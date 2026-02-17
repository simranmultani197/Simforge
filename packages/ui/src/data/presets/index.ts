import type { ComponentConfig, ComponentPreset, CloudProvider } from '@simforge/types';
import { servicePresets } from './service-presets';
import { databasePresets } from './database-presets';
import { cachePresets } from './cache-presets';
import { apiGatewayPresets } from './api-gateway-presets';

export const allPresets: ComponentPreset[] = [
  ...servicePresets,
  ...databasePresets,
  ...cachePresets,
  ...apiGatewayPresets,
];

export function getPresetsForKind<K extends ComponentConfig['kind']>(
  kind: K,
): ComponentPreset<K>[] {
  return allPresets.filter((preset): preset is ComponentPreset<K> => preset.kind === kind);
}

export function getPresetById(id: string): ComponentPreset | undefined {
  return allPresets.find((preset) => preset.id === id);
}

export function getPresetsForProvider(provider: CloudProvider): ComponentPreset[] {
  return allPresets.filter((preset) => preset.provider === provider);
}
