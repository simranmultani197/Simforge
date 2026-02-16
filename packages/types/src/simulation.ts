import type { SimTopology } from './topology';

/**
 * A discrete event in the simulation.
 */
export interface SimEvent {
  /** Simulation time in milliseconds */
  time: number;
  /** Discriminated event type */
  type: string;
  /** Target node ID */
  nodeId: string;
  /** Event-specific data */
  payload: Record<string, unknown>;
}

/**
 * Configuration for a simulation run.
 */
export interface SimulationConfig {
  /** Random seed for reproducibility */
  seed: number;
  /** Maximum simulation time in ms */
  maxTimeMs: number;
  /** Maximum number of events to process (safety limit) */
  maxEvents: number;
  /** Request generation rate (requests per second) */
  requestRateRps: number;
  /** Request generation distribution */
  requestDistribution: 'constant' | 'poisson';
}

/**
 * A complete snapshot of simulation state (for save/load).
 */
export interface SimSnapshot {
  topology: SimTopology;
  config: SimulationConfig;
  currentTime: number;
  eventsProcessed: number;
}

/**
 * Simulation run status.
 */
export type SimulationStatus = 'idle' | 'running' | 'paused' | 'completed' | 'error';
