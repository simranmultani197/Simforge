import { memo } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from '@xyflow/react';
import type { SimforgeEdge as SimforgeEdgeType } from '../../../types/flow';
import { useSimulationStore } from '../../../stores/simulation-store';
import { useChaosStore } from '../../../stores/chaos-store';

function SimforgeEdgeComponent({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
  style,
}: EdgeProps<SimforgeEdgeType>) {
  const isRunning = useSimulationStore((s) => s.status === 'running');
  const isPartitioned = useChaosStore((s) => s.partitionedEdgeIds.includes(id));
  const sourceFault = useChaosStore((s) => s.nodeFaults[source]);
  const targetFault = useChaosStore((s) => s.nodeFaults[target]);
  const hasKillFault = Boolean(sourceFault?.kill || targetFault?.kill);
  const hasDropFault = Boolean(sourceFault?.dropPackets || targetFault?.dropPackets);
  const hasLatencySpike = Boolean(
    sourceFault?.latencySpikeFactor || targetFault?.latencySpikeFactor,
  );

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  // Format latency for label
  let latencyLabel = '';
  if (data?.latencyMs) {
    switch (data.latencyMs.type) {
      case 'constant':
        latencyLabel = `${data.latencyMs.value}ms`;
        break;
      case 'uniform':
        latencyLabel = `${data.latencyMs.min}–${data.latencyMs.max}ms`;
        break;
      case 'exponential':
        latencyLabel = `exp(${data.latencyMs.rate})`;
        break;
      case 'normal':
        latencyLabel = `N(${data.latencyMs.mean}, ${data.latencyMs.stddev})`;
        break;
    }
  }
  if (isPartitioned) {
    latencyLabel = 'PARTITIONED';
  }

  // Animate edges while simulation is running
  const stroke = selected
    ? 'var(--sf-accent)'
    : isPartitioned || hasKillFault
      ? 'var(--sf-error)'
      : hasDropFault
        ? 'var(--sf-warning)'
        : isRunning
          ? 'var(--sf-accent)'
          : 'var(--sf-text-muted)';

  const strokeWidth = selected
    ? 2.5
    : isPartitioned || hasKillFault
      ? 2.4
      : hasDropFault
        ? 2.1
        : isRunning
          ? 2
          : 1.5;

  const strokeDasharray = selected
    ? 'none'
    : isPartitioned
      ? '2 2'
      : hasDropFault
        ? '8 4'
        : '6 4';

  const shouldAnimate = isRunning && !selected && !isPartitioned && !hasKillFault;

  const edgeStyle: React.CSSProperties = {
    ...style,
    stroke,
    strokeWidth,
    strokeDasharray,
    strokeDashoffset: 0,
    opacity: selected ? 1 : isPartitioned ? 1 : hasLatencySpike ? 0.95 : isRunning ? 0.8 : 0.6,
    transition: 'stroke 0.2s ease, stroke-width 0.2s ease, opacity 0.2s ease',
    ...(shouldAnimate
      ? { animation: `sf-flow-dash ${hasDropFault ? '0.35s' : '0.6s'} linear infinite` }
      : {}),
  };

  return (
    <>
      <BaseEdge id={id} path={edgePath} style={edgeStyle} />
      {latencyLabel && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="sf-edge-label"
          >
            {latencyLabel}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export const SimforgeEdge = memo(SimforgeEdgeComponent);
