import type { SimEvent, CacheConfig } from '@simforge/types';
import type { SeededRNG } from '../core/rng';
import type { SimulationEngine } from '../core/engine';
import { sample } from '../distributions';

/**
 * State tracked per cache node during simulation.
 */
export interface CacheState {
  totalHits: number;
  totalMisses: number;
  activeRequests: number;
}

/**
 * Create initial state for a cache node.
 */
export function createCacheState(): CacheState {
  return { totalHits: 0, totalMisses: 0, activeRequests: 0 };
}

/**
 * Handle an incoming request at a cache node.
 *
 * Cache behavior:
 * - Probabilistic hit/miss based on `hitRate`
 * - Hits: fast path with `hitLatencyMs`, treated as terminal (request complete, no forwarding)
 * - Misses: slower path with `missLatencyMs`, forwarded to downstream nodes via outEdges
 */
export function handleCacheRequest(
  event: SimEvent,
  config: CacheConfig,
  state: CacheState,
  engine: SimulationEngine,
  rng: SeededRNG,
  outEdges: string[],
): void {
  state.activeRequests++;
  const isHit = rng.next() < config.hitRate;

  if (isHit) {
    // Cache hit — fast path, no forwarding needed
    state.totalHits++;
    const latency = sample(config.hitLatencyMs, rng);

    engine.schedule({
      time: event.time + latency,
      type: 'request.complete',
      nodeId: event.nodeId,
      payload: {
        requestId: event.payload['requestId'],
        startTime: event.payload['startTime'],
        cacheHit: true,
        // Empty outEdges so the simulator treats this as terminal
        outEdges: [],
      },
    });
  } else {
    // Cache miss — forward to downstream
    state.totalMisses++;
    const latency = sample(config.missLatencyMs, rng);

    engine.schedule({
      time: event.time + latency,
      type: 'request.complete',
      nodeId: event.nodeId,
      payload: {
        requestId: event.payload['requestId'],
        startTime: event.payload['startTime'],
        cacheHit: false,
        outEdges,
      },
    });
  }
}

/**
 * Handle completion of a request at a cache node.
 */
export function handleCacheComplete(_event: SimEvent, state: CacheState): void {
  state.activeRequests--;
}
