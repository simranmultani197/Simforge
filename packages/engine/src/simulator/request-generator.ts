import type { SimulationConfig } from '@simforge/types';
import type { SimulationEngine } from '../core/engine';
import type { SeededRNG } from '../core/rng';

/**
 * Generate request arrival events and schedule them on the engine.
 *
 * - **constant**: Fixed inter-arrival time = 1000 / requestRateRps ms
 * - **poisson**: Exponentially distributed inter-arrival times with mean = 1000 / requestRateRps ms
 *
 * Requests are distributed round-robin across entry nodes.
 * Each request carries a unique `requestId` and `startTime` for latency tracking.
 */
export function generateRequests(
  config: SimulationConfig,
  entryNodeIds: string[],
  engine: SimulationEngine,
  rng: SeededRNG,
): number {
  if (entryNodeIds.length === 0) return 0;
  if (config.requestRateRps <= 0) return 0;

  const meanInterArrivalMs = 1000 / config.requestRateRps;
  let time = 0;
  let sequenceNumber = 0;
  let entryIndex = 0;

  while (time <= config.maxTimeMs) {
    const targetNode = entryNodeIds[entryIndex % entryNodeIds.length]!;
    entryIndex++;

    engine.schedule({
      time,
      type: 'request.arrive',
      nodeId: targetNode,
      payload: {
        requestId: `req-${sequenceNumber}`,
        startTime: time,
      },
    });

    sequenceNumber++;

    // Calculate next arrival time
    if (config.requestDistribution === 'poisson') {
      // Exponential inter-arrival: -ln(U) * meanInterval
      const u = rng.next();
      time += -Math.log(1 - u) * meanInterArrivalMs;
    } else {
      // Constant rate
      time += meanInterArrivalMs;
    }
  }

  return sequenceNumber;
}
