import { describe, it, expect } from 'vitest';
import type { DatabaseConfig, SimEvent } from '@simforge/types';
import { SimulationEngine } from '../../src/core/engine';
import { SeededRNG } from '../../src/core/rng';
import {
  createDatabaseState,
  handleDatabaseRequest,
  handleDatabaseComplete,
} from '../../src/behaviors/database';

function makeConfig(overrides: Partial<DatabaseConfig> = {}): DatabaseConfig {
  return {
    kind: 'database',
    engine: 'postgres',
    maxConnections: 100,
    queryLatencyMs: { type: 'constant', value: 5 },
    writeLatencyMs: { type: 'constant', value: 10 },
    failureRate: 0,
    connectionPoolSize: 10,
    replicationFactor: 1,
    ...overrides,
  };
}

function makeEvent(overrides: Partial<SimEvent> = {}): SimEvent {
  return {
    time: 100,
    type: 'request.arrive',
    nodeId: 'db-1',
    payload: { requestId: 'req-1', startTime: 0 },
    ...overrides,
  };
}

describe('database behavior', () => {
  it('creates initial state correctly', () => {
    const state = createDatabaseState();
    expect(state.activeConnections).toBe(0);
    expect(state.totalQueries).toBe(0);
    expect(state.totalWrites).toBe(0);
    expect(state.totalDropped).toBe(0);
  });

  it('processes a request and schedules completion', () => {
    const config = makeConfig();
    const state = createDatabaseState();
    const engine = new SimulationEngine();
    const rng = new SeededRNG(42);

    handleDatabaseRequest(makeEvent(), config, state, engine, rng, []);

    expect(state.activeConnections).toBe(1);
    // Should have scheduled a request.complete event
    const event = engine.step();
    expect(event).not.toBeNull();
    expect(event!.type).toBe('request.complete');
  });

  it('drops requests when connection pool is exhausted', () => {
    const config = makeConfig({ connectionPoolSize: 1 });
    const state = createDatabaseState();
    state.activeConnections = 1; // Pool full
    const engine = new SimulationEngine();
    const rng = new SeededRNG(42);

    handleDatabaseRequest(makeEvent(), config, state, engine, rng, []);

    expect(state.totalDropped).toBe(1);
    const event = engine.step();
    expect(event!.type).toBe('request.dropped');
    expect(event!.payload['reason']).toBe('pool_exhausted');
  });

  it('drops requests on failure', () => {
    const config = makeConfig({ failureRate: 1.0 }); // Always fail
    const state = createDatabaseState();
    const engine = new SimulationEngine();
    const rng = new SeededRNG(42);

    handleDatabaseRequest(makeEvent(), config, state, engine, rng, []);

    expect(state.totalDropped).toBe(1);
    const event = engine.step();
    expect(event!.type).toBe('request.dropped');
    expect(event!.payload['reason']).toBe('failure');
  });

  it('applies replication factor to write latency', () => {
    const config = makeConfig({
      writeLatencyMs: { type: 'constant', value: 10 },
      replicationFactor: 3,
    });
    const state = createDatabaseState();
    const engine = new SimulationEngine();
    // Use a seed that produces isWrite = true (rng.next() < 0.2)
    // We'll iterate seeds to find one that gives a write
    let rng: SeededRNG;
    let attempts = 0;
    do {
      rng = new SeededRNG(attempts);
      // Skip the failure check RNG call
      rng.next();
      // Check if isWrite (rng.next() < 0.2)
      if (rng.next() < 0.2) break;
      attempts++;
    } while (attempts < 100);

    // Reset and use this seed
    rng = new SeededRNG(attempts);

    handleDatabaseRequest(makeEvent(), config, state, engine, rng, []);

    const event = engine.step();
    expect(event).not.toBeNull();
    // Write latency = 10ms * 3 replications = 30ms
    expect(event!.time).toBe(100 + 30);
    expect(state.totalWrites).toBe(1);
  });

  it('handleDatabaseComplete decrements active connections', () => {
    const state = createDatabaseState();
    state.activeConnections = 5;

    handleDatabaseComplete(makeEvent({ type: 'request.complete' }), state);

    expect(state.activeConnections).toBe(4);
  });

  it('passes outEdges in completion payload', () => {
    const config = makeConfig();
    const state = createDatabaseState();
    const engine = new SimulationEngine();
    const rng = new SeededRNG(42);

    handleDatabaseRequest(makeEvent(), config, state, engine, rng, ['svc-1', 'svc-2']);

    const event = engine.step();
    expect(event!.payload['outEdges']).toEqual(['svc-1', 'svc-2']);
  });
});
