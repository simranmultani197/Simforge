import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PresetSelector } from '../../src/components/common/PresetSelector';

describe('PresetSelector', () => {
  it('renders provider-grouped presets for supported kind', () => {
    render(<PresetSelector kind="database" onApply={vi.fn()} />);

    const select = screen.getByRole('combobox', { name: 'database preset selector' });
    expect(select).toBeDefined();
    expect(screen.getByText('AWS RDS Postgres')).toBeDefined();
    expect(screen.getByText('GCP Cloud SQL Postgres')).toBeDefined();
    expect(screen.getByText('Azure Cosmos DB')).toBeDefined();
  });

  it('applies preset config on selection', () => {
    const onApply = vi.fn();
    render(<PresetSelector kind="service" onApply={onApply} />);

    const select = screen.getByRole('combobox', { name: 'service preset selector' });
    fireEvent.change(select, { target: { value: 'aws-lambda' } });

    expect(onApply).toHaveBeenCalledTimes(1);
    const applied = onApply.mock.calls[0]![0] as Record<string, unknown>;
    expect(applied['replicas']).toBeDefined();
    expect(applied['latencyMs']).toBeDefined();
  });
});
