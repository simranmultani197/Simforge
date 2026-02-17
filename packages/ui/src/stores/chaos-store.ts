import { create } from 'zustand';
import type { ComponentConfig, Distribution, SimTopology } from '@simforge/types';

export type ChaosPreset = 'region-failure' | 'database-failover' | 'gateway-brownout';

export interface NodeChaosFault {
  kill?: boolean;
  latencySpikeFactor?: number;
  dropPackets?: boolean;
}

interface ChaosState {
  nodeFaults: Record<string, NodeChaosFault>;
  partitionedEdgeIds: string[];
  cascadeNodeIds: string[];
  setNodeFault: (
    nodeId: string,
    patch: Partial<NodeChaosFault>,
    topology: SimTopology,
  ) => void;
  clearNodeFault: (nodeId: string, topology: SimTopology) => void;
  togglePartitionEdge: (edgeId: string) => void;
  clearAllFaults: () => void;
  applyPreset: (preset: ChaosPreset, topology: SimTopology) => void;
  getEffectiveTopology: (topology: SimTopology) => SimTopology;
}

function sanitizeFault(fault: NodeChaosFault): NodeChaosFault | null {
  const normalized: NodeChaosFault = {};

  if (fault.kill) normalized.kill = true;
  if (fault.dropPackets) normalized.dropPackets = true;
  if (
    typeof fault.latencySpikeFactor === 'number' &&
    Number.isFinite(fault.latencySpikeFactor) &&
    fault.latencySpikeFactor > 1
  ) {
    normalized.latencySpikeFactor = fault.latencySpikeFactor;
  }

  return Object.keys(normalized).length > 0 ? normalized : null;
}

function multiplyDistribution(dist: Distribution, factor: number): Distribution {
  switch (dist.type) {
    case 'constant':
      return { ...dist, value: dist.value * factor };
    case 'uniform':
      return { ...dist, min: dist.min * factor, max: dist.max * factor };
    case 'exponential':
      return { ...dist, rate: dist.rate / factor };
    case 'normal':
      return {
        ...dist,
        mean: dist.mean * factor,
        stddev: dist.stddev * factor,
      };
  }
}

function applyLatencySpikeToConfig(
  config: ComponentConfig,
  factor: number,
): ComponentConfig {
  switch (config.kind) {
    case 'service':
      return {
        ...config,
        latencyMs: multiplyDistribution(config.latencyMs, factor),
      };
    case 'queue':
      return {
        ...config,
        processingTimeMs: multiplyDistribution(config.processingTimeMs, factor),
      };
    case 'database':
      return {
        ...config,
        queryLatencyMs: multiplyDistribution(config.queryLatencyMs, factor),
        writeLatencyMs: multiplyDistribution(config.writeLatencyMs, factor),
      };
    case 'cache':
      return {
        ...config,
        hitLatencyMs: multiplyDistribution(config.hitLatencyMs, factor),
        missLatencyMs: multiplyDistribution(config.missLatencyMs, factor),
      };
    case 'api-gateway':
      return {
        ...config,
        authLatencyMs: multiplyDistribution(config.authLatencyMs, factor),
      };
    case 'load-balancer':
      return config;
  }
}

function applyKillToConfig(config: ComponentConfig): ComponentConfig {
  switch (config.kind) {
    case 'service':
      return { ...config, failureRate: 1, maxConcurrency: 0 };
    case 'load-balancer':
      return { ...config, maxConnections: 0 };
    case 'queue':
      return { ...config, maxDepth: 0, deadLetterEnabled: true };
    case 'database':
      return { ...config, failureRate: 1, connectionPoolSize: 0, maxConnections: 0 };
    case 'cache':
      // Cache has no intrinsic failure mode in v0.2 behaviors, so edge failures
      // are injected separately. Keep config unchanged.
      return config;
    case 'api-gateway':
      return {
        ...config,
        failureRate: 1,
        maxConcurrentRequests: 0,
        rateLimitRps: 0,
      };
  }
}

function computeCascadeNodeIds(
  topology: SimTopology,
  nodeFaults: Record<string, NodeChaosFault>,
): string[] {
  const seeds = Object.entries(nodeFaults)
    .filter(([, fault]) => fault.kill || fault.dropPackets)
    .map(([nodeId]) => nodeId);

  if (seeds.length === 0) return [];

  const adjacency = new Map<string, string[]>();
  for (const edge of topology.edges) {
    const existing = adjacency.get(edge.source);
    if (existing) {
      existing.push(edge.target);
    } else {
      adjacency.set(edge.source, [edge.target]);
    }
  }

  const seen = new Set<string>(seeds);
  const queue = [...seeds];

  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    for (const target of adjacency.get(nodeId) ?? []) {
      if (seen.has(target)) continue;
      seen.add(target);
      queue.push(target);
    }
  }

  for (const seed of seeds) {
    seen.delete(seed);
  }
  return [...seen];
}

function applyRegionFailurePreset(topology: SimTopology) {
  if (topology.nodes.length === 0) {
    return { nodeFaults: {}, partitionedEdgeIds: [] as string[] };
  }

  const sortedX = topology.nodes
    .map((node) => node.position.x)
    .sort((a, b) => a - b);
  const medianX = sortedX[Math.floor(sortedX.length / 2)]!;

  const leftNodes = new Set(
    topology.nodes
      .filter((node) => node.position.x <= medianX)
      .map((node) => node.id),
  );
  const rightNodes = new Set(
    topology.nodes
      .filter((node) => node.position.x > medianX)
      .map((node) => node.id),
  );

  const partitionedEdgeIds = topology.edges
    .filter(
      (edge) =>
        (leftNodes.has(edge.source) && rightNodes.has(edge.target)) ||
        (rightNodes.has(edge.source) && leftNodes.has(edge.target)),
    )
    .map((edge) => edge.id);

  const killCandidate = topology.nodes.find(
    (node) =>
      leftNodes.has(node.id) &&
      (node.config.kind === 'service' ||
        node.config.kind === 'database' ||
        node.config.kind === 'api-gateway' ||
        node.config.kind === 'load-balancer'),
  );

  const nodeFaults: Record<string, NodeChaosFault> = {};
  if (killCandidate) {
    nodeFaults[killCandidate.id] = { kill: true };
  }

  return { nodeFaults, partitionedEdgeIds };
}

function applyDatabaseFailoverPreset(topology: SimTopology) {
  const nodeFaults: Record<string, NodeChaosFault> = {};
  const db = topology.nodes.find((node) => node.config.kind === 'database');
  if (db) {
    nodeFaults[db.id] = { kill: true };
  }
  return { nodeFaults, partitionedEdgeIds: [] as string[] };
}

function applyGatewayBrownoutPreset(topology: SimTopology) {
  const nodeFaults: Record<string, NodeChaosFault> = {};
  const gateway = topology.nodes.find((node) => node.config.kind === 'api-gateway');
  if (gateway) {
    nodeFaults[gateway.id] = {
      latencySpikeFactor: 8,
      dropPackets: true,
    };
  }
  return { nodeFaults, partitionedEdgeIds: [] as string[] };
}

export const useChaosStore = create<ChaosState>()((set, get) => ({
  nodeFaults: {},
  partitionedEdgeIds: [],
  cascadeNodeIds: [],

  setNodeFault: (nodeId, patch, topology) => {
    const existing = get().nodeFaults[nodeId] ?? {};
    const merged = sanitizeFault({ ...existing, ...patch });

    const nextFaults = { ...get().nodeFaults };
    if (merged) {
      nextFaults[nodeId] = merged;
    } else {
      delete nextFaults[nodeId];
    }

    set({
      nodeFaults: nextFaults,
      cascadeNodeIds: computeCascadeNodeIds(topology, nextFaults),
    });
  },

  clearNodeFault: (nodeId, topology) => {
    const nextFaults = { ...get().nodeFaults };
    delete nextFaults[nodeId];
    set({
      nodeFaults: nextFaults,
      cascadeNodeIds: computeCascadeNodeIds(topology, nextFaults),
    });
  },

  togglePartitionEdge: (edgeId) => {
    const current = new Set(get().partitionedEdgeIds);
    if (current.has(edgeId)) {
      current.delete(edgeId);
    } else {
      current.add(edgeId);
    }
    set({ partitionedEdgeIds: [...current] });
  },

  clearAllFaults: () => {
    set({
      nodeFaults: {},
      partitionedEdgeIds: [],
      cascadeNodeIds: [],
    });
  },

  applyPreset: (preset, topology) => {
    const presetResult =
      preset === 'region-failure'
        ? applyRegionFailurePreset(topology)
        : preset === 'database-failover'
          ? applyDatabaseFailoverPreset(topology)
          : applyGatewayBrownoutPreset(topology);

    set({
      nodeFaults: presetResult.nodeFaults,
      partitionedEdgeIds: presetResult.partitionedEdgeIds,
      cascadeNodeIds: computeCascadeNodeIds(topology, presetResult.nodeFaults),
    });
  },

  getEffectiveTopology: (topology) => {
    const { nodeFaults, partitionedEdgeIds } = get();

    const killedNodeIds = new Set(
      Object.entries(nodeFaults)
        .filter(([, fault]) => Boolean(fault.kill))
        .map(([nodeId]) => nodeId),
    );

    const partitionedSet = new Set(partitionedEdgeIds);

    const nodes = topology.nodes.map((node) => {
      const fault = nodeFaults[node.id];
      if (!fault) return node;

      let nextConfig = node.config;
      if (fault.kill) {
        nextConfig = applyKillToConfig(nextConfig);
      }
      if (fault.latencySpikeFactor) {
        nextConfig = applyLatencySpikeToConfig(
          nextConfig,
          fault.latencySpikeFactor,
        );
      }

      return { ...node, config: nextConfig };
    });

    const edges = topology.edges.map((edge) => {
      const sourceFault = nodeFaults[edge.source];
      const targetFault = nodeFaults[edge.target];

      let nextFailureRate = edge.config.failureRate;
      let nextLatency = edge.config.latencyMs;

      if (partitionedSet.has(edge.id)) {
        nextFailureRate = 1;
      }

      if (killedNodeIds.has(edge.source) || killedNodeIds.has(edge.target)) {
        nextFailureRate = 1;
      }

      if (sourceFault?.dropPackets) {
        nextFailureRate = Math.max(nextFailureRate, 0.9);
      }

      const latencyFactor = Math.max(
        sourceFault?.latencySpikeFactor ?? 1,
        targetFault?.latencySpikeFactor ?? 1,
      );
      if (latencyFactor > 1) {
        nextLatency = multiplyDistribution(nextLatency, latencyFactor);
      }

      if (
        nextFailureRate === edge.config.failureRate &&
        nextLatency === edge.config.latencyMs
      ) {
        return edge;
      }

      return {
        ...edge,
        config: {
          ...edge.config,
          failureRate: nextFailureRate,
          latencyMs: nextLatency,
        },
      };
    });

    return { nodes, edges };
  },
}));
