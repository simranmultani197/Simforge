import { memo } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from '@xyflow/react';
import type { SimforgeEdge as SimforgeEdgeType } from '../../../types/flow';

function SimforgeEdgeComponent({
  id,
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

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          ...style,
          stroke: selected ? 'var(--sf-accent)' : 'var(--sf-text-muted)',
          strokeWidth: selected ? 2.5 : 1.5,
          strokeDasharray: selected ? 'none' : '6 4',
          strokeDashoffset: 0,
          opacity: selected ? 1 : 0.6,
          transition: 'stroke 0.2s ease, stroke-width 0.2s ease, opacity 0.2s ease',
        }}
      />
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
