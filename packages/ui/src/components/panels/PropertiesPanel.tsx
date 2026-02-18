import { useTopologyStore } from '../../stores/topology-store';
import { ClientProperties } from './properties/ClientProperties';
import { ServiceProperties } from './properties/ServiceProperties';
import { LoadBalancerProperties } from './properties/LoadBalancerProperties';
import { QueueProperties } from './properties/QueueProperties';
import { DatabaseProperties } from './properties/DatabaseProperties';
import { CacheProperties } from './properties/CacheProperties';
import { ApiGatewayProperties } from './properties/ApiGatewayProperties';
import { EdgeProperties } from './properties/EdgeProperties';
import type {
  ClientFlowNode,
  ServiceFlowNode,
  LoadBalancerFlowNode,
  QueueFlowNode,
  DatabaseFlowNode,
  CacheFlowNode,
  ApiGatewayFlowNode,
} from '../../types/flow';

export function PropertiesPanel() {
  const selectedNodeId = useTopologyStore((s) => s.selectedNodeId);
  const selectedEdgeId = useTopologyStore((s) => s.selectedEdgeId);
  const nodes = useTopologyStore((s) => s.nodes);
  const edges = useTopologyStore((s) => s.edges);

  const selectedNode = selectedNodeId
    ? nodes.find((n) => n.id === selectedNodeId)
    : null;
  const selectedEdge = selectedEdgeId
    ? edges.find((e) => e.id === selectedEdgeId)
    : null;

  if (selectedNode) {
    switch (selectedNode.type) {
      case 'client':
        return <ClientProperties node={selectedNode as ClientFlowNode} />;
      case 'service':
        return <ServiceProperties node={selectedNode as ServiceFlowNode} />;
      case 'load-balancer':
        return <LoadBalancerProperties node={selectedNode as LoadBalancerFlowNode} />;
      case 'queue':
        return <QueueProperties node={selectedNode as QueueFlowNode} />;
      case 'database':
        return <DatabaseProperties node={selectedNode as DatabaseFlowNode} />;
      case 'cache':
        return <CacheProperties node={selectedNode as CacheFlowNode} />;
      case 'api-gateway':
        return <ApiGatewayProperties node={selectedNode as ApiGatewayFlowNode} />;
    }
  }

  if (selectedEdge) {
    return <EdgeProperties edge={selectedEdge} />;
  }

  return (
    <div className="sf-empty-state" style={{ padding: '32px 16px' }}>
      <svg
        className="sf-empty-state__icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 3l2 7h7l-5.5 4 2 7L12 17l-5.5 4 2-7L3 10h7z" />
      </svg>
      <div className="sf-empty-state__title">No Selection</div>
      <div className="sf-empty-state__text">
        Click a node or edge on the canvas to view and edit its properties.
      </div>
    </div>
  );
}
