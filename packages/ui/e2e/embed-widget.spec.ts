import { test, expect } from '@playwright/test';
import LZString from 'lz-string';

const { compressToEncodedURIComponent } = LZString;

function buildEmbedPathFromDocument(document: unknown): string {
  const encoded = compressToEncodedURIComponent(JSON.stringify(document));
  return `/?embed=1#sf=${encoded}`;
}

test.describe('embed widget mode', () => {
  test('renders shared topology in read-only iframe mode', async ({ page }) => {
    const sharedDocument = {
      version: 1,
      topology: {
        nodes: [
          {
            id: 'api-gateway-1',
            config: {
              kind: 'api-gateway',
              rateLimitRps: 1200,
              burstSize: 60,
              authLatencyMs: { type: 'constant', value: 3 },
              routes: 12,
              failureRate: 0.001,
              maxConcurrentRequests: 900,
            },
            position: { x: 120, y: 120 },
            metadata: { label: 'Public Gateway' },
          },
          {
            id: 'service-1',
            config: {
              kind: 'service',
              replicas: 2,
              latencyMs: { type: 'constant', value: 25 },
              failureRate: 0.01,
              maxConcurrency: 120,
            },
            position: { x: 360, y: 240 },
            metadata: { label: 'Edge Service' },
          },
        ],
        edges: [
          {
            id: 'edge-1',
            source: 'api-gateway-1',
            target: 'service-1',
            config: {
              latencyMs: { type: 'constant', value: 2 },
              bandwidthMbps: 1000,
              failureRate: 0,
            },
          },
        ],
      },
      config: {
        seed: 42,
        maxTimeMs: 10000,
        maxEvents: 1000000,
        requestRateRps: 200,
        requestDistribution: 'constant',
      },
    };

    await page.goto(buildEmbedPathFromDocument(sharedDocument));

    await expect(page.getByText('Powered by Simforge')).toBeVisible();
    await expect(page.getByText('Public Gateway')).toBeVisible();
    await expect(page.getByText('Edge Service')).toBeVisible();

    await expect(page.getByText('Components')).toHaveCount(0);
    await expect(page.getByText('Properties')).toHaveCount(0);
    await expect(page.getByRole('button', { name: /play/i })).toHaveCount(0);
  });

  test('shows empty embed-state copy when no share hash is provided', async ({ page }) => {
    await page.goto('/?embed=1');
    await expect(page.getByText('No Shared Design')).toBeVisible();
  });
});
