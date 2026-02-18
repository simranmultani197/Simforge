/**
 * Simforge Simulation Web Worker
 *
 * Runs the discrete-event simulation engine off the main thread.
 * Uses the engine's SimulationWorkerRuntime for proper event batching
 * and metric reporting.
 */

import { SimulationWorkerRuntime } from '@simforge/engine';
import type { WorkerCommand, WorkerEvent } from '@simforge/engine';

declare const self: DedicatedWorkerGlobalScope;

const runtime = new SimulationWorkerRuntime((event: WorkerEvent) => {
  self.postMessage(event);
});

self.addEventListener('message', (e: MessageEvent<WorkerCommand>) => {
  runtime.handle(e.data);
});

export {};
