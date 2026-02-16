import { describe, it, expect, beforeEach } from 'vitest';
import { SimulationEngine } from '../../src/core/engine';
import { SeededRNG } from '../../src/core/rng';
import {
  createQueueState,
  handleQueueEnqueue,
  handleQueueDequeue,
} from '../../src/behaviors/queue';
import type { QueueConfig, SimEvent } from '@simforge/types';

function makeRequest(time: number, nodeId = 'queue-1', requestId = `req-${time}`): SimEvent {
  return {
    time,
    type: 'request.arrive',
    nodeId,
    payload: { requestId },
  };
}

describe('Queue behavior', () => {
  let engine: SimulationEngine;
  let rng: SeededRNG;

  const config: QueueConfig = {
    kind: 'queue',
    maxDepth: 10,
    processingTimeMs: { type: 'constant', value: 5 },
    deadLetterEnabled: false,
  };

  beforeEach(() => {
    engine = new SimulationEngine();
    rng = new SeededRNG(42);
  });

  it('enqueues a message and schedules dequeue', () => {
    const state = createQueueState();
    handleQueueEnqueue(makeRequest(100), config, state, engine, rng);

    expect(state.buffer).toHaveLength(1);
    expect(state.totalEnqueued).toBe(1);
    expect(state.isProcessing).toBe(true);
    expect(engine.pendingEvents).toBe(1);

    // Dequeue event should be at time 100 + 5 (constant processing time)
    const dequeueEvent = engine.step();
    expect(dequeueEvent!.type).toBe('queue.dequeue');
    expect(dequeueEvent!.time).toBe(105);
    expect(dequeueEvent!.nodeId).toBe('queue-1');
  });

  it('drops messages when queue is full', () => {
    const smallConfig: QueueConfig = { ...config, maxDepth: 2 };
    const state = createQueueState();

    handleQueueEnqueue(makeRequest(100, 'queue-1', 'req-1'), smallConfig, state, engine, rng);
    handleQueueEnqueue(makeRequest(101, 'queue-1', 'req-2'), smallConfig, state, engine, rng);
    handleQueueEnqueue(makeRequest(102, 'queue-1', 'req-3'), smallConfig, state, engine, rng);

    expect(state.buffer).toHaveLength(2);
    expect(state.totalEnqueued).toBe(2);
    expect(state.totalDropped).toBe(1);
  });

  it('sends to dead letter when enabled and queue full', () => {
    const dlqConfig: QueueConfig = { ...config, maxDepth: 1, deadLetterEnabled: true };
    const state = createQueueState();

    handleQueueEnqueue(makeRequest(100, 'queue-1', 'req-1'), dlqConfig, state, engine, rng);
    handleQueueEnqueue(makeRequest(101, 'queue-1', 'req-2'), dlqConfig, state, engine, rng);

    // First event is a dequeue, second should be a deadletter
    const events: SimEvent[] = [];
    while (engine.pendingEvents > 0) {
      const e = engine.step();
      if (e) events.push(e);
    }

    const deadLetterEvent = events.find((e) => e.type === 'queue.deadletter');
    expect(deadLetterEvent).toBeDefined();
    expect(deadLetterEvent!.payload['reason']).toBe('queue_full');
  });

  it('dequeues and forwards to consumer via outEdges', () => {
    const state = createQueueState();
    state.buffer.push('req-1');
    state.isProcessing = true;

    const dequeueEvent: SimEvent = {
      time: 105,
      type: 'queue.dequeue',
      nodeId: 'queue-1',
      payload: {},
    };

    handleQueueDequeue(dequeueEvent, config, state, engine, rng, ['svc-1']);

    expect(state.totalDequeued).toBe(1);
    expect(state.buffer).toHaveLength(0);

    // Should forward to svc-1
    const forwardEvent = engine.step();
    expect(forwardEvent!.type).toBe('request.arrive');
    expect(forwardEvent!.nodeId).toBe('svc-1');
    expect(forwardEvent!.payload['requestId']).toBe('req-1');
  });

  it('drains buffer with multiple items', () => {
    const state = createQueueState();

    // Enqueue 3 messages
    handleQueueEnqueue(makeRequest(100, 'queue-1', 'req-1'), config, state, engine, rng);
    handleQueueEnqueue(makeRequest(101, 'queue-1', 'req-2'), config, state, engine, rng);
    handleQueueEnqueue(makeRequest(102, 'queue-1', 'req-3'), config, state, engine, rng);

    expect(state.buffer).toHaveLength(3);
    expect(state.totalEnqueued).toBe(3);

    // Process all dequeue events
    let dequeueCount = 0;
    while (engine.pendingEvents > 0) {
      const event = engine.step()!;
      if (event.type === 'queue.dequeue') {
        dequeueCount++;
        handleQueueDequeue(event, config, state, engine, rng, ['svc-1']);
      }
    }

    expect(dequeueCount).toBe(3);
    expect(state.totalDequeued).toBe(3);
    expect(state.buffer).toHaveLength(0);
    expect(state.isProcessing).toBe(false);
  });

  it('schedules dequeue with correct nodeId (bug fix verification)', () => {
    const state = createQueueState();
    handleQueueEnqueue(makeRequest(100, 'my-queue'), config, state, engine, rng);

    const dequeueEvent = engine.step();
    expect(dequeueEvent!.nodeId).toBe('my-queue');
  });
});
