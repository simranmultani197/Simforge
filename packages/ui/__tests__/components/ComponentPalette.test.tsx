import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ComponentPalette } from '../../src/components/panels/ComponentPalette';
import { useTopologyStore } from '../../src/stores/topology-store';
import { useSimulationStore } from '../../src/stores/simulation-store';

describe('ComponentPalette', () => {
  beforeEach(() => {
    useTopologyStore.setState({
      nodes: [],
      edges: [],
      selectedNodeId: null,
      selectedEdgeId: null,
    });
    useSimulationStore.setState((state) => ({
      ...state,
      config: {
        seed: 42,
        maxTimeMs: 10000,
        maxEvents: 1_000_000,
        requestRateRps: 100,
        requestDistribution: 'constant',
      },
    }));
  });

  it('renders all seven component types', () => {
    render(<ComponentPalette />);

    expect(screen.getByText('Client')).toBeDefined();
    expect(screen.getByText('Service')).toBeDefined();
    expect(screen.getByText('Load Balancer')).toBeDefined();
    expect(screen.getByText('Queue')).toBeDefined();
    expect(screen.getByText('Database')).toBeDefined();
    expect(screen.getByText('Cache')).toBeDefined();
    expect(screen.getByText('API Gateway')).toBeDefined();
  });

  it('renders descriptions for each component', () => {
    render(<ComponentPalette />);

    expect(screen.getByText('Origin of requests into your system')).toBeDefined();
    expect(screen.getByText('Processes requests with configurable latency')).toBeDefined();
    expect(screen.getByText('Routes traffic across targets')).toBeDefined();
    expect(screen.getByText('Buffers and processes messages')).toBeDefined();
    expect(screen.getByText('Persists read/write workloads')).toBeDefined();
    expect(screen.getByText('Serves hot paths with hit/miss behavior')).toBeDefined();
    expect(screen.getByText('Applies auth, limits, and traffic control')).toBeDefined();
  });

  it('renders with correct accessibility attributes', () => {
    render(<ComponentPalette />);

    // Container has role="list"
    const list = screen.getByRole('list', { name: 'Component palette' });
    expect(list).toBeDefined();

    // Items have role="listitem"
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(7);
  });

  it('items are draggable', () => {
    render(<ComponentPalette />);

    const items = screen.getAllByRole('listitem');
    for (const item of items) {
      expect(item.getAttribute('draggable')).toBe('true');
    }
  });

  it('items have tabIndex for keyboard accessibility', () => {
    render(<ComponentPalette />);

    const items = screen.getAllByRole('listitem');
    for (const item of items) {
      expect(item.getAttribute('tabindex')).toBe('0');
    }
  });

  it('sets correct dataTransfer data on drag start', () => {
    render(<ComponentPalette />);

    const items = screen.getAllByRole('listitem');
    const firstItem = items[0]!;

    // Simulate drag start on the first item (Service)
    const setDataCalls: Array<[string, string]> = [];
    const mockDataTransfer = {
      setData: (format: string, data: string) => {
        setDataCalls.push([format, data]);
      },
      effectAllowed: '',
    };

    fireEvent.dragStart(firstItem, { dataTransfer: mockDataTransfer });
    expect(setDataCalls).toContainEqual(['application/reactflow', 'client']);
    expect(setDataCalls).toContainEqual(['application/simforge-node', 'client']);
    expect(setDataCalls).toContainEqual(['text/plain', 'client']);
    expect(mockDataTransfer.effectAllowed).toBe('move');
  });

  it('has descriptive aria-labels on each item', () => {
    render(<ComponentPalette />);

    const items = screen.getAllByRole('listitem');
    expect(items[0]!.getAttribute('aria-label')).toContain('Client');
    expect(items[1]!.getAttribute('aria-label')).toContain('Service');
    expect(items[2]!.getAttribute('aria-label')).toContain('Load Balancer');
    expect(items[3]!.getAttribute('aria-label')).toContain('Queue');
    expect(items[4]!.getAttribute('aria-label')).toContain('Database');
    expect(items[5]!.getAttribute('aria-label')).toContain('Cache');
    expect(items[6]!.getAttribute('aria-label')).toContain('API Gateway');
  });

  it('renders built-in quick templates (open by default)', () => {
    render(<ComponentPalette />);

    // Templates section is open by default
    expect(screen.getByRole('button', { name: 'Load template Load-Balanced Services' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Load template Event-Driven Pipeline' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Load template Cached Read API' })).toBeDefined();
  });

  it('applies selected template to topology and simulation config', () => {
    render(<ComponentPalette />);

    // Templates section is open by default
    fireEvent.click(screen.getByRole('button', { name: 'Load template Event-Driven Pipeline' }));

    const topologyState = useTopologyStore.getState();
    const simState = useSimulationStore.getState();

    expect(topologyState.nodes.length).toBeGreaterThan(0);
    expect(topologyState.edges.length).toBeGreaterThan(0);
    expect(simState.config.requestDistribution).toBe('poisson');
    expect(simState.config.requestRateRps).toBe(350);
  });

  it('double-clicking a palette item adds a node to the canvas', () => {
    render(<ComponentPalette />);

    const serviceItem = screen.getByRole('listitem', {
      name: /Drag to add Service/i,
    });

    fireEvent.doubleClick(serviceItem);

    const topologyState = useTopologyStore.getState();
    expect(topologyState.nodes).toHaveLength(1);
    expect(topologyState.nodes[0]!.type).toBe('service');
  });
});
