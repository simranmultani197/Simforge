import { useMemo } from 'react';
import {
    AreaChart,
    Area,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import { useSimulationStore } from '../../stores/simulation-store';
import { useUiStore } from '../../stores/ui-store';

/* ------------------------------------------------------------------ */
/* Chart colour tokens                                                  */
/* ------------------------------------------------------------------ */

const COLORS = {
    throughput: '#3b82f6',
    p50: '#22c55e',
    p95: '#f59e0b',
    p99: '#ef4444',
    completed: '#3b82f6',
    dropped: '#ef4444',
    queue: ['#8b5cf6', '#3b82f6', '#f59e0b', '#ef4444', '#22c55e', '#06b6d4'],
};

const TOOLTIP_STYLE: React.CSSProperties = {
    background: 'var(--sf-bg-elevated)',
    border: '1px solid var(--sf-border)',
    borderRadius: 8,
    fontSize: 12,
    fontFamily: 'Inter, sans-serif',
    backdropFilter: 'blur(12px)',
};

/* ------------------------------------------------------------------ */
/* Summary Cards                                                       */
/* ------------------------------------------------------------------ */

function SummaryCards() {
    const latestSample = useSimulationStore((s) => s.latestSample);
    const completionInfo = useSimulationStore((s) => s.completionInfo);
    const samples = useSimulationStore((s) => s.samples);

    const totalCompleted = samples.reduce((s, m) => s + m.completedRequests, 0);
    const totalDropped = samples.reduce((s, m) => s + m.droppedRequests, 0);

    const cards = [
        {
            label: 'Throughput',
            value: latestSample ? `${latestSample.throughputRps.toFixed(0)} rps` : '—',
            color: COLORS.throughput,
        },
        {
            label: 'P50 Latency',
            value: latestSample ? `${latestSample.latencyP50.toFixed(1)} ms` : '—',
            color: COLORS.p50,
        },
        {
            label: 'P99 Latency',
            value: latestSample ? `${latestSample.latencyP99.toFixed(1)} ms` : '—',
            color: COLORS.p99,
        },
        {
            label: 'Completed',
            value: totalCompleted > 0 ? totalCompleted.toLocaleString() : '—',
            color: COLORS.completed,
        },
        {
            label: 'Dropped',
            value: totalDropped > 0 ? totalDropped.toLocaleString() : '—',
            color: COLORS.dropped,
        },
        {
            label: 'Events',
            value: completionInfo
                ? completionInfo.eventsProcessed.toLocaleString()
                : '—',
            color: 'var(--sf-text-secondary)',
        },
    ];

    return (
        <div style={{ display: 'flex', gap: 12, padding: '12px 16px', flexWrap: 'wrap' }}>
            {cards.map((c) => (
                <div
                    key={c.label}
                    style={{
                        flex: '1 1 100px',
                        minWidth: 100,
                        padding: '10px 14px',
                        borderRadius: 'var(--sf-radius-sm)',
                        border: '1px solid var(--sf-border)',
                        background: 'var(--sf-bg-primary)',
                    }}
                >
                    <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--sf-text-muted)', marginBottom: 4 }}>
                        {c.label}
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: c.color, fontFamily: 'Inter, sans-serif' }}>
                        {c.value}
                    </div>
                </div>
            ))}
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Throughput Chart                                                     */
/* ------------------------------------------------------------------ */

function ThroughputChart({ data }: { data: ReturnType<typeof useFormattedSamples> }) {
    return (
        <div style={{ flex: 1, minWidth: 300 }}>
            <div className="sf-sidebar__title" style={{ padding: '0 4px 4px' }}>Throughput (rps)</div>
            <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={data} margin={{ top: 4, right: 12, bottom: 4, left: 0 }}>
                    <defs>
                        <linearGradient id="throughputGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={COLORS.throughput} stopOpacity={0.3} />
                            <stop offset="100%" stopColor={COLORS.throughput} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--sf-border-subtle)" />
                    <XAxis dataKey="time" fontSize={10} tickFormatter={(v: number) => `${(v / 1000).toFixed(1)}s`} stroke="var(--sf-text-muted)" />
                    <YAxis fontSize={10} stroke="var(--sf-text-muted)" />
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Area type="monotone" dataKey="throughputRps" stroke={COLORS.throughput} fill="url(#throughputGrad)" strokeWidth={2} name="RPS" dot={false} />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Latency Chart                                                       */
/* ------------------------------------------------------------------ */

function LatencyChart({ data }: { data: ReturnType<typeof useFormattedSamples> }) {
    return (
        <div style={{ flex: 1, minWidth: 300 }}>
            <div className="sf-sidebar__title" style={{ padding: '0 4px 4px' }}>Latency (ms)</div>
            <ResponsiveContainer width="100%" height={180}>
                <LineChart data={data} margin={{ top: 4, right: 12, bottom: 4, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--sf-border-subtle)" />
                    <XAxis dataKey="time" fontSize={10} tickFormatter={(v: number) => `${(v / 1000).toFixed(1)}s`} stroke="var(--sf-text-muted)" />
                    <YAxis fontSize={10} stroke="var(--sf-text-muted)" />
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Legend iconSize={8} wrapperStyle={{ fontSize: 11, fontFamily: 'Inter, sans-serif' }} />
                    <Line type="monotone" dataKey="latencyP50" stroke={COLORS.p50} strokeWidth={2} name="P50" dot={false} />
                    <Line type="monotone" dataKey="latencyP95" stroke={COLORS.p95} strokeWidth={2} name="P95" dot={false} />
                    <Line type="monotone" dataKey="latencyP99" stroke={COLORS.p99} strokeWidth={2} name="P99" dot={false} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Queue Depths Chart                                                  */
/* ------------------------------------------------------------------ */

function QueueDepthsChart({ data }: { data: ReturnType<typeof useFormattedSamples> }) {
    // Discover all queue IDs across all samples
    const queueIds = useMemo(() => {
        const ids = new Set<string>();
        data.forEach((s) => {
            Object.keys(s).forEach((k) => {
                if (k.startsWith('q_')) ids.add(k);
            });
        });
        return Array.from(ids);
    }, [data]);

    if (queueIds.length === 0) return null;

    return (
        <div style={{ flex: 1, minWidth: 300 }}>
            <div className="sf-sidebar__title" style={{ padding: '0 4px 4px' }}>Queue Depths</div>
            <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={data} margin={{ top: 4, right: 12, bottom: 4, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--sf-border-subtle)" />
                    <XAxis dataKey="time" fontSize={10} tickFormatter={(v: number) => `${(v / 1000).toFixed(1)}s`} stroke="var(--sf-text-muted)" />
                    <YAxis fontSize={10} stroke="var(--sf-text-muted)" />
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Legend iconSize={8} wrapperStyle={{ fontSize: 11, fontFamily: 'Inter, sans-serif' }} />
                    {queueIds.map((id, i) => (
                        <Area
                            key={id}
                            type="monotone"
                            dataKey={id}
                            stackId="queues"
                            stroke={COLORS.queue[i % COLORS.queue.length]}
                            fill={COLORS.queue[i % COLORS.queue.length]}
                            fillOpacity={0.2}
                            strokeWidth={1.5}
                            name={id.replace('q_', '')}
                            dot={false}
                        />
                    ))}
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Data hook                                                           */
/* ------------------------------------------------------------------ */

function useFormattedSamples() {
    const samples = useSimulationStore((s) => s.samples);
    return useMemo(
        () =>
            samples.map((s) => {
                // Flatten queueDepths into top-level keys with q_ prefix
                const flat: Record<string, number> = {};
                for (const [nodeId, depth] of Object.entries(s.queueDepths)) {
                    flat[`q_${nodeId}`] = depth;
                }
                return { ...s, ...flat };
            }),
        [samples],
    );
}

/* ------------------------------------------------------------------ */
/* MetricsPanel (exported)                                             */
/* ------------------------------------------------------------------ */

export function MetricsPanel() {
    const metricsOpen = useUiStore((s) => s.metricsOpen);
    const samples = useSimulationStore((s) => s.samples);
    const data = useFormattedSamples();

    if (!metricsOpen) return null;

    return (
        <div className="sf-metrics-panel sf-animate-slide-in">
            {/* Summary cards */}
            <SummaryCards />

            {samples.length === 0 ? (
                <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--sf-text-muted)', fontSize: 13 }}>
                    Run a simulation to see metrics here.
                </div>
            ) : (
                <div style={{ display: 'flex', gap: 8, padding: '0 12px 12px', flexWrap: 'wrap' }}>
                    <ThroughputChart data={data} />
                    <LatencyChart data={data} />
                    <QueueDepthsChart data={data} />
                </div>
            )}
        </div>
    );
}
