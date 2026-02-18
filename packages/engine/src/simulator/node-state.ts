import type { SimNode, ApiGatewayConfig } from '@simforge/types';
import { createServiceState } from '../behaviors/service';
import type { ServiceState } from '../behaviors/service';
import { createLoadBalancerState } from '../behaviors/load-balancer';
import type { LoadBalancerState } from '../behaviors/load-balancer';
import { createQueueState } from '../behaviors/queue';
import type { QueueState } from '../behaviors/queue';
import { createDatabaseState } from '../behaviors/database';
import type { DatabaseState } from '../behaviors/database';
import { createCacheState } from '../behaviors/cache';
import type { CacheState } from '../behaviors/cache';
import { createApiGatewayState } from '../behaviors/api-gateway';
import type { ApiGatewayState } from '../behaviors/api-gateway';
import { createClientState } from '../behaviors/client';
import type { ClientState } from '../behaviors/client';
import type { TopologyGraph } from './topology-graph';
import { getOutTargetIds } from './topology-graph';

/**
 * Discriminated union of all possible node runtime states.
 */
export type NodeState =
  | { kind: 'service'; state: ServiceState }
  | { kind: 'load-balancer'; state: LoadBalancerState }
  | { kind: 'queue'; state: QueueState }
  | { kind: 'database'; state: DatabaseState }
  | { kind: 'cache'; state: CacheState }
  | { kind: 'api-gateway'; state: ApiGatewayState }
  | { kind: 'client'; state: ClientState };

/**
 * Create the initial runtime state for a node based on its config kind.
 */
export function createNodeState(node: SimNode, graph: TopologyGraph): NodeState {
  switch (node.config.kind) {
    case 'service':
      return { kind: 'service', state: createServiceState() };

    case 'load-balancer': {
      const targetIds = getOutTargetIds(graph, node.id);
      return { kind: 'load-balancer', state: createLoadBalancerState(targetIds) };
    }

    case 'queue':
      return { kind: 'queue', state: createQueueState() };

    case 'database':
      return { kind: 'database', state: createDatabaseState() };

    case 'cache':
      return { kind: 'cache', state: createCacheState() };

    case 'api-gateway':
      return { kind: 'api-gateway', state: createApiGatewayState(node.config as ApiGatewayConfig) };

    case 'client':
      return { kind: 'client', state: createClientState() };
  }
}

/**
 * Create a map of node states for all nodes in the topology.
 */
export function createAllNodeStates(graph: TopologyGraph): Map<string, NodeState> {
  const states = new Map<string, NodeState>();
  for (const [nodeId, node] of graph.nodes) {
    states.set(nodeId, createNodeState(node, graph));
  }
  return states;
}
