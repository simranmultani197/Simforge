import { useMemo, useState } from 'react';
import type { ComponentConfig, ComponentPreset, CloudProvider } from '@simforge/types';
import { usePresetStore } from '../../stores/preset-store';

interface PresetSelectorProps {
  kind: ComponentConfig['kind'];
  onApply: (config: Partial<ComponentConfig>, presetId: string) => void;
}

const PROVIDER_LABELS: Record<CloudProvider, string> = {
  aws: 'AWS',
  gcp: 'GCP',
  azure: 'Azure',
};
const GROUP_ORDER = ['aws', 'gcp', 'azure', 'community'] as const;
type PresetGroup = (typeof GROUP_ORDER)[number];
const GROUP_LABELS: Record<PresetGroup, string> = {
  aws: PROVIDER_LABELS.aws,
  gcp: PROVIDER_LABELS.gcp,
  azure: PROVIDER_LABELS.azure,
  community: 'Community',
};

export function PresetSelector({ kind, onApply }: PresetSelectorProps) {
  const [selectedId, setSelectedId] = useState('');
  const getCombinedPresetsForKind = usePresetStore((state) => state.getCombinedPresetsForKind);
  const presets = useMemo(() => getCombinedPresetsForKind(kind), [getCombinedPresetsForKind, kind]);

  const grouped = useMemo(() => {
    const groups: Record<PresetGroup, ComponentPreset[]> = {
      aws: [],
      gcp: [],
      azure: [],
      community: [],
    };

    for (const preset of presets) {
      if (!preset.provider) {
        groups.community.push(preset);
      } else {
        groups[preset.provider].push(preset);
      }
    }

    return groups;
  }, [presets]);

  const handleChange = (value: string) => {
    setSelectedId(value);
    if (!value) return;

    const preset = presets.find((item) => item.id === value);
    if (!preset) return;

    onApply(preset.config as Partial<ComponentConfig>, preset.id);
  };

  return (
    <select
      value={selectedId}
      onChange={(e) => handleChange(e.target.value)}
      className="sf-input"
      aria-label={`${kind} preset selector`}
    >
      <option value="">Select a cloud preset...</option>
      {GROUP_ORDER.map((group) => {
        const options = grouped[group];
        if (options.length === 0) return null;

        return (
          <optgroup key={group} label={GROUP_LABELS[group]}>
            {options.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.name}
              </option>
            ))}
          </optgroup>
        );
      })}
    </select>
  );
}
