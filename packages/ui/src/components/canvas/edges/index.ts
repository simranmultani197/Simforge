import type { EdgeTypes } from '@xyflow/react';
import { SimforgeEdge } from './SimforgeEdge';

/**
 * CRITICAL: Module-level constant — NOT inside a component.
 */
export const edgeTypes: EdgeTypes = {
  simforge: SimforgeEdge,
};
