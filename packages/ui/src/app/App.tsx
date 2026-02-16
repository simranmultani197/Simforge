import { Providers } from './providers';
import { ComponentPalette } from '../components/panels/ComponentPalette';
import { SimforgeCanvas } from '../components/canvas/SimforgeCanvas';
import { PropertiesPanel } from '../components/panels/PropertiesPanel';
import { MetricsPanel } from '../components/panels/MetricsPanel';
import { SimulationControls } from '../components/controls/SimulationControls';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

function AppContent() {
  useKeyboardShortcuts();

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
            overflowY: 'auto',
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

export default function App() {
  return (
    <ErrorBoundary fallbackTitle="Application error">
      <Providers>
        <AppContent />
      </Providers>
    </ErrorBoundary>
  );
}
