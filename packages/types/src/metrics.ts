/**
 * A single metrics sample at a point in simulation time.
 */
export interface MetricsSample {
  /** Simulation time when this sample was taken */
  time: number;
  /** Requests processed per second */
  throughputRps: number;
  /** Latency percentiles in ms */
  latencyP50: number;
  latencyP95: number;
  latencyP99: number;
  /** Current queue depths by node ID */
  queueDepths: Record<string, number>;
  /** Active connections by node ID */
  activeConnections: Record<string, number>;
  /** Dropped/failed requests since last sample */
  droppedRequests: number;
  /** Total requests completed since last sample */
  completedRequests: number;
}

/**
 * Aggregate metrics for the entire simulation run.
 */
export interface SimulationMetrics {
  totalRequests: number;
  completedRequests: number;
  droppedRequests: number;
  avgLatencyMs: number;
  p50LatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  maxThroughputRps: number;
  simulationDurationMs: number;
  eventsProcessed: number;
}
