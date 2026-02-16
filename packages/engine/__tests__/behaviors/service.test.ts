import { describe, it, expect, beforeEach } from 'vitest';
import { SimulationEngine } from '../../src/core/engine';
import { SeededRNG } from '../../src/core/rng';
import {
  createServiceState,
  handleServiceRequest,
  handleServiceComplete,
} from '../../src/behaviors/service';
import type { ServiceConfig, SimEvent } from '@simforge/types';

function makeRequest(time: number, nodeId = 'service-1'): SimEvent {
  return {
    time,
    type: 'request.arrive',
    nodeId,
    payload: { requestId: `req-${time}` },
  };
}

describe('Service behavior', () => {
  let engine: SimulationEngine;
  let rng: SeededRNG;

  const config: ServiceConfig = {
    kind: 'service',
    replicas: 1,
    latencyMs: { type: 'constant', value: 10 },
    failureRate: 0,
    maxConcurrency: 100,
  };

  beforeEach(() => {
    engine = new SimulationEngine();
    rng = new SeededRNG(42);
  });

  it('processes a request and schedules completion', () => {
    const state = createServiceState();
    const event = makeRequest(100);

    handleServiceRequest(event, config, state, engine, rng, []);

    expect(state.activeRequests).toBe(1);
    expect(engine.pendingEvents).toBe(1);

    const completion = engine.step();
    expect(completion!.type).toBe('request.complete');
    expect(completion!.time).toBe(110); // 100 + 10ms constant latency
  });

  it('drops requests when overloaded', () => {
    const overloadConfig: ServiceConfig = { ...config, maxConcurrency: 1 };
    const state = createServiceState();

    handleServiceRequest(makeRequest(100), overloadConfig, state, engine, rng, []);
    handleServiceRequest(makeRequest(105), overloadConfig, state, engine, rng, []);

    expect(state.activeRequests).toBe(1);
    expect(state.totalDropped).toBe(1);
  });

  it('handles request completion correctly', () => {
    const state = createServiceState();
    state.activeRequests = 1;

    const completeEvent: SimEvent = {
      time: 110,
      type: 'request.complete',
      nodeId: 'service-1',
      payload: { requestId: 'req-1' },
    };

    handleServiceComplete(completeEvent, state);

    expect(state.activeRequests).toBe(0);
    expect(state.totalProcessed).toBe(1);
  });

  it('drops requests based on failure rate', () => {
    const failConfig: ServiceConfig = { ...config, failureRate: 1.0 };
    const state = createServiceState();

    handleServiceRequest(makeRequest(100), failConfig, state, engine, rng, []);

    expect(state.totalDropped).toBe(1);
    expect(state.activeRequests).toBe(0);
  });
});
