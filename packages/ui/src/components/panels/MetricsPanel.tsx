import { useMemo, useState, useCallback } from 'react';
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
import { EventLog } from './EventLog';

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
/* Tabs                                                                */
/* ------------------------------------------------------------------ */

type Tab = 'charts' | 'events';

/* ------------------------------------------------------------------ */
/* Summary Cards                                                       */
/* ------------------------------------------------------------------ */

function SummaryCards() {
    const latestSample = useSimulationStore((s) => s.latestSample);
    const completionInfo = useSimulationStore((s) => s.completionInfo);
    const samples = useSimulationStore((s) => s.samples);

    const totalCompleted = samples.reduce((s, m) => s + m.completedRequests, 0);
    const totalDropped = samples.reduce((s, m) => s + m.droppedRequests, 0);

    const successRate = (totalCompleted + totalDropped) > 0
        ? ((totalCompleted / (totalCompleted + totalDropped)) * 100).toFixed(1)
        : '—';

    // Compute trends by comparing last 2 samples
    const prev = samples.length >= 2 ? samples[samples.length - 2] : null;
    const curr = samples.length >= 1 ? samples[samples.length - 1] : null;
    const throughputTrend = prev && curr ? (curr.throughputRps > prev.throughputRps ? '↑' : curr.throughputRps < prev.throughputRps ? '↓' : '') : '';
    const latencyTrend = prev && curr ? (curr.latencyP50 > prev.latencyP50 ? '↑' : curr.latencyP50 < prev.latencyP50 ? '↓' : '') : '';

    const cards: { label: string; value: string; color: string; trend?: string; trendGood?: boolean }[] = [
        {
            label: 'Throughput',
            value: latestSample ? `${latestSample.throughputRps.toFixed(0)} rps` : '—',
            color: COLORS.throughput,
            trend: throughputTrend,
            trendGood: true,
        },
        {
            label: 'P50 Latency',
            value: latestSample ? `${latestSample.latencyP50.toFixed(1)} ms` : '—',
            color: COLORS.p50,
            trend: latencyTrend,
            trendGood: false,
        },
        {
            label: 'P99 Latency',
            value: latestSample ? `${latestSample.latencyP99.toFixed(1)} ms` : '—',
            color: COLORS.p99,
        },
        {
            label: 'Success Rate',
            value: successRate !== '—' ? `${successRate}%` : '—',
            color: Number(successRate) >= 99 ? COLORS.p50 : Number(successRate) >= 95 ? COLORS.p95 : COLORS.p99,
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
        <div style={{ display: 'flex', gap: 12, padding: '12px 16px', flexWrap: 'wrap' }} role="group" aria-label="Simulation summary metrics">
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
                    role="meter"
                    aria-label={`${c.label}: ${c.value}`}
                >
                    <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--sf-text-muted)', marginBottom: 4 }}>
                        {c.label}
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: c.color, fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'baseline', gap: 4 }}>
                        {c.value}
                        {c.trend && (
                            <span style={{ fontSize: 12, color: (c.trend === '↑' && c.trendGood) || (c.trend === '↓' && !c.trendGood) ? COLORS.p50 : COLORS.p99 }}>
                                {c.trend}
                            </span>
                        )}
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
/* Error Rate Chart                                                    */
/* ------------------------------------------------------------------ */

function ErrorRateChart({ data }: { data: ReturnType<typeof useFormattedSamples> }) {
    return (
        <div style={{ flex: 1, minWidth: 300 }}>
            <div className="sf-sidebar__title" style={{ padding: '0 4px 4px' }}>Requests (completed vs dropped)</div>
            <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={data} margin={{ top: 4, right: 12, bottom: 4, left: 0 }}>
                    <defs>
                        <linearGradient id="completedGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={COLORS.completed} stopOpacity={0.3} />
                            <stop offset="100%" stopColor={COLORS.completed} stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="droppedGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={COLORS.dropped} stopOpacity={0.3} />
                            <stop offset="100%" stopColor={COLORS.dropped} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--sf-border-subtle)" />
                    <XAxis dataKey="time" fontSize={10} tickFormatter={(v: number) => `${(v / 1000).toFixed(1)}s`} stroke="var(--sf-text-muted)" />
                    <YAxis fontSize={10} stroke="var(--sf-text-muted)" />
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Legend iconSize={8} wrapperStyle={{ fontSize: 11, fontFamily: 'Inter, sans-serif' }} />
                    <Area type="monotone" dataKey="completedRequests" stroke={COLORS.completed} fill="url(#completedGrad)" strokeWidth={2} name="Completed" dot={false} />
                    <Area type="monotone" dataKey="droppedRequests" stroke={COLORS.dropped} fill="url(#droppedGrad)" strokeWidth={2} name="Dropped" dot={false} />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Error Breakdown (HTTP codes)                                        */
/* ------------------------------------------------------------------ */

const REASON_TO_HTTP: Record<string, { code: number; label: string; color: string }> = {
    failure: { code: 500, label: 'Internal Server Error', color: '#ef4444' },
    overloaded: { code: 503, label: 'Service Unavailable', color: '#f97316' },
    rate_limited: { code: 429, label: 'Too Many Requests', color: '#eab308' },
    pool_exhausted: { code: 503, label: 'Pool Exhausted', color: '#f97316' },
    queue_full: { code: 507, label: 'Queue Full', color: '#a855f7' },
    no_targets: { code: 502, label: 'Bad Gateway', color: '#ec4899' },
    max_connections: { code: 503, label: 'Max Connections', color: '#f97316' },
    edge_failure: { code: 502, label: 'Edge Failure', color: '#ec4899' },
    unknown: { code: 0, label: 'Unknown', color: '#6b7280' },
};

function ErrorBreakdown() {
    const samples = useSimulationStore((s) => s.samples);

    const aggregated = useMemo(() => {
        const totals: Record<string, number> = {};
        for (const s of samples) {
            if (s.dropReasons) {
                for (const [reason, count] of Object.entries(s.dropReasons)) {
                    totals[reason] = (totals[reason] ?? 0) + count;
                }
            }
        }
        return Object.entries(totals)
            .map(([reason, count]) => ({
                reason,
                count,
                http: REASON_TO_HTTP[reason] ?? REASON_TO_HTTP['unknown']!,
            }))
            .sort((a, b) => b.count - a.count);
    }, [samples]);

    if (aggregated.length === 0) return null;

    const totalErrors = aggregated.reduce((sum, e) => sum + e.count, 0);

    return (
        <div style={{ flex: 1, minWidth: 300 }}>
            <div className="sf-sidebar__title" style={{ padding: '0 4px 4px' }}>Error Breakdown</div>
            <div style={{ padding: '4px 0', fontSize: 12, fontFamily: 'Inter, sans-serif' }}>
                {aggregated.map((entry) => {
                    const pct = totalErrors > 0 ? ((entry.count / totalErrors) * 100).toFixed(1) : '0';
                    return (
                        <div
                            key={entry.reason}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                padding: '4px 8px',
                                borderBottom: '1px solid var(--sf-border-subtle)',
                            }}
                        >
                            <span
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    minWidth: 36,
                                    padding: '2px 6px',
                                    borderRadius: 4,
                                    fontSize: 10,
                                    fontWeight: 700,
                                    fontFamily: 'monospace',
                                    background: entry.http.color,
                                    color: 'white',
                                }}
                            >
                                {entry.http.code || '???'}
                            </span>
                            <span style={{ flex: 1, color: 'var(--sf-text-secondary)', fontSize: 11 }}>
                                {entry.http.label}
                            </span>
                            <span style={{ fontWeight: 600, color: 'var(--sf-text-primary)', fontFamily: 'monospace' }}>
                                {entry.count.toLocaleString()}
                            </span>
                            <span style={{ color: 'var(--sf-text-muted)', fontSize: 10, minWidth: 40, textAlign: 'right' }}>
                                {pct}%
                            </span>
                        </div>
                    );
                })}
            </div>
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
/* CSV Export                                                           */
/* ------------------------------------------------------------------ */

function useExportCsv() {
    const samples = useSimulationStore((s) => s.samples);
    return useCallback(() => {
        if (samples.length === 0) return;
        const headers = ['time', 'throughputRps', 'latencyP50', 'latencyP95', 'latencyP99', 'completedRequests', 'droppedRequests', 'activeConnections'];
        const rows = samples.map((s) =>
            headers.map((h) => (s as unknown as Record<string, unknown>)[h] ?? '').join(',')
        );
        const csv = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'metrics.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, [samples]);
}

/* ------------------------------------------------------------------ */
/* MetricsPanel (exported)                                             */
/* ------------------------------------------------------------------ */

export function MetricsPanel() {
    const metricsOpen = useUiStore((s) => s.metricsOpen);
    const samples = useSimulationStore((s) => s.samples);
    const data = useFormattedSamples();
    const exportCsv = useExportCsv();
    const [tab, setTab] = useState<Tab>('charts');

    if (!metricsOpen) return null;

    return (
        <div className="sf-metrics-panel sf-animate-slide-in" role="region" aria-label="Simulation metrics" aria-live="polite">
            {/* Tab bar + export button */}
            <div style={{ display: 'flex', alignItems: 'center', padding: '6px 16px 0', gap: 4 }} role="tablist" aria-label="Metrics view">
                <button
                    className={`sf-btn ${tab === 'charts' ? 'sf-btn--primary' : 'sf-btn--secondary'}`}
                    onClick={() => setTab('charts')}
                    style={{ fontSize: 11, padding: '3px 10px' }}
                    role="tab"
                    aria-selected={tab === 'charts'}
                    aria-controls="metrics-tabpanel"
                >
                    Charts
                </button>
                <button
                    className={`sf-btn ${tab === 'events' ? 'sf-btn--primary' : 'sf-btn--secondary'}`}
                    onClick={() => setTab('events')}
                    style={{ fontSize: 11, padding: '3px 10px' }}
                    role="tab"
                    aria-selected={tab === 'events'}
                    aria-controls="metrics-tabpanel"
                >
                    Event Log
                </button>
                <div style={{ flex: 1 }} />
                {tab === 'charts' && samples.length > 0 && (
                    <button
                        className="sf-btn sf-btn--secondary"
                        onClick={exportCsv}
                        title="Export metrics as CSV"
                        aria-label="Export metrics data as CSV file"
                        style={{ fontSize: 11, padding: '3px 10px' }}
                    >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        Export CSV
                    </button>
                )}
            </div>

            {/* Summary cards */}
            <SummaryCards />

            <div id="metrics-tabpanel" role="tabpanel" aria-label={tab === 'charts' ? 'Charts view' : 'Event log view'}>
            {tab === 'charts' ? (
                samples.length === 0 ? (
                    <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--sf-text-muted)', fontSize: 13 }}>
                        Run a simulation to see metrics here.
                    </div>
                ) : (
                    <div style={{ display: 'flex', gap: 8, padding: '0 12px 12px', flexWrap: 'wrap' }}>
                        <ThroughputChart data={data} />
                        <LatencyChart data={data} />
                        <QueueDepthsChart data={data} />
                        <ErrorRateChart data={data} />
                        <ErrorBreakdown />
                    </div>
                )
            ) : (
                <EventLog />
            )}
            </div>
        </div>
    );
}
