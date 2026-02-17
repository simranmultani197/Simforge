import { useEffect, useCallback } from 'react';
import { useSimulationStore } from '../stores/simulation-store';
import { useTopologyStore } from '../stores/topology-store';
import { useChaosStore } from '../stores/chaos-store';

/**
 * Hook that manages the simulation Web Worker lifecycle
 * and provides control functions (start, pause, step, reset).
 */
export function useSimulationWorker() {
  const initWorker = useSimulationStore((s) => s.initWorker);
  const terminateWorker = useSimulationStore((s) => s.terminateWorker);
  const status = useSimulationStore((s) => s.status);
  const config = useSimulationStore((s) => s.config);
  const completionInfo = useSimulationStore((s) => s.completionInfo);
  const errorMessage = useSimulationStore((s) => s.errorMessage);
  const latestSample = useSimulationStore((s) => s.latestSample);
  const startSim = useSimulationStore((s) => s.start);
  const pauseSim = useSimulationStore((s) => s.pause);
  const stepSim = useSimulationStore((s) => s.step);
  const resetSim = useSimulationStore((s) => s.reset);
  const toSimTopology = useTopologyStore((s) => s.toSimTopology);
  const getEffectiveTopology = useChaosStore((s) => s.getEffectiveTopology);

  // Initialize worker on mount, terminate on unmount
  useEffect(() => {
    initWorker();
    return () => terminateWorker();
  }, [initWorker, terminateWorker]);

  const start = useCallback(() => {
    const topology = getEffectiveTopology(toSimTopology());
    if (topology.nodes.length === 0) return;
    startSim(topology);
  }, [getEffectiveTopology, toSimTopology, startSim]);

  const pause = useCallback(() => {
    pauseSim();
  }, [pauseSim]);

  const step = useCallback(() => {
    const topology = getEffectiveTopology(toSimTopology());
    if (topology.nodes.length === 0) return;
    stepSim(topology);
  }, [getEffectiveTopology, toSimTopology, stepSim]);

  const reset = useCallback(() => {
    resetSim();
  }, [resetSim]);

  return {
    status,
    config,
    completionInfo,
    errorMessage,
    latestSample,
    start,
    pause,
    step,
    reset,
  };
}
