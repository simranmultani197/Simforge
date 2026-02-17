import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReactFlowProvider, type NodeProps } from '@xyflow/react';
import { DatabaseNode } from '../../src/components/canvas/nodes/DatabaseNode';
import type { DatabaseFlowNode } from '../../src/types/flow';

function renderNode(props: Partial<NodeProps<DatabaseFlowNode>>) {
  const baseProps = {
    id: 'db-1',
    data: {
      label: 'Primary DB',
      config: {
        kind: 'database',
        engine: 'postgres',
        maxConnections: 200,
        queryLatencyMs: { type: 'constant', value: 5 },
        writeLatencyMs: { type: 'constant', value: 10 },
        failureRate: 0.001,
        connectionPoolSize: 150,
        replicationFactor: 2,
      },
    },
    selected: false,
    ...props,
  } as unknown as NodeProps<DatabaseFlowNode>;

  return render(
    <ReactFlowProvider>
      <DatabaseNode {...baseProps} />
    </ReactFlowProvider>,
  );
}

describe('DatabaseNode', () => {
  it('renders label and metadata', () => {
    renderNode({});
    expect(screen.getByText('Primary DB')).toBeDefined();
    expect(screen.getByText('postgres · 200 conn.')).toBeDefined();
  });

  it('exposes accessible group label', () => {
    renderNode({});
    expect(screen.getByRole('group', { name: 'Database: Primary DB' })).toBeDefined();
  });
});
