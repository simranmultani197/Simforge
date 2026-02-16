import type { ComponentConfig, Distribution } from './components';

/**
 * A node in the simulation topology.
 */
export interface SimNode {
  id: string;
  config: ComponentConfig;
  position: { x: number; y: number };
  metadata: {
    label: string;
    description?: string;
  };
}

/**
 * An edge (connection) between two nodes.
 */
export interface SimEdge {
  id: string;
  source: string;
  target: string;
  config: {
    latencyMs: Distribution;
    bandwidthMbps: number;
    failureRate: number;
  };
}

/**
 * A complete simulation topology (graph of nodes and edges).
 */
export interface SimTopology {
  nodes: SimNode[];
  edges: SimEdge[];
}
