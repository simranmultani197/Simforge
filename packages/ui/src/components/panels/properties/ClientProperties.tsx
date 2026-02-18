import { useTopologyStore } from '../../../stores/topology-store';
import { FormField } from '../../common/FormField';
import type { ClientFlowNode } from '../../../types/flow';

interface Props {
  node: ClientFlowNode;
}

export function ClientProperties({ node }: Props) {
  const updateNodeLabel = useTopologyStore((s) => s.updateNodeLabel);

  return (
    <div className="sf-animate-slide-in">
      <div className="sf-props-header">
        <span
          className="sf-props-header__badge"
          style={{ background: 'var(--sf-node-client-soft)', color: 'var(--sf-node-client)' }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          Client
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

      <div style={{ padding: '12px 0', fontSize: 12, color: 'var(--sf-text-secondary)', lineHeight: 1.5 }}>
        The client node represents the origin of requests into your system.
        Connect it to a load balancer, API gateway, or service to start the request flow.
      </div>
    </div>
  );
}
