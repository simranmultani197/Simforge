import type { SimEvent, ApiGatewayConfig } from '@simforge/types';
import type { SeededRNG } from '../core/rng';
import type { SimulationEngine } from '../core/engine';
import { sample } from '../distributions';

/**
 * State tracked per API Gateway node during simulation.
 */
export interface ApiGatewayState {
  /** Token bucket: tokens available for rate limiting */
  tokens: number;
  /** Last time tokens were refilled */
  lastRefillTime: number;
  /** Currently in-flight requests */
  activeRequests: number;
  totalRouted: number;
  totalRateLimited: number;
  totalDropped: number;
}

/**
 * Create initial state for an API Gateway node.
 */
export function createApiGatewayState(config: ApiGatewayConfig): ApiGatewayState {
  return {
    tokens: config.burstSize,
    lastRefillTime: 0,
    activeRequests: 0,
    totalRouted: 0,
    totalRateLimited: 0,
    totalDropped: 0,
  };
}

/**
 * Handle an incoming request at an API Gateway node.
 *
 * API Gateway behavior:
 * - Token bucket rate limiting (rateLimitRps + burstSize)
 * - Concurrent request cap (maxConcurrentRequests)
 * - Auth latency overhead added to every request
 * - Failure rate for random drops
 * - Forwards to all outEdges after processing
 */
export function handleApiGatewayRequest(
  event: SimEvent,
  config: ApiGatewayConfig,
  state: ApiGatewayState,
  engine: SimulationEngine,
  rng: SeededRNG,
  outEdges: string[],
): void {
  // Check failure
  if (rng.next() < config.failureRate) {
    state.totalDropped++;
    engine.schedule({
      time: event.time,
      type: 'request.dropped',
      nodeId: event.nodeId,
      payload: { reason: 'failure', requestId: event.payload['requestId'] },
    });
    return;
  }

  // Refill token bucket
  refillTokens(event.time, config, state);

  // Check rate limit
  if (state.tokens < 1) {
    state.totalRateLimited++;
    engine.schedule({
      time: event.time,
      type: 'request.dropped',
      nodeId: event.nodeId,
      payload: { reason: 'rate_limited', requestId: event.payload['requestId'] },
    });
    return;
  }

  // Check concurrent request limit
  if (state.activeRequests >= config.maxConcurrentRequests) {
    state.totalDropped++;
    engine.schedule({
      time: event.time,
      type: 'request.dropped',
      nodeId: event.nodeId,
      payload: { reason: 'overloaded', requestId: event.payload['requestId'] },
    });
    return;
  }

  // Consume a token and process
  state.tokens--;
  state.activeRequests++;
  state.totalRouted++;

  // Auth latency overhead
  const authLatency = sample(config.authLatencyMs, rng);

  engine.schedule({
    time: event.time + authLatency,
    type: 'request.complete',
    nodeId: event.nodeId,
    payload: {
      requestId: event.payload['requestId'],
      startTime: event.payload['startTime'],
      outEdges,
    },
  });
}

/**
 * Handle completion of a request at an API Gateway node.
 */
export function handleApiGatewayComplete(_event: SimEvent, state: ApiGatewayState): void {
  state.activeRequests--;
}

/**
 * Refill tokens based on elapsed time since last refill.
 * Uses token bucket algorithm: adds `rateLimitRps / 1000 * elapsed` tokens,
 * capped at burstSize.
 */
function refillTokens(currentTime: number, config: ApiGatewayConfig, state: ApiGatewayState): void {
  const elapsed = currentTime - state.lastRefillTime;
  if (elapsed <= 0) return;

  // Convert RPS to tokens-per-ms
  const tokensPerMs = config.rateLimitRps / 1000;
  const newTokens = elapsed * tokensPerMs;

  state.tokens = Math.min(config.burstSize, state.tokens + newTokens);
  state.lastRefillTime = currentTime;
}
