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

## Quick Start

```bash
# Prerequisites: Node.js >= 20, pnpm >= 10
pnpm install
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

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
