import type { WorkerCommand, WorkerEvent } from './protocol';

declare const self: DedicatedWorkerGlobalScope;

/**
 * Web Worker entry point for the simulation engine.
 * Runs the simulation loop off the main thread.
 */

function postEvent(event: WorkerEvent): void {
  self.postMessage(event);
}

self.onmessage = (e: MessageEvent<WorkerCommand>) => {
  const command = e.data;

  switch (command.type) {
    case 'init':
      // TODO: Initialize simulation with topology and config
      postEvent({ type: 'status', status: 'idle' });
      break;

    case 'start':
      // TODO: Start simulation loop
      postEvent({ type: 'status', status: 'running' });
      break;

    case 'pause':
      postEvent({ type: 'status', status: 'paused' });
      break;

    case 'step':
      // TODO: Process single event
      break;

    case 'reset':
      postEvent({ type: 'status', status: 'idle' });
      break;

    case 'configure':
      // TODO: Update simulation config
      break;
  }
};
