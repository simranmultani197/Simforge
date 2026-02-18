import { useState } from 'react';
import { useSimulationWorker } from '../../hooks/useSimulationWorker';
import { useSimulationStore } from '../../stores/simulation-store';
import { useUiStore } from '../../stores/ui-store';
import { useFileIO } from '../../hooks/useFileIO';
import { useShareableUrl } from '../../hooks/useShareableUrl';
import { useTopologyStore } from '../../stores/topology-store';
import { useChaosStore, type ChaosPreset } from '../../stores/chaos-store';
import { ThemeToggle } from '../common/ThemeToggle';
import { usePresetIO } from '../../hooks/usePresetIO';

export function SimulationControls() {
  const { status, start, pause, step, reset, completionInfo, errorMessage } =
    useSimulationWorker();
  const config = useSimulationStore((s) => s.config);
  const updateConfig = useSimulationStore((s) => s.updateConfig);
  const latestSample = useSimulationStore((s) => s.latestSample);
  const toggleMetrics = useUiStore((s) => s.toggleMetrics);
  const metricsOpen = useUiStore((s) => s.metricsOpen);
  const toSimTopology = useTopologyStore((s) => s.toSimTopology);
  const applyChaosPreset = useChaosStore((s) => s.applyPreset);
  const clearAllChaosFaults = useChaosStore((s) => s.clearAllFaults);
  const nodeFaultCount = useChaosStore((s) => Object.keys(s.nodeFaults).length);
  const partitionedEdgeCount = useChaosStore((s) => s.partitionedEdgeIds.length);
  const cascadeNodeCount = useChaosStore((s) => s.cascadeNodeIds.length);
  const { saveDesign, loadDesign } = useFileIO();
  const { copyShareUrl, copyEmbedCode } = useShareableUrl({ autoLoad: false });
  const { importPresets, exportPresets } = usePresetIO();
  const [selectedChaosPreset, setSelectedChaosPreset] =
    useState<ChaosPreset>('region-failure');
  const [showMore, setShowMore] = useState(true);

  const isRunning = status === 'running';
  const isCompleted = status === 'completed';
  const isIdle = status === 'idle';
  const activeChaosCount = nodeFaultCount + partitionedEdgeCount;

  return (
    <div className="sf-controls-bar" role="toolbar" aria-label="Simulation controls">
      {/* ── Primary row: always visible ── */}
      <div className="sf-controls-group sf-controls-group--playback">
        <span className="sf-brand">Simforge</span>

        <button
          onClick={isRunning ? pause : start}
          disabled={isCompleted}
          className={`sf-btn ${isRunning ? 'sf-btn--secondary' : 'sf-btn--primary'}`}
          aria-label={isRunning ? 'Pause simulation' : 'Start simulation'}
        >
          {isRunning ? '⏸ Pause' : '▶ Play'}
        </button>

        <button
          onClick={step}
          disabled={isRunning}
          className="sf-btn sf-btn--secondary"
          aria-label="Step simulation forward by one event"
          title="Process one event at a time (useful for debugging request flow step-by-step)"
        >
          ⏭ Step
        </button>

        <button
          onClick={reset}
          disabled={isIdle}
          className="sf-btn sf-btn--secondary"
          aria-label="Reset simulation"
        >
          ↺ Reset
        </button>

        <div className={`sf-status sf-status--${status}`} role="status" aria-live="assertive" aria-label={`Simulation status: ${status}`}>
          <span className="sf-status__dot" aria-hidden="true" />
          <span>{status}</span>
        </div>

        {latestSample && !metricsOpen && (
          <span className="sf-controls-mini-metric">
            {latestSample.throughputRps.toFixed(0)} rps · p50 {latestSample.latencyP50.toFixed(0)}ms
          </span>
        )}
      </div>

      {/* Spacer */}
      <div style={{ flex: 1, minWidth: 8 }} />

      {/* ── Actions group ── */}
      <div className="sf-controls-group sf-controls-group--actions">
        <button
          onClick={toggleMetrics}
          className={`sf-btn ${metricsOpen ? 'sf-btn--primary' : 'sf-btn--secondary'}`}
          title="Toggle metrics panel"
          aria-label={metricsOpen ? 'Hide metrics panel' : 'Show metrics panel'}
          aria-pressed={metricsOpen}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
          <span className="sf-controls-btn-label">Metrics</span>
        </button>

        <button onClick={saveDesign} className="sf-btn sf-btn--secondary" title="Save design (Cmd+S)" aria-label="Save design file">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
          </svg>
          <span className="sf-controls-btn-label">Save</span>
        </button>

        <button onClick={loadDesign} className="sf-btn sf-btn--secondary" title="Load design (Cmd+O)" aria-label="Load design file">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
          <span className="sf-controls-btn-label">Load</span>
        </button>

        <button onClick={() => void copyShareUrl()} className="sf-btn sf-btn--secondary" title="Copy share URL" aria-label="Copy shareable URL">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M10 13a5 5 0 0 0 7.07 0l2.83-2.83a5 5 0 0 0-7.07-7.07L11 4" />
            <path d="M14 11a5 5 0 0 0-7.07 0L4.1 13.83a5 5 0 1 0 7.07 7.07L13 19" />
          </svg>
          <span className="sf-controls-btn-label">Share</span>
        </button>

        <button onClick={() => void copyEmbedCode()} className="sf-btn sf-btn--secondary" title="Copy embed code" aria-label="Copy iframe embed code">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
          </svg>
          <span className="sf-controls-btn-label">Embed</span>
        </button>

        <ThemeToggle />
      </div>

      {/* ── More toggle for secondary controls ── */}
      <button
        onClick={() => setShowMore(!showMore)}
        className={`sf-btn sf-btn--secondary sf-controls-more-toggle`}
        aria-label={showMore ? 'Hide additional controls' : 'Show additional controls'}
        aria-expanded={showMore}
      >
        ⋯
      </button>

      {/* ── Secondary controls: chaos + config (always visible on large screens, toggled on small) ── */}
      <div className={`sf-controls-secondary ${showMore ? '' : 'sf-controls-secondary--closed'}`}>
        {/* Chaos group */}
        <div className="sf-controls-group sf-controls-group--chaos">
          <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span className="sf-label__text" style={{ margin: 0 }}>Chaos</span>
            <select
              value={selectedChaosPreset}
              onChange={(e) => setSelectedChaosPreset(e.target.value as ChaosPreset)}
              className="sf-input"
              style={{ width: 148 }}
              aria-label="Chaos preset"
            >
              <option value="region-failure">Region failure</option>
              <option value="database-failover">Database failover</option>
              <option value="gateway-brownout">Gateway brownout</option>
            </select>
          </label>

          <button
            onClick={() => applyChaosPreset(selectedChaosPreset, toSimTopology())}
            className="sf-btn sf-btn--secondary"
            aria-label="Apply chaos preset"
          >
            Apply Fault
          </button>

          <button
            onClick={clearAllChaosFaults}
            className="sf-btn sf-btn--secondary"
            disabled={activeChaosCount === 0}
            aria-label="Clear all chaos faults"
          >
            Clear Faults
          </button>

          {activeChaosCount > 0 && (
            <span style={{ fontSize: 11, color: 'var(--sf-warning)', fontWeight: 600 }}>
              {nodeFaultCount} fault{nodeFaultCount === 1 ? '' : 's'} · {partitionedEdgeCount} partition{partitionedEdgeCount === 1 ? '' : 's'} · {cascadeNodeCount} cascade
            </span>
          )}
        </div>

        <span className="sf-controls-divider" />

        {/* Config group */}
        <div className="sf-controls-group sf-controls-group--config">
          <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span className="sf-label__text" style={{ margin: 0 }}>Seed</span>
            <input
              type="number"
              value={config.seed}
              onChange={(e) => updateConfig({ seed: Number(e.target.value) })}
              className="sf-input"
              style={{ width: 64 }}
              disabled={isRunning}
            />
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span className="sf-label__text" style={{ margin: 0 }}>RPS</span>
            <input
              type="number"
              value={config.requestRateRps}
              onChange={(e) => updateConfig({ requestRateRps: Math.max(1, Number(e.target.value)) })}
              className="sf-input"
              style={{ width: 64 }}
              disabled={isRunning}
            />
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span className="sf-label__text" style={{ margin: 0 }}>Duration</span>
            <input
              type="number"
              value={config.maxTimeMs}
              onChange={(e) => updateConfig({ maxTimeMs: Math.max(100, Number(e.target.value)) })}
              className="sf-input"
              style={{ width: 80 }}
              disabled={isRunning}
            />
            <span style={{ fontSize: 11, color: 'var(--sf-text-muted)' }}>ms</span>
          </label>
        </div>

        <span className="sf-controls-divider" />

        {/* Presets group */}
        <div className="sf-controls-group" style={{ gap: 4 }}>
          <button
            onClick={importPresets}
            className="sf-btn sf-btn--secondary sf-btn--compact"
            aria-label="Import presets file"
          >
            Import Presets
          </button>
          <button
            onClick={exportPresets}
            className="sf-btn sf-btn--secondary sf-btn--compact"
            aria-label="Export custom presets file"
          >
            Export Presets
          </button>
        </div>

        {/* Completion info */}
        {completionInfo && (
          <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--sf-success)' }}>
            ✓ {completionInfo.eventsProcessed.toLocaleString()} events · {completionInfo.simulationTime.toFixed(0)}ms
          </span>
        )}

        {errorMessage && (
          <span
            style={{ fontSize: 11, color: 'var(--sf-error)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}
            title={errorMessage}
          >
            ✕ {errorMessage}
          </span>
        )}
      </div>

    </div>
  );
}
