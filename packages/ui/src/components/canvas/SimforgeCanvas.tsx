import { useCallback } from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  type Connection,
  useReactFlow,
} from '@xyflow/react';

import { useTopologyStore } from '../../stores/topology-store';
import { nodeTypes } from './nodes';
import { edgeTypes } from './edges';
import type { SimforgeNodeType, SimforgeNode, SimforgeEdge } from '../../types/flow';

interface EmptyCanvasOverlayProps {
  title: string;
  description: string;
}

function EmptyCanvasOverlay({ title, description }: EmptyCanvasOverlayProps) {
  return (
    <div
      className="sf-empty-state"
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 5,
        background: 'transparent',
      }}
    >
      <svg
        width="72"
        height="72"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ opacity: 0.25, marginBottom: 16 }}
      >
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
      <div className="sf-empty-state__title">{title}</div>
      <div className="sf-empty-state__text">{description}</div>
    </div>
  );
}

interface SimforgeCanvasProps {
  readOnly?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  showControls?: boolean;
  showMiniMap?: boolean;
}

export function SimforgeCanvas({
  readOnly = false,
  emptyTitle = 'Design your system',
  emptyDescription = 'Drag components from the left panel onto the canvas, then connect them to build your architecture.',
  showControls = true,
  showMiniMap = true,
}: SimforgeCanvasProps = {}) {
  const { screenToFlowPosition } = useReactFlow();

  // Zustand selectors — subscribe to individual slices for performance
  const nodes = useTopologyStore((s) => s.nodes);
  const edges = useTopologyStore((s) => s.edges);
  const onNodesChange = useTopologyStore((s) => s.onNodesChange);
  const onEdgesChange = useTopologyStore((s) => s.onEdgesChange);
  const onConnect = useTopologyStore((s) => s.onConnect);
  const addNode = useTopologyStore((s) => s.addNode);
  const setSelectedNode = useTopologyStore((s) => s.setSelectedNode);
  const setSelectedEdge = useTopologyStore((s) => s.setSelectedEdge);

  // Drag-and-drop from palette
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const nodeType = event.dataTransfer.getData(
        'application/simforge-node',
      ) as SimforgeNodeType;
      if (!nodeType) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      addNode(nodeType, position);
    },
    [screenToFlowPosition, addNode],
  );

  // Connection validation
  const isValidConnection = useCallback(
    (connection: SimforgeEdge | Connection) => {
      // No self-connections
      if (connection.source === connection.target) return false;
      // No duplicate edges between same source/target
      const exists = edges.some(
        (e) => e.source === connection.source && e.target === connection.target,
      );
      return !exists;
    },
    [edges],
  );

  // Selection handlers
  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: SimforgeNode) => {
      setSelectedNode(node.id);
      setSelectedEdge(null);
    },
    [setSelectedNode, setSelectedEdge],
  );

  const onEdgeClick = useCallback(
    (_: React.MouseEvent, edge: SimforgeEdge) => {
      setSelectedEdge(edge.id);
      setSelectedNode(null);
    },
    [setSelectedEdge, setSelectedNode],
  );

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setSelectedEdge(null);
  }, [setSelectedNode, setSelectedEdge]);

  const isEmpty = nodes.length === 0;

  return (
    <div className="h-full w-full relative">
      {isEmpty && (
        <EmptyCanvasOverlay
          title={emptyTitle}
          description={emptyDescription}
        />
      )}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={readOnly ? undefined : onNodesChange}
        onEdgesChange={readOnly ? undefined : onEdgesChange}
        onConnect={readOnly ? undefined : onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={{ type: 'simforge', animated: false }}
        isValidConnection={readOnly ? undefined : isValidConnection}
        onDragOver={readOnly ? undefined : onDragOver}
        onDrop={readOnly ? undefined : onDrop}
        onNodeClick={readOnly ? undefined : onNodeClick}
        onEdgeClick={readOnly ? undefined : onEdgeClick}
        onPaneClick={readOnly ? undefined : onPaneClick}
        nodesDraggable={!readOnly}
        nodesConnectable={!readOnly}
        elementsSelectable={!readOnly}
        deleteKeyCode={readOnly ? undefined : ['Backspace', 'Delete']}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="var(--sf-text-muted)" />
        {showControls && <Controls />}
        {showMiniMap && (
          <MiniMap
            nodeStrokeWidth={3}
            className="!bg-[var(--sf-bg-secondary)]"
          />
        )}
      </ReactFlow>
    </div>
  );
}
