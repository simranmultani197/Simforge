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

export interface ServiceNodeData {
  label: string;
  config: ServiceConfig;
  [key: string]: unknown;
}

export interface LoadBalancerNodeData {
  label: string;
  config: LoadBalancerConfig;
  [key: string]: unknown;
}

export interface QueueNodeData {
  label: string;
  config: QueueConfig;
  [key: string]: unknown;
}

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

export interface SimforgeEdgeData {
  latencyMs: Distribution;
  bandwidthMbps: number;
  failureRate: number;
  [key: string]: unknown;
}

export type SimforgeEdge = Edge<SimforgeEdgeData, 'simforge'>;

// ---------------------------------------------------------------------------
// String literal union for node type keys
// ---------------------------------------------------------------------------

export type SimforgeNodeType = 'service' | 'load-balancer' | 'queue';
