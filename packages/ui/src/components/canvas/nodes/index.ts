import type { NodeTypes } from '@xyflow/react';
import { ServiceNode } from './ServiceNode';
import { LoadBalancerNode } from './LoadBalancerNode';
import { QueueNode } from './QueueNode';
import { DatabaseNode } from './DatabaseNode';
import { CacheNode } from './CacheNode';
import { ApiGatewayNode } from './ApiGatewayNode';

/**
 * CRITICAL: This must be defined at module scope — NOT inside a component.
 * React Flow re-registers node types if the object reference changes on render.
 */
export const nodeTypes: NodeTypes = {
  service: ServiceNode,
  'load-balancer': LoadBalancerNode,
  queue: QueueNode,
  database: DatabaseNode,
  cache: CacheNode,
  'api-gateway': ApiGatewayNode,
};
