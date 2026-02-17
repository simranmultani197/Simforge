import { useEffect, useRef } from 'react';
import { useTopologyStore } from '../stores/topology-store';
import { useSimulationStore } from '../stores/simulation-store';
import { useToast } from './useToast';

const AUTOSAVE_KEY = 'simforge-autosave';
const AUTOSAVE_INTERVAL_MS = 30_000;

/**
 * Auto-saves the current topology + config to localStorage every 30 seconds
 * and on tab visibility change (blur). On mount, restores from localStorage
 * if a previous session was saved.
 */
export function useAutoSave(): void {
  const { toast } = useToast();
  const hasRestoredRef = useRef(false);

  // Restore on first mount
  useEffect(() => {
    if (hasRestoredRef.current) return;
    hasRestoredRef.current = true;

    try {
      const saved = localStorage.getItem(AUTOSAVE_KEY);
      if (!saved) return;

      const parsed = JSON.parse(saved) as {
        topology: ReturnType<typeof useTopologyStore.getState>['toSimTopology'] extends () => infer R ? R : never;
        config: ReturnType<typeof useSimulationStore.getState>['config'];
        savedAt: string;
      };

      if (parsed.topology && parsed.topology.nodes.length > 0) {
        useTopologyStore.getState().fromSimTopology(parsed.topology);
        if (parsed.config) {
          useSimulationStore.getState().updateConfig(parsed.config);
        }
        toast('Previous session restored', 'info');
      }
    } catch {
      // Corrupted data — ignore
    }
  }, [toast]);

  // Periodic save + save on visibility change
  useEffect(() => {
    const save = () => {
      try {
        const topology = useTopologyStore.getState().toSimTopology();
        const config = useSimulationStore.getState().config;

        // Don't save empty topologies
        if (topology.nodes.length === 0) return;

        const data = JSON.stringify({
          topology,
          config,
          savedAt: new Date().toISOString(),
        });
        localStorage.setItem(AUTOSAVE_KEY, data);
      } catch {
        // localStorage full or unavailable — silently skip
      }
    };

    // Save every 30 seconds
    const interval = setInterval(save, AUTOSAVE_INTERVAL_MS);

    // Save when tab is hidden (user switches away)
    const handleVisibilityChange = () => {
      if (document.hidden) save();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
}
