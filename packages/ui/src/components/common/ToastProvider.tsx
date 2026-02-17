import { createContext, useCallback, useState, type ReactNode } from 'react';

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
    id: number;
    message: string;
    type: ToastType;
}

export interface ToastContextValue {
    toast: (message: string, type?: ToastType) => void;
}

/* ------------------------------------------------------------------ */
/* Context                                                             */
/* ------------------------------------------------------------------ */

export const ToastContext = createContext<ToastContextValue>({
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    toast: () => { },
});

/* ------------------------------------------------------------------ */
/* Provider                                                            */
/* ------------------------------------------------------------------ */

let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = nextId++;
        setToasts((prev) => [...prev, { id, message, type }]);

        // Auto-dismiss after 3s
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3000);
    }, []);

    const dismiss = useCallback((id: number) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const icons: Record<ToastType, string> = {
        success: '✓',
        error: '✕',
        info: 'ℹ',
    };

    return (
        <ToastContext.Provider value={{ toast: addToast }}>
            {children}

            {/* Toast container */}
            <div
                style={{
                    position: 'fixed',
                    bottom: 16,
                    right: 16,
                    zIndex: 9999,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    pointerEvents: 'none',
                }}
            >
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        className={`sf-toast sf-toast--${t.type} sf-animate-slide-in`}
                        style={{ pointerEvents: 'auto' }}
                        onClick={() => dismiss(t.id)}
                    >
                        <span className="sf-toast__icon">{icons[t.type]}</span>
                        <span>{t.message}</span>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}
