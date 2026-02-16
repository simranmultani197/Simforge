import { describe, it, expect, beforeEach } from 'vitest';
import { EventQueue } from '../../src/core/event-queue';
import type { SimEvent } from '@simforge/types';

function makeEvent(time: number, type = 'test'): SimEvent {
  return { time, type, nodeId: 'node-1', payload: {} };
}

describe('EventQueue', () => {
  let queue: EventQueue;

  beforeEach(() => {
    queue = new EventQueue();
  });

  it('starts empty', () => {
    expect(queue.size).toBe(0);
    expect(queue.isEmpty).toBe(true);
    expect(queue.peek()).toBeUndefined();
    expect(queue.pop()).toBeUndefined();
  });

  it('pushes and pops a single event', () => {
    const event = makeEvent(100);
    queue.push(event);

    expect(queue.size).toBe(1);
    expect(queue.isEmpty).toBe(false);
    expect(queue.peek()).toBe(event);
    expect(queue.pop()).toBe(event);
    expect(queue.isEmpty).toBe(true);
  });

  it('maintains min-heap order', () => {
    queue.push(makeEvent(30));
    queue.push(makeEvent(10));
    queue.push(makeEvent(20));

    expect(queue.pop()!.time).toBe(10);
    expect(queue.pop()!.time).toBe(20);
    expect(queue.pop()!.time).toBe(30);
  });

  it('handles many events in correct order', () => {
    const times = [50, 10, 90, 30, 70, 20, 80, 40, 60, 100];
    for (const t of times) {
      queue.push(makeEvent(t));
    }

    const result: number[] = [];
    while (!queue.isEmpty) {
      result.push(queue.pop()!.time);
    }

    expect(result).toEqual([10, 20, 30, 40, 50, 60, 70, 80, 90, 100]);
  });

  it('handles events with equal times (FIFO-like for same priority)', () => {
    queue.push(makeEvent(10, 'first'));
    queue.push(makeEvent(10, 'second'));
    queue.push(makeEvent(10, 'third'));

    // All should be popped, though order among ties is not guaranteed
    const events = [queue.pop()!, queue.pop()!, queue.pop()!];
    expect(events).toHaveLength(3);
    expect(events.every((e) => e.time === 10)).toBe(true);
  });

  it('clears all events', () => {
    queue.push(makeEvent(10));
    queue.push(makeEvent(20));
    queue.push(makeEvent(30));
    queue.clear();

    expect(queue.size).toBe(0);
    expect(queue.isEmpty).toBe(true);
  });

  it('works correctly after interleaved push/pop', () => {
    queue.push(makeEvent(50));
    queue.push(makeEvent(10));
    expect(queue.pop()!.time).toBe(10);

    queue.push(makeEvent(5));
    queue.push(makeEvent(30));
    expect(queue.pop()!.time).toBe(5);
    expect(queue.pop()!.time).toBe(30);
    expect(queue.pop()!.time).toBe(50);
  });

  it('handles large number of events', () => {
    const n = 10000;
    const times: number[] = [];
    for (let i = 0; i < n; i++) {
      times.push(Math.random() * 100000);
    }

    for (const t of times) {
      queue.push(makeEvent(t));
    }

    expect(queue.size).toBe(n);

    let prev = -Infinity;
    while (!queue.isEmpty) {
      const event = queue.pop()!;
      expect(event.time).toBeGreaterThanOrEqual(prev);
      prev = event.time;
    }
  });
});
