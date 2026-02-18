import { useTopologyStore } from '../../../stores/topology-store';
import { FormField } from '../../common/FormField';
import { PresetSelector } from '../../common/PresetSelector';
import type { LoadBalancerFlowNode } from '../../../types/flow';

interface Props {
  node: LoadBalancerFlowNode;
}

export function LoadBalancerProperties({ node }: Props) {
  const updateNodeConfig = useTopologyStore((s) => s.updateNodeConfig);
  const updateNodeLabel = useTopologyStore((s) => s.updateNodeLabel);
  const updateNodePresetId = useTopologyStore((s) => s.updateNodePresetId);
  const { config } = node.data;

  return (
    <div className="sf-animate-slide-in">
      <div className="sf-props-header">
        <span
          className="sf-props-header__badge"
          style={{ background: 'var(--sf-node-lb-soft)', color: 'var(--sf-node-lb)' }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="4" />
            <line x1="4" y1="12" x2="8" y2="12" />
            <line x1="16" y1="12" x2="20" y2="12" />
          </svg>
          Load Balancer
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

      <FormField label="Preset">
        <PresetSelector
          kind="load-balancer"
          onApply={(presetConfig, presetId) => { updateNodeConfig(node.id, presetConfig); updateNodePresetId(node.id, presetId); }}
        />
      </FormField>

      <FormField label="Algorithm">
        <select
          value={config.algorithm}
          onChange={(e) =>
            updateNodeConfig(node.id, {
              algorithm: e.target.value as 'round-robin' | 'least-connections' | 'random',
            })
          }
          className="sf-input"
        >
          <option value="round-robin">Round Robin</option>
          <option value="least-connections">Least Connections</option>
          <option value="random">Random</option>
        </select>
      </FormField>

      <FormField label="Max Connections">
        <input
          type="number"
          min={1}
          value={config.maxConnections}
          onChange={(e) =>
            updateNodeConfig(node.id, {
              maxConnections: Math.max(1, Number(e.target.value)),
            })
          }
          className="sf-input"
        />
      </FormField>
    </div>
  );
}
