import { describe, it, expect, beforeEach } from 'vitest';
import { SimulationEngine } from '../../src/core/engine';
import { SeededRNG } from '../../src/core/rng';
import {
  createCacheState,
  handleCacheRequest,
  handleCacheComplete,
} from '../../src/behaviors/cache';
import type { CacheConfig, SimEvent } from '@simforge/types';

function makeConfig(overrides: Partial<CacheConfig> = {}): CacheConfig {
  return {
    kind: 'cache',
    evictionPolicy: 'lru',
    maxSizeMb: 256,
    hitRate: 0.8,
    hitLatencyMs: { type: 'constant', value: 1 },
    missLatencyMs: { type: 'constant', value: 10 },
    ttlMs: 60000,
    maxEntries: 100000,
    ...overrides,
  };
}

function makeEvent(overrides: Partial<SimEvent> = {}): SimEvent {
  return {
    time: 100,
    type: 'request.arrive',
    nodeId: 'cache-1',
    payload: { requestId: 'req-1', startTime: 0 },
    ...overrides,
  };
}

describe('cache behavior', () => {
  let engine: SimulationEngine;
  let rng: SeededRNG;

  beforeEach(() => {
    engine = new SimulationEngine();
    rng = new SeededRNG(42);
  });

  it('creates initial state correctly', () => {
    const state = createCacheState();
    expect(state.totalHits).toBe(0);
    expect(state.totalMisses).toBe(0);
    expect(state.activeRequests).toBe(0);
  });

  it('handles cache hit with fast completion and no forwarding', () => {
    const config = makeConfig({
      hitRate: 1,
      hitLatencyMs: { type: 'constant', value: 2 },
      missLatencyMs: { type: 'constant', value: 20 },
    });
    const state = createCacheState();

    handleCacheRequest(makeEvent(), config, state, engine, rng, ['db-1']);

    expect(state.activeRequests).toBe(1);
    expect(state.totalHits).toBe(1);
    expect(state.totalMisses).toBe(0);

    const completion = engine.step();
    expect(completion).not.toBeNull();
    expect(completion!.type).toBe('request.complete');
    expect(completion!.time).toBe(102);
    expect(completion!.payload['cacheHit']).toBe(true);
    expect(completion!.payload['outEdges']).toEqual([]);
  });

  it('handles cache miss with miss latency and forwarding targets', () => {
    const config = makeConfig({
      hitRate: 0,
      hitLatencyMs: { type: 'constant', value: 1 },
      missLatencyMs: { type: 'constant', value: 15 },
    });
    const state = createCacheState();

    handleCacheRequest(makeEvent(), config, state, engine, rng, ['db-1', 'db-2']);

    expect(state.activeRequests).toBe(1);
    expect(state.totalHits).toBe(0);
    expect(state.totalMisses).toBe(1);

    const completion = engine.step();
    expect(completion).not.toBeNull();
    expect(completion!.type).toBe('request.complete');
    expect(completion!.time).toBe(115);
    expect(completion!.payload['cacheHit']).toBe(false);
    expect(completion!.payload['outEdges']).toEqual(['db-1', 'db-2']);
  });

  it('passes request metadata through completion payload', () => {
    const config = makeConfig({ hitRate: 1 });
    const state = createCacheState();

    handleCacheRequest(
      makeEvent({
        payload: { requestId: 'req-99', startTime: 12 },
      }),
      config,
      state,
      engine,
      rng,
      ['db-1'],
    );

    const completion = engine.step();
    expect(completion!.payload['requestId']).toBe('req-99');
    expect(completion!.payload['startTime']).toBe(12);
  });

  it('increments active requests per arrival', () => {
    const config = makeConfig({ hitRate: 1 });
    const state = createCacheState();

    handleCacheRequest(makeEvent({ payload: { requestId: 'req-1', startTime: 0 } }), config, state, engine, rng, []);
    handleCacheRequest(makeEvent({ payload: { requestId: 'req-2', startTime: 0 } }), config, state, engine, rng, []);

    expect(state.activeRequests).toBe(2);
  });

  it('handleCacheComplete decrements active requests', () => {
    const state = createCacheState();
    state.activeRequests = 3;

    handleCacheComplete(
      makeEvent({
        type: 'request.complete',
      }),
      state,
    );

    expect(state.activeRequests).toBe(2);
  });
});
