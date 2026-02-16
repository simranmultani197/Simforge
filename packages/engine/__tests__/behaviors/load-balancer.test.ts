import { describe, it, expect, beforeEach } from 'vitest';
import { SimulationEngine } from '../../src/core/engine';
import { SeededRNG } from '../../src/core/rng';
import {
  createLoadBalancerState,
  handleLoadBalancerRequest,
} from '../../src/behaviors/load-balancer';
import type { LoadBalancerConfig, SimEvent } from '@simforge/types';

function makeRequest(time: number): SimEvent {
  return {
    time,
    type: 'request.arrive',
    nodeId: 'lb-1',
    payload: { requestId: `req-${time}` },
  };
}

describe('LoadBalancer behavior', () => {
  let engine: SimulationEngine;
  let rng: SeededRNG;
  const targets = ['svc-1', 'svc-2', 'svc-3'];

  beforeEach(() => {
    engine = new SimulationEngine();
    rng = new SeededRNG(42);
  });

  it('round-robin distributes evenly', () => {
    const config: LoadBalancerConfig = {
      kind: 'load-balancer',
      algorithm: 'round-robin',
      maxConnections: 1000,
    };
    const state = createLoadBalancerState(targets);

    // Send 6 requests
    for (let i = 0; i < 6; i++) {
      handleLoadBalancerRequest(makeRequest(i * 10), config, state, engine, rng, targets);
    }

    // Each target should get exactly 2 requests
    for (const id of targets) {
      expect(state.activeConnections.get(id)).toBe(2);
    }
    expect(state.totalRouted).toBe(6);
  });

  it('least-connections picks the least loaded target', () => {
    const config: LoadBalancerConfig = {
      kind: 'load-balancer',
      algorithm: 'least-connections',
      maxConnections: 1000,
    };
    const state = createLoadBalancerState(targets);

    // Pre-load svc-1 and svc-2
    state.activeConnections.set('svc-1', 5);
    state.activeConnections.set('svc-2', 3);
    state.activeConnections.set('svc-3', 0);

    handleLoadBalancerRequest(makeRequest(100), config, state, engine, rng, targets);

    // Should route to svc-3 (least connections)
    expect(state.activeConnections.get('svc-3')).toBe(1);
  });

  it('drops requests when max connections reached', () => {
    const config: LoadBalancerConfig = {
      kind: 'load-balancer',
      algorithm: 'round-robin',
      maxConnections: 2,
    };
    const state = createLoadBalancerState(targets);

    // Fill up connections
    handleLoadBalancerRequest(makeRequest(100), config, state, engine, rng, targets);
    handleLoadBalancerRequest(makeRequest(200), config, state, engine, rng, targets);
    handleLoadBalancerRequest(makeRequest(300), config, state, engine, rng, targets);

    expect(state.totalRouted).toBe(2);
    expect(state.totalDropped).toBe(1);
  });

  it('drops requests when no targets', () => {
    const config: LoadBalancerConfig = {
      kind: 'load-balancer',
      algorithm: 'round-robin',
      maxConnections: 1000,
    };
    const state = createLoadBalancerState([]);

    handleLoadBalancerRequest(makeRequest(100), config, state, engine, rng, []);

    expect(state.totalDropped).toBe(1);
  });
});
