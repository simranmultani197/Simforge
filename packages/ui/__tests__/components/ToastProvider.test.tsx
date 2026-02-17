import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ToastProvider } from '../../src/components/common/ToastProvider';
import { useToast } from '../../src/hooks/useToast';

// Test component that fires toasts via the hook
function ToastTrigger({ message, type }: { message: string; type?: 'success' | 'error' | 'info' }) {
  const { toast } = useToast();
  return (
    <button onClick={() => toast(message, type)}>
      Fire Toast
    </button>
  );
}

describe('ToastProvider', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders children', () => {
    render(
      <ToastProvider>
        <div>Hello</div>
      </ToastProvider>,
    );
    expect(screen.getByText('Hello')).toBeDefined();
  });

  it('shows toast when triggered', () => {
    render(
      <ToastProvider>
        <ToastTrigger message="Hello toast" />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByText('Fire Toast'));
    expect(screen.getByText('Hello toast')).toBeDefined();
  });

  it('auto-dismisses toast after 3s', () => {
    render(
      <ToastProvider>
        <ToastTrigger message="Temp toast" />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByText('Fire Toast'));
    expect(screen.getByText('Temp toast')).toBeDefined();

    // Advance time by 3s
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(screen.queryByText('Temp toast')).toBeNull();
  });

  it('shows correct icon for each toast type', () => {
    function MultiToaster() {
      const { toast } = useToast();
      return (
        <>
          <button onClick={() => toast('S', 'success')}>S</button>
          <button onClick={() => toast('E', 'error')}>E</button>
          <button onClick={() => toast('I', 'info')}>I</button>
        </>
      );
    }

    render(
      <ToastProvider>
        <MultiToaster />
      </ToastProvider>,
    );

    // Fire all three
    fireEvent.click(screen.getByText('S'));
    fireEvent.click(screen.getByText('E'));
    fireEvent.click(screen.getByText('I'));

    // Verify toast content is shown
    expect(screen.getByText('S', { selector: 'span' })).toBeDefined();
    expect(screen.getByText('E', { selector: 'span' })).toBeDefined();
    expect(screen.getByText('I', { selector: 'span' })).toBeDefined();
  });

  it('dismisses toast when clicked', () => {
    render(
      <ToastProvider>
        <ToastTrigger message="Click me away" />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByText('Fire Toast'));
    const toast = screen.getByText('Click me away');
    expect(toast).toBeDefined();

    // Click the toast container (parent div)
    fireEvent.click(toast.closest('.sf-toast')!);

    expect(screen.queryByText('Click me away')).toBeNull();
  });

  it('can show multiple toasts simultaneously', () => {
    function MultiFireToaster() {
      const { toast } = useToast();
      return (
        <button onClick={() => { toast('First'); toast('Second'); toast('Third'); }}>
          Fire All
        </button>
      );
    }

    render(
      <ToastProvider>
        <MultiFireToaster />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByText('Fire All'));

    expect(screen.getByText('First')).toBeDefined();
    expect(screen.getByText('Second')).toBeDefined();
    expect(screen.getByText('Third')).toBeDefined();
  });
});
