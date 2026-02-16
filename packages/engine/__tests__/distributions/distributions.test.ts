import { describe, it, expect } from 'vitest';
import { sample } from '../../src/distributions';
import { SeededRNG } from '../../src/core/rng';
import type { Distribution } from '@simforge/types';

describe('Distributions', () => {
  describe('constant', () => {
    it('returns the exact value', () => {
      const rng = new SeededRNG(42);
      const dist: Distribution = { type: 'constant', value: 42 };

      for (let i = 0; i < 100; i++) {
        expect(sample(dist, rng)).toBe(42);
      }
    });
  });

  describe('uniform', () => {
    it('stays within [min, max]', () => {
      const rng = new SeededRNG(42);
      const dist: Distribution = { type: 'uniform', min: 5, max: 15 };

      for (let i = 0; i < 1000; i++) {
        const v = sample(dist, rng);
        expect(v).toBeGreaterThanOrEqual(5);
        expect(v).toBeLessThanOrEqual(15);
      }
    });

    it('has approximate mean of (min+max)/2', () => {
      const rng = new SeededRNG(42);
      const dist: Distribution = { type: 'uniform', min: 0, max: 100 };

      let sum = 0;
      const n = 10000;
      for (let i = 0; i < n; i++) {
        sum += sample(dist, rng);
      }
      const mean = sum / n;
      expect(mean).toBeGreaterThan(45);
      expect(mean).toBeLessThan(55);
    });
  });

  describe('exponential', () => {
    it('produces positive values', () => {
      const rng = new SeededRNG(42);
      const dist: Distribution = { type: 'exponential', rate: 0.1 };

      for (let i = 0; i < 1000; i++) {
        expect(sample(dist, rng)).toBeGreaterThan(0);
      }
    });

    it('has approximate mean of 1/rate', () => {
      const rng = new SeededRNG(42);
      const rate = 0.5;
      const dist: Distribution = { type: 'exponential', rate };

      let sum = 0;
      const n = 10000;
      for (let i = 0; i < n; i++) {
        sum += sample(dist, rng);
      }
      const mean = sum / n;
      const expectedMean = 1 / rate; // 2.0
      expect(mean).toBeGreaterThan(expectedMean * 0.85);
      expect(mean).toBeLessThan(expectedMean * 1.15);
    });
  });

  describe('normal', () => {
    it('has approximate target mean', () => {
      const rng = new SeededRNG(42);
      const dist: Distribution = { type: 'normal', mean: 100, stddev: 10 };

      let sum = 0;
      const n = 10000;
      for (let i = 0; i < n; i++) {
        sum += sample(dist, rng);
      }
      const mean = sum / n;
      expect(mean).toBeGreaterThan(97);
      expect(mean).toBeLessThan(103);
    });

    it('has approximate target stddev', () => {
      const rng = new SeededRNG(42);
      const targetMean = 50;
      const targetStddev = 10;
      const dist: Distribution = { type: 'normal', mean: targetMean, stddev: targetStddev };

      const values: number[] = [];
      const n = 10000;
      for (let i = 0; i < n; i++) {
        values.push(sample(dist, rng));
      }

      const mean = values.reduce((a, b) => a + b, 0) / n;
      const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / n;
      const stddev = Math.sqrt(variance);

      expect(stddev).toBeGreaterThan(targetStddev * 0.85);
      expect(stddev).toBeLessThan(targetStddev * 1.15);
    });
  });

  describe('determinism', () => {
    it('produces identical sequences with same seed', () => {
      const dist: Distribution = { type: 'exponential', rate: 0.1 };

      const rng1 = new SeededRNG(12345);
      const seq1 = Array.from({ length: 50 }, () => sample(dist, rng1));

      const rng2 = new SeededRNG(12345);
      const seq2 = Array.from({ length: 50 }, () => sample(dist, rng2));

      expect(seq1).toEqual(seq2);
    });
  });
});
