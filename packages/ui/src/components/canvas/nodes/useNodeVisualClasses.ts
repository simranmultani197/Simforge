import { useMemo } from 'react';
import { useChaosStore } from '../../../stores/chaos-store';
import { useSimulationStore } from '../../../stores/simulation-store';

export function useNodeVisualClasses(nodeId: string): string {
  const runtimeState = useSimulationStore((s) => s.nodeVisualStates[nodeId]);
  const nodeFault = useChaosStore((s) => s.nodeFaults[nodeId]);
  const cascade = useChaosStore((s) => s.cascadeNodeIds.includes(nodeId));

  return useMemo(() => {
    const classes: string[] = [];

    if (nodeFault?.kill || nodeFault?.dropPackets) {
      classes.push('sf-node--failed');
    } else if (nodeFault?.latencySpikeFactor) {
      classes.push('sf-node--overloaded');
    } else if (runtimeState) {
      classes.push(`sf-node--${runtimeState}`);
    }

    if (nodeFault) {
      classes.push('sf-node--chaos');
    }
    if (cascade) {
      classes.push('sf-node--cascade');
    }

    return classes.join(' ');
  }, [runtimeState, nodeFault, cascade]);
}
