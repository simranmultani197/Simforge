import { expect, test } from '@playwright/test';

test.describe('canvas drag and drop', () => {
  test('adds a node when dragging from palette to canvas', async ({ page }) => {
    await page.goto('/');

    const serviceItem = page.getByRole('listitem', {
      name: /Drag to add Service/i,
    });
    const flowSurface = page.locator('[data-testid="rf__wrapper"]');

    await expect(serviceItem).toBeVisible();

    const dataTransfer = await page.evaluateHandle(() => new DataTransfer());
    await serviceItem.dispatchEvent('dragstart', { dataTransfer });
    await flowSurface.dispatchEvent('dragover', {
      dataTransfer,
      clientX: 500,
      clientY: 320,
    });
    await flowSurface.dispatchEvent('drop', {
      dataTransfer,
      clientX: 500,
      clientY: 320,
    });

    const nodes = page.locator('.react-flow__node');
    await expect(nodes).toHaveCount(1);
    await expect(nodes.first()).toContainText('Service');
  });
});
