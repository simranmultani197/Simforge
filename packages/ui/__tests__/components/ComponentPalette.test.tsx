import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ComponentPalette } from '../../src/components/panels/ComponentPalette';

describe('ComponentPalette', () => {
  it('renders all six component types', () => {
    render(<ComponentPalette />);

    expect(screen.getByText('Service')).toBeDefined();
    expect(screen.getByText('Load Balancer')).toBeDefined();
    expect(screen.getByText('Queue')).toBeDefined();
    expect(screen.getByText('Database')).toBeDefined();
    expect(screen.getByText('Cache')).toBeDefined();
    expect(screen.getByText('API Gateway')).toBeDefined();
  });

  it('renders descriptions for each component', () => {
    render(<ComponentPalette />);

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
    expect(items).toHaveLength(6);
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
    const mockDataTransfer = {
      setData: (format: string, data: string) => {
        expect(format).toBe('application/simforge-node');
        expect(data).toBe('service');
      },
      effectAllowed: '',
    };

    fireEvent.dragStart(firstItem, { dataTransfer: mockDataTransfer });
    expect(mockDataTransfer.effectAllowed).toBe('move');
  });

  it('has descriptive aria-labels on each item', () => {
    render(<ComponentPalette />);

    const items = screen.getAllByRole('listitem');
    expect(items[0]!.getAttribute('aria-label')).toContain('Service');
    expect(items[1]!.getAttribute('aria-label')).toContain('Load Balancer');
    expect(items[2]!.getAttribute('aria-label')).toContain('Queue');
    expect(items[3]!.getAttribute('aria-label')).toContain('Database');
    expect(items[4]!.getAttribute('aria-label')).toContain('Cache');
    expect(items[5]!.getAttribute('aria-label')).toContain('API Gateway');
  });

  it('renders preset import/export actions', () => {
    render(<ComponentPalette />);

    expect(screen.getByRole('button', { name: 'Import presets file' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Export custom presets file' })).toBeDefined();
  });
});
