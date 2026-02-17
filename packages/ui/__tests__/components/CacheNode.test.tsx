import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReactFlowProvider, type NodeProps } from '@xyflow/react';
import { CacheNode } from '../../src/components/canvas/nodes/CacheNode';
import type { CacheFlowNode } from '../../src/types/flow';

function renderNode(props: Partial<NodeProps<CacheFlowNode>>) {
  const baseProps = {
    id: 'cache-1',
    data: {
      label: 'Global Cache',
      config: {
        kind: 'cache',
        evictionPolicy: 'lru',
        maxSizeMb: 512,
        hitRate: 0.88,
        hitLatencyMs: { type: 'constant', value: 1 },
        missLatencyMs: { type: 'constant', value: 3 },
        ttlMs: 60000,
        maxEntries: 100000,
      },
    },
    selected: false,
    ...props,
  } as unknown as NodeProps<CacheFlowNode>;

  return render(
    <ReactFlowProvider>
      <CacheNode {...baseProps} />
    </ReactFlowProvider>,
  );
}

describe('CacheNode', () => {
  it('renders label and cache summary', () => {
    renderNode({});
    expect(screen.getByText('Global Cache')).toBeDefined();
    expect(screen.getByText('LRU · 88% hit')).toBeDefined();
  });

  it('exposes accessible group label', () => {
    renderNode({});
    expect(screen.getByRole('group', { name: 'Cache: Global Cache' })).toBeDefined();
  });
});
