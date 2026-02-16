import { describe, it, expect, beforeEach } from 'vitest';
import { MetricsCollector } from '../../src/metrics/collector';

describe('MetricsCollector', () => {
  let collector: MetricsCollector;

  beforeEach(() => {
    collector = new MetricsCollector();
  });

  it('records latencies and produces correct percentiles', () => {
    // Record 100 latencies from 1 to 100
    for (let i = 1; i <= 100; i++) {
      collector.recordLatency(i);
    }

    const sample = collector.sample(1000, {}, {});
    expect(sample.completedRequests).toBe(100);
    expect(sample.latencyP50).toBe(50);
    expect(sample.latencyP95).toBe(95);
    expect(sample.latencyP99).toBe(99);
  });

  it('records drops and tracks them in samples', () => {
    collector.recordDrop();
    collector.recordDrop();
    collector.recordDrop();

    const sample = collector.sample(1000, {}, {});
    expect(sample.droppedRequests).toBe(3);
    expect(sample.completedRequests).toBe(0);
  });

  it('calculates throughput based on window duration', () => {
    // Record 100 requests in a 1000ms window
    for (let i = 0; i < 100; i++) {
      collector.recordLatency(10);
    }

    const sample = collector.sample(1000, {}, {});
    // 100 completed / 1000ms * 1000 = 100 RPS
    expect(sample.throughputRps).toBe(100);
  });

  it('resets window after each sample', () => {
    collector.recordLatency(10);
    collector.recordDrop();
    collector.sample(1000, {}, {});

    // Second sample should have empty window
    const sample2 = collector.sample(2000, {}, {});
    expect(sample2.completedRequests).toBe(0);
    expect(sample2.droppedRequests).toBe(0);
  });

  it('includes queue depths and active connections in sample', () => {
    collector.recordLatency(10);
    const sample = collector.sample(
      1000,
      { 'queue-1': 5, 'queue-2': 10 },
      { 'svc-1': 3 },
    );

    expect(sample.queueDepths).toEqual({ 'queue-1': 5, 'queue-2': 10 });
    expect(sample.activeConnections).toEqual({ 'svc-1': 3 });
  });

  it('produces correct aggregate metrics', () => {
    // Window 1: 50 requests at 10ms latency
    for (let i = 0; i < 50; i++) {
      collector.recordLatency(10);
    }
    collector.recordDrop();
    collector.sample(1000, {}, {});

    // Window 2: 50 requests at 20ms latency
    for (let i = 0; i < 50; i++) {
      collector.recordLatency(20);
    }
    collector.recordDrop();
    collector.sample(2000, {}, {});

    const agg = collector.aggregate(2000, 500);
    expect(agg.totalRequests).toBe(102); // 100 completed + 2 dropped
    expect(agg.completedRequests).toBe(100);
    expect(agg.droppedRequests).toBe(2);
    expect(agg.simulationDurationMs).toBe(2000);
    expect(agg.eventsProcessed).toBe(500);
    expect(agg.maxThroughputRps).toBeGreaterThan(0);
  });

  it('handles empty metrics gracefully', () => {
    const agg = collector.aggregate(0, 0);
    expect(agg.totalRequests).toBe(0);
    expect(agg.completedRequests).toBe(0);
    expect(agg.avgLatencyMs).toBe(0);
    expect(agg.p50LatencyMs).toBe(0);
  });

  it('resets all state', () => {
    collector.recordLatency(10);
    collector.recordDrop();
    collector.sample(1000, {}, {});
    collector.reset();

    const agg = collector.aggregate(0, 0);
    expect(agg.totalRequests).toBe(0);
  });
});
