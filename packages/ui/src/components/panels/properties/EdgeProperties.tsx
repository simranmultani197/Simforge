import { useTopologyStore } from '../../../stores/topology-store';
import { FormField } from '../../common/FormField';
import type { SimforgeEdge } from '../../../types/flow';

interface Props {
  edge: SimforgeEdge;
}

export function EdgeProperties({ edge }: Props) {
  const updateEdgeConfig = useTopologyStore((s) => s.updateEdgeConfig);
  const data = edge.data;

  if (!data) return null;

  return (
    <div className="sf-animate-slide-in">
      <div className="sf-props-header">
        <span
          className="sf-props-header__badge"
          style={{ background: 'var(--sf-accent-soft)', color: 'var(--sf-accent)' }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" />
            <path d="M12 5l7 7-7 7" />
          </svg>
          Connection
        </span>
      </div>

      <div className="text-xs text-[var(--sf-text-secondary)] mb-4 flex items-center gap-1.5">
        <span className="font-medium text-[var(--sf-text-primary)]">{edge.source}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--sf-text-muted)]">
          <path d="M5 12h14" />
          <path d="M12 5l7 7-7 7" />
        </svg>
        <span className="font-medium text-[var(--sf-text-primary)]">{edge.target}</span>
      </div>

      <FormField label="Latency (ms)">
        <input
          type="number"
          min={0}
          step={1}
          value={data.latencyMs.type === 'constant' ? data.latencyMs.value : 0}
          onChange={(e) =>
            updateEdgeConfig(edge.id, {
              latencyMs: { type: 'constant', value: Math.max(0, Number(e.target.value)) },
            })
          }
          className="sf-input"
        />
      </FormField>

      <FormField label="Bandwidth (Mbps)">
        <input
          type="number"
          min={1}
          value={data.bandwidthMbps}
          onChange={(e) =>
            updateEdgeConfig(edge.id, {
              bandwidthMbps: Math.max(1, Number(e.target.value)),
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
          value={data.failureRate}
          onChange={(e) =>
            updateEdgeConfig(edge.id, {
              failureRate: Math.min(1, Math.max(0, Number(e.target.value))),
            })
          }
          className="sf-input"
        />
      </FormField>
    </div>
  );
}
