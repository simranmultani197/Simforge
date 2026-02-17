import { describe, expect, it } from 'vitest';
import type { SimEdge, SimNode, SimTopology, SimulationConfig } from '@simforge/types';
import type { WorkerEvent } from '../../src/worker/protocol';
import { SimulationWorkerRuntime } from '../../src/worker/runtime';

function makeNode(id: string, config: SimNode['config']): SimNode {
  return {
    id,
    config,
    position: { x: 0, y: 0 },
    metadata: { label: id },
  };
}

function makeEdge(
  id: string,
  source: string,
  target: string,
  latencyMs = 1,
): SimEdge {
  return {
    id,
    source,
    target,
    config: {
      latencyMs: { type: 'constant', value: latencyMs },
      bandwidthMbps: 1000,
      failureRate: 0,
    },
  };
}

function createTopology(): SimTopology {
  return {
    nodes: [
      makeNode('gw-1', {
        kind: 'api-gateway',
        rateLimitRps: 1000,
        burstSize: 100,
        authLatencyMs: { type: 'constant', value: 1 },
        routes: 8,
        failureRate: 0,
        maxConcurrentRequests: 1000,
      }),
      makeNode('svc-1', {
        kind: 'service',
        replicas: 1,
        latencyMs: { type: 'constant', value: 2 },
        failureRate: 0,
        maxConcurrency: 100,
      }),
    ],
    edges: [makeEdge('e1', 'gw-1', 'svc-1')],
  };
}

function createConfig(overrides: Partial<SimulationConfig> = {}): SimulationConfig {
  return {
    seed: 42,
    maxTimeMs: 25,
    maxEvents: 10000,
    requestRateRps: 200,
    requestDistribution: 'constant',
    ...overrides,
  };
}

function setupRuntime() {
  const emitted: WorkerEvent[] = [];
  const runtime = new SimulationWorkerRuntime((event) => emitted.push(event));
  return { runtime, emitted };
}

describe('SimulationWorkerRuntime', () => {
  it('emits error when start is called before init', () => {
    const { runtime, emitted } = setupRuntime();

    runtime.handle({ type: 'start' });

    expect(emitted[0]).toEqual({
      type: 'error',
      message: 'Simulator not initialized. Send "init" first.',
    });
  });

  it('initializes simulator and emits idle status', () => {
    const { runtime, emitted } = setupRuntime();

    runtime.handle({
      type: 'init',
      topology: createTopology(),
      config: createConfig(),
    });

    expect(emitted).toContainEqual({ type: 'status', status: 'idle' });
  });

  it('runs full simulation after init and emits completion', () => {
    const { runtime, emitted } = setupRuntime();

    runtime.handle({
      type: 'init',
      topology: createTopology(),
      config: createConfig({ maxTimeMs: 1200 }),
    });
    runtime.handle({ type: 'start' });

    expect(emitted).toContainEqual({ type: 'status', status: 'running' });
    expect(emitted.some((event) => event.type === 'events')).toBe(true);
    expect(emitted.some((event) => event.type === 'metrics')).toBe(true);

    const complete = emitted.find((event) => event.type === 'complete');
    expect(complete?.type).toBe('complete');
    if (complete?.type === 'complete') {
      expect(complete.eventsProcessed).toBeGreaterThan(0);
      expect(complete.simulationTime).toBeGreaterThan(0);
    }

    expect(emitted).toContainEqual({ type: 'status', status: 'completed' });
  });

  it('steps simulation event-by-event until completion', () => {
    const { runtime, emitted } = setupRuntime();

    runtime.handle({
      type: 'init',
      topology: createTopology(),
      config: createConfig({ maxTimeMs: 10 }),
    });

    for (let i = 0; i < 200; i++) {
      runtime.handle({ type: 'step' });
      if (emitted.some((event) => event.type === 'complete')) break;
    }

    expect(emitted.some((event) => event.type === 'events')).toBe(true);
    expect(emitted.some((event) => event.type === 'complete')).toBe(true);
    expect(emitted).toContainEqual({ type: 'status', status: 'completed' });
  });

  it('applies configure updates by re-initializing with merged config', () => {
    const { runtime, emitted } = setupRuntime();

    runtime.handle({
      type: 'init',
      topology: createTopology(),
      config: createConfig({ maxTimeMs: 500 }),
    });
    runtime.handle({
      type: 'configure',
      config: { maxTimeMs: 5 },
    });
    runtime.handle({ type: 'start' });

    const complete = emitted.find((event) => event.type === 'complete');
    expect(complete?.type).toBe('complete');
    if (complete?.type === 'complete') {
      expect(complete.simulationTime).toBeLessThanOrEqual(5);
    }
  });

  it('resets runtime and requires re-init for step/start', () => {
    const { runtime, emitted } = setupRuntime();

    runtime.handle({
      type: 'init',
      topology: createTopology(),
      config: createConfig(),
    });
    runtime.handle({ type: 'reset' });
    runtime.handle({ type: 'step' });

    expect(emitted).toContainEqual({ type: 'status', status: 'idle' });
    expect(emitted[emitted.length - 1]).toEqual({
      type: 'error',
      message: 'Simulator not initialized. Send "init" first.',
    });
  });
});
