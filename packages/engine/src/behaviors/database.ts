import type { SimEvent, DatabaseConfig } from '@simforge/types';
import type { SeededRNG } from '../core/rng';
import type { SimulationEngine } from '../core/engine';
import { sample } from '../distributions';

/**
 * State tracked per database node during simulation.
 */
export interface DatabaseState {
  activeConnections: number;
  totalQueries: number;
  totalWrites: number;
  totalDropped: number;
}

/**
 * Create initial state for a database node.
 */
export function createDatabaseState(): DatabaseState {
  return { activeConnections: 0, totalQueries: 0, totalWrites: 0, totalDropped: 0 };
}

/**
 * Handle an incoming request at a database node.
 *
 * Database behavior:
 * - Connection pool limits concurrent requests
 * - 80/20 read/write split (configurable via RNG)
 * - Write latency multiplied by replication factor
 * - Failure rate causes random request drops
 */
export function handleDatabaseRequest(
  event: SimEvent,
  config: DatabaseConfig,
  state: DatabaseState,
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

  // Check connection pool
  if (state.activeConnections >= config.connectionPoolSize) {
    state.totalDropped++;
    engine.schedule({
      time: event.time,
      type: 'request.dropped',
      nodeId: event.nodeId,
      payload: { reason: 'pool_exhausted', requestId: event.payload['requestId'] },
    });
    return;
  }

  // Process request — 80% reads, 20% writes
  state.activeConnections++;
  const isWrite = rng.next() < 0.2;
  let processingTime: number;

  if (isWrite) {
    state.totalWrites++;
    processingTime = sample(config.writeLatencyMs, rng) * config.replicationFactor;
  } else {
    state.totalQueries++;
    processingTime = sample(config.queryLatencyMs, rng);
  }

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
 * Handle completion of a request at a database node.
 */
export function handleDatabaseComplete(_event: SimEvent, state: DatabaseState): void {
  state.activeConnections--;
}
