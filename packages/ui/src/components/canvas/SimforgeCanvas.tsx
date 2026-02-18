import { useCallback, useEffect, useState } from 'react';
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
import { useChaosStore } from '../../stores/chaos-store';
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
        pointerEvents: 'none',
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

interface NodeContextMenuState {
  nodeId: string;
  x: number;
  y: number;
}

interface EdgeContextMenuState {
  edgeId: string;
  x: number;
  y: number;
}

function isSimforgeNodeType(value: string): value is SimforgeNodeType {
  return (
    value === 'client' ||
    value === 'service' ||
    value === 'load-balancer' ||
    value === 'queue' ||
    value === 'database' ||
    value === 'cache' ||
    value === 'api-gateway'
  );
}

export function SimforgeCanvas({
  readOnly = false,
  emptyTitle = 'Design your system',
  emptyDescription = 'Drag components from the left panel onto the canvas, then connect them to build your architecture.',
  showControls = true,
  showMiniMap = true,
}: SimforgeCanvasProps = {}) {
  const { screenToFlowPosition } = useReactFlow();
  const [nodeContextMenu, setNodeContextMenu] = useState<NodeContextMenuState | null>(null);
  const [edgeContextMenu, setEdgeContextMenu] = useState<EdgeContextMenuState | null>(null);

  // Zustand selectors — subscribe to individual slices for performance
  const nodes = useTopologyStore((s) => s.nodes);
  const edges = useTopologyStore((s) => s.edges);
  const onNodesChange = useTopologyStore((s) => s.onNodesChange);
  const onEdgesChange = useTopologyStore((s) => s.onEdgesChange);
  const onConnect = useTopologyStore((s) => s.onConnect);
  const addNode = useTopologyStore((s) => s.addNode);
  const toSimTopology = useTopologyStore((s) => s.toSimTopology);
  const setSelectedNode = useTopologyStore((s) => s.setSelectedNode);
  const setSelectedEdge = useTopologyStore((s) => s.setSelectedEdge);
  const setNodeFault = useChaosStore((s) => s.setNodeFault);
  const clearNodeFault = useChaosStore((s) => s.clearNodeFault);
  const togglePartitionEdge = useChaosStore((s) => s.togglePartitionEdge);
  const nodeFaults = useChaosStore((s) => s.nodeFaults);
  const partitionedEdgeIds = useChaosStore((s) => s.partitionedEdgeIds);

  const closeContextMenus = useCallback(() => {
    setNodeContextMenu(null);
    setEdgeContextMenu(null);
  }, []);

  useEffect(() => {
    if (!nodeContextMenu && !edgeContextMenu) return;

    const onWindowClick = () => closeContextMenus();
    const onWindowEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeContextMenus();
      }
    };

    window.addEventListener('click', onWindowClick);
    window.addEventListener('keydown', onWindowEscape);
    return () => {
      window.removeEventListener('click', onWindowClick);
      window.removeEventListener('keydown', onWindowEscape);
    };
  }, [nodeContextMenu, edgeContextMenu, closeContextMenus]);

  // Drag-and-drop from palette
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const rawNodeType =
        event.dataTransfer.getData('application/reactflow') ||
        event.dataTransfer.getData('application/simforge-node') ||
        event.dataTransfer.getData('text/plain');
      if (!isSimforgeNodeType(rawNodeType)) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      addNode(rawNodeType, position);
    },
    [screenToFlowPosition, addNode],
  );

  // Connection validation — semantic rules based on component types
  const isValidConnection = useCallback(
    (connection: SimforgeEdge | Connection) => {
      // No self-connections
      if (connection.source === connection.target) return false;
      // No duplicate edges between same source/target
      const exists = edges.some(
        (e) => e.source === connection.source && e.target === connection.target,
      );
      if (exists) return false;

      // Semantic connection rules
      const sourceNode = nodes.find((n) => n.id === connection.source);
      const targetNode = nodes.find((n) => n.id === connection.target);
      if (!sourceNode || !targetNode) return false;

      const src = sourceNode.type as SimforgeNodeType;
      const tgt = targetNode.type as SimforgeNodeType;

      // Nothing can connect INTO a client — clients are entry-only
      if (tgt === 'client') return false;

      // Database is typically terminal — only allow DB → Service or DB → Cache
      if (src === 'database' && tgt !== 'service' && tgt !== 'cache') return false;

      // Cache can only forward misses to database or service
      if (src === 'cache' && tgt !== 'database' && tgt !== 'service') return false;

      // Queue should connect to exactly one consumer (service, database, or cache)
      if (src === 'queue') {
        if (tgt !== 'service' && tgt !== 'database' && tgt !== 'cache') return false;
        // Queue can only have one outgoing edge
        const queueOutEdges = edges.filter((e) => e.source === sourceNode.id);
        if (queueOutEdges.length >= 1) return false;
      }

      // Load balancer should only distribute to services or queues
      if (src === 'load-balancer') {
        if (tgt !== 'service' && tgt !== 'queue') return false;
      }

      // Client should connect to api-gateway, load-balancer, or service (entry points)
      if (src === 'client') {
        if (tgt !== 'api-gateway' && tgt !== 'load-balancer' && tgt !== 'service') return false;
      }

      // API Gateway should connect to service, load-balancer, or queue
      if (src === 'api-gateway') {
        if (tgt === 'api-gateway') return false;
      }

      return true;
    },
    [edges, nodes],
  );

  // Selection handlers
  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: SimforgeNode) => {
      closeContextMenus();
      setSelectedNode(node.id);
      setSelectedEdge(null);
    },
    [closeContextMenus, setSelectedNode, setSelectedEdge],
  );

  const onEdgeClick = useCallback(
    (_: React.MouseEvent, edge: SimforgeEdge) => {
      closeContextMenus();
      setSelectedEdge(edge.id);
      setSelectedNode(null);
    },
    [closeContextMenus, setSelectedEdge, setSelectedNode],
  );

  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: SimforgeNode) => {
      if (readOnly) return;
      event.preventDefault();
      event.stopPropagation();

      setSelectedNode(node.id);
      setSelectedEdge(null);
      setEdgeContextMenu(null);
      setNodeContextMenu({
        nodeId: node.id,
        x: event.clientX,
        y: event.clientY,
      });
    },
    [readOnly, setSelectedNode, setSelectedEdge],
  );

  const onEdgeContextMenu = useCallback(
    (event: React.MouseEvent, edge: SimforgeEdge) => {
      if (readOnly) return;
      event.preventDefault();
      event.stopPropagation();

      setSelectedEdge(edge.id);
      setSelectedNode(null);
      setNodeContextMenu(null);
      setEdgeContextMenu({
        edgeId: edge.id,
        x: event.clientX,
        y: event.clientY,
      });
    },
    [readOnly, setSelectedEdge, setSelectedNode],
  );

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setSelectedEdge(null);
    closeContextMenus();
  }, [setSelectedNode, setSelectedEdge, closeContextMenus]);

  const isEmpty = nodes.length === 0;
  const currentNodeFault = nodeContextMenu
    ? nodeFaults[nodeContextMenu.nodeId]
    : undefined;
  const isEdgePartitioned = edgeContextMenu
    ? partitionedEdgeIds.includes(edgeContextMenu.edgeId)
    : false;

  return (
    <div
      className="h-full w-full relative"
      onDragOver={readOnly ? undefined : onDragOver}
    >
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
        onNodeClick={readOnly ? undefined : onNodeClick}
        onEdgeClick={readOnly ? undefined : onEdgeClick}
        onNodeContextMenu={readOnly ? undefined : onNodeContextMenu}
        onEdgeContextMenu={readOnly ? undefined : onEdgeContextMenu}
        onPaneClick={readOnly ? undefined : onPaneClick}
        onDragOver={readOnly ? undefined : onDragOver}
        onDrop={readOnly ? undefined : onDrop}
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

      {!readOnly && nodeContextMenu && (
        <div
          className="sf-context-menu"
          style={{ left: nodeContextMenu.x, top: nodeContextMenu.y }}
          role="menu"
          aria-label="Node chaos fault menu"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            className={`sf-context-menu__item ${currentNodeFault?.kill ? 'active' : ''}`}
            onClick={() =>
              setNodeFault(
                nodeContextMenu.nodeId,
                { kill: !currentNodeFault?.kill },
                toSimTopology(),
              )
            }
          >
            {currentNodeFault?.kill ? 'Disable kill fault' : 'Kill node'}
          </button>
          <button
            className={`sf-context-menu__item ${currentNodeFault?.latencySpikeFactor ? 'active' : ''}`}
            onClick={() =>
              setNodeFault(
                nodeContextMenu.nodeId,
                {
                  latencySpikeFactor: currentNodeFault?.latencySpikeFactor
                    ? undefined
                    : 8,
                },
                toSimTopology(),
              )
            }
          >
            {currentNodeFault?.latencySpikeFactor ? 'Disable latency spike' : 'Spike latency x8'}
          </button>
          <button
            className={`sf-context-menu__item ${currentNodeFault?.dropPackets ? 'active' : ''}`}
            onClick={() =>
              setNodeFault(
                nodeContextMenu.nodeId,
                { dropPackets: !currentNodeFault?.dropPackets },
                toSimTopology(),
              )
            }
          >
            {currentNodeFault?.dropPackets ? 'Disable packet drop' : 'Drop packets'}
          </button>
          <button
            className="sf-context-menu__item"
            onClick={() => clearNodeFault(nodeContextMenu.nodeId, toSimTopology())}
          >
            Clear node faults
          </button>
        </div>
      )}

      {!readOnly && edgeContextMenu && (
        <div
          className="sf-context-menu"
          style={{ left: edgeContextMenu.x, top: edgeContextMenu.y }}
          role="menu"
          aria-label="Edge partition menu"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            className={`sf-context-menu__item ${isEdgePartitioned ? 'active' : ''}`}
            onClick={() => togglePartitionEdge(edgeContextMenu.edgeId)}
          >
            {isEdgePartitioned ? 'Heal partition' : 'Partition edge'}
          </button>
        </div>
      )}
    </div>
  );
}
