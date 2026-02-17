import { describe, it, expect, beforeEach } from 'vitest';
import { SimulationEngine } from '../../src/core/engine';
import { SeededRNG } from '../../src/core/rng';
import {
  createApiGatewayState,
  handleApiGatewayRequest,
  handleApiGatewayComplete,
} from '../../src/behaviors/api-gateway';
import type { ApiGatewayConfig, SimEvent } from '@simforge/types';

function makeConfig(overrides: Partial<ApiGatewayConfig> = {}): ApiGatewayConfig {
  return {
    kind: 'api-gateway',
    rateLimitRps: 1000,
    burstSize: 10,
    authLatencyMs: { type: 'constant', value: 3 },
    routes: 20,
    failureRate: 0,
    maxConcurrentRequests: 100,
    ...overrides,
  };
}

function makeEvent(overrides: Partial<SimEvent> = {}): SimEvent {
  return {
    time: 100,
    type: 'request.arrive',
    nodeId: 'gw-1',
    payload: { requestId: 'req-1', startTime: 0 },
    ...overrides,
  };
}

describe('api-gateway behavior', () => {
  let engine: SimulationEngine;
  let rng: SeededRNG;

  beforeEach(() => {
    engine = new SimulationEngine();
    rng = new SeededRNG(42);
  });

  it('creates initial state from config', () => {
    const config = makeConfig({ burstSize: 25 });
    const state = createApiGatewayState(config);

    expect(state.tokens).toBe(25);
    expect(state.activeRequests).toBe(0);
    expect(state.totalRouted).toBe(0);
    expect(state.totalRateLimited).toBe(0);
    expect(state.totalDropped).toBe(0);
  });

  it('routes request and schedules completion with auth latency', () => {
    const config = makeConfig({ authLatencyMs: { type: 'constant', value: 7 } });
    const state = createApiGatewayState(config);

    handleApiGatewayRequest(makeEvent(), config, state, engine, rng, ['lb-1']);

    expect(state.totalRouted).toBe(1);
    expect(state.activeRequests).toBe(1);
    expect(state.tokens).toBe(9);

    const completion = engine.step();
    expect(completion).not.toBeNull();
    expect(completion!.type).toBe('request.complete');
    expect(completion!.time).toBe(107);
    expect(completion!.payload['outEdges']).toEqual(['lb-1']);
  });

  it('drops request on failure', () => {
    const config = makeConfig({ failureRate: 1 });
    const state = createApiGatewayState(config);

    handleApiGatewayRequest(makeEvent(), config, state, engine, rng, ['lb-1']);

    expect(state.totalDropped).toBe(1);
    const dropped = engine.step();
    expect(dropped!.type).toBe('request.dropped');
    expect(dropped!.payload['reason']).toBe('failure');
  });

  it('drops request when rate limited', () => {
    const config = makeConfig({ rateLimitRps: 0, burstSize: 0 });
    const state = createApiGatewayState(config);

    handleApiGatewayRequest(makeEvent({ time: 0 }), config, state, engine, rng, ['lb-1']);

    expect(state.totalRateLimited).toBe(1);
    const dropped = engine.step();
    expect(dropped!.type).toBe('request.dropped');
    expect(dropped!.payload['reason']).toBe('rate_limited');
  });

  it('does not consume capacity for rate-limited requests', () => {
    const config = makeConfig({ rateLimitRps: 0, burstSize: 0 });
    const state = createApiGatewayState(config);

    handleApiGatewayRequest(makeEvent({ time: 0 }), config, state, engine, rng, ['lb-1']);

    expect(state.tokens).toBe(0);
    expect(state.activeRequests).toBe(0);
    expect(state.totalRouted).toBe(0);
  });

  it('drops request when max concurrency is exceeded', () => {
    const config = makeConfig({ maxConcurrentRequests: 1 });
    const state = createApiGatewayState(config);
    state.activeRequests = 1;

    handleApiGatewayRequest(makeEvent(), config, state, engine, rng, ['lb-1']);

    expect(state.totalDropped).toBe(1);
    const dropped = engine.step();
    expect(dropped!.type).toBe('request.dropped');
    expect(dropped!.payload['reason']).toBe('overloaded');
  });

  it('refills tokens over elapsed time before rate-limit check', () => {
    const config = makeConfig({ rateLimitRps: 10, burstSize: 5 });
    const state = createApiGatewayState(config);
    state.tokens = 0;
    state.lastRefillTime = 0;

    handleApiGatewayRequest(makeEvent({ time: 1000 }), config, state, engine, rng, ['lb-1']);

    // Refilled to burst cap (5), then consumed one token.
    expect(state.tokens).toBe(4);
    expect(state.totalRouted).toBe(1);
    expect(state.lastRefillTime).toBe(1000);
  });

  it('handleApiGatewayComplete decrements active requests', () => {
    const state = createApiGatewayState(makeConfig());
    state.activeRequests = 4;

    handleApiGatewayComplete(
      makeEvent({
        type: 'request.complete',
      }),
      state,
    );

    expect(state.activeRequests).toBe(3);
  });
});
