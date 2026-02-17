# Simforge

An open-source system design simulator. Drag-and-drop cloud resources, connect them, and run discrete-event simulations to test architectural resilience before writing code.

> Think "wind tunnel for software architecture."

## Features

- **Visual Editor** - Drag-and-drop components onto an infinite canvas
- **Discrete-Event Simulation** - Realistic modeling of request flow, latency, and failures
- **Real-Time Metrics** - Live throughput, latency percentiles, and queue depth charts
- **Deterministic Replay** - Same seed produces identical results every time
- **Undo/Redo** - Full history support for design changes
- **Save/Load** - Export and import designs as `.simforge.json` files
- **Shareable URLs** - Copy a compressed URL hash with full topology + simulation config
- **Embeddable Widget** - Render shared architectures in a read-only iframe view
- **Chaos Engineering** - Inject node faults, edge partitions, and scenario presets to visualize failure cascades

## Quick Start

```bash
# Prerequisites: Node.js >= 20, pnpm >= 10
pnpm install
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Share & Embed

### Share URL flow

1. Build a design in the editor.
2. Click `Share` in the top controls.
3. Send the copied URL.

Shared links encode the document in the URL hash as `#sf=<compressed-payload>`.

### Embed widget flow

1. Build a design and click `Embed` in the top controls.
2. Paste the copied `<iframe ...>` snippet into your docs/site.
3. The widget loads in read-only mode with a `Powered by Simforge` watermark.

### Query Parameter Contract

- `embed=1` (or `embed=true`): enable read-only embed widget mode.
- `#sf=<payload>`: required share payload containing:
  - `version`
  - `topology.nodes[]` and `topology.edges[]`
  - `config` (`seed`, `maxTimeMs`, `maxEvents`, `requestRateRps`, `requestDistribution`)

### Copy/Paste Examples

Embed URL:

```text
https://your-hosted-simforge.example/?embed=1#sf=<compressed-document>
```

Iframe snippet:

```html
<iframe
  src="https://your-hosted-simforge.example/?embed=1#sf=<compressed-document>"
  width="100%"
  height="640"
  style="border:0;"
  loading="lazy"
  title="Simforge architecture widget"
></iframe>
```

## Architecture

Simforge is a monorepo with three packages:

| Package | Description |
|---|---|
| `@simforge/types` | Shared TypeScript type definitions |
| `@simforge/engine` | Pure TypeScript discrete-event simulation engine |
| `@simforge/ui` | React-based visual editor and simulation interface |

The simulation engine runs in a Web Worker to keep the UI responsive at 60fps.

## Development

```bash
pnpm install          # Install dependencies
pnpm dev              # Start dev server
pnpm test             # Run all tests
pnpm test:e2e         # Run Playwright e2e tests
pnpm lint             # Lint all packages
pnpm typecheck        # Type-check all packages
pnpm build            # Build all packages
```

## Tech Stack

- **Vite** - Build tool
- **React 19** + **React Flow 12** - Visual node editor
- **Zustand** - State management
- **Recharts** - Real-time metrics charts
- **Vitest** - Testing
- **Tailwind CSS 4** - Styling

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and guidelines.

## License

[MIT](LICENSE)
