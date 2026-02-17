import { useTopologyStore } from '../../../stores/topology-store';
import { FormField } from '../../common/FormField';
import { PresetSelector } from '../../common/PresetSelector';
import type { DatabaseFlowNode } from '../../../types/flow';

interface Props {
  node: DatabaseFlowNode;
}

export function DatabaseProperties({ node }: Props) {
  const updateNodeConfig = useTopologyStore((s) => s.updateNodeConfig);
  const updateNodeLabel = useTopologyStore((s) => s.updateNodeLabel);
  const { config } = node.data;

  return (
    <div className="sf-animate-slide-in">
      <div className="sf-props-header">
        <span
          className="sf-props-header__badge"
          style={{ background: 'var(--sf-node-database-soft)', color: 'var(--sf-node-database)' }}
        >
          Database
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
          kind="database"
          onApply={(presetConfig) => updateNodeConfig(node.id, presetConfig)}
        />
      </FormField>

      <FormField label="Engine">
        <select
          value={config.engine}
          onChange={(e) =>
            updateNodeConfig(node.id, {
              engine: e.target.value as 'postgres' | 'mysql' | 'dynamodb' | 'redis',
            })
          }
          className="sf-input"
        >
          <option value="postgres">Postgres</option>
          <option value="mysql">MySQL</option>
          <option value="dynamodb">DynamoDB</option>
          <option value="redis">Redis</option>
        </select>
      </FormField>

      <FormField label="Max Connections">
        <input
          type="number"
          min={1}
          value={config.maxConnections}
          onChange={(e) =>
            updateNodeConfig(node.id, { maxConnections: Math.max(1, Number(e.target.value)) })
          }
          className="sf-input"
        />
      </FormField>

      <FormField label="Query Latency (ms)">
        <input
          type="number"
          min={0}
          step={1}
          value={config.queryLatencyMs.type === 'constant' ? config.queryLatencyMs.value : 0}
          onChange={(e) =>
            updateNodeConfig(node.id, {
              queryLatencyMs: { type: 'constant', value: Math.max(0, Number(e.target.value)) },
            })
          }
          className="sf-input"
        />
      </FormField>

      <FormField label="Write Latency (ms)">
        <input
          type="number"
          min={0}
          step={1}
          value={config.writeLatencyMs.type === 'constant' ? config.writeLatencyMs.value : 0}
          onChange={(e) =>
            updateNodeConfig(node.id, {
              writeLatencyMs: { type: 'constant', value: Math.max(0, Number(e.target.value)) },
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

      <FormField label="Pool Size">
        <input
          type="number"
          min={1}
          value={config.connectionPoolSize}
          onChange={(e) =>
            updateNodeConfig(node.id, { connectionPoolSize: Math.max(1, Number(e.target.value)) })
          }
          className="sf-input"
        />
      </FormField>

      <FormField label="Replication Factor">
        <input
          type="number"
          min={1}
          value={config.replicationFactor}
          onChange={(e) =>
            updateNodeConfig(node.id, { replicationFactor: Math.max(1, Number(e.target.value)) })
          }
          className="sf-input"
        />
      </FormField>
    </div>
  );
}
