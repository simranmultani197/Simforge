import type { SimEvent, ServiceConfig } from '@simforge/types';
import type { SeededRNG } from '../core/rng';
import type { SimulationEngine } from '../core/engine';
import { sample } from '../distributions';

/**
 * State tracked per service node during simulation.
 */
export interface ServiceState {
  activeRequests: number;
  totalProcessed: number;
  totalDropped: number;
}

/**
 * Create initial state for a service node.
 */
export function createServiceState(): ServiceState {
  return { activeRequests: 0, totalProcessed: 0, totalDropped: 0 };
}

/**
 * Handle an incoming request at a service node.
 */
export function handleServiceRequest(
  event: SimEvent,
  config: ServiceConfig,
  state: ServiceState,
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

  // Check concurrency limit
  if (state.activeRequests >= config.maxConcurrency) {
    state.totalDropped++;
    engine.schedule({
      time: event.time,
      type: 'request.dropped',
      nodeId: event.nodeId,
      payload: { reason: 'overloaded', requestId: event.payload['requestId'] },
    });
    return;
  }

  // Process request
  state.activeRequests++;
  const processingTime = sample(config.latencyMs, rng);

  engine.schedule({
    time: event.time + processingTime,
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
 * Handle completion of a request at a service node.
 */
export function handleServiceComplete(
  _event: SimEvent,
  state: ServiceState,
): void {
  state.activeRequests--;
  state.totalProcessed++;
}
