import type { Node, Edge } from '@xyflow/react';
import type {
  ClientConfig,
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

export interface ClientNodeData {
  label: string;
  presetId?: string;
  config: ClientConfig;
  [key: string]: unknown;
}

export interface ServiceNodeData {
  label: string;
  presetId?: string;
  config: ServiceConfig;
  [key: string]: unknown;
}

export interface LoadBalancerNodeData {
  label: string;
  presetId?: string;
  config: LoadBalancerConfig;
  [key: string]: unknown;
}

export interface QueueNodeData {
  label: string;
  presetId?: string;
  config: QueueConfig;
  [key: string]: unknown;
}

export interface DatabaseNodeData {
  label: string;
  presetId?: string;
  config: DatabaseConfig;
  [key: string]: unknown;
}

export interface CacheNodeData {
  label: string;
  presetId?: string;
  config: CacheConfig;
  [key: string]: unknown;
}

export interface ApiGatewayNodeData {
  label: string;
  presetId?: string;
  config: ApiGatewayConfig;
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Discriminated React Flow node union
// ---------------------------------------------------------------------------

export type ClientFlowNode = Node<ClientNodeData, 'client'>;
export type ServiceFlowNode = Node<ServiceNodeData, 'service'>;
export type LoadBalancerFlowNode = Node<LoadBalancerNodeData, 'load-balancer'>;
export type QueueFlowNode = Node<QueueNodeData, 'queue'>;
export type DatabaseFlowNode = Node<DatabaseNodeData, 'database'>;
export type CacheFlowNode = Node<CacheNodeData, 'cache'>;
export type ApiGatewayFlowNode = Node<ApiGatewayNodeData, 'api-gateway'>;

export type SimforgeNode =
  | ClientFlowNode
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
  | 'client'
  | 'service'
  | 'load-balancer'
  | 'queue'
  | 'database'
  | 'cache'
  | 'api-gateway';
