import type { SimEvent, QueueConfig } from '@simforge/types';
import type { SeededRNG } from '../core/rng';
import type { SimulationEngine } from '../core/engine';
import { sample } from '../distributions';

/**
 * State tracked per queue node during simulation.
 */
export interface QueueState {
  buffer: string[];
  totalEnqueued: number;
  totalDequeued: number;
  totalDropped: number;
  isProcessing: boolean;
}

/**
 * Create initial state for a queue node.
 */
export function createQueueState(): QueueState {
  return {
    buffer: [],
    totalEnqueued: 0,
    totalDequeued: 0,
    totalDropped: 0,
    isProcessing: false,
  };
}

/**
 * Handle an incoming message at a queue node.
 */
export function handleQueueEnqueue(
  event: SimEvent,
  config: QueueConfig,
  state: QueueState,
  engine: SimulationEngine,
  rng: SeededRNG,
): void {
  const requestId = event.payload['requestId'] as string;

  // Check queue depth
  if (state.buffer.length >= config.maxDepth) {
    state.totalDropped++;

    if (config.deadLetterEnabled) {
      engine.schedule({
        time: event.time,
        type: 'queue.deadletter',
        nodeId: event.nodeId,
        payload: { requestId, reason: 'queue_full' },
      });
    } else {
      engine.schedule({
        time: event.time,
        type: 'request.dropped',
        nodeId: event.nodeId,
        payload: { requestId, reason: 'queue_full' },
      });
    }
    return;
  }

  // Enqueue
  state.buffer.push(requestId);
  state.totalEnqueued++;

  // Start processing if idle
  if (!state.isProcessing) {
    scheduleDequeue(event.nodeId, event.time, config, state, engine, rng);
  }
}

/**
 * Handle dequeue (consumer processing).
 */
export function handleQueueDequeue(
  event: SimEvent,
  config: QueueConfig,
  state: QueueState,
  engine: SimulationEngine,
  rng: SeededRNG,
  outEdges: string[],
): void {
  const requestId = state.buffer.shift();
  if (!requestId) {
    state.isProcessing = false;
    return;
  }

  state.totalDequeued++;

  // Forward to consumer (first out-edge)
  if (outEdges.length > 0) {
    engine.schedule({
      time: event.time,
      type: 'request.arrive',
      nodeId: outEdges[0]!,
      payload: { requestId, dequeuedFrom: event.nodeId },
    });
  }

  // Schedule next dequeue if buffer still has items
  if (state.buffer.length > 0) {
    scheduleDequeue(event.nodeId, event.time, config, state, engine, rng);
  } else {
    state.isProcessing = false;
  }
}

function scheduleDequeue(
  nodeId: string,
  currentTime: number,
  config: QueueConfig,
  state: QueueState,
  engine: SimulationEngine,
  rng: SeededRNG,
): void {
  state.isProcessing = true;
  const processingTime = sample(config.processingTimeMs, rng);

  engine.schedule({
    time: currentTime + processingTime,
    type: 'queue.dequeue',
    nodeId,
    payload: {},
  });
}
