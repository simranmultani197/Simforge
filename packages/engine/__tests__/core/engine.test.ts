import { describe, it, expect, beforeEach } from 'vitest';
import { SimulationEngine } from '../../src/core/engine';
import type { SimEvent, SimulationConfig } from '@simforge/types';

function makeConfig(overrides: Partial<SimulationConfig> = {}): SimulationConfig {
  return {
    seed: 42,
    maxTimeMs: 10000,
    maxEvents: 100000,
    requestRateRps: 100,
    requestDistribution: 'constant',
    ...overrides,
  };
}

function makeEvent(time: number, type = 'test', nodeId = 'node-1'): SimEvent {
  return { time, type, nodeId, payload: {} };
}

describe('SimulationEngine', () => {
  let engine: SimulationEngine;

  beforeEach(() => {
    engine = new SimulationEngine();
  });

  it('starts in idle state', () => {
    expect(engine.status).toBe('idle');
    expect(engine.time).toBe(0);
    expect(engine.eventsProcessed).toBe(0);
    expect(engine.pendingEvents).toBe(0);
  });

  it('schedules and processes a single event', () => {
    engine.schedule(makeEvent(100));
    expect(engine.pendingEvents).toBe(1);

    const event = engine.step();
    expect(event).not.toBeNull();
    expect(event!.time).toBe(100);
    expect(engine.time).toBe(100);
    expect(engine.eventsProcessed).toBe(1);
  });

  it('processes events in time order', () => {
    engine.schedule(makeEvent(300));
    engine.schedule(makeEvent(100));
    engine.schedule(makeEvent(200));

    const times: number[] = [];
    for (let i = 0; i < 3; i++) {
      const e = engine.step();
      if (e) times.push(e.time);
    }

    expect(times).toEqual([100, 200, 300]);
  });

  it('rejects events in the past', () => {
    engine.schedule(makeEvent(100));
    engine.step();

    expect(() => engine.schedule(makeEvent(50))).toThrow('Cannot schedule event in the past');
  });

  it('calls registered handlers', () => {
    const handled: SimEvent[] = [];
    engine.on('test', (event) => handled.push(event));

    engine.schedule(makeEvent(100, 'test'));
    engine.schedule(makeEvent(200, 'other'));
    engine.step();
    engine.step();

    expect(handled).toHaveLength(1);
    expect(handled[0]!.type).toBe('test');
  });

  it('runs until maxTimeMs', () => {
    for (let t = 100; t <= 10000; t += 100) {
      engine.schedule(makeEvent(t));
    }

    const config = makeConfig({ maxTimeMs: 500 });
    const processed = engine.runUntil(config);

    expect(processed).toBe(5);
    expect(engine.time).toBe(500);
    expect(engine.status).toBe('completed');
  });

  it('runs until maxEvents', () => {
    for (let t = 1; t <= 100; t++) {
      engine.schedule(makeEvent(t));
    }

    const config = makeConfig({ maxEvents: 10 });
    const processed = engine.runUntil(config);

    expect(processed).toBe(10);
    expect(engine.status).toBe('completed');
  });

  it('completes when queue is empty', () => {
    engine.schedule(makeEvent(100));
    engine.schedule(makeEvent(200));

    const config = makeConfig();
    const processed = engine.runUntil(config);

    expect(processed).toBe(2);
    expect(engine.status).toBe('completed');
  });

  it('pauses and resumes', () => {
    for (let t = 100; t <= 1000; t += 100) {
      engine.schedule(makeEvent(t));
    }

    // Start running, pause after a few events via handler
    let count = 0;
    engine.on('test', () => {
      count++;
      if (count === 3) engine.pause();
    });

    const config = makeConfig();
    engine.runUntil(config);

    expect(engine.status).toBe('paused');
    expect(engine.eventsProcessed).toBe(3);
    expect(engine.pendingEvents).toBe(7);
  });

  it('resets to initial state', () => {
    engine.schedule(makeEvent(100));
    engine.step();
    engine.reset();

    expect(engine.time).toBe(0);
    expect(engine.eventsProcessed).toBe(0);
    expect(engine.pendingEvents).toBe(0);
    expect(engine.status).toBe('idle');
  });

  it('calls onEvent callback', () => {
    const events: SimEvent[] = [];
    const engine = new SimulationEngine({ onEvent: (e) => events.push(e) });

    engine.schedule(makeEvent(100));
    engine.schedule(makeEvent(200));
    engine.step();
    engine.step();

    expect(events).toHaveLength(2);
  });

  it('calls onStatusChange callback', () => {
    const statuses: string[] = [];
    const engine = new SimulationEngine({ onStatusChange: (s) => statuses.push(s) });

    engine.schedule(makeEvent(100));
    engine.runUntil(makeConfig());

    expect(statuses).toContain('running');
    expect(statuses).toContain('completed');
  });
});
