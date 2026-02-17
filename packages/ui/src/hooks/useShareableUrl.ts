import { useCallback, useEffect, useRef } from 'react';
import { useTopologyStore } from '../stores/topology-store';
import { useSimulationStore } from '../stores/simulation-store';
import { useToast } from './useToast';
import {
  buildIframeEmbedCode,
  buildShareUrl,
  decodeShareDocument,
  getEncodedPayloadFromHash,
  hasShareHash,
} from '../utils/share-url';

interface UseShareableUrlOptions {
  autoLoad?: boolean;
}

async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
}

export function useShareableUrl(options: UseShareableUrlOptions = {}) {
  const { autoLoad = true } = options;
  const toSimTopology = useTopologyStore((state) => state.toSimTopology);
  const fromSimTopology = useTopologyStore((state) => state.fromSimTopology);
  const config = useSimulationStore((state) => state.config);
  const updateConfig = useSimulationStore((state) => state.updateConfig);
  const { toast } = useToast();
  const hasLoadedRef = useRef(false);

  const copyShareUrl = useCallback(async () => {
    const document = {
      version: 1 as const,
      topology: toSimTopology(),
      config,
    };

    try {
      const url = buildShareUrl(document, window.location);

      window.history.replaceState(null, '', url);
      await copyToClipboard(url);
      toast('Shareable URL copied to clipboard.', 'success');
    } catch (error) {
      console.error('[Simforge] Failed to create share URL:', error);
      toast('Failed to create share URL.', 'error');
    }
  }, [config, toSimTopology, toast]);

  const copyEmbedCode = useCallback(async () => {
    const document = {
      version: 1 as const,
      topology: toSimTopology(),
      config,
    };

    try {
      const embedCode = buildIframeEmbedCode(document, window.location);
      const embedUrl = buildShareUrl(document, window.location);

      window.history.replaceState(null, '', embedUrl);
      await copyToClipboard(embedCode);
      toast('Iframe embed code copied to clipboard.', 'success');
    } catch (error) {
      console.error('[Simforge] Failed to create embed code:', error);
      toast('Failed to create iframe embed code.', 'error');
    }
  }, [config, toSimTopology, toast]);

  const loadFromCurrentHash = useCallback(() => {
    const encoded = getEncodedPayloadFromHash(window.location.hash);
    if (!encoded) return false;

    const document = decodeShareDocument(encoded);
    if (!document) {
      toast('Invalid share URL payload.', 'error');
      return false;
    }

    fromSimTopology(document.topology);
    updateConfig(document.config);
    toast('Loaded design from share URL.', 'success');
    return true;
  }, [fromSimTopology, toast, updateConfig]);

  useEffect(() => {
    if (!autoLoad || hasLoadedRef.current) return;
    hasLoadedRef.current = true;
    if (!hasShareHash(window.location.hash)) return;
    loadFromCurrentHash();
  }, [autoLoad, loadFromCurrentHash]);

  return {
    copyShareUrl,
    copyEmbedCode,
    loadFromCurrentHash,
  };
}
