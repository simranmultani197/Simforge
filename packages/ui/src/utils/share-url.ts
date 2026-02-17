import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from 'lz-string';
import type { SimTopology, SimulationConfig } from '@simforge/types';

export const SHARE_HASH_KEY = 'sf';
const SHARE_HASH_PREFIX = `${SHARE_HASH_KEY}=`;

export interface ShareableDocument {
  version: 1;
  topology: SimTopology;
  config: SimulationConfig;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isValidDocument(value: unknown): value is ShareableDocument {
  if (!isObject(value)) return false;
  if (value['version'] !== 1) return false;

  const topology = value['topology'];
  const config = value['config'];
  if (!isObject(topology) || !Array.isArray(topology['nodes']) || !Array.isArray(topology['edges'])) {
    return false;
  }
  if (!isObject(config)) return false;

  const requiredConfigKeys = [
    'seed',
    'maxTimeMs',
    'maxEvents',
    'requestRateRps',
    'requestDistribution',
  ] as const;
  for (const key of requiredConfigKeys) {
    if (!(key in config)) return false;
  }

  return true;
}

export function hasShareHash(hash: string): boolean {
  return hash.startsWith(`#${SHARE_HASH_PREFIX}`);
}

export function encodeShareDocument(document: ShareableDocument): string {
  return compressToEncodedURIComponent(JSON.stringify(document));
}

export function decodeShareDocument(encoded: string): ShareableDocument | null {
  try {
    const decompressed = decompressFromEncodedURIComponent(encoded);
    if (!decompressed) return null;
    const parsed = JSON.parse(decompressed) as unknown;
    if (!isValidDocument(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function getEncodedPayloadFromHash(hash: string): string | null {
  if (!hasShareHash(hash)) return null;
  const raw = hash.slice(1);
  return raw.slice(SHARE_HASH_PREFIX.length);
}

export function buildShareHash(document: ShareableDocument): string {
  return `#${SHARE_HASH_PREFIX}${encodeShareDocument(document)}`;
}

export function buildShareUrl(
  document: ShareableDocument,
  locationLike: Pick<Location, 'origin' | 'pathname' | 'search'>,
): string {
  return `${locationLike.origin}${locationLike.pathname}${locationLike.search}${buildShareHash(document)}`;
}
