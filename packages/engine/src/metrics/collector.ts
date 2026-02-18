import type { MetricsSample, SimulationMetrics } from '@simforge/types';

/**
 * Collects and aggregates simulation metrics over time.
 */
export class MetricsCollector {
  private latencies: number[] = [];
  private completedInWindow = 0;
  private droppedInWindow = 0;
  private dropReasonsInWindow: Record<string, number> = {};
  private windowStartTime = 0;
  private samples: MetricsSample[] = [];
  private totalCompleted = 0;
  private totalDropped = 0;

  /**
   * Record a completed request latency.
   */
  recordLatency(latencyMs: number): void {
    this.latencies.push(latencyMs);
    this.completedInWindow++;
    this.totalCompleted++;
  }

  /**
   * Record a dropped request with an optional reason.
   */
  recordDrop(reason?: string): void {
    this.droppedInWindow++;
    this.totalDropped++;
    const key = reason ?? 'unknown';
    this.dropReasonsInWindow[key] = (this.dropReasonsInWindow[key] ?? 0) + 1;
  }

  /**
   * Take a sample at the current simulation time.
   */
  sample(
    time: number,
    queueDepths: Record<string, number>,
    activeConnections: Record<string, number>,
  ): MetricsSample {
    const windowDuration = Math.max(time - this.windowStartTime, 1);
    const throughput = (this.completedInWindow / windowDuration) * 1000;

    const sorted = [...this.latencies].sort((a, b) => a - b);

    const metricsample: MetricsSample = {
      time,
      throughputRps: throughput,
      latencyP50: percentile(sorted, 0.5),
      latencyP95: percentile(sorted, 0.95),
      latencyP99: percentile(sorted, 0.99),
      queueDepths,
      activeConnections,
      droppedRequests: this.droppedInWindow,
      completedRequests: this.completedInWindow,
      dropReasons: { ...this.dropReasonsInWindow },
    };

    this.samples.push(metricsample);

    // Reset window
    this.latencies = [];
    this.completedInWindow = 0;
    this.droppedInWindow = 0;
    this.dropReasonsInWindow = {};
    this.windowStartTime = time;

    return metricsample;
  }

  /**
   * Get aggregate metrics for the entire simulation.
   */
  aggregate(simulationDurationMs: number, eventsProcessed: number): SimulationMetrics {
    const allLatencies = this.samples.flatMap((s) =>
      Array.from({ length: s.completedRequests }, (_, i) => {
        // Approximate from percentiles
        const idx = i / s.completedRequests;
        if (idx < 0.5) return s.latencyP50;
        if (idx < 0.95) return s.latencyP95;
        return s.latencyP99;
      }),
    );

    const sorted = [...allLatencies].sort((a, b) => a - b);

    return {
      totalRequests: this.totalCompleted + this.totalDropped,
      completedRequests: this.totalCompleted,
      droppedRequests: this.totalDropped,
      avgLatencyMs: sorted.length > 0 ? sorted.reduce((a, b) => a + b, 0) / sorted.length : 0,
      p50LatencyMs: percentile(sorted, 0.5),
      p95LatencyMs: percentile(sorted, 0.95),
      p99LatencyMs: percentile(sorted, 0.99),
      maxThroughputRps: Math.max(...this.samples.map((s) => s.throughputRps), 0),
      simulationDurationMs,
      eventsProcessed,
    };
  }

  /**
   * Reset all metrics.
   */
  reset(): void {
    this.latencies = [];
    this.completedInWindow = 0;
    this.droppedInWindow = 0;
    this.dropReasonsInWindow = {};
    this.windowStartTime = 0;
    this.samples = [];
    this.totalCompleted = 0;
    this.totalDropped = 0;
  }
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.ceil(p * sorted.length) - 1;
  return sorted[Math.max(0, idx)]!;
}
