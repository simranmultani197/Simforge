import type { WorkerCommand, WorkerEvent } from './protocol';
import { SimulationWorkerRuntime } from './runtime';

declare const self: DedicatedWorkerGlobalScope;

/**
 * Web Worker entry point for the simulation engine.
 * Runs the simulation loop off the main thread.
 */

function postEvent(event: WorkerEvent): void {
  self.postMessage(event);
}

const runtime = new SimulationWorkerRuntime(postEvent);

self.addEventListener('message', (e: MessageEvent<WorkerCommand>) => {
  runtime.handle(e.data);
});

export {};
