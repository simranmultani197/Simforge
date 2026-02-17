import { create } from 'zustand';
import type {
  SimulationConfig,
  SimulationStatus,
  MetricsSample,
  SimTopology,
} from '@simforge/types';

// Lightweight event shape for the event log (mirrors SimEvent from @simforge/types)
export interface LogEvent {
  time: number;
  type: string;
  nodeId: string;
}

// We define the WorkerEvent type inline to avoid importing from engine internals.
// This mirrors the protocol in packages/engine/src/worker/protocol.ts.
type WorkerEvent =
  | { type: 'status'; status: SimulationStatus }
  | { type: 'events'; events: LogEvent[] }
  | { type: 'metrics'; sample: MetricsSample }
  | { type: 'error'; message: string; stack?: string }
  | { type: 'complete'; eventsProcessed: number; simulationTime: number };

/** Per-node visual state derived from simulation metrics. */
export type NodeVisualState = 'idle' | 'processing' | 'overloaded' | 'failed';

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

  // Per-node visual states derived from metrics
  nodeVisualStates: Record<string, NodeVisualState>;

  // Event log
  recentEvents: LogEvent[];

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
  recentEvents: [],
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
  nodeVisualStates: {},
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
      recentEvents: [],
      nodeVisualStates: {},
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
      case 'metrics': {
        // Derive per-node visual states from active connections
        const nodeStates: Record<string, NodeVisualState> = {};
        if (event.sample.activeConnections) {
          for (const [nodeId, active] of Object.entries(event.sample.activeConnections)) {
            if (active === 0) {
              nodeStates[nodeId] = 'idle';
            } else if (active > 80) {
              nodeStates[nodeId] = 'overloaded';
            } else {
              nodeStates[nodeId] = 'processing';
            }
          }
        }
        if (event.sample.queueDepths) {
          for (const [nodeId, depth] of Object.entries(event.sample.queueDepths)) {
            if (depth === 0) {
              nodeStates[nodeId] = 'idle';
            } else if (depth > 800) {
              nodeStates[nodeId] = 'overloaded';
            } else {
              nodeStates[nodeId] = 'processing';
            }
          }
        }
        set((s) => ({
          latestSample: event.sample,
          samples: [...s.samples, event.sample],
          nodeVisualStates: nodeStates,
        }));
        break;
      }
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
      case 'events': {
        const incoming = event.events.map((e) => ({ time: e.time, type: e.type, nodeId: e.nodeId }));
        set((s) => ({
          recentEvents: [...s.recentEvents, ...incoming].slice(-500),
        }));
        break;
      }
    }
  },
}));
