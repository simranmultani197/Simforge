import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { ComponentConfig, ComponentPreset } from '@simforge/types';
import { builtInPresets } from '../data/presets';

interface MergeResult {
  added: number;
  updated: number;
  rejected: number;
}

interface PresetState {
  customPresets: ComponentPreset[];
  upsertCustomPresets: (presets: ComponentPreset[]) => MergeResult;
  removeCustomPreset: (id: string) => void;
  clearCustomPresets: () => void;
  getCombinedPresetsForKind: <K extends ComponentConfig['kind']>(kind: K) => ComponentPreset<K>[];
}

const STORAGE_KEY = 'simforge-custom-presets';
const builtInIds = new Set(builtInPresets.map((preset) => preset.id));
const memoryStorageState = new Map<string, string>();

interface StorageLike {
  getItem: (name: string) => string | null;
  setItem: (name: string, value: string) => void;
  removeItem: (name: string) => void;
}

const memoryStorage: StorageLike = {
  getItem: (name) => memoryStorageState.get(name) ?? null,
  setItem: (name, value) => {
    memoryStorageState.set(name, value);
  },
  removeItem: (name) => {
    memoryStorageState.delete(name);
  },
};

function resolveStorage(): StorageLike {
  const candidate = (globalThis as { localStorage?: Partial<StorageLike> }).localStorage;
  if (
    candidate &&
    typeof candidate.getItem === 'function' &&
    typeof candidate.setItem === 'function' &&
    typeof candidate.removeItem === 'function'
  ) {
    return candidate as StorageLike;
  }
  return memoryStorage;
}

export const usePresetStore = create<PresetState>()(
  persist(
    (set, get) => ({
      customPresets: [],

      upsertCustomPresets: (presets) => {
        if (presets.length === 0) {
          return { added: 0, updated: 0, rejected: 0 };
        }

        const existing = get().customPresets;
        const byId = new Map(existing.map((preset) => [preset.id, preset]));

        let added = 0;
        let updated = 0;
        let rejected = 0;

        for (const preset of presets) {
          // Guard against overriding built-ins.
          if (builtInIds.has(preset.id)) {
            rejected++;
            continue;
          }

          if (byId.has(preset.id)) {
            updated++;
          } else {
            added++;
          }
          byId.set(preset.id, preset);
        }

        set({ customPresets: [...byId.values()] });
        return { added, updated, rejected };
      },

      removeCustomPreset: (id) => {
        set((state) => ({
          customPresets: state.customPresets.filter((preset) => preset.id !== id),
        }));
      },

      clearCustomPresets: () => {
        set({ customPresets: [] });
      },

      getCombinedPresetsForKind: (kind) => {
        const builtIns = builtInPresets.filter(
          (preset): preset is ComponentPreset<typeof kind> => preset.kind === kind,
        );
        const custom = get().customPresets.filter(
          (preset): preset is ComponentPreset<typeof kind> => preset.kind === kind,
        );
        return [...builtIns, ...custom];
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(resolveStorage),
      partialize: (state) => ({
        customPresets: state.customPresets,
      }),
    },
  ),
);
