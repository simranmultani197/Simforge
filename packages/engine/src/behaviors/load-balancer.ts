import type { SimEvent, LoadBalancerConfig } from '@simforge/types';
import type { SeededRNG } from '../core/rng';
import type { SimulationEngine } from '../core/engine';

/**
 * State tracked per load balancer node during simulation.
 */
export interface LoadBalancerState {
  currentIndex: number;
  activeConnections: Map<string, number>;
  totalRouted: number;
  totalDropped: number;
}

/**
 * Create initial state for a load balancer node.
 */
export function createLoadBalancerState(targetIds: string[]): LoadBalancerState {
  const activeConnections = new Map<string, number>();
  for (const id of targetIds) {
    activeConnections.set(id, 0);
  }
  return { currentIndex: 0, activeConnections, totalRouted: 0, totalDropped: 0 };
}

/**
 * Route a request through the load balancer to a target.
 */
export function handleLoadBalancerRequest(
  event: SimEvent,
  config: LoadBalancerConfig,
  state: LoadBalancerState,
  engine: SimulationEngine,
  rng: SeededRNG,
  targetIds: string[],
): void {
  if (targetIds.length === 0) {
    state.totalDropped++;
    engine.schedule({
      time: event.time,
      type: 'request.dropped',
      nodeId: event.nodeId,
      payload: { reason: 'no_targets', requestId: event.payload['requestId'] },
    });
    return;
  }

  // Check total connection limit
  let totalConnections = 0;
  for (const count of state.activeConnections.values()) {
    totalConnections += count;
  }
  if (totalConnections >= config.maxConnections) {
    state.totalDropped++;
    engine.schedule({
      time: event.time,
      type: 'request.dropped',
      nodeId: event.nodeId,
      payload: { reason: 'max_connections', requestId: event.payload['requestId'] },
    });
    return;
  }

  // Select target based on algorithm
  const targetId = selectTarget(config.algorithm, state, targetIds, rng);

  // Track connection
  const current = state.activeConnections.get(targetId) ?? 0;
  state.activeConnections.set(targetId, current + 1);
  state.totalRouted++;

  // Forward request to target
  engine.schedule({
    time: event.time,
    type: 'request.arrive',
    nodeId: targetId,
    payload: {
      ...event.payload,
      routedFrom: event.nodeId,
    },
  });
}

function selectTarget(
  algorithm: LoadBalancerConfig['algorithm'],
  state: LoadBalancerState,
  targetIds: string[],
  rng: SeededRNG,
): string {
  switch (algorithm) {
    case 'round-robin': {
      const target = targetIds[state.currentIndex % targetIds.length]!;
      state.currentIndex++;
      return target;
    }
    case 'random': {
      return targetIds[Math.floor(rng.next() * targetIds.length)]!;
    }
    case 'least-connections': {
      let minConnections = Infinity;
      let minTarget = targetIds[0]!;
      for (const id of targetIds) {
        const connections = state.activeConnections.get(id) ?? 0;
        if (connections < minConnections) {
          minConnections = connections;
          minTarget = id;
        }
      }
      return minTarget;
    }
  }
}
