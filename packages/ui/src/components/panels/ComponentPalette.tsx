import type { SimforgeNodeType } from '../../types/flow';

interface PaletteItem {
  type: SimforgeNodeType;
  label: string;
  description: string;
  colorClass: string;
  icon: React.ReactNode;
}

const ServiceIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const LoadBalancerIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="2" x2="12" y2="6" />
    <line x1="12" y1="18" x2="12" y2="22" />
    <circle cx="12" cy="12" r="4" />
    <line x1="4" y1="12" x2="8" y2="12" />
    <line x1="16" y1="12" x2="20" y2="12" />
    <line x1="5.6" y1="5.6" x2="8.5" y2="8.5" />
    <line x1="15.5" y1="15.5" x2="18.4" y2="18.4" />
    <line x1="5.6" y1="18.4" x2="8.5" y2="15.5" />
    <line x1="15.5" y1="8.5" x2="18.4" y2="5.6" />
  </svg>
);

const QueueIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="4" rx="1" />
    <rect x="3" y="10" width="18" height="4" rx="1" />
    <rect x="3" y="17" width="18" height="4" rx="1" />
  </svg>
);

const PALETTE_ITEMS: PaletteItem[] = [
  {
    type: 'service',
    label: 'Service',
    description: 'Processes requests with configurable latency',
    colorClass: 'service',
    icon: <ServiceIcon />,
  },
  {
    type: 'load-balancer',
    label: 'Load Balancer',
    description: 'Routes traffic across targets',
    colorClass: 'lb',
    icon: <LoadBalancerIcon />,
  },
  {
    type: 'queue',
    label: 'Queue',
    description: 'Buffers and processes messages',
    colorClass: 'queue',
    icon: <QueueIcon />,
  },
];

const ICON_STYLES: Record<string, React.CSSProperties> = {
  service: { background: 'var(--sf-node-service-soft)', color: 'var(--sf-node-service)' },
  lb: { background: 'var(--sf-node-lb-soft)', color: 'var(--sf-node-lb)' },
  queue: { background: 'var(--sf-node-queue-soft)', color: 'var(--sf-node-queue)' },
};

export function ComponentPalette() {
  const onDragStart = (event: React.DragEvent, nodeType: SimforgeNodeType) => {
    event.dataTransfer.setData('application/simforge-node', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="space-y-2">
      {PALETTE_ITEMS.map((item) => (
        <div
          key={item.type}
          className="sf-palette-item"
          draggable
          onDragStart={(e) => onDragStart(e, item.type)}
        >
          <div
            className="sf-palette-item__icon"
            style={ICON_STYLES[item.colorClass]}
          >
            {item.icon}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-[var(--sf-text-primary)]">
              {item.label}
            </div>
            <div className="text-[11px] text-[var(--sf-text-secondary)] leading-snug">
              {item.description}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
