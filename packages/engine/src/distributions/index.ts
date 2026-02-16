import type { Distribution } from '@simforge/types';
import type { SeededRNG } from '../core/rng';

/**
 * Sample a value from a statistical distribution using the given RNG.
 */
export function sample(dist: Distribution, rng: SeededRNG): number {
  switch (dist.type) {
    case 'constant':
      return dist.value;

    case 'uniform':
      return dist.min + rng.next() * (dist.max - dist.min);

    case 'exponential':
      // Inverse transform sampling: -ln(U) / rate
      return -Math.log(1 - rng.next()) / dist.rate;

    case 'normal':
      // Box-Muller transform
      return boxMuller(dist.mean, dist.stddev, rng);
  }
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
