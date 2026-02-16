import { ReactFlowProvider } from '@xyflow/react';
import type { ReactNode } from 'react';

interface ProvidersProps {
  children: ReactNode;
}

/**
 * Top-level providers for the application.
 *
 * ReactFlowProvider must wrap any component that calls useReactFlow().
 * Zustand stores are module-level singletons and don't need providers.
 */
export function Providers({ children }: ProvidersProps) {
  return <ReactFlowProvider>{children}</ReactFlowProvider>;
}
