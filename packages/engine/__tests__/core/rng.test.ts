import { describe, it, expect } from 'vitest';
import { SeededRNG } from '../../src/core/rng';

describe('SeededRNG', () => {
  it('produces values in [0, 1)', () => {
    const rng = new SeededRNG(42);
    for (let i = 0; i < 1000; i++) {
      const v = rng.next();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it('produces deterministic sequences from the same seed', () => {
    const rng1 = new SeededRNG(12345);
    const rng2 = new SeededRNG(12345);

    const seq1 = Array.from({ length: 100 }, () => rng1.next());
    const seq2 = Array.from({ length: 100 }, () => rng2.next());

    expect(seq1).toEqual(seq2);
  });

  it('produces different sequences from different seeds', () => {
    const rng1 = new SeededRNG(1);
    const rng2 = new SeededRNG(2);

    const seq1 = Array.from({ length: 10 }, () => rng1.next());
    const seq2 = Array.from({ length: 10 }, () => rng2.next());

    expect(seq1).not.toEqual(seq2);
  });

  it('nextInt produces values in [min, max]', () => {
    const rng = new SeededRNG(99);
    for (let i = 0; i < 1000; i++) {
      const v = rng.nextInt(5, 10);
      expect(v).toBeGreaterThanOrEqual(5);
      expect(v).toBeLessThanOrEqual(10);
      expect(Number.isInteger(v)).toBe(true);
    }
  });

  it('has reasonable uniformity', () => {
    const rng = new SeededRNG(42);
    const buckets = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const n = 100000;

    for (let i = 0; i < n; i++) {
      const bucket = Math.floor(rng.next() * 10);
      buckets[bucket]!++;
    }

    // Each bucket should have ~10% of values
    for (const count of buckets) {
      const ratio = count / n;
      expect(ratio).toBeGreaterThan(0.08);
      expect(ratio).toBeLessThan(0.12);
    }
  });
});
