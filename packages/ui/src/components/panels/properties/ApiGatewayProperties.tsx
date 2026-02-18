import { useTopologyStore } from '../../../stores/topology-store';
import { FormField } from '../../common/FormField';
import { PresetSelector } from '../../common/PresetSelector';
import type { ApiGatewayFlowNode } from '../../../types/flow';

interface Props {
  node: ApiGatewayFlowNode;
}

export function ApiGatewayProperties({ node }: Props) {
  const updateNodeConfig = useTopologyStore((s) => s.updateNodeConfig);
  const updateNodeLabel = useTopologyStore((s) => s.updateNodeLabel);
  const updateNodePresetId = useTopologyStore((s) => s.updateNodePresetId);
  const { config } = node.data;

  return (
    <div className="sf-animate-slide-in">
      <div className="sf-props-header">
        <span
          className="sf-props-header__badge"
          style={{ background: 'var(--sf-node-gateway-soft)', color: 'var(--sf-node-gateway)' }}
        >
          API Gateway
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
          kind="api-gateway"
          onApply={(presetConfig, presetId) => { updateNodeConfig(node.id, presetConfig); updateNodePresetId(node.id, presetId); }}
        />
      </FormField>

      <FormField label="Rate Limit (RPS)">
        <input
          type="number"
          min={1}
          value={config.rateLimitRps}
          onChange={(e) => updateNodeConfig(node.id, { rateLimitRps: Math.max(1, Number(e.target.value)) })}
          className="sf-input"
        />
      </FormField>

      <FormField label="Burst Size">
        <input
          type="number"
          min={1}
          value={config.burstSize}
          onChange={(e) => updateNodeConfig(node.id, { burstSize: Math.max(1, Number(e.target.value)) })}
          className="sf-input"
        />
      </FormField>

      <FormField label="Auth Latency (ms)">
        <input
          type="number"
          min={0}
          step={1}
          value={config.authLatencyMs.type === 'constant' ? config.authLatencyMs.value : 0}
          onChange={(e) =>
            updateNodeConfig(node.id, {
              authLatencyMs: { type: 'constant', value: Math.max(0, Number(e.target.value)) },
            })
          }
          className="sf-input"
        />
      </FormField>

      <FormField label="Routes">
        <input
          type="number"
          min={1}
          value={config.routes}
          onChange={(e) => updateNodeConfig(node.id, { routes: Math.max(1, Number(e.target.value)) })}
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

      <FormField label="Max Concurrent Requests">
        <input
          type="number"
          min={1}
          value={config.maxConcurrentRequests}
          onChange={(e) =>
            updateNodeConfig(node.id, { maxConcurrentRequests: Math.max(1, Number(e.target.value)) })
          }
          className="sf-input"
        />
      </FormField>
    </div>
  );
}
