import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary } from '../../src/components/common/ErrorBoundary';

// A component that throws when told to
function ThrowingChild({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error('Test explosion');
  return <div>Child OK</div>;
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // Suppress React's default error boundary console.error in tests
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <ThrowingChild shouldThrow={false} />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Child OK')).toBeDefined();
  });

  it('renders fallback UI when a child throws', () => {
    render(
      <ErrorBoundary>
        <ThrowingChild shouldThrow={true} />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Something went wrong')).toBeDefined();
    expect(screen.getByText('Test explosion')).toBeDefined();
  });

  it('uses custom fallbackTitle when provided', () => {
    render(
      <ErrorBoundary fallbackTitle="Canvas crashed">
        <ThrowingChild shouldThrow={true} />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Canvas crashed')).toBeDefined();
  });

  it('shows "Try Again" button in fallback UI', () => {
    render(
      <ErrorBoundary>
        <ThrowingChild shouldThrow={true} />
      </ErrorBoundary>,
    );

    // Should show error fallback with Try Again button
    const tryAgainButton = screen.getByText('Try Again');
    expect(tryAgainButton).toBeDefined();
    expect(tryAgainButton.tagName).toBe('BUTTON');
  });

  it('logs error to console', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ThrowingChild shouldThrow={true} />
      </ErrorBoundary>,
    );

    // React calls console.error with error info, and ErrorBoundary also logs
    expect(errorSpy).toHaveBeenCalled();
    const calls = errorSpy.mock.calls;
    const simforgeLogs = calls.filter(
      (args) => typeof args[0] === 'string' && args[0].includes('[Simforge ErrorBoundary]'),
    );
    expect(simforgeLogs.length).toBeGreaterThan(0);
  });
});
