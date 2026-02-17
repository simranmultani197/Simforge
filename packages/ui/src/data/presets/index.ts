import type { ComponentConfig, ComponentPreset, CloudProvider } from '@simforge/types';
import { servicePresets } from './service-presets';
import { databasePresets } from './database-presets';
import { cachePresets } from './cache-presets';
import { apiGatewayPresets } from './api-gateway-presets';

export const builtInPresets: ComponentPreset[] = [
  ...servicePresets,
  ...databasePresets,
  ...cachePresets,
  ...apiGatewayPresets,
];

// Backward-compatible alias
export const allPresets = builtInPresets;

export function getPresetsForKind<K extends ComponentConfig['kind']>(
  kind: K,
): ComponentPreset<K>[] {
  return builtInPresets.filter((preset): preset is ComponentPreset<K> => preset.kind === kind);
}

export function getPresetById(id: string): ComponentPreset | undefined {
  return builtInPresets.find((preset) => preset.id === id);
}

export function getPresetsForProvider(provider: CloudProvider): ComponentPreset[] {
  return builtInPresets.filter((preset) => preset.provider === provider);
}
