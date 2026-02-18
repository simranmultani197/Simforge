import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { CacheFlowNode } from '../../../types/flow';
import { getNodeIcon } from '../../../data/icons/cloud-icons';
import { useNodeVisualClasses } from './useNodeVisualClasses';

function CacheNodeComponent({ id, data, selected }: NodeProps<CacheFlowNode>) {
  const stateClass = useNodeVisualClasses(id);
  const Icon = getNodeIcon('cache', data.presetId);

  return (
    <div
      className={`sf-node sf-node--cache ${selected ? 'selected' : ''} ${stateClass}`}
      role="group"
      aria-label={`Cache: ${data.label}`}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: 'var(--sf-node-cache)' }}
        aria-label="Input connection"
      />

      <div className="flex items-center gap-3">
        <div className="sf-node__icon">
          <Icon />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-[var(--sf-text-primary)] truncate">{data.label}</div>
          <div className="text-[11px] text-[var(--sf-text-secondary)] mt-0.5">
            {data.config.evictionPolicy.toUpperCase()} · {Math.round(data.config.hitRate * 100)}% hit
          </div>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: 'var(--sf-node-cache)' }}
        aria-label="Output connection"
      />
    </div>
  );
}

export const CacheNode = memo(CacheNodeComponent);
