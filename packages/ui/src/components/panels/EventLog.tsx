import { useRef, useEffect } from 'react';
import { useSimulationStore } from '../../stores/simulation-store';

/* ------------------------------------------------------------------ */
/* Event type colours                                                  */
/* ------------------------------------------------------------------ */

const TYPE_COLORS: Record<string, string> = {
    'request.arrive': 'var(--sf-node-service)',
    'request.complete': 'var(--sf-success)',
    'request.dropped': 'var(--sf-error)',
    'queue.dequeue': '#f59e0b',
    'queue.deadletter': 'var(--sf-error)',
    'metrics.sample': 'var(--sf-text-muted)',
};

function getColor(type: string): string {
    return TYPE_COLORS[type] ?? 'var(--sf-text-muted)';
}

/* ------------------------------------------------------------------ */
/* EventLog                                                            */
/* ------------------------------------------------------------------ */

export function EventLog() {
    const events = useSimulationStore((s) => s.recentEvents);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [events.length]);

    if (events.length === 0) {
        return (
            <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--sf-text-muted)', fontSize: 13 }}>
                Run a simulation to see events here.
            </div>
        );
    }

    return (
        <div
            ref={scrollRef}
            style={{
                maxHeight: 260,
                overflowY: 'auto',
                padding: '4px 12px',
                fontFamily: 'monospace',
                fontSize: 11,
                lineHeight: 1.7,
            }}
        >
            {events.map((ev, i) => (
                <div
                    key={i}
                    style={{
                        display: 'flex',
                        gap: 8,
                        borderBottom: '1px solid var(--sf-border-subtle)',
                        padding: '3px 0',
                    }}
                >
                    <span style={{ color: 'var(--sf-text-muted)', minWidth: 56, textAlign: 'right' }}>
                        {ev.time.toFixed(0)}ms
                    </span>
                    <span
                        style={{
                            color: getColor(ev.type),
                            fontWeight: 600,
                            minWidth: 120,
                        }}
                    >
                        {ev.type}
                    </span>
                    <span style={{ color: 'var(--sf-text-secondary)' }}>{ev.nodeId}</span>
                </div>
            ))}
        </div>
    );
}
