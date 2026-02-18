import type { SimEvent, ClientConfig } from '@simforge/types';
import type { SeededRNG } from '../core/rng';
import type { SimulationEngine } from '../core/engine';

/**
 * State tracked per client node during simulation.
 */
export interface ClientState {
  requestsForwarded: number;
}

/**
 * Create initial state for a client node.
 */
export function createClientState(): ClientState {
  return { requestsForwarded: 0 };
}

/**
 * Handle an incoming request at a client node.
 * Zero-latency passthrough — immediately schedules completion at the same time.
 */
export function handleClientRequest(
  event: SimEvent,
  _config: ClientConfig,
  state: ClientState,
  engine: SimulationEngine,
  _rng: SeededRNG,
  outEdges: string[],
): void {
  state.requestsForwarded++;

  engine.schedule({
    time: event.time,
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
 * Handle completion of a request at a client node.
 * No-op — client doesn't track active requests.
 */
export function handleClientComplete(
  _event: SimEvent,
  _state: ClientState,
): void {
  // No-op: client is a passthrough and doesn't track active requests.
}
