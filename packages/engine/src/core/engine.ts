import type { SimEvent, SimulationConfig, SimulationStatus } from '@simforge/types';
import { EventQueue } from './event-queue';

export interface EngineCallbacks {
  onEvent?: (event: SimEvent) => void;
  onStatusChange?: (status: SimulationStatus) => void;
}

/**
 * Core discrete-event simulation engine.
 * Processes events from a priority queue in time order.
 */
export class SimulationEngine {
  private queue = new EventQueue();
  private _time = 0;
  private _eventsProcessed = 0;
  private _status: SimulationStatus = 'idle';
  private callbacks: EngineCallbacks;
  private handlers = new Map<string, (event: SimEvent) => void>();

  constructor(callbacks: EngineCallbacks = {}) {
    this.callbacks = callbacks;
  }

  get time(): number {
    return this._time;
  }

  get eventsProcessed(): number {
    return this._eventsProcessed;
  }

  get status(): SimulationStatus {
    return this._status;
  }

  get pendingEvents(): number {
    return this.queue.size;
  }

  /**
   * Register a handler for a specific event type.
   */
  on(eventType: string, handler: (event: SimEvent) => void): void {
    this.handlers.set(eventType, handler);
  }

  /**
   * Schedule a new event.
   */
  schedule(event: SimEvent): void {
    if (event.time < this._time) {
      throw new Error(
        `Cannot schedule event in the past: event.time=${event.time}, current=${this._time}`,
      );
    }
    this.queue.push(event);
  }

  /**
   * Process a single event. Returns the event or null if queue is empty.
   */
  step(): SimEvent | null {
    const event = this.queue.pop();
    if (!event) return null;

    this._time = event.time;
    this._eventsProcessed++;

    const handler = this.handlers.get(event.type);
    if (handler) {
      handler(event);
    }

    this.callbacks.onEvent?.(event);
    return event;
  }

  /**
   * Run simulation until endTime or maxEvents, whichever comes first.
   * Returns the number of events processed in this run.
   */
  runUntil(config: SimulationConfig): number {
    this.setStatus('running');
    let processed = 0;

    while (this._status === 'running') {
      const next = this.queue.peek();
      if (!next) {
        this.setStatus('completed');
        break;
      }
      if (next.time > config.maxTimeMs) {
        this.setStatus('completed');
        break;
      }
      if (this._eventsProcessed >= config.maxEvents) {
        this.setStatus('completed');
        break;
      }

      this.step();
      processed++;
    }

    return processed;
  }

  /**
   * Pause the simulation (can be resumed with runUntil).
   */
  pause(): void {
    if (this._status === 'running') {
      this.setStatus('paused');
    }
  }

  /**
   * Reset the engine to initial state.
   */
  reset(): void {
    this.queue.clear();
    this._time = 0;
    this._eventsProcessed = 0;
    this.setStatus('idle');
  }

  private setStatus(status: SimulationStatus): void {
    this._status = status;
    this.callbacks.onStatusChange?.(status);
  }
}
