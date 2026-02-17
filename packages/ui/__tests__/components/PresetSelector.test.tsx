import { beforeEach, describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PresetSelector } from '../../src/components/common/PresetSelector';
import { usePresetStore } from '../../src/stores/preset-store';

describe('PresetSelector', () => {
  beforeEach(() => {
    usePresetStore.setState({ customPresets: [] });
  });

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

  it('includes imported custom presets for matching kind', () => {
    usePresetStore.getState().upsertCustomPresets([
      {
        id: 'community-service-fast',
        name: 'Community Fast Service',
        kind: 'service',
        provider: null,
        description: 'Fast latency service profile',
        config: {
          replicas: 20,
          latencyMs: { type: 'constant', value: 8 },
          failureRate: 0.001,
          maxConcurrency: 2000,
        },
        tags: ['community'],
      },
    ]);

    render(<PresetSelector kind="service" onApply={vi.fn()} />);
    expect(screen.getByText('Community Fast Service')).toBeDefined();
  });
});
