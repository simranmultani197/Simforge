import { describe, it, expect } from 'vitest';
import { Simulator } from '../../src/simulator/simulator';
import type {
  SimTopology,
  SimulationConfig,
  SimNode,
  SimEdge,
} from '@simforge/types';

function makeNode(id: string, config: SimNode['config']): SimNode {
  return { id, config, position: { x: 0, y: 0 }, metadata: { label: id } };
}

function makeEdge(
  id: string,
  source: string,
  target: string,
  latencyMs = 1,
  failureRate = 0,
): SimEdge {
  return {
    id,
    source,
    target,
    config: {
      latencyMs: { type: 'constant', value: latencyMs },
      bandwidthMbps: 1000,
      failureRate,
    },
  };
}

function makeConfig(overrides: Partial<SimulationConfig> = {}): SimulationConfig {
  return {
    seed: 42,
    maxTimeMs: 1000,
    maxEvents: 100000,
    requestRateRps: 100,
    requestDistribution: 'constant',
    ...overrides,
  };
}

describe('Simulator', () => {
  describe('single service', () => {
    it('processes all requests with no failures', () => {
      const topology: SimTopology = {
        nodes: [
          makeNode('svc-1', {
            kind: 'service',
            replicas: 1,
            latencyMs: { type: 'constant', value: 5 },
            failureRate: 0,
            maxConcurrency: 1000,
          }),
        ],
        edges: [],
      };

      const config = makeConfig({ requestRateRps: 100, maxTimeMs: 1000 });
      const sim = new Simulator({ topology, config });
      const metrics = sim.run();

      expect(metrics.completedRequests).toBeGreaterThan(0);
      expect(metrics.droppedRequests).toBe(0);
      expect(metrics.completedRequests).toBe(metrics.totalRequests);
      expect(metrics.p50LatencyMs).toBeGreaterThan(0);
    });
  });

  describe('load balancer → services', () => {
    const topology: SimTopology = {
      nodes: [
        makeNode('lb-1', {
          kind: 'load-balancer',
          algorithm: 'round-robin',
          maxConnections: 10000,
        }),
        makeNode('svc-1', {
          kind: 'service',
          replicas: 1,
          latencyMs: { type: 'constant', value: 10 },
          failureRate: 0,
          maxConcurrency: 1000,
        }),
        makeNode('svc-2', {
          kind: 'service',
          replicas: 1,
          latencyMs: { type: 'constant', value: 10 },
          failureRate: 0,
          maxConcurrency: 1000,
        }),
        makeNode('svc-3', {
          kind: 'service',
          replicas: 1,
          latencyMs: { type: 'constant', value: 10 },
          failureRate: 0,
          maxConcurrency: 1000,
        }),
      ],
      edges: [
        makeEdge('e1', 'lb-1', 'svc-1'),
        makeEdge('e2', 'lb-1', 'svc-2'),
        makeEdge('e3', 'lb-1', 'svc-3'),
      ],
    };

    it('routes requests through load balancer to services', () => {
      const config = makeConfig({ requestRateRps: 300, maxTimeMs: 1000 });
      const sim = new Simulator({ topology, config });
      const metrics = sim.run();

      expect(metrics.completedRequests).toBeGreaterThan(0);
      expect(metrics.droppedRequests).toBe(0);
      // Latency should be ~10ms service + ~1ms edge = ~11ms
      expect(metrics.p50LatencyMs).toBeGreaterThanOrEqual(10);
    });

    it('drops requests when service has failures', () => {
      const failTopology: SimTopology = {
        ...topology,
        nodes: [
          topology.nodes[0]!,
          makeNode('svc-1', {
            kind: 'service',
            replicas: 1,
            latencyMs: { type: 'constant', value: 10 },
            failureRate: 0.5,
            maxConcurrency: 1000,
          }),
          makeNode('svc-2', {
            kind: 'service',
            replicas: 1,
            latencyMs: { type: 'constant', value: 10 },
            failureRate: 0.5,
            maxConcurrency: 1000,
          }),
          makeNode('svc-3', {
            kind: 'service',
            replicas: 1,
            latencyMs: { type: 'constant', value: 10 },
            failureRate: 0.5,
            maxConcurrency: 1000,
          }),
        ],
      };

      const config = makeConfig({ requestRateRps: 100, maxTimeMs: 1000 });
      const sim = new Simulator({ topology: failTopology, config });
      const metrics = sim.run();

      expect(metrics.droppedRequests).toBeGreaterThan(0);
      expect(metrics.completedRequests).toBeGreaterThan(0);
      expect(metrics.totalRequests).toBe(
        metrics.completedRequests + metrics.droppedRequests,
      );
    });
  });

  describe('queue → service', () => {
    it('processes messages through queue to consumer', () => {
      const topology: SimTopology = {
        nodes: [
          makeNode('queue-1', {
            kind: 'queue',
            maxDepth: 1000,
            processingTimeMs: { type: 'constant', value: 2 },
            deadLetterEnabled: false,
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

      const config = makeConfig({ requestRateRps: 100, maxTimeMs: 1000 });
      const sim = new Simulator({ topology, config });
      const metrics = sim.run();

      expect(metrics.completedRequests).toBeGreaterThan(0);
      // Latency = queue processing (2ms) + service latency (5ms) = 7ms
      expect(metrics.p50LatencyMs).toBeGreaterThanOrEqual(5);
    });
  });

  describe('edge latency', () => {
    it('includes edge traversal time in total latency', () => {
      const topology: SimTopology = {
        nodes: [
          makeNode('svc-1', {
            kind: 'service',
            replicas: 1,
            latencyMs: { type: 'constant', value: 10 },
            failureRate: 0,
            maxConcurrency: 1000,
          }),
          makeNode('svc-2', {
            kind: 'service',
            replicas: 1,
            latencyMs: { type: 'constant', value: 10 },
            failureRate: 0,
            maxConcurrency: 1000,
          }),
        ],
        edges: [makeEdge('e1', 'svc-1', 'svc-2', 50)], // 50ms edge latency
      };

      const config = makeConfig({ requestRateRps: 10, maxTimeMs: 1000 });
      const sim = new Simulator({ topology, config });
      const metrics = sim.run();

      // Total latency should be svc-1 (10ms) + edge (50ms) + svc-2 (10ms) = 70ms
      expect(metrics.p50LatencyMs).toBeGreaterThanOrEqual(60);
    });
  });

  describe('overloaded service', () => {
    it('drops requests when maxConcurrency exceeded', () => {
      const topology: SimTopology = {
        nodes: [
          makeNode('svc-1', {
            kind: 'service',
            replicas: 1,
            latencyMs: { type: 'constant', value: 100 },
            failureRate: 0,
            maxConcurrency: 1, // Only 1 concurrent request
          }),
        ],
        edges: [],
      };

      // High RPS with low concurrency = drops
      const config = makeConfig({ requestRateRps: 100, maxTimeMs: 1000 });
      const sim = new Simulator({ topology, config });
      const metrics = sim.run();

      expect(metrics.droppedRequests).toBeGreaterThan(0);
    });
  });

  describe('metrics sampling', () => {
    it('calls onMetrics callback during simulation', () => {
      const topology: SimTopology = {
        nodes: [
          makeNode('svc-1', {
            kind: 'service',
            replicas: 1,
            latencyMs: { type: 'constant', value: 5 },
            failureRate: 0,
            maxConcurrency: 1000,
          }),
        ],
        edges: [],
      };

      const samples: unknown[] = [];
      const config = makeConfig({ maxTimeMs: 5000 });
      const sim = new Simulator({
        topology,
        config,
        onMetrics: (s) => samples.push(s),
        metricsIntervalMs: 1000,
      });
      sim.run();

      // Should have ~5 samples (at 1000, 2000, 3000, 4000, 5000)
      expect(samples.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe('10k request simulation', () => {
    it('produces reasonable metrics for a realistic topology', () => {
      const topology: SimTopology = {
        nodes: [
          makeNode('lb-1', {
            kind: 'load-balancer',
            algorithm: 'round-robin',
            maxConnections: 50000,
          }),
          makeNode('svc-1', {
            kind: 'service',
            replicas: 1,
            latencyMs: { type: 'constant', value: 10 },
            failureRate: 0.01,
            maxConcurrency: 5000,
          }),
          makeNode('svc-2', {
            kind: 'service',
            replicas: 1,
            latencyMs: { type: 'constant', value: 10 },
            failureRate: 0.01,
            maxConcurrency: 5000,
          }),
          makeNode('svc-3', {
            kind: 'service',
            replicas: 1,
            latencyMs: { type: 'constant', value: 10 },
            failureRate: 0.01,
            maxConcurrency: 5000,
          }),
        ],
        edges: [
          makeEdge('e1', 'lb-1', 'svc-1', 1),
          makeEdge('e2', 'lb-1', 'svc-2', 1),
          makeEdge('e3', 'lb-1', 'svc-3', 1),
        ],
      };

      const config = makeConfig({
        requestRateRps: 1000,
        maxTimeMs: 10000,
        maxEvents: 1000000,
      });
      const sim = new Simulator({ topology, config });
      const metrics = sim.run();

      expect(metrics.totalRequests).toBeGreaterThan(0);
      expect(metrics.completedRequests).toBeGreaterThan(0);
      expect(metrics.p50LatencyMs).toBeGreaterThan(0);
      expect(metrics.maxThroughputRps).toBeGreaterThan(0);
      expect(metrics.completedRequests + metrics.droppedRequests).toBe(
        metrics.totalRequests,
      );
      expect(metrics.eventsProcessed).toBeGreaterThan(metrics.totalRequests);
    });
  });
});
