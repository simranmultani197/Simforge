import { useEffect } from 'react';
import { useTopologyStore } from '../stores/topology-store';
import { useFileIO } from './useFileIO';
import { useShareableUrl } from './useShareableUrl';

/**
 * Global keyboard shortcuts for the application.
 *
 * - Cmd/Ctrl + Z: Undo
 * - Cmd/Ctrl + Shift + Z: Redo
 * - Cmd/Ctrl + S: Save design as .simforge.json
 * - Cmd/Ctrl + O: Load design from .simforge.json
 * - Cmd/Ctrl + Shift + C: Copy shareable URL
 * - Delete/Backspace: Handled by React Flow's deleteKeyCode
 */
export function useKeyboardShortcuts() {
  const { saveDesign, loadDesign } = useFileIO();
  const { copyShareUrl } = useShareableUrl({ autoLoad: false });

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const meta = e.metaKey || e.ctrlKey;

      // Don't intercept shortcuts while typing in inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      // Cmd+Z: Undo
      if (meta && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        useTopologyStore.temporal.getState().undo();
        return;
      }

      // Cmd+Shift+Z: Redo
      if (meta && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        useTopologyStore.temporal.getState().redo();
        return;
      }

      // Cmd+S: Save design
      if (meta && e.key === 's') {
        e.preventDefault();
        saveDesign();
        return;
      }

      // Cmd+O: Load design
      if (meta && e.key === 'o') {
        e.preventDefault();
        loadDesign();
        return;
      }

      // Cmd+Shift+C: Copy share URL
      if (meta && e.shiftKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        void copyShareUrl();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [copyShareUrl, saveDesign, loadDesign]);
}
