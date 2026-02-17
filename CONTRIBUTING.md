# Contributing to Simforge

Thank you for your interest in contributing to Simforge! This guide will help you get started.

## Development Setup

### Prerequisites

- Node.js >= 20
- pnpm >= 10

### Getting Started

```bash
git clone https://github.com/your-org/simforge.git
cd simforge
pnpm install
pnpm dev
```

### Project Structure

```
packages/
  types/    # @simforge/types - shared type definitions (zero deps)
  engine/   # @simforge/engine - simulation engine (pure TypeScript)
  ui/       # @simforge/ui - React visual editor
```

### Available Scripts

```bash
pnpm dev          # Start development server
pnpm test         # Run all tests
pnpm test:e2e     # Run Playwright end-to-end tests
pnpm test:watch   # Run tests in watch mode
pnpm lint         # Lint all packages
pnpm typecheck    # Type-check all packages
pnpm build        # Build all packages
pnpm format       # Format all files with Prettier
```

## Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(engine): add circuit breaker behavior
fix(ui): correct node position after drag
docs: update README with new setup steps
test(engine): add deterministic replay tests
refactor(types): simplify Distribution union
chore(deps): update React to 19.1
```

Valid scopes: `types`, `engine`, `ui`, `ci`, `docs`, `deps`

## Pull Requests

1. Fork the repository
2. Create a feature branch from `main`
3. Make your changes
4. Add tests for new functionality
5. Run `pnpm test && pnpm test:e2e && pnpm lint && pnpm typecheck` to verify
6. Submit a pull request

### PR Checklist

- [ ] Tests added/updated
- [ ] E2E tests added/updated for user-visible behavior changes
- [ ] Types updated if needed
- [ ] No lint or typecheck errors
- [ ] Commit messages follow conventional commits

## Code Style

- TypeScript strict mode (`noUncheckedIndexedAccess`, no `any`)
- Prettier for formatting (runs automatically via lint-staged)
- ESLint for linting

## Adding a New Component Type

To add a new simulation component (e.g., Database):

1. Add the config type to `packages/types/src/components.ts`
2. Create a behavior handler in `packages/engine/src/behaviors/`
3. Add tests in `packages/engine/__tests__/behaviors/`
4. Create the React Flow node component in `packages/ui/src/components/canvas/nodes/`
5. Register the component in the palette

## License

By contributing to Simforge, you agree that your contributions will be licensed under the MIT License.
