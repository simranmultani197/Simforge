/**
 * Simforge Simulation Web Worker
 *
 * Runs the discrete-event simulation engine off the main thread.
 * Communicates via WorkerCommand (inbound) and WorkerEvent (outbound).
 */

import { Simulator } from '@simforge/engine';
import type { SimTopology, SimulationConfig, MetricsSample, SimulationStatus } from '@simforge/types';

// Worker event types (mirroring protocol.ts to avoid import issues)
type WorkerCommand =
  | { type: 'init'; topology: SimTopology; config: SimulationConfig }
  | { type: 'start' }
  | { type: 'pause' }
  | { type: 'step' }
  | { type: 'reset' }
  | { type: 'configure'; config: Partial<SimulationConfig> };

type WorkerEvent =
  | { type: 'status'; status: SimulationStatus }
  | { type: 'events'; events: unknown[] }
  | { type: 'metrics'; sample: MetricsSample }
  | { type: 'error'; message: string; stack?: string }
  | { type: 'complete'; eventsProcessed: number; simulationTime: number };

declare const self: DedicatedWorkerGlobalScope;

let simulator: Simulator | null = null;
let currentConfig: SimulationConfig | null = null;

function post(event: WorkerEvent): void {
  self.postMessage(event);
}

self.onmessage = (e: MessageEvent<WorkerCommand>) => {
  const cmd = e.data;

  switch (cmd.type) {
    case 'init': {
      currentConfig = cmd.config;
      try {
        simulator = new Simulator({
          topology: cmd.topology,
          config: cmd.config,
          onMetrics: (sample: MetricsSample) => {
            post({ type: 'metrics', sample });
          },
        });
        post({ type: 'status', status: 'idle' });
      } catch (err) {
        post({
          type: 'error',
          message: err instanceof Error ? err.message : String(err),
          stack: err instanceof Error ? err.stack : undefined,
        });
        post({ type: 'status', status: 'error' });
      }
      break;
    }

    case 'start': {
      if (!simulator) {
        post({ type: 'error', message: 'Simulator not initialized. Send "init" first.' });
        return;
      }
      post({ type: 'status', status: 'running' });
      try {
        simulator.run();
        post({
          type: 'complete',
          eventsProcessed: simulator.eventsProcessed,
          simulationTime: simulator.time,
        });
        post({ type: 'status', status: 'completed' });
      } catch (err) {
        post({
          type: 'error',
          message: err instanceof Error ? err.message : String(err),
          stack: err instanceof Error ? err.stack : undefined,
        });
        post({ type: 'status', status: 'error' });
      }
      break;
    }

    case 'pause':
      simulator?.pause();
      post({ type: 'status', status: 'paused' });
      break;

    case 'step': {
      if (!simulator) {
        post({ type: 'error', message: 'Simulator not initialized. Send "init" first.' });
        return;
      }
      const event = simulator.step();
      if (event) {
        post({ type: 'events', events: [event] });
      } else {
        post({
          type: 'complete',
          eventsProcessed: simulator.eventsProcessed,
          simulationTime: simulator.time,
        });
        post({ type: 'status', status: 'completed' });
      }
      break;
    }

    case 'reset':
      simulator?.reset();
      simulator = null;
      post({ type: 'status', status: 'idle' });
      break;

    case 'configure':
      if (currentConfig) {
        currentConfig = { ...currentConfig, ...cmd.config };
      }
      break;
  }
};
