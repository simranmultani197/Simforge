import { create } from 'zustand';
import { temporal } from 'zundo';
import {
  applyNodeChanges,
  applyEdgeChanges,
  type Connection,
  type NodeChange,
  type EdgeChange,
} from '@xyflow/react';
import type {
  ComponentConfig,
  SimTopology,
  SimNode,
  SimEdge as EngineSimEdge,
} from '@simforge/types';
import type {
  SimforgeNode,
  SimforgeEdge,
  SimforgeEdgeData,
  SimforgeNodeType,
} from '../types/flow';

// ---------------------------------------------------------------------------
// Default configs for each node type
// ---------------------------------------------------------------------------

const DEFAULT_CONFIGS: Record<SimforgeNodeType, ComponentConfig> = {
  client: {
    kind: 'client',
  },
  service: {
    kind: 'service',
    replicas: 1,
    latencyMs: { type: 'constant', value: 50 },
    failureRate: 0.01,
    maxConcurrency: 100,
  },
  'load-balancer': {
    kind: 'load-balancer',
    algorithm: 'round-robin',
    maxConnections: 10000,
  },
  queue: {
    kind: 'queue',
    maxDepth: 1000,
    processingTimeMs: { type: 'constant', value: 10 },
    deadLetterEnabled: false,
  },
  database: {
    kind: 'database',
    engine: 'postgres',
    maxConnections: 100,
    queryLatencyMs: { type: 'normal', mean: 5, stddev: 2 },
    writeLatencyMs: { type: 'normal', mean: 10, stddev: 3 },
    failureRate: 0.001,
    connectionPoolSize: 100,
    replicationFactor: 1,
  },
  cache: {
    kind: 'cache',
    evictionPolicy: 'lru',
    maxSizeMb: 256,
    hitRate: 0.85,
    hitLatencyMs: { type: 'constant', value: 1 },
    missLatencyMs: { type: 'constant', value: 2 },
    ttlMs: 60000,
    maxEntries: 100000,
  },
  'api-gateway': {
    kind: 'api-gateway',
    rateLimitRps: 1000,
    burstSize: 50,
    authLatencyMs: { type: 'constant', value: 3 },
    routes: 8,
    failureRate: 0.001,
    maxConcurrentRequests: 1000,
  },
};

const DEFAULT_LABELS: Record<SimforgeNodeType, string> = {
  client: 'Client',
  service: 'Service',
  'load-balancer': 'Load Balancer',
  queue: 'Queue',
  database: 'Database',
  cache: 'Cache',
  'api-gateway': 'API Gateway',
};

const DEFAULT_EDGE_DATA: SimforgeEdgeData = {
  latencyMs: { type: 'constant', value: 5 },
  bandwidthMbps: 1000,
  failureRate: 0,
};

// ---------------------------------------------------------------------------
// Store interface
// ---------------------------------------------------------------------------

interface TopologyState {
  nodes: SimforgeNode[];
  edges: SimforgeEdge[];
  selectedNodeId: string | null;
  selectedEdgeId: string | null;

  // React Flow change handlers
  onNodesChange: (changes: NodeChange<SimforgeNode>[]) => void;
  onEdgesChange: (changes: EdgeChange<SimforgeEdge>[]) => void;
  onConnect: (connection: Connection) => void;

  // CRUD
  addNode: (type: SimforgeNodeType, position: { x: number; y: number }) => void;
  removeNode: (id: string) => void;
  removeEdge: (id: string) => void;
  updateNodeConfig: (id: string, config: Partial<ComponentConfig>) => void;
  updateNodeLabel: (id: string, label: string) => void;
  updateNodePresetId: (id: string, presetId: string) => void;
  updateEdgeConfig: (id: string, config: Partial<SimforgeEdgeData>) => void;
  deleteSelected: () => void;
  clearCanvas: () => void;

  // Selection
  setSelectedNode: (id: string | null) => void;
  setSelectedEdge: (id: string | null) => void;

  // Serialization — bridge React Flow ↔ engine
  toSimTopology: () => SimTopology;
  fromSimTopology: (topology: SimTopology) => void;
}

// Counter for generating readable IDs
let nodeCounter = 0;
let edgeCounter = 0;

// ---------------------------------------------------------------------------
// Store creation
// ---------------------------------------------------------------------------

export const useTopologyStore = create<TopologyState>()(
  temporal(
    (set, get) => ({
      nodes: [],
      edges: [],
      selectedNodeId: null,
      selectedEdgeId: null,

      // ---- React Flow handlers ----

      onNodesChange: (changes) => {
        set({ nodes: applyNodeChanges(changes, get().nodes) });

        // Track selection changes
        for (const change of changes) {
          if (change.type === 'select' && change.selected) {
            set({ selectedNodeId: change.id, selectedEdgeId: null });
          }
        }
      },

      onEdgesChange: (changes) => {
        set({ edges: applyEdgeChanges(changes, get().edges) });

        // Track selection changes
        for (const change of changes) {
          if (change.type === 'select' && change.selected) {
            set({ selectedEdgeId: change.id, selectedNodeId: null });
          }
        }
      },

      onConnect: (connection) => {
        if (!connection.source || !connection.target) return;

        const id = `edge-${++edgeCounter}`;
        const newEdge: SimforgeEdge = {
          id,
          source: connection.source,
          target: connection.target,
          sourceHandle: connection.sourceHandle ?? undefined,
          targetHandle: connection.targetHandle ?? undefined,
          type: 'simforge',
          data: { ...DEFAULT_EDGE_DATA },
        };

        set({ edges: [...get().edges, newEdge] });
      },

      // ---- CRUD ----

      addNode: (type, position) => {
        const id = `${type}-${++nodeCounter}`;
        const config = { ...DEFAULT_CONFIGS[type] };

        const newNode: SimforgeNode = {
          id,
          type,
          position,
          data: {
            label: `${DEFAULT_LABELS[type]} ${nodeCounter}`,
            config,
          },
        } as SimforgeNode;

        set({ nodes: [...get().nodes, newNode] });
      },

      removeNode: (id) => {
        set({
          nodes: get().nodes.filter((n) => n.id !== id),
          edges: get().edges.filter((e) => e.source !== id && e.target !== id),
          selectedNodeId: get().selectedNodeId === id ? null : get().selectedNodeId,
        });
      },

      removeEdge: (id) => {
        set({
          edges: get().edges.filter((e) => e.id !== id),
          selectedEdgeId: get().selectedEdgeId === id ? null : get().selectedEdgeId,
        });
      },

      updateNodeConfig: (id, partialConfig) => {
        set({
          nodes: get().nodes.map((node) =>
            node.id === id
              ? {
                  ...node,
                  data: {
                    ...node.data,
                    config: { ...node.data.config, ...partialConfig },
                  },
                }
              : node,
          ) as SimforgeNode[],
        });
      },

      updateNodeLabel: (id, label) => {
        set({
          nodes: get().nodes.map((node) =>
            node.id === id
              ? { ...node, data: { ...node.data, label } }
              : node,
          ) as SimforgeNode[],
        });
      },

      updateNodePresetId: (id, presetId) => {
        set({
          nodes: get().nodes.map((node) =>
            node.id === id
              ? { ...node, data: { ...node.data, presetId } }
              : node,
          ) as SimforgeNode[],
        });
      },

      updateEdgeConfig: (id, partialData) => {
        set({
          edges: get().edges.map((edge) =>
            edge.id === id
              ? { ...edge, data: { ...edge.data!, ...partialData } }
              : edge,
          ),
        });
      },

      deleteSelected: () => {
        const { selectedNodeId, selectedEdgeId } = get();
        if (selectedNodeId) {
          get().removeNode(selectedNodeId);
        } else if (selectedEdgeId) {
          get().removeEdge(selectedEdgeId);
        }
      },

      clearCanvas: () => {
        set({
          nodes: [],
          edges: [],
          selectedNodeId: null,
          selectedEdgeId: null,
        });
      },

      // ---- Selection ----

      setSelectedNode: (id) => set({ selectedNodeId: id }),
      setSelectedEdge: (id) => set({ selectedEdgeId: id }),

      // ---- Serialization ----

      toSimTopology: (): SimTopology => {
        const { nodes, edges } = get();

        const simNodes: SimNode[] = nodes.map((node) => ({
          id: node.id,
          config: node.data.config as ComponentConfig,
          position: { x: node.position.x, y: node.position.y },
          metadata: { label: node.data.label },
        }));

        const simEdges: EngineSimEdge[] = edges.map((edge) => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          config: {
            latencyMs: edge.data?.latencyMs ?? DEFAULT_EDGE_DATA.latencyMs,
            bandwidthMbps: edge.data?.bandwidthMbps ?? DEFAULT_EDGE_DATA.bandwidthMbps,
            failureRate: edge.data?.failureRate ?? DEFAULT_EDGE_DATA.failureRate,
          },
        }));

        return { nodes: simNodes, edges: simEdges };
      },

      fromSimTopology: (topology) => {
        const nodes: SimforgeNode[] = topology.nodes.map((simNode) => ({
          id: simNode.id,
          type: simNode.config.kind,
          position: { x: simNode.position.x, y: simNode.position.y },
          data: {
            label: simNode.metadata.label,
            config: simNode.config,
          },
        })) as SimforgeNode[];

        const edges: SimforgeEdge[] = topology.edges.map((simEdge) => ({
          id: simEdge.id,
          source: simEdge.source,
          target: simEdge.target,
          type: 'simforge' as const,
          data: {
            latencyMs: simEdge.config.latencyMs,
            bandwidthMbps: simEdge.config.bandwidthMbps,
            failureRate: simEdge.config.failureRate,
          },
        }));

        set({ nodes, edges, selectedNodeId: null, selectedEdgeId: null });
      },
    }),
    {
      // Zundo config: only track graph mutations, not selection
      partialize: (state) => ({
        nodes: state.nodes,
        edges: state.edges,
      }),
      limit: 50,
    },
  ),
);
