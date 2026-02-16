import type {
  SimEvent,
  SimulationConfig,
  SimulationStatus,
  SimTopology,
  MetricsSample,
} from '@simforge/types';

/**
 * Commands sent from the main thread to the simulation worker.
 */
export type WorkerCommand =
  | { type: 'init'; topology: SimTopology; config: SimulationConfig }
  | { type: 'start' }
  | { type: 'pause' }
  | { type: 'step' }
  | { type: 'reset' }
  | { type: 'configure'; config: Partial<SimulationConfig> };

/**
 * Events sent from the simulation worker to the main thread.
 */
export type WorkerEvent =
  | { type: 'status'; status: SimulationStatus }
  | { type: 'events'; events: SimEvent[] }
  | { type: 'metrics'; sample: MetricsSample }
  | { type: 'error'; message: string; stack?: string }
  | { type: 'complete'; eventsProcessed: number; simulationTime: number };
