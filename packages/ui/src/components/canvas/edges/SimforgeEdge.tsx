import { memo } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from '@xyflow/react';
import type { SimforgeEdge as SimforgeEdgeType } from '../../../types/flow';
import { useSimulationStore, type NodeVisualState } from '../../../stores/simulation-store';
import { useChaosStore } from '../../../stores/chaos-store';

/* ------------------------------------------------------------------ */
/* Edge health derivation from connected node states                   */
/* ------------------------------------------------------------------ */

type EdgeHealth = 'healthy' | 'degraded' | 'failing';

function deriveEdgeHealth(
  sourceState: NodeVisualState,
  targetState: NodeVisualState,
): EdgeHealth {
  if (sourceState === 'failed' || targetState === 'failed') return 'failing';
  if (sourceState === 'overloaded' || targetState === 'overloaded') return 'degraded';
  return 'healthy';
}

const HEALTH_STROKE: Record<EdgeHealth, string> = {
  healthy: 'var(--sf-success)',
  degraded: 'var(--sf-warning)',
  failing: 'var(--sf-error)',
};

const HEALTH_PARTICLE: Record<EdgeHealth, string> = {
  healthy: 'var(--sf-accent)',
  degraded: 'var(--sf-warning)',
  failing: 'var(--sf-error)',
};

/* ------------------------------------------------------------------ */
/* Edge component                                                      */
/* ------------------------------------------------------------------ */

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
  const sourceVisualState = useSimulationStore(
    (s) => s.nodeVisualStates[source] ?? 'idle',
  );
  const targetVisualState = useSimulationStore(
    (s) => s.nodeVisualStates[target] ?? 'idle',
  );
  const isPartitioned = useChaosStore((s) => s.partitionedEdgeIds.includes(id));
  const sourceFault = useChaosStore((s) => s.nodeFaults[source]);
  const targetFault = useChaosStore((s) => s.nodeFaults[target]);
  const hasKillFault = Boolean(sourceFault?.kill || targetFault?.kill);
  const hasDropFault = Boolean(sourceFault?.dropPackets || targetFault?.dropPackets);
  const hasLatencySpike = Boolean(
    sourceFault?.latencySpikeFactor || targetFault?.latencySpikeFactor,
  );

  const edgeHealth = deriveEdgeHealth(sourceVisualState, targetVisualState);

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

  // Determine stroke color: chaos faults > health-based > default
  const stroke = selected
    ? 'var(--sf-accent)'
    : isPartitioned || hasKillFault
      ? 'var(--sf-error)'
      : hasDropFault
        ? 'var(--sf-warning)'
        : isRunning
          ? HEALTH_STROKE[edgeHealth]
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

  const particleColor = HEALTH_PARTICLE[edgeHealth];

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
      {shouldAnimate && (
        <>
          <defs>
            <filter id={`glow-${id}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {[0, 1, 2].map((i) => (
            <circle
              key={i}
              r="3.5"
              fill={particleColor}
              opacity={0.85 - i * 0.15}
              filter={`url(#glow-${id})`}
            >
              <animateMotion
                dur={`${1.2 + i * 0.4}s`}
                repeatCount="indefinite"
                begin={`${i * 0.4}s`}
                path={edgePath}
              />
            </circle>
          ))}
        </>
      )}
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
