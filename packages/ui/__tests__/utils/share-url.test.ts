import { describe, expect, it } from 'vitest';
import type { ShareableDocument } from '../../src/utils/share-url';
import {
  buildEmbedUrl,
  buildIframeEmbedCode,
  buildShareHash,
  buildShareUrl,
  decodeShareDocument,
  encodeShareDocument,
  getEncodedPayloadFromHash,
  hasShareHash,
} from '../../src/utils/share-url';

const sampleDocument: ShareableDocument = {
  version: 1,
  topology: {
    nodes: [
      {
        id: 'svc-1',
        config: {
          kind: 'service',
          replicas: 1,
          latencyMs: { type: 'constant', value: 10 },
          failureRate: 0,
          maxConcurrency: 10,
        },
        position: { x: 100, y: 120 },
        metadata: { label: 'Service 1' },
      },
    ],
    edges: [],
  },
  config: {
    seed: 42,
    maxTimeMs: 10000,
    maxEvents: 1000000,
    requestRateRps: 100,
    requestDistribution: 'constant',
  },
};

describe('share-url utilities', () => {
  it('encodes and decodes a shareable document', () => {
    const encoded = encodeShareDocument(sampleDocument);
    const decoded = decodeShareDocument(encoded);

    expect(decoded).toEqual(sampleDocument);
  });

  it('returns null for malformed payloads', () => {
    expect(decodeShareDocument('not-valid-payload')).toBeNull();
  });

  it('builds and parses the hash payload', () => {
    const hash = buildShareHash(sampleDocument);
    expect(hasShareHash(hash)).toBe(true);

    const payload = getEncodedPayloadFromHash(hash);
    expect(payload).toBeTruthy();
    expect(decodeShareDocument(payload!)).toEqual(sampleDocument);
  });

  it('returns null when extracting payload from non-share hash', () => {
    expect(hasShareHash('#other=value')).toBe(false);
    expect(getEncodedPayloadFromHash('#other=value')).toBeNull();
  });

  it('builds a full share URL from location-like values', () => {
    const url = buildShareUrl(sampleDocument, {
      origin: 'https://simforge.dev',
      pathname: '/app',
      search: '?mode=demo',
    });

    expect(url.startsWith('https://simforge.dev/app?mode=demo#sf=')).toBe(true);
  });

  it('builds embed URL with embed=1 query parameter', () => {
    const url = buildEmbedUrl(sampleDocument, {
      origin: 'https://simforge.dev',
      pathname: '/app',
      search: '?mode=demo',
    });

    expect(url.startsWith('https://simforge.dev/app?mode=demo&embed=1#sf=')).toBe(true);
  });

  it('builds iframe embed code snippet', () => {
    const code = buildIframeEmbedCode(sampleDocument, {
      origin: 'https://simforge.dev',
      pathname: '/app',
      search: '',
    });

    expect(code).toContain('<iframe');
    expect(code).toContain('embed=1#sf=');
    expect(code).toContain('title="Simforge architecture widget"');
  });
});
