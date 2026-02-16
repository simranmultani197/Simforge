import type { SimNode, SimEdge, SimTopology } from '@simforge/types';

/**
 * Graph representation of a simulation topology.
 * Provides O(1) lookups for nodes and their connections.
 */
export interface TopologyGraph {
  /** All nodes indexed by ID */
  nodes: Map<string, SimNode>;
  /** Outgoing edges for each node (nodeId → edges leaving this node) */
  outEdges: Map<string, SimEdge[]>;
  /** Incoming edges for each node (nodeId → edges entering this node) */
  inEdges: Map<string, SimEdge[]>;
  /** Node IDs with no incoming edges (traffic entry points) */
  entryNodes: string[];
}

/**
 * Build an adjacency-list graph from a flat topology.
 * Entry nodes are auto-detected as nodes with no incoming edges.
 *
 * @throws Error if topology has no entry nodes
 */
export function buildTopologyGraph(topology: SimTopology): TopologyGraph {
  const nodes = new Map<string, SimNode>();
  const outEdges = new Map<string, SimEdge[]>();
  const inEdges = new Map<string, SimEdge[]>();

  // Index all nodes
  for (const node of topology.nodes) {
    nodes.set(node.id, node);
    outEdges.set(node.id, []);
    inEdges.set(node.id, []);
  }

  // Build adjacency lists
  for (const edge of topology.edges) {
    const out = outEdges.get(edge.source);
    if (out) {
      out.push(edge);
    }
    const inc = inEdges.get(edge.target);
    if (inc) {
      inc.push(edge);
    }
  }

  // Detect entry nodes (no incoming edges)
  const entryNodes: string[] = [];
  for (const [nodeId, edges] of inEdges) {
    if (edges.length === 0) {
      entryNodes.push(nodeId);
    }
  }

  if (entryNodes.length === 0) {
    throw new Error(
      'Topology has no entry nodes (all nodes have incoming edges). ' +
        'At least one node must have no incoming edges to receive traffic.',
    );
  }

  return { nodes, outEdges, inEdges, entryNodes };
}

/**
 * Get the IDs of all nodes that a given node connects to via outgoing edges.
 */
export function getOutTargetIds(graph: TopologyGraph, nodeId: string): string[] {
  const edges = graph.outEdges.get(nodeId) ?? [];
  return edges.map((e) => e.target);
}
