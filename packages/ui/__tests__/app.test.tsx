import { describe, it, expect } from 'vitest';

describe('App', () => {
  it('should be importable', async () => {
    // Validates that the module compiles and exports correctly
    const mod = await import('../src/app/App');
    expect(mod.default).toBeDefined();
  });
});
