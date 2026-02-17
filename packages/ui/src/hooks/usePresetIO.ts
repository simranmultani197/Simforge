import { useCallback } from 'react';
import type { ComponentConfig, ComponentPreset } from '@simforge/types';
import { builtInPresets } from '../data/presets';
import { usePresetStore } from '../stores/preset-store';
import { useToast } from './useToast';

interface SimforgePresetFile {
  version: 1;
  exportedAt: string;
  presets: ComponentPreset[];
}

const VALID_KINDS = new Set<ComponentConfig['kind']>([
  'service',
  'load-balancer',
  'queue',
  'database',
  'cache',
  'api-gateway',
]);
const VALID_PROVIDERS = new Set(['aws', 'gcp', 'azure']);
const builtInIds = new Set(builtInPresets.map((preset) => preset.id));

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function validatePreset(candidate: unknown): ComponentPreset | null {
  if (!isObject(candidate)) return null;

  const id = candidate['id'];
  const name = candidate['name'];
  const kind = candidate['kind'];
  const provider = candidate['provider'];
  const description = candidate['description'];
  const config = candidate['config'];
  const tags = candidate['tags'];

  if (typeof id !== 'string' || id.trim().length === 0) return null;
  if (typeof name !== 'string' || name.trim().length === 0) return null;
  if (typeof kind !== 'string' || !VALID_KINDS.has(kind as ComponentConfig['kind'])) return null;
  if (provider !== null && (typeof provider !== 'string' || !VALID_PROVIDERS.has(provider))) return null;
  if (typeof description !== 'string') return null;
  if (!isObject(config)) return null;
  if (!isStringArray(tags)) return null;

  return {
    id,
    name,
    kind: kind as ComponentConfig['kind'],
    provider: provider as 'aws' | 'gcp' | 'azure' | null,
    description,
    config: config as ComponentPreset['config'],
    tags,
  };
}

export function usePresetIO() {
  const customPresets = usePresetStore((state) => state.customPresets);
  const upsertCustomPresets = usePresetStore((state) => state.upsertCustomPresets);
  const { toast } = useToast();

  const importPresets = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.simforge-presets.json';

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const parsed = JSON.parse(text) as unknown;
        if (
          !isObject(parsed) ||
          parsed['version'] !== 1 ||
          !Array.isArray(parsed['presets'])
        ) {
          throw new Error('Invalid preset file: expected { version: 1, presets[] }.');
        }

        const valid: ComponentPreset[] = [];
        let invalid = 0;

        for (const preset of parsed['presets']) {
          const candidate = validatePreset(preset);
          if (!candidate) {
            invalid++;
            continue;
          }

          if (builtInIds.has(candidate.id)) {
            invalid++;
            continue;
          }

          valid.push(candidate);
        }

        if (valid.length === 0) {
          throw new Error('No valid custom presets found in the selected file.');
        }

        const { added, updated, rejected } = upsertCustomPresets(valid);
        const totalRejected = rejected + invalid;

        toast(`Imported presets: ${added} added, ${updated} updated.`, 'success');
        if (totalRejected > 0) {
          toast(`${totalRejected} preset(s) were rejected as invalid or conflicting.`, 'info');
        }
      } catch (error) {
        console.error('[Simforge] Failed to import presets:', error);
        toast(
          `Failed to import presets: ${error instanceof Error ? error.message : 'Unknown error'}`,
          'error',
        );
      }
    };

    input.click();
  }, [toast, upsertCustomPresets]);

  const exportPresets = useCallback(() => {
    if (customPresets.length === 0) {
      toast('No custom presets to export.', 'info');
      return;
    }

    const payload: SimforgePresetFile = {
      version: 1,
      exportedAt: new Date().toISOString(),
      presets: customPresets,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);

    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'community-presets.simforge-presets.json';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);

    toast(`Exported ${customPresets.length} custom preset(s).`, 'success');
  }, [customPresets, toast]);

  return {
    importPresets,
    exportPresets,
  };
}
