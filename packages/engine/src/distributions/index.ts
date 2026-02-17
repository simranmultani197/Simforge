import type { Distribution } from '@simforge/types';
import type { SeededRNG } from '../core/rng';

/**
 * Sample a value from a statistical distribution using the given RNG.
 */
export function sample(dist: Distribution, rng: SeededRNG): number {
  let value: number;

  switch (dist.type) {
    case 'constant':
      value = dist.value;
      break;

    case 'uniform':
      value = dist.min + rng.next() * (dist.max - dist.min);
      break;

    case 'exponential':
      // Inverse transform sampling: -ln(U) / rate
      value = -Math.log(1 - rng.next()) / dist.rate;
      break;

    case 'normal':
      // Box-Muller transform
      value = boxMuller(dist.mean, dist.stddev, rng);
      break;
  }

  if (!Number.isFinite(value)) return 0;

  // Simulation times/latencies must not be negative or events can be
  // scheduled in the past.
  return value < 0 ? 0 : value;
}

/**
 * Box-Muller transform for generating normally distributed values.
 */
function boxMuller(mean: number, stddev: number, rng: SeededRNG): number {
  const u1 = rng.next();
  const u2 = rng.next();
  const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + stddev * z0;
}
