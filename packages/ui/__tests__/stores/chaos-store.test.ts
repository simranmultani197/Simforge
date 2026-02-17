import { beforeEach, describe, expect, it } from 'vitest';
import type { SimTopology } from '@simforge/types';
import { useChaosStore } from '../../src/stores/chaos-store';

function makeTopology(): SimTopology {
  return {
    nodes: [
      {
        id: 'gw-1',
        position: { x: 0, y: 0 },
        metadata: { label: 'Gateway' },
        config: {
          kind: 'api-gateway',
          rateLimitRps: 1000,
          burstSize: 50,
          authLatencyMs: { type: 'constant', value: 3 },
          routes: 8,
          failureRate: 0.001,
          maxConcurrentRequests: 1000,
        },
      },
      {
        id: 'svc-1',
        position: { x: 10, y: 0 },
        metadata: { label: 'Service' },
        config: {
          kind: 'service',
          replicas: 1,
          latencyMs: { type: 'constant', value: 10 },
          failureRate: 0.01,
          maxConcurrency: 100,
        },
      },
      {
        id: 'db-1',
        position: { x: 100, y: 0 },
        metadata: { label: 'Database' },
        config: {
          kind: 'database',
          engine: 'postgres',
          maxConnections: 100,
          queryLatencyMs: { type: 'constant', value: 8 },
          writeLatencyMs: { type: 'constant', value: 14 },
          failureRate: 0.001,
          connectionPoolSize: 100,
          replicationFactor: 1,
        },
      },
    ],
    edges: [
      {
        id: 'e1',
        source: 'gw-1',
        target: 'svc-1',
        config: {
          latencyMs: { type: 'constant', value: 5 },
          bandwidthMbps: 1000,
          failureRate: 0,
        },
      },
      {
        id: 'e2',
        source: 'svc-1',
        target: 'db-1',
        config: {
          latencyMs: { type: 'constant', value: 7 },
          bandwidthMbps: 1000,
          failureRate: 0,
        },
      },
      {
        id: 'e3',
        source: 'gw-1',
        target: 'db-1',
        config: {
          latencyMs: { type: 'constant', value: 9 },
          bandwidthMbps: 1000,
          failureRate: 0,
        },
      },
    ],
  };
}

describe('chaos-store', () => {
  beforeEach(() => {
    useChaosStore.setState({
      nodeFaults: {},
      partitionedEdgeIds: [],
      cascadeNodeIds: [],
    });
  });

  it('setNodeFault sanitizes state and computes cascade', () => {
    const topology = makeTopology();
    const store = useChaosStore.getState();

    store.setNodeFault('gw-1', { kill: true }, topology);
    expect(useChaosStore.getState().nodeFaults['gw-1']).toEqual({ kill: true });
    expect(useChaosStore.getState().cascadeNodeIds).toEqual(
      expect.arrayContaining(['svc-1', 'db-1']),
    );

    store.setNodeFault('gw-1', { kill: false, dropPackets: false }, topology);
    expect(useChaosStore.getState().nodeFaults['gw-1']).toBeUndefined();
    expect(useChaosStore.getState().cascadeNodeIds).toEqual([]);
  });

  it('toggles edge partition state', () => {
    const store = useChaosStore.getState();
    store.togglePartitionEdge('e2');
    expect(useChaosStore.getState().partitionedEdgeIds).toEqual(['e2']);

    store.togglePartitionEdge('e2');
    expect(useChaosStore.getState().partitionedEdgeIds).toEqual([]);
  });

  it('mutates effective topology for node and edge faults', () => {
    const topology = makeTopology();
    useChaosStore.setState({
      nodeFaults: {
        'gw-1': { latencySpikeFactor: 3, dropPackets: true },
        'svc-1': { kill: true },
      },
      partitionedEdgeIds: ['e2'],
      cascadeNodeIds: ['db-1'],
    });

    const effective = useChaosStore.getState().getEffectiveTopology(topology);
    const gateway = effective.nodes.find((node) => node.id === 'gw-1');
    const service = effective.nodes.find((node) => node.id === 'svc-1');
    const edge1 = effective.edges.find((edge) => edge.id === 'e1');
    const edge2 = effective.edges.find((edge) => edge.id === 'e2');

    expect(gateway?.config.kind).toBe('api-gateway');
    if (gateway?.config.kind === 'api-gateway') {
      expect(gateway.config.authLatencyMs).toEqual({ type: 'constant', value: 9 });
    }

    expect(service?.config.kind).toBe('service');
    if (service?.config.kind === 'service') {
      expect(service.config.failureRate).toBe(1);
      expect(service.config.maxConcurrency).toBe(0);
    }

    expect(edge1?.config.failureRate).toBe(1);
    expect(edge1?.config.latencyMs).toEqual({ type: 'constant', value: 15 });
    expect(edge2?.config.failureRate).toBe(1);
  });

  it('applies database failover preset', () => {
    const topology = makeTopology();
    useChaosStore.getState().applyPreset('database-failover', topology);

    expect(useChaosStore.getState().nodeFaults['db-1']).toEqual({ kill: true });
    expect(useChaosStore.getState().partitionedEdgeIds).toEqual([]);
  });

  it('applies gateway brownout preset', () => {
    const topology = makeTopology();
    useChaosStore.getState().applyPreset('gateway-brownout', topology);

    expect(useChaosStore.getState().nodeFaults['gw-1']).toEqual({
      latencySpikeFactor: 8,
      dropPackets: true,
    });
  });

  it('applies region failure preset with partitions', () => {
    const topology = makeTopology();
    useChaosStore.getState().applyPreset('region-failure', topology);

    expect(useChaosStore.getState().partitionedEdgeIds).toEqual(
      expect.arrayContaining(['e2', 'e3']),
    );
    expect(Object.values(useChaosStore.getState().nodeFaults)).toEqual(
      expect.arrayContaining([{ kill: true }]),
    );
  });
});
