import { useTopologyStore } from '../../../stores/topology-store';
import { FormField } from '../../common/FormField';
import type { ServiceFlowNode } from '../../../types/flow';

interface Props {
  node: ServiceFlowNode;
}

export function ServiceProperties({ node }: Props) {
  const updateNodeConfig = useTopologyStore((s) => s.updateNodeConfig);
  const updateNodeLabel = useTopologyStore((s) => s.updateNodeLabel);
  const { config } = node.data;

  return (
    <div className="sf-animate-slide-in">
      <div className="sf-props-header">
        <span
          className="sf-props-header__badge"
          style={{ background: 'var(--sf-node-service-soft)', color: 'var(--sf-node-service)' }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
          Service
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

      <FormField label="Replicas">
        <input
          type="number"
          min={1}
          value={config.replicas}
          onChange={(e) =>
            updateNodeConfig(node.id, { replicas: Math.max(1, Number(e.target.value)) })
          }
          className="sf-input"
        />
      </FormField>

      <FormField label="Latency (ms)">
        <input
          type="number"
          min={0}
          step={1}
          value={config.latencyMs.type === 'constant' ? config.latencyMs.value : 0}
          onChange={(e) =>
            updateNodeConfig(node.id, {
              latencyMs: { type: 'constant', value: Math.max(0, Number(e.target.value)) },
            })
          }
          className="sf-input"
        />
      </FormField>

      <FormField label="Failure Rate (0–1)">
        <input
          type="number"
          min={0}
          max={1}
          step={0.01}
          value={config.failureRate}
          onChange={(e) =>
            updateNodeConfig(node.id, {
              failureRate: Math.min(1, Math.max(0, Number(e.target.value))),
            })
          }
          className="sf-input"
        />
      </FormField>

      <FormField label="Max Concurrency">
        <input
          type="number"
          min={1}
          value={config.maxConcurrency}
          onChange={(e) =>
            updateNodeConfig(node.id, {
              maxConcurrency: Math.max(1, Number(e.target.value)),
            })
          }
          className="sf-input"
        />
      </FormField>
    </div>
  );
}
