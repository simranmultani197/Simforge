import { Providers } from './providers';
import { ComponentPalette } from '../components/panels/ComponentPalette';
import { SimforgeCanvas } from '../components/canvas/SimforgeCanvas';
import { PropertiesPanel } from '../components/panels/PropertiesPanel';
import { MetricsPanel } from '../components/panels/MetricsPanel';
import { SimulationControls } from '../components/controls/SimulationControls';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { ToastProvider } from '../components/common/ToastProvider';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useAutoSave } from '../hooks/useAutoSave';
import { useShareableUrl } from '../hooks/useShareableUrl';

function EditorAppContent() {
  useShareableUrl();
  useKeyboardShortcuts();
  useAutoSave();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      {/* Simulation toolbar */}
      <ErrorBoundary fallbackTitle="Controls error">
        <SimulationControls />
      </ErrorBoundary>

      {/* Three-panel layout */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {/* Left sidebar — Component Palette */}
        <aside
          className="sf-sidebar"
          style={{
            width: 256,
            flexShrink: 0,
            borderRight: '1px solid var(--sf-border)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <div className="sf-sidebar__title">Components</div>
          <ErrorBoundary fallbackTitle="Palette error">
            <ComponentPalette />
          </ErrorBoundary>
        </aside>

        {/* Center — Canvas + Metrics */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <main style={{ flex: 1, position: 'relative', minHeight: 0 }}>
            <ErrorBoundary fallbackTitle="Canvas error">
              <SimforgeCanvas />
            </ErrorBoundary>
          </main>

          {/* Bottom metrics panel */}
          <ErrorBoundary fallbackTitle="Metrics error">
            <MetricsPanel />
          </ErrorBoundary>
        </div>

        {/* Right sidebar — Properties Panel */}
        <aside
          className="sf-sidebar"
          style={{
            width: 320,
            flexShrink: 0,
            borderLeft: '1px solid var(--sf-border)',
            overflowY: 'auto',
          }}
        >
          <div className="sf-sidebar__title">Properties</div>
          <ErrorBoundary fallbackTitle="Properties error">
            <PropertiesPanel />
          </ErrorBoundary>
        </aside>
      </div>
    </div>
  );
}

function EmbedAppContent() {
  useShareableUrl();

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      <ErrorBoundary fallbackTitle="Widget error">
        <SimforgeCanvas
          readOnly
          showControls={false}
          showMiniMap={false}
          emptyTitle="No Shared Design"
          emptyDescription="Add a share hash to the iframe URL to render a Simforge architecture."
        />
      </ErrorBoundary>
      <div className="sf-embed-watermark" aria-label="Powered by Simforge">
        Powered by Simforge
      </div>
    </div>
  );
}

function isEmbedMode(): boolean {
  if (typeof window === 'undefined') return false;
  const value = new URLSearchParams(window.location.search).get('embed');
  return value === '1' || value === 'true';
}

export default function App() {
  const embedMode = isEmbedMode();

  return (
    <ErrorBoundary fallbackTitle="Application error">
      <ToastProvider>
        <Providers>
          {embedMode ? <EmbedAppContent /> : <EditorAppContent />}
        </Providers>
      </ToastProvider>
    </ErrorBoundary>
  );
}
