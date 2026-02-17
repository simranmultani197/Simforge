import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ComponentPalette } from '../../src/components/panels/ComponentPalette';

describe('ComponentPalette', () => {
  it('renders all three component types', () => {
    render(<ComponentPalette />);

    expect(screen.getByText('Service')).toBeDefined();
    expect(screen.getByText('Load Balancer')).toBeDefined();
    expect(screen.getByText('Queue')).toBeDefined();
  });

  it('renders descriptions for each component', () => {
    render(<ComponentPalette />);

    expect(screen.getByText('Processes requests with configurable latency')).toBeDefined();
    expect(screen.getByText('Routes traffic across targets')).toBeDefined();
    expect(screen.getByText('Buffers and processes messages')).toBeDefined();
  });

  it('renders with correct accessibility attributes', () => {
    render(<ComponentPalette />);

    // Container has role="list"
    const list = screen.getByRole('list', { name: 'Component palette' });
    expect(list).toBeDefined();

    // Items have role="listitem"
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(3);
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
  });
});
