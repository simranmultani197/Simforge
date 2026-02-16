import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallbackTitle?: string;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

/**
 * Reusable error boundary — catches React rendering errors and shows
 * a friendly fallback instead of crashing the entire app.
 *
 * Use at multiple levels: app shell, individual panels, canvas.
 */
export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error('[Simforge ErrorBoundary]', error, info.componentStack);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="sf-error-boundary">
                    <svg
                        width="40"
                        height="40"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="var(--sf-error)"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <div className="sf-error-boundary__title">
                        {this.props.fallbackTitle ?? 'Something went wrong'}
                    </div>
                    <div className="sf-error-boundary__message">
                        {this.state.error?.message ?? 'An unexpected error occurred.'}
                    </div>
                    <button
                        onClick={this.handleReset}
                        className="sf-btn sf-btn--secondary"
                        style={{ marginTop: 8 }}
                    >
                        Try Again
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
