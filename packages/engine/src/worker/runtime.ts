import type {
  SimEvent,
  SimTopology,
  SimulationConfig,
} from '@simforge/types';
import { Simulator } from '../simulator/simulator';
import type { WorkerCommand, WorkerEvent } from './protocol';

const EVENT_BATCH_SIZE = 256;

/**
 * Testable runtime for the simulation worker protocol.
 * Handles command dispatch and emits protocol events via callback.
 */
export class SimulationWorkerRuntime {
  private simulator: Simulator | null = null;
  private topology: SimTopology | null = null;
  private config: SimulationConfig | null = null;
  private bufferedEvents: SimEvent[] = [];

  constructor(private readonly emit: (event: WorkerEvent) => void) {}

  handle(command: WorkerCommand): void {
    switch (command.type) {
      case 'init':
        this.handleInit(command.topology, command.config);
        break;

      case 'start':
        this.handleStart();
        break;

      case 'pause':
        this.handlePause();
        break;

      case 'step':
        this.handleStep();
        break;

      case 'reset':
        this.handleReset();
        break;

      case 'configure':
        this.handleConfigure(command.config);
        break;
    }
  }

  private handleInit(topology: SimTopology, config: SimulationConfig): void {
    this.topology = topology;
    this.config = config;
    this.bufferedEvents = [];

    try {
      this.simulator = this.createSimulator(topology, config);
      this.emit({ type: 'status', status: 'idle' });
    } catch (error) {
      this.emitError(error);
      this.emit({ type: 'status', status: 'error' });
    }
  }

  private handleStart(): void {
    if (!this.simulator) {
      this.emit({ type: 'error', message: 'Simulator not initialized. Send "init" first.' });
      return;
    }

    this.emit({ type: 'status', status: 'running' });
    try {
      this.simulator.run();
      this.flushBufferedEvents();
      this.emit({
        type: 'complete',
        eventsProcessed: this.simulator.eventsProcessed,
        simulationTime: this.simulator.time,
      });
      this.emit({ type: 'status', status: 'completed' });
    } catch (error) {
      this.emitError(error);
      this.emit({ type: 'status', status: 'error' });
    }
  }

  private handlePause(): void {
    if (!this.simulator) {
      this.emit({ type: 'error', message: 'Simulator not initialized. Send "init" first.' });
      return;
    }
    this.simulator.pause();
    this.emit({ type: 'status', status: 'paused' });
  }

  private handleStep(): void {
    if (!this.simulator) {
      this.emit({ type: 'error', message: 'Simulator not initialized. Send "init" first.' });
      return;
    }

    try {
      const processed = this.simulator.step();
      this.flushBufferedEvents();

      if (!processed) {
        this.emit({
          type: 'complete',
          eventsProcessed: this.simulator.eventsProcessed,
          simulationTime: this.simulator.time,
        });
        this.emit({ type: 'status', status: 'completed' });
      }
    } catch (error) {
      this.emitError(error);
      this.emit({ type: 'status', status: 'error' });
    }
  }

  private handleReset(): void {
    this.simulator?.reset();
    this.simulator = null;
    this.topology = null;
    this.config = null;
    this.bufferedEvents = [];
    this.emit({ type: 'status', status: 'idle' });
  }

  private handleConfigure(partial: Partial<SimulationConfig>): void {
    if (!this.config) {
      this.emit({ type: 'error', message: 'Cannot configure before initialization.' });
      return;
    }

    this.config = { ...this.config, ...partial };

    // Re-initialize simulator so config changes apply deterministically.
    if (this.topology) {
      try {
        this.simulator = this.createSimulator(this.topology, this.config);
        this.bufferedEvents = [];
        this.emit({ type: 'status', status: 'idle' });
      } catch (error) {
        this.emitError(error);
        this.emit({ type: 'status', status: 'error' });
      }
    }
  }

  private createSimulator(topology: SimTopology, config: SimulationConfig): Simulator {
    return new Simulator({
      topology,
      config,
      onEvent: (event) => {
        this.bufferedEvents.push(event);
        if (this.bufferedEvents.length >= EVENT_BATCH_SIZE) {
          this.flushBufferedEvents();
        }
      },
      onMetrics: (sample) => {
        this.emit({ type: 'metrics', sample });
      },
    });
  }

  private flushBufferedEvents(): void {
    if (this.bufferedEvents.length === 0) return;

    this.emit({
      type: 'events',
      events: this.bufferedEvents,
    });
    this.bufferedEvents = [];
  }

  private emitError(error: unknown): void {
    this.emit({
      type: 'error',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
  }
}
