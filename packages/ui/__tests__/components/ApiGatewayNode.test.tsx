import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReactFlowProvider, type NodeProps } from '@xyflow/react';
import { ApiGatewayNode } from '../../src/components/canvas/nodes/ApiGatewayNode';
import type { ApiGatewayFlowNode } from '../../src/types/flow';

function renderNode(props: Partial<NodeProps<ApiGatewayFlowNode>>) {
  const baseProps = {
    id: 'gw-1',
    data: {
      label: 'Public Gateway',
      config: {
        kind: 'api-gateway',
        rateLimitRps: 5000,
        burstSize: 500,
        authLatencyMs: { type: 'constant', value: 3 },
        routes: 24,
        failureRate: 0.001,
        maxConcurrentRequests: 7000,
      },
    },
    selected: false,
    ...props,
  } as unknown as NodeProps<ApiGatewayFlowNode>;

  return render(
    <ReactFlowProvider>
      <ApiGatewayNode {...baseProps} />
    </ReactFlowProvider>,
  );
}

describe('ApiGatewayNode', () => {
  it('renders label and gateway summary', () => {
    renderNode({});
    expect(screen.getByText('Public Gateway')).toBeDefined();
    expect(screen.getByText('5,000 rps · 24 routes')).toBeDefined();
  });

  it('exposes accessible group label', () => {
    renderNode({});
    expect(screen.getByRole('group', { name: 'API Gateway: Public Gateway' })).toBeDefined();
  });
});
