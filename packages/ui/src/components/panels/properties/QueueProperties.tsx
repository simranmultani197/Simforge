import { useTopologyStore } from '../../../stores/topology-store';
import { FormField } from '../../common/FormField';
import type { QueueFlowNode } from '../../../types/flow';

interface Props {
  node: QueueFlowNode;
}

export function QueueProperties({ node }: Props) {
  const updateNodeConfig = useTopologyStore((s) => s.updateNodeConfig);
  const updateNodeLabel = useTopologyStore((s) => s.updateNodeLabel);
  const { config } = node.data;

  return (
    <div className="sf-animate-slide-in">
      <div className="sf-props-header">
        <span
          className="sf-props-header__badge"
          style={{ background: 'var(--sf-node-queue-soft)', color: 'var(--sf-node-queue)' }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="4" rx="1" />
            <rect x="3" y="10" width="18" height="4" rx="1" />
            <rect x="3" y="17" width="18" height="4" rx="1" />
          </svg>
          Queue
        </span>
      </div>

      <FormField label="Label">
        <input
          type="text"
          value={node.data.label}
          onChange={(e) => updateNodeLabel(node.id, e.target.value)}
          className="sf-input"
        />
      </FormField>

      <FormField label="Max Depth">
        <input
          type="number"
          min={1}
          value={config.maxDepth}
          onChange={(e) =>
            updateNodeConfig(node.id, {
              maxDepth: Math.max(1, Number(e.target.value)),
            })
          }
          className="sf-input"
        />
      </FormField>

      <FormField label="Processing Time (ms)">
        <input
          type="number"
          min={0}
          step={1}
          value={
            config.processingTimeMs.type === 'constant'
              ? config.processingTimeMs.value
              : 0
          }
          onChange={(e) =>
            updateNodeConfig(node.id, {
              processingTimeMs: {
                type: 'constant',
                value: Math.max(0, Number(e.target.value)),
              },
            })
          }
          className="sf-input"
        />
      </FormField>

      <FormField label="Dead Letter Queue">
        <label className="flex items-center gap-2 text-sm text-[var(--sf-text-primary)] cursor-pointer">
          <input
            type="checkbox"
            checked={config.deadLetterEnabled}
            onChange={(e) =>
              updateNodeConfig(node.id, { deadLetterEnabled: e.target.checked })
            }
            className="rounded border-[var(--sf-border)] accent-[var(--sf-node-queue)]"
          />
          Enabled
        </label>
      </FormField>
    </div>
  );
}
