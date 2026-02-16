import type { Node, Edge } from '@xyflow/react';
import type {
  ServiceConfig,
  LoadBalancerConfig,
  QueueConfig,
  Distribution,
} from '@simforge/types';

// ---------------------------------------------------------------------------
// Node data types — carry ComponentConfig + UI metadata
// ---------------------------------------------------------------------------

export type ServiceNodeData = {
  label: string;
  config: ServiceConfig;
};

export type LoadBalancerNodeData = {
  label: string;
  config: LoadBalancerConfig;
};

export type QueueNodeData = {
  label: string;
  config: QueueConfig;
};

// ---------------------------------------------------------------------------
// Discriminated React Flow node union
// ---------------------------------------------------------------------------

export type ServiceFlowNode = Node<ServiceNodeData, 'service'>;
export type LoadBalancerFlowNode = Node<LoadBalancerNodeData, 'load-balancer'>;
export type QueueFlowNode = Node<QueueNodeData, 'queue'>;

export type SimforgeNode = ServiceFlowNode | LoadBalancerFlowNode | QueueFlowNode;

// ---------------------------------------------------------------------------
// Edge data — mirrors SimEdge.config
// ---------------------------------------------------------------------------

export type SimforgeEdgeData = {
  latencyMs: Distribution;
  bandwidthMbps: number;
  failureRate: number;
};

export type SimforgeEdge = Edge<SimforgeEdgeData, 'simforge'>;

// ---------------------------------------------------------------------------
// String literal union for node type keys
// ---------------------------------------------------------------------------

export type SimforgeNodeType = 'service' | 'load-balancer' | 'queue';
