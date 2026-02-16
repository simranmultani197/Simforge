import { describe, it, expect } from 'vitest';
import { Simulator } from '../../src/simulator/simulator';
import type {
  SimTopology,
  SimulationConfig,
  SimulationMetrics,
  SimNode,
  SimEdge,
} from '@simforge/types';

function makeNode(id: string, config: SimNode['config']): SimNode {
  return { id, config, position: { x: 0, y: 0 }, metadata: { label: id } };
}

function makeEdge(id: string, source: string, target: string): SimEdge {
  return {
    id,
    source,
    target,
    config: {
      latencyMs: { type: 'constant', value: 1 },
      bandwidthMbps: 1000,
      failureRate: 0,
    },
  };
}

function runSimulation(topology: SimTopology, config: SimulationConfig): SimulationMetrics {
  const sim = new Simulator({ topology, config });
  return sim.run();
}

/**
 * Assert two SimulationMetrics are byte-identical.
 */
function assertMetricsEqual(a: SimulationMetrics, b: SimulationMetrics): void {
  expect(a.totalRequests).toBe(b.totalRequests);
  expect(a.completedRequests).toBe(b.completedRequests);
  expect(a.droppedRequests).toBe(b.droppedRequests);
  expect(a.avgLatencyMs).toBe(b.avgLatencyMs);
  expect(a.p50LatencyMs).toBe(b.p50LatencyMs);
  expect(a.p95LatencyMs).toBe(b.p95LatencyMs);
  expect(a.p99LatencyMs).toBe(b.p99LatencyMs);
  expect(a.maxThroughputRps).toBe(b.maxThroughputRps);
  expect(a.simulationDurationMs).toBe(b.simulationDurationMs);
  expect(a.eventsProcessed).toBe(b.eventsProcessed);
}

// Topology 1: Single service
const singleServiceTopology: SimTopology = {
  nodes: [
    makeNode('svc-1', {
      kind: 'service',
      replicas: 1,
      latencyMs: { type: 'constant', value: 10 },
      failureRate: 0.05,
      maxConcurrency: 50,
    }),
  ],
  edges: [],
};

// Topology 2: LB → 2 services
const lbTopology: SimTopology = {
  nodes: [
    makeNode('lb-1', {
      kind: 'load-balancer',
      algorithm: 'round-robin',
      maxConnections: 10000,
    }),
    makeNode('svc-1', {
      kind: 'service',
      replicas: 1,
      latencyMs: { type: 'exponential', rate: 0.1 },
      failureRate: 0.02,
      maxConcurrency: 100,
    }),
    makeNode('svc-2', {
      kind: 'service',
      replicas: 1,
      latencyMs: { type: 'exponential', rate: 0.1 },
      failureRate: 0.02,
      maxConcurrency: 100,
    }),
  ],
  edges: [
    makeEdge('e1', 'lb-1', 'svc-1'),
    makeEdge('e2', 'lb-1', 'svc-2'),
  ],
};

// Topology 3: Queue → Service
const queueTopology: SimTopology = {
  nodes: [
    makeNode('queue-1', {
      kind: 'queue',
      maxDepth: 500,
      processingTimeMs: { type: 'constant', value: 2 },
      deadLetterEnabled: true,
    }),
    makeNode('svc-1', {
      kind: 'service',
      replicas: 1,
      latencyMs: { type: 'constant', value: 5 },
      failureRate: 0,
      maxConcurrency: 1000,
    }),
  ],
  edges: [makeEdge('e1', 'queue-1', 'svc-1')],
};

// Topology 4: LB → Queue → Service (chain)
const chainTopology: SimTopology = {
  nodes: [
    makeNode('lb-1', {
      kind: 'load-balancer',
      algorithm: 'least-connections',
      maxConnections: 10000,
    }),
    makeNode('queue-1', {
      kind: 'queue',
      maxDepth: 100,
      processingTimeMs: { type: 'constant', value: 1 },
      deadLetterEnabled: false,
    }),
    makeNode('svc-1', {
      kind: 'service',
      replicas: 1,
      latencyMs: { type: 'normal', mean: 10, stddev: 3 },
      failureRate: 0.01,
      maxConcurrency: 200,
    }),
  ],
  edges: [
    makeEdge('e1', 'lb-1', 'queue-1'),
    makeEdge('e2', 'queue-1', 'svc-1'),
  ],
};

// Topology 5: Poisson arrivals
const poissonConfig: SimulationConfig = {
  seed: 99,
  maxTimeMs: 5000,
  maxEvents: 500000,
  requestRateRps: 200,
  requestDistribution: 'poisson',
};

const topologies = [
  { name: 'single-service', topology: singleServiceTopology },
  { name: 'lb-2-services', topology: lbTopology },
  { name: 'queue-service', topology: queueTopology },
  { name: 'chain', topology: chainTopology },
];

describe('Deterministic Replay', () => {
  describe('same seed produces identical results', () => {
    for (const { name, topology } of topologies) {
      it(`topology: ${name}`, () => {
        const config: SimulationConfig = {
          seed: 42,
          maxTimeMs: 5000,
          maxEvents: 500000,
          requestRateRps: 200,
          requestDistribution: 'constant',
        };

        const run1 = runSimulation(topology, config);
        const run2 = runSimulation(topology, config);
        const run3 = runSimulation(topology, config);

        assertMetricsEqual(run1, run2);
        assertMetricsEqual(run2, run3);
      });
    }
  });

  it('poisson arrivals are also deterministic', () => {
    const run1 = runSimulation(lbTopology, poissonConfig);
    const run2 = runSimulation(lbTopology, poissonConfig);

    assertMetricsEqual(run1, run2);
  });

  it('different seeds produce different results', () => {
    const config1: SimulationConfig = {
      seed: 1,
      maxTimeMs: 5000,
      maxEvents: 500000,
      requestRateRps: 200,
      requestDistribution: 'constant',
    };

    const config2: SimulationConfig = { ...config1, seed: 2 };

    const run1 = runSimulation(lbTopology, config1);
    const run2 = runSimulation(lbTopology, config2);

    // With different seeds, at least some metrics should differ
    const allEqual =
      run1.completedRequests === run2.completedRequests &&
      run1.droppedRequests === run2.droppedRequests &&
      run1.p50LatencyMs === run2.p50LatencyMs &&
      run1.p99LatencyMs === run2.p99LatencyMs;

    expect(allEqual).toBe(false);
  });

  it('reset and re-run produces identical results', () => {
    const config: SimulationConfig = {
      seed: 42,
      maxTimeMs: 3000,
      maxEvents: 100000,
      requestRateRps: 100,
      requestDistribution: 'constant',
    };

    const sim = new Simulator({ topology: lbTopology, config });

    const run1 = sim.run();
    sim.reset();
    const run2 = sim.run();

    assertMetricsEqual(run1, run2);
  });
});
