import { describe, it, expect, beforeEach } from 'vitest';
import { useTopologyStore } from '../../src/stores/topology-store';
import type { SimTopology } from '@simforge/types';

describe('topology-store', () => {
  beforeEach(() => {
    // Reset store state before each test
    useTopologyStore.setState({
      nodes: [],
      edges: [],
      selectedNodeId: null,
      selectedEdgeId: null,
    });
  });

  // ----- addNode -----

  it('addNode creates a service node with default config', () => {
    useTopologyStore.getState().addNode('service', { x: 100, y: 200 });

    const { nodes } = useTopologyStore.getState();
    expect(nodes).toHaveLength(1);
    expect(nodes[0]!.type).toBe('service');
    expect(nodes[0]!.position).toEqual({ x: 100, y: 200 });
    expect(nodes[0]!.data.config.kind).toBe('service');
    expect(nodes[0]!.data.label).toContain('Service');
  });

  it('addNode creates a load-balancer node', () => {
    useTopologyStore.getState().addNode('load-balancer', { x: 0, y: 0 });

    const { nodes } = useTopologyStore.getState();
    expect(nodes).toHaveLength(1);
    expect(nodes[0]!.data.config.kind).toBe('load-balancer');
  });

  it('addNode creates a queue node', () => {
    useTopologyStore.getState().addNode('queue', { x: 50, y: 50 });

    const { nodes } = useTopologyStore.getState();
    expect(nodes).toHaveLength(1);
    expect(nodes[0]!.data.config.kind).toBe('queue');
  });

  // ----- removeNode -----

  it('removeNode deletes the node and associated edges', () => {
    const store = useTopologyStore.getState();
    store.addNode('service', { x: 0, y: 0 });
    store.addNode('service', { x: 100, y: 0 });

    const nodesAfterAdd = useTopologyStore.getState().nodes;
    expect(nodesAfterAdd).toHaveLength(2);

    const nodeId = nodesAfterAdd[0]!.id;

    // Manually add an edge
    useTopologyStore.setState({
      edges: [
        {
          id: 'e1',
          source: nodesAfterAdd[0]!.id,
          target: nodesAfterAdd[1]!.id,
          type: 'simforge',
          data: {
            latencyMs: { type: 'constant', value: 5 },
            bandwidthMbps: 1000,
            failureRate: 0,
          },
        },
      ],
    });

    useTopologyStore.getState().removeNode(nodeId);

    const state = useTopologyStore.getState();
    expect(state.nodes).toHaveLength(1);
    expect(state.edges).toHaveLength(0); // Edge should be removed too
  });

  it('removeNode clears selection if removed node was selected', () => {
    useTopologyStore.getState().addNode('service', { x: 0, y: 0 });
    const nodeId = useTopologyStore.getState().nodes[0]!.id;

    useTopologyStore.getState().setSelectedNode(nodeId);
    expect(useTopologyStore.getState().selectedNodeId).toBe(nodeId);

    useTopologyStore.getState().removeNode(nodeId);
    expect(useTopologyStore.getState().selectedNodeId).toBeNull();
  });

  // ----- updateNodeConfig -----

  it('updateNodeConfig merges partial config', () => {
    useTopologyStore.getState().addNode('service', { x: 0, y: 0 });
    const nodeId = useTopologyStore.getState().nodes[0]!.id;

    useTopologyStore.getState().updateNodeConfig(nodeId, { failureRate: 0.5 });

    const node = useTopologyStore.getState().nodes[0]!;
    expect(node.data.config.kind).toBe('service');
    if (node.data.config.kind === 'service') {
      expect(node.data.config.failureRate).toBe(0.5);
      // Other fields should remain
      expect(node.data.config.replicas).toBe(1);
    }
  });

  // ----- updateNodeLabel -----

  it('updateNodeLabel updates the label', () => {
    useTopologyStore.getState().addNode('service', { x: 0, y: 0 });
    const nodeId = useTopologyStore.getState().nodes[0]!.id;

    useTopologyStore.getState().updateNodeLabel(nodeId, 'Auth Service');

    expect(useTopologyStore.getState().nodes[0]!.data.label).toBe('Auth Service');
  });

  // ----- onConnect -----

  it('onConnect creates a new edge with default data', () => {
    useTopologyStore.getState().addNode('load-balancer', { x: 0, y: 0 });
    useTopologyStore.getState().addNode('service', { x: 100, y: 100 });

    const nodes = useTopologyStore.getState().nodes;

    useTopologyStore.getState().onConnect({
      source: nodes[0]!.id,
      target: nodes[1]!.id,
      sourceHandle: null,
      targetHandle: null,
    });

    const { edges } = useTopologyStore.getState();
    expect(edges).toHaveLength(1);
    expect(edges[0]!.source).toBe(nodes[0]!.id);
    expect(edges[0]!.target).toBe(nodes[1]!.id);
    expect(edges[0]!.type).toBe('simforge');
    expect(edges[0]!.data?.latencyMs).toEqual({ type: 'constant', value: 5 });
  });

  it('onConnect ignores connections without source or target', () => {
    useTopologyStore.getState().onConnect({
      source: null as unknown as string,
      target: 'some-node',
      sourceHandle: null,
      targetHandle: null,
    });

    expect(useTopologyStore.getState().edges).toHaveLength(0);
  });

  // ----- updateEdgeConfig -----

  it('updateEdgeConfig merges partial edge data', () => {
    useTopologyStore.getState().addNode('service', { x: 0, y: 0 });
    useTopologyStore.getState().addNode('service', { x: 100, y: 0 });

    const nodes = useTopologyStore.getState().nodes;
    useTopologyStore.getState().onConnect({
      source: nodes[0]!.id,
      target: nodes[1]!.id,
      sourceHandle: null,
      targetHandle: null,
    });

    const edgeId = useTopologyStore.getState().edges[0]!.id;
    useTopologyStore.getState().updateEdgeConfig(edgeId, { failureRate: 0.1 });

    const edge = useTopologyStore.getState().edges[0]!;
    expect(edge.data?.failureRate).toBe(0.1);
    expect(edge.data?.bandwidthMbps).toBe(1000); // Should remain
  });

  // ----- deleteSelected -----

  it('deleteSelected removes the selected node', () => {
    useTopologyStore.getState().addNode('service', { x: 0, y: 0 });
    const nodeId = useTopologyStore.getState().nodes[0]!.id;

    useTopologyStore.getState().setSelectedNode(nodeId);
    useTopologyStore.getState().deleteSelected();

    expect(useTopologyStore.getState().nodes).toHaveLength(0);
  });

  it('deleteSelected does nothing if nothing selected', () => {
    useTopologyStore.getState().addNode('service', { x: 0, y: 0 });
    useTopologyStore.getState().deleteSelected();

    // Node should still be there
    expect(useTopologyStore.getState().nodes).toHaveLength(1);
  });

  // ----- Serialization -----

  it('toSimTopology converts React Flow state to engine format', () => {
    useTopologyStore.getState().addNode('service', { x: 10, y: 20 });
    useTopologyStore.getState().addNode('load-balancer', { x: 30, y: 40 });

    const nodes = useTopologyStore.getState().nodes;
    useTopologyStore.getState().onConnect({
      source: nodes[1]!.id,
      target: nodes[0]!.id,
      sourceHandle: null,
      targetHandle: null,
    });

    const topology = useTopologyStore.getState().toSimTopology();

    expect(topology.nodes).toHaveLength(2);
    expect(topology.edges).toHaveLength(1);
    expect(topology.nodes[0]!.config.kind).toBe('service');
    expect(topology.nodes[0]!.position).toEqual({ x: 10, y: 20 });
    expect(topology.nodes[0]!.metadata.label).toContain('Service');
    expect(topology.edges[0]!.source).toBe(nodes[1]!.id);
    expect(topology.edges[0]!.target).toBe(nodes[0]!.id);
  });

  it('fromSimTopology restores state from engine format', () => {
    const topology: SimTopology = {
      nodes: [
        {
          id: 'svc-1',
          config: { kind: 'service', replicas: 2, latencyMs: { type: 'constant', value: 25 }, failureRate: 0.05, maxConcurrency: 50 },
          position: { x: 100, y: 200 },
          metadata: { label: 'Auth Service' },
        },
        {
          id: 'lb-1',
          config: { kind: 'load-balancer', algorithm: 'least-connections', maxConnections: 5000 },
          position: { x: 0, y: 0 },
          metadata: { label: 'Frontend LB' },
        },
      ],
      edges: [
        {
          id: 'e-1',
          source: 'lb-1',
          target: 'svc-1',
          config: { latencyMs: { type: 'constant', value: 2 }, bandwidthMbps: 500, failureRate: 0.01 },
        },
      ],
    };

    useTopologyStore.getState().fromSimTopology(topology);

    const state = useTopologyStore.getState();
    expect(state.nodes).toHaveLength(2);
    expect(state.edges).toHaveLength(1);
    expect(state.nodes[0]!.data.label).toBe('Auth Service');
    expect(state.nodes[0]!.data.config.kind).toBe('service');
    expect(state.edges[0]!.data?.latencyMs).toEqual({ type: 'constant', value: 2 });
    expect(state.selectedNodeId).toBeNull();
    expect(state.selectedEdgeId).toBeNull();
  });

  it('round-trip: toSimTopology then fromSimTopology preserves data', () => {
    useTopologyStore.getState().addNode('queue', { x: 50, y: 50 });
    useTopologyStore.getState().addNode('service', { x: 200, y: 200 });

    const nodes = useTopologyStore.getState().nodes;
    useTopologyStore.getState().onConnect({
      source: nodes[0]!.id,
      target: nodes[1]!.id,
      sourceHandle: null,
      targetHandle: null,
    });

    const topology = useTopologyStore.getState().toSimTopology();

    // Clear and restore
    useTopologyStore.setState({ nodes: [], edges: [] });
    useTopologyStore.getState().fromSimTopology(topology);

    const restored = useTopologyStore.getState();
    expect(restored.nodes).toHaveLength(2);
    expect(restored.edges).toHaveLength(1);
    expect(restored.nodes[0]!.data.config.kind).toBe('queue');
    expect(restored.nodes[1]!.data.config.kind).toBe('service');
  });
});
