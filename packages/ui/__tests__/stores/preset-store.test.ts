import { beforeEach, describe, expect, it } from 'vitest';
import { usePresetStore } from '../../src/stores/preset-store';

describe('preset-store', () => {
  beforeEach(() => {
    usePresetStore.setState({ customPresets: [] });
  });

  it('adds and updates custom presets', () => {
    const first = {
      id: 'custom-edge-cache',
      name: 'Community Edge Cache',
      kind: 'cache' as const,
      provider: null,
      description: 'Community tuned edge cache profile',
      config: {
        hitRate: 0.93,
        maxSizeMb: 512,
      },
      tags: ['community'],
    };

    const added = usePresetStore.getState().upsertCustomPresets([first]);
    expect(added).toEqual({ added: 1, updated: 0, rejected: 0 });
    expect(usePresetStore.getState().customPresets).toHaveLength(1);

    const updatedPreset = { ...first, config: { ...first.config, hitRate: 0.95 } };
    const updated = usePresetStore.getState().upsertCustomPresets([updatedPreset]);
    expect(updated).toEqual({ added: 0, updated: 1, rejected: 0 });
    expect(usePresetStore.getState().customPresets[0]!.config).toEqual({
      hitRate: 0.95,
      maxSizeMb: 512,
    });
  });

  it('rejects IDs that conflict with built-in presets', () => {
    const conflict = {
      id: 'aws-lambda',
      name: 'Conflicting Preset',
      kind: 'service' as const,
      provider: null,
      description: 'Should be rejected',
      config: { replicas: 999 },
      tags: ['invalid'],
    };

    const result = usePresetStore.getState().upsertCustomPresets([conflict]);
    expect(result).toEqual({ added: 0, updated: 0, rejected: 1 });
    expect(usePresetStore.getState().customPresets).toHaveLength(0);
  });

  it('returns built-in and custom presets for a kind', () => {
    usePresetStore.getState().upsertCustomPresets([
      {
        id: 'custom-service',
        name: 'Community Service',
        kind: 'service',
        provider: null,
        description: 'Custom service tuning',
        config: { replicas: 12 },
        tags: ['community'],
      },
    ]);

    const servicePresets = usePresetStore.getState().getCombinedPresetsForKind('service');
    const ids = servicePresets.map((preset) => preset.id);
    expect(ids).toContain('aws-lambda');
    expect(ids).toContain('custom-service');
  });
});
