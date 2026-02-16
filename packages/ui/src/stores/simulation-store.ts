import { create } from 'zustand';
import type {
  SimulationConfig,
  SimulationStatus,
  MetricsSample,
  SimTopology,
} from '@simforge/types';

// We define the WorkerEvent type inline to avoid importing from engine internals.
// This mirrors the protocol in packages/engine/src/worker/protocol.ts.
type WorkerEvent =
  | { type: 'status'; status: SimulationStatus }
  | { type: 'events'; events: unknown[] }
  | { type: 'metrics'; sample: MetricsSample }
  | { type: 'error'; message: string; stack?: string }
  | { type: 'complete'; eventsProcessed: number; simulationTime: number };

interface SimulationState {
  // Status
  status: SimulationStatus;
  errorMessage: string | null;

  // Config
  config: SimulationConfig;

  // Metrics (live + final)
  latestSample: MetricsSample | null;
  samples: MetricsSample[];
  completionInfo: { eventsProcessed: number; simulationTime: number } | null;

  // Worker reference
  worker: Worker | null;

  // Actions
  initWorker: () => void;
  terminateWorker: () => void;
  start: (topology: SimTopology) => void;
  pause: () => void;
  step: (topology: SimTopology) => void;
  reset: () => void;
  updateConfig: (config: Partial<SimulationConfig>) => void;

  // Internal — called by worker message handler
  handleWorkerEvent: (event: WorkerEvent) => void;
}

export const useSimulationStore = create<SimulationState>((set, get) => ({
  // Initial state
  status: 'idle',
  errorMessage: null,
  config: {
    seed: 42,
    maxTimeMs: 10000,
    maxEvents: 1_000_000,
    requestRateRps: 100,
    requestDistribution: 'constant',
  },
  latestSample: null,
  samples: [],
  completionInfo: null,
  worker: null,

  // ---- Worker lifecycle ----

  initWorker: () => {
    const existing = get().worker;
    if (existing) existing.terminate();

    const w = new Worker(
      new URL('../worker/simulation-worker.ts', import.meta.url),
      { type: 'module' },
    );

    w.addEventListener('message', (e: MessageEvent<WorkerEvent>) => {
      get().handleWorkerEvent(e.data);
    });

    set({ worker: w });
  },

  terminateWorker: () => {
    const w = get().worker;
    if (w) {
      w.terminate();
      set({ worker: null });
    }
  },

  // ---- Simulation commands ----

  start: (topology) => {
    const { worker, config } = get();
    if (!worker) return;

    // Clear previous results
    set({ samples: [], latestSample: null, completionInfo: null, errorMessage: null });

    worker.postMessage({ type: 'init', topology, config });
    worker.postMessage({ type: 'start' });
  },

  pause: () => {
    get().worker?.postMessage({ type: 'pause' });
  },

  step: (topology) => {
    const { worker, config } = get();
    if (!worker) return;

    worker.postMessage({ type: 'init', topology, config });
    worker.postMessage({ type: 'step' });
  },

  reset: () => {
    const { worker } = get();
    if (worker) {
      worker.postMessage({ type: 'reset' });
    }
    set({
      status: 'idle',
      errorMessage: null,
      latestSample: null,
      samples: [],
      completionInfo: null,
    });
  },

  updateConfig: (partial) => {
    set({ config: { ...get().config, ...partial } });
  },

  // ---- Worker event handler ----

  handleWorkerEvent: (event) => {
    switch (event.type) {
      case 'status':
        set({ status: event.status });
        break;
      case 'metrics':
        set((s) => ({
          latestSample: event.sample,
          samples: [...s.samples, event.sample],
        }));
        break;
      case 'error':
        set({ errorMessage: event.message, status: 'error' });
        break;
      case 'complete':
        set({
          completionInfo: {
            eventsProcessed: event.eventsProcessed,
            simulationTime: event.simulationTime,
          },
        });
        break;
      case 'events':
        // Phase 3: visualize individual events
        break;
    }
  },
}));
