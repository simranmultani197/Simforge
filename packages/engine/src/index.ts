// Core
export { EventQueue } from './core/event-queue';
export { SimulationEngine } from './core/engine';
export { SeededRNG } from './core/rng';

// Simulator
export { Simulator } from './simulator/simulator';
export type { SimulatorOptions } from './simulator/simulator';

// Topology
export { buildTopologyGraph, getOutTargetIds } from './simulator/topology-graph';
export type { TopologyGraph } from './simulator/topology-graph';

// Node state
export { createNodeState, createAllNodeStates } from './simulator/node-state';
export type { NodeState } from './simulator/node-state';

// Request generation
export { generateRequests } from './simulator/request-generator';

// Distributions
export { sample } from './distributions';

// Metrics
export { MetricsCollector } from './metrics/collector';
export { Histogram } from './metrics/histogram';

// Behaviors (for advanced usage / custom simulators)
export { handleServiceRequest, handleServiceComplete } from './behaviors/service';
export type { ServiceState } from './behaviors/service';
export { handleLoadBalancerRequest } from './behaviors/load-balancer';
export type { LoadBalancerState } from './behaviors/load-balancer';
export { handleQueueEnqueue, handleQueueDequeue } from './behaviors/queue';
export type { QueueState } from './behaviors/queue';
export { handleDatabaseRequest, handleDatabaseComplete } from './behaviors/database';
export type { DatabaseState } from './behaviors/database';
export { handleCacheRequest, handleCacheComplete } from './behaviors/cache';
export type { CacheState } from './behaviors/cache';
export { handleApiGatewayRequest, handleApiGatewayComplete } from './behaviors/api-gateway';
export type { ApiGatewayState } from './behaviors/api-gateway';

// Worker protocol types
export type { WorkerCommand, WorkerEvent } from './worker/protocol';
export { SimulationWorkerRuntime } from './worker/runtime';
