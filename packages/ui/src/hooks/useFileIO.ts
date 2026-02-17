import { useCallback } from 'react';
import { useTopologyStore } from '../stores/topology-store';
import { useSimulationStore } from '../stores/simulation-store';
import { useToast } from './useToast';
import type { SimTopology, SimulationConfig } from '@simforge/types';

/**
 * File format for .simforge.json
 */
interface SimforgeFile {
    version: 1;
    topology: SimTopology;
    config: SimulationConfig;
}

/**
 * Hook for saving / loading simulation designs as .simforge.json files.
 */
export function useFileIO() {
    const toSimTopology = useTopologyStore((s) => s.toSimTopology);
    const fromSimTopology = useTopologyStore((s) => s.fromSimTopology);
    const config = useSimulationStore((s) => s.config);
    const updateConfig = useSimulationStore((s) => s.updateConfig);
    const { toast } = useToast();

    /** Download the current topology + config as a .simforge.json file */
    const saveDesign = useCallback(() => {
        const topology = toSimTopology();
        const file: SimforgeFile = {
            version: 1,
            topology,
            config,
        };
        const json = JSON.stringify(file, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'design.simforge.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast('Design saved!', 'success');
    }, [toSimTopology, config, toast]);

    /** Open a file picker and load a .simforge.json file */
    const loadDesign = useCallback(() => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json,.simforge.json';
        input.onchange = async () => {
            const file = input.files?.[0];
            if (!file) return;

            try {
                const text = await file.text();
                const parsed = JSON.parse(text) as SimforgeFile;

                // Basic validation
                if (!parsed.topology || !parsed.config) {
                    throw new Error('Invalid .simforge.json file: missing topology or config');
                }

                fromSimTopology(parsed.topology);
                updateConfig(parsed.config);
                toast(`Loaded "${file.name}"`, 'success');
            } catch (err) {
                console.error('[Simforge] Failed to load design:', err);
                toast(
                    `Failed to load: ${err instanceof Error ? err.message : 'Unknown error'}`,
                    'error',
                );
            }
        };
        input.click();
    }, [fromSimTopology, updateConfig, toast]);

    return { saveDesign, loadDesign };
}
