import { useMemo, useState } from 'react';
import type { ComponentConfig, ComponentPreset, CloudProvider } from '@simforge/types';
import { getPresetsForKind } from '../../data/presets';

interface PresetSelectorProps {
  kind: ComponentConfig['kind'];
  onApply: (config: Partial<ComponentConfig>) => void;
}

const PROVIDER_LABELS: Record<CloudProvider, string> = {
  aws: 'AWS',
  gcp: 'GCP',
  azure: 'Azure',
};

export function PresetSelector({ kind, onApply }: PresetSelectorProps) {
  const [selectedId, setSelectedId] = useState('');
  const presets = useMemo(() => getPresetsForKind(kind), [kind]);

  const grouped = useMemo(() => {
    const groups: Record<CloudProvider, ComponentPreset[]> = {
      aws: [],
      gcp: [],
      azure: [],
    };

    for (const preset of presets) {
      if (!preset.provider) continue;
      groups[preset.provider].push(preset);
    }

    return groups;
  }, [presets]);

  const handleChange = (value: string) => {
    setSelectedId(value);
    if (!value) return;

    const preset = presets.find((item) => item.id === value);
    if (!preset) return;

    onApply(preset.config as Partial<ComponentConfig>);
  };

  return (
    <select
      value={selectedId}
      onChange={(e) => handleChange(e.target.value)}
      className="sf-input"
      aria-label={`${kind} preset selector`}
    >
      <option value="">Select a cloud preset...</option>
      {(Object.keys(grouped) as CloudProvider[]).map((provider) => {
        const options = grouped[provider];
        if (options.length === 0) return null;

        return (
          <optgroup key={provider} label={PROVIDER_LABELS[provider]}>
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
