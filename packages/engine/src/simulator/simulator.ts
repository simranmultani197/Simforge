import type {
  SimEvent,
  SimTopology,
  SimulationConfig,
  SimulationStatus,
  SimulationMetrics,
  MetricsSample,
} from '@simforge/types';
import { SimulationEngine } from '../core/engine';
import { SeededRNG } from '../core/rng';
import { sample } from '../distributions';
import { MetricsCollector } from '../metrics/collector';
import { buildTopologyGraph, getOutTargetIds } from './topology-graph';
import type { TopologyGraph } from './topology-graph';
import { createAllNodeStates } from './node-state';
import type { NodeState } from './node-state';
import { handleServiceRequest, handleServiceComplete } from '../behaviors/service';
import { handleLoadBalancerRequest } from '../behaviors/load-balancer';
import { handleQueueEnqueue, handleQueueDequeue } from '../behaviors/queue';
import { handleDatabaseRequest, handleDatabaseComplete } from '../behaviors/database';
import { handleCacheRequest, handleCacheComplete } from '../behaviors/cache';
import { handleApiGatewayRequest, handleApiGatewayComplete } from '../behaviors/api-gateway';
import { generateRequests } from './request-generator';

/**
 * Options for creating a Simulator instance.
 */
export interface SimulatorOptions {
  topology: SimTopology;
  config: SimulationConfig;
  /** Called for every simulation event (useful for visualization) */
  onEvent?: (event: SimEvent) => void;
  /** Called when a metrics sample is taken */
  onMetrics?: (sample: MetricsSample) => void;
  /** Interval between metrics samples in simulation time (ms). Default: 1000 */
  metricsIntervalMs?: number;
}

/**
 * High-level simulator that orchestrates a complete discrete-event simulation.
 *
 * Takes a topology (nodes + edges) and a simulation config, then runs
 * requests through the system, tracking metrics along the way.
 *
 * Usage:
 * ```typescript
 * const sim = new Simulator({ topology, config });
 * const metrics = sim.run();
 * console.log(metrics.completedRequests, metrics.p99LatencyMs);
 * ```
 */
export class Simulator {
  private engine: SimulationEngine;
  private rng: SeededRNG;
  private graph: TopologyGraph;
  private nodeStates: Map<string, NodeState>;
  private metrics: MetricsCollector;
  private config: SimulationConfig;
  private metricsIntervalMs: number;
  private onEvent?: (event: SimEvent) => void;
  private onMetrics?: (sample: MetricsSample) => void;
  private initialized = false;
  /** Tracks request start times by requestId so latency can be measured even
   *  when requests pass through components (like queues) that don't preserve
   *  the full payload. */
  private requestStartTimes: Map<string, number> = new Map();

  constructor(options: SimulatorOptions) {
    this.config = options.config;
    this.metricsIntervalMs = options.metricsIntervalMs ?? 1000;
    this.onEvent = options.onEvent;
    this.onMetrics = options.onMetrics;

    // Build the topology graph
    this.graph = buildTopologyGraph(options.topology);

    // Create per-node runtime state
    this.nodeStates = createAllNodeStates(this.graph);

    // Create RNG from seed
    this.rng = new SeededRNG(options.config.seed);

    // Create metrics collector
    this.metrics = new MetricsCollector();

    // Create the engine with event callback
    this.engine = new SimulationEngine({
      onEvent: this.onEvent,
    });

    // Register all event handlers
    this.registerHandlers();
  }

  // -- Public API --

  /**
   * Run the full simulation and return aggregate metrics.
   */
  run(): SimulationMetrics {
    this.initialize();
    this.engine.runUntil(this.config);

    return this.metrics.aggregate(this.engine.time, this.engine.eventsProcessed);
  }

  /**
   * Process a single simulation event. Returns the event or null if done.
   */
  step(): SimEvent | null {
    this.initialize();
    return this.engine.step();
  }

  /**
   * Pause the simulation (can be resumed by calling run() or step() again).
   */
  pause(): void {
    this.engine.pause();
  }

  /**
   * Reset the simulator to initial state (can be re-run).
   */
  reset(): void {
    this.engine.reset();
    this.metrics.reset();
    this.rng = new SeededRNG(this.config.seed);
    this.nodeStates = createAllNodeStates(this.graph);
    this.requestStartTimes.clear();
    this.initialized = false;
  }

  get time(): number {
    return this.engine.time;
  }

  get status(): SimulationStatus {
    return this.engine.status;
  }

  get eventsProcessed(): number {
    return this.engine.eventsProcessed;
  }

  // -- Initialization --

  private initialize(): void {
    if (this.initialized) return;
    this.initialized = true;

    // Generate initial request arrivals
    generateRequests(this.config, this.graph.entryNodes, this.engine, this.rng);

    // Schedule first metrics sample
    if (this.metricsIntervalMs > 0) {
      this.engine.schedule({
        time: this.metricsIntervalMs,
        type: 'metrics.sample',
        nodeId: '__system__',
        payload: {},
      });
    }
  }

  // -- Event Handlers --

  private registerHandlers(): void {
    this.engine.on('request.arrive', (event) => this.handleArrive(event));
    this.engine.on('request.complete', (event) => this.handleComplete(event));
    this.engine.on('request.dropped', (event) => this.handleDropped(event));
    this.engine.on('queue.dequeue', (event) => this.handleQueueDequeue(event));
    this.engine.on('queue.deadletter', (event) => this.handleDropped(event));
    this.engine.on('metrics.sample', (event) => this.handleMetricsSample(event));
  }

  /**
   * Route an incoming request to the correct behavior handler based on node type.
   */
  private handleArrive(event: SimEvent): void {
    const node = this.graph.nodes.get(event.nodeId);
    const nodeState = this.nodeStates.get(event.nodeId);
    if (!node || !nodeState) return;

    // Track request start time on first arrival
    const requestId = event.payload['requestId'] as string | undefined;
    const startTime = event.payload['startTime'] as number | undefined;
    if (requestId && startTime !== undefined && !this.requestStartTimes.has(requestId)) {
      this.requestStartTimes.set(requestId, startTime);
    }

    const outTargetIds = getOutTargetIds(this.graph, event.nodeId);

    switch (nodeState.kind) {
      case 'service':
        handleServiceRequest(
          event,
          node.config as Extract<typeof node.config, { kind: 'service' }>,
          nodeState.state,
          this.engine,
          this.rng,
          outTargetIds,
        );
        break;

      case 'load-balancer':
        handleLoadBalancerRequest(
          event,
          node.config as Extract<typeof node.config, { kind: 'load-balancer' }>,
          nodeState.state,
          this.engine,
          this.rng,
          outTargetIds,
        );
        break;

      case 'queue':
        handleQueueEnqueue(
          event,
          node.config as Extract<typeof node.config, { kind: 'queue' }>,
          nodeState.state,
          this.engine,
          this.rng,
        );
        break;

      case 'database':
        handleDatabaseRequest(
          event,
          node.config as Extract<typeof node.config, { kind: 'database' }>,
          nodeState.state,
          this.engine,
          this.rng,
          outTargetIds,
        );
        break;

      case 'cache':
        handleCacheRequest(
          event,
          node.config as Extract<typeof node.config, { kind: 'cache' }>,
          nodeState.state,
          this.engine,
          this.rng,
          outTargetIds,
        );
        break;

      case 'api-gateway':
        handleApiGatewayRequest(
          event,
          node.config as Extract<typeof node.config, { kind: 'api-gateway' }>,
          nodeState.state,
          this.engine,
          this.rng,
          outTargetIds,
        );
        break;
    }
  }

  /**
   * Handle request completion at a service node.
   * If the node has outgoing edges, forward the request.
   * If terminal (no outEdges), record latency.
   */
  private handleComplete(event: SimEvent): void {
    const nodeState = this.nodeStates.get(event.nodeId);
    if (!nodeState) return;

    // Dispatch to correct complete handler
    switch (nodeState.kind) {
      case 'service':
        handleServiceComplete(event, nodeState.state);
        break;
      case 'database':
        handleDatabaseComplete(event, nodeState.state);
        break;
      case 'cache':
        handleCacheComplete(event, nodeState.state);
        break;
      case 'api-gateway':
        handleApiGatewayComplete(event, nodeState.state);
        break;
      case 'load-balancer':
      case 'queue':
        // These don't have complete handlers
        return;
    }

    // Resolve outgoing edges for forwarding.
    // Some behaviors (e.g. cache hit path) override forwarding targets via payload.outEdges.
    const outEdges = this.resolveOutEdges(event);

    if (outEdges.length === 0) {
      // Terminal node — record end-to-end latency
      const requestId = event.payload['requestId'] as string | undefined;
      const startTime =
        (event.payload['startTime'] as number | undefined) ??
        (requestId ? this.requestStartTimes.get(requestId) : undefined);
      if (startTime !== undefined) {
        this.metrics.recordLatency(event.time - startTime);
        // Clean up — request is done
        if (requestId) this.requestStartTimes.delete(requestId);
      }
    } else {
      // Forward to next nodes via edges
      for (const edge of outEdges) {
        // Check edge failure
        if (edge.config.failureRate > 0 && this.rng.next() < edge.config.failureRate) {
          this.metrics.recordDrop();
          continue;
        }

        // Sample edge latency
        const edgeLatency = sample(edge.config.latencyMs, this.rng);

        this.engine.schedule({
          time: event.time + edgeLatency,
          type: 'request.arrive',
          nodeId: edge.target,
          payload: {
            requestId: event.payload['requestId'],
            startTime: event.payload['startTime'],
          },
        });
      }
    }
  }

  /**
   * Handle dropped/failed requests — record in metrics.
   */
  private handleDropped(_event: SimEvent): void {
    this.metrics.recordDrop();
  }

  /**
   * Handle queue dequeue events — dispatch to queue behavior.
   */
  private handleQueueDequeue(event: SimEvent): void {
    const node = this.graph.nodes.get(event.nodeId);
    const nodeState = this.nodeStates.get(event.nodeId);
    if (!node || !nodeState || nodeState.kind !== 'queue') return;

    const outTargetIds = getOutTargetIds(this.graph, event.nodeId);

    handleQueueDequeue(
      event,
      node.config as Extract<typeof node.config, { kind: 'queue' }>,
      nodeState.state,
      this.engine,
      this.rng,
      outTargetIds,
    );
  }

  /**
   * Take a metrics sample and schedule the next one.
   */
  private handleMetricsSample(event: SimEvent): void {
    // Gather queue depths and active connections
    const queueDepths: Record<string, number> = {};
    const activeConnections: Record<string, number> = {};

    for (const [nodeId, nodeState] of this.nodeStates) {
      switch (nodeState.kind) {
        case 'queue':
          queueDepths[nodeId] = nodeState.state.buffer.length;
          break;
        case 'service':
          activeConnections[nodeId] = nodeState.state.activeRequests;
          break;
        case 'load-balancer': {
          let total = 0;
          for (const count of nodeState.state.activeConnections.values()) {
            total += count;
          }
          activeConnections[nodeId] = total;
          break;
        }
        case 'database':
          activeConnections[nodeId] = nodeState.state.activeConnections;
          break;
        case 'cache':
          activeConnections[nodeId] = nodeState.state.activeRequests;
          break;
        case 'api-gateway':
          activeConnections[nodeId] = nodeState.state.activeRequests;
          break;
      }
    }

    const metricsSample = this.metrics.sample(event.time, queueDepths, activeConnections);
    this.onMetrics?.(metricsSample);

    // Schedule next sample if simulation hasn't exceeded time limit
    const nextSampleTime = event.time + this.metricsIntervalMs;
    if (nextSampleTime <= this.config.maxTimeMs) {
      this.engine.schedule({
        time: nextSampleTime,
        type: 'metrics.sample',
        nodeId: '__system__',
        payload: {},
      });
    }
  }

  private resolveOutEdges(event: SimEvent) {
    const graphOutEdges = this.graph.outEdges.get(event.nodeId) ?? [];
    const payloadOutEdges = event.payload['outEdges'];

    if (!Array.isArray(payloadOutEdges)) {
      return graphOutEdges;
    }

    const allowedTargets = new Set(
      payloadOutEdges.filter((target): target is string => typeof target === 'string'),
    );

    return graphOutEdges.filter((edge) => allowedTargets.has(edge.target));
  }
}
