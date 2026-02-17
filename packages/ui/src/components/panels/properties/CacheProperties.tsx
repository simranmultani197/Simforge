import { useTopologyStore } from '../../../stores/topology-store';
import { FormField } from '../../common/FormField';
import { PresetSelector } from '../../common/PresetSelector';
import type { CacheFlowNode } from '../../../types/flow';

interface Props {
  node: CacheFlowNode;
}

export function CacheProperties({ node }: Props) {
  const updateNodeConfig = useTopologyStore((s) => s.updateNodeConfig);
  const updateNodeLabel = useTopologyStore((s) => s.updateNodeLabel);
  const { config } = node.data;

  return (
    <div className="sf-animate-slide-in">
      <div className="sf-props-header">
        <span
          className="sf-props-header__badge"
          style={{ background: 'var(--sf-node-cache-soft)', color: 'var(--sf-node-cache)' }}
        >
          Cache
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
          kind="cache"
          onApply={(presetConfig) => updateNodeConfig(node.id, presetConfig)}
        />
      </FormField>

      <FormField label="Eviction Policy">
        <select
          value={config.evictionPolicy}
          onChange={(e) =>
            updateNodeConfig(node.id, {
              evictionPolicy: e.target.value as 'lru' | 'lfu' | 'ttl',
            })
          }
          className="sf-input"
        >
          <option value="lru">LRU</option>
          <option value="lfu">LFU</option>
          <option value="ttl">TTL</option>
        </select>
      </FormField>

      <FormField label="Max Size (MB)">
        <input
          type="number"
          min={1}
          value={config.maxSizeMb}
          onChange={(e) => updateNodeConfig(node.id, { maxSizeMb: Math.max(1, Number(e.target.value)) })}
          className="sf-input"
        />
      </FormField>

      <FormField label="Hit Rate (0–1)">
        <input
          type="number"
          min={0}
          max={1}
          step={0.01}
          value={config.hitRate}
          onChange={(e) =>
            updateNodeConfig(node.id, { hitRate: Math.min(1, Math.max(0, Number(e.target.value))) })
          }
          className="sf-input"
        />
      </FormField>

      <FormField label="Hit Latency (ms)">
        <input
          type="number"
          min={0}
          step={1}
          value={config.hitLatencyMs.type === 'constant' ? config.hitLatencyMs.value : 0}
          onChange={(e) =>
            updateNodeConfig(node.id, {
              hitLatencyMs: { type: 'constant', value: Math.max(0, Number(e.target.value)) },
            })
          }
          className="sf-input"
        />
      </FormField>

      <FormField label="Miss Latency (ms)">
        <input
          type="number"
          min={0}
          step={1}
          value={config.missLatencyMs.type === 'constant' ? config.missLatencyMs.value : 0}
          onChange={(e) =>
            updateNodeConfig(node.id, {
              missLatencyMs: { type: 'constant', value: Math.max(0, Number(e.target.value)) },
            })
          }
          className="sf-input"
        />
      </FormField>

      <FormField label="TTL (ms)">
        <input
          type="number"
          min={1}
          value={config.ttlMs}
          onChange={(e) => updateNodeConfig(node.id, { ttlMs: Math.max(1, Number(e.target.value)) })}
          className="sf-input"
        />
      </FormField>

      <FormField label="Max Entries">
        <input
          type="number"
          min={1}
          value={config.maxEntries}
          onChange={(e) =>
            updateNodeConfig(node.id, { maxEntries: Math.max(1, Number(e.target.value)) })
          }
          className="sf-input"
        />
      </FormField>
    </div>
  );
}
