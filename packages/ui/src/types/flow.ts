import type { Node, Edge } from '@xyflow/react';
import type {
  ServiceConfig,
  LoadBalancerConfig,
  QueueConfig,
  DatabaseConfig,
  CacheConfig,
  ApiGatewayConfig,
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

export interface DatabaseNodeData {
  label: string;
  config: DatabaseConfig;
  [key: string]: unknown;
}

export interface CacheNodeData {
  label: string;
  config: CacheConfig;
  [key: string]: unknown;
}

export interface ApiGatewayNodeData {
  label: string;
  config: ApiGatewayConfig;
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Discriminated React Flow node union
// ---------------------------------------------------------------------------

export type ServiceFlowNode = Node<ServiceNodeData, 'service'>;
export type LoadBalancerFlowNode = Node<LoadBalancerNodeData, 'load-balancer'>;
export type QueueFlowNode = Node<QueueNodeData, 'queue'>;
export type DatabaseFlowNode = Node<DatabaseNodeData, 'database'>;
export type CacheFlowNode = Node<CacheNodeData, 'cache'>;
export type ApiGatewayFlowNode = Node<ApiGatewayNodeData, 'api-gateway'>;

export type SimforgeNode =
  | ServiceFlowNode
  | LoadBalancerFlowNode
  | QueueFlowNode
  | DatabaseFlowNode
  | CacheFlowNode
  | ApiGatewayFlowNode;

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

export type SimforgeNodeType =
  | 'service'
  | 'load-balancer'
  | 'queue'
  | 'database'
  | 'cache'
  | 'api-gateway';
