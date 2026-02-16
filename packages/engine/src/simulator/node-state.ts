import type { SimNode } from '@simforge/types';
import { createServiceState } from '../behaviors/service';
import type { ServiceState } from '../behaviors/service';
import { createLoadBalancerState } from '../behaviors/load-balancer';
import type { LoadBalancerState } from '../behaviors/load-balancer';
import { createQueueState } from '../behaviors/queue';
import type { QueueState } from '../behaviors/queue';
import type { TopologyGraph } from './topology-graph';
import { getOutTargetIds } from './topology-graph';

/**
 * Discriminated union of all possible node runtime states.
 */
export type NodeState =
  | { kind: 'service'; state: ServiceState }
  | { kind: 'load-balancer'; state: LoadBalancerState }
  | { kind: 'queue'; state: QueueState };

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
