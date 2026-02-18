import type { ComponentPreset } from '@simforge/types';

export const loadBalancerPresets: ComponentPreset<'load-balancer'>[] = [
  {
    id: 'aws-alb',
    name: 'AWS ALB',
    kind: 'load-balancer',
    provider: 'aws',
    description: 'Application Load Balancer with L7 routing and path-based rules.',
    config: {
      algorithm: 'round-robin',
      maxConnections: 100000,
    },
    tags: ['layer-7', 'http'],
  },
  {
    id: 'aws-nlb',
    name: 'AWS NLB',
    kind: 'load-balancer',
    provider: 'aws',
    description: 'Network Load Balancer for ultra-low latency TCP/UDP traffic.',
    config: {
      algorithm: 'least-connections',
      maxConnections: 1000000,
    },
    tags: ['layer-4', 'tcp'],
  },
  {
    id: 'gcp-cloud-lb',
    name: 'GCP Cloud Load Balancing',
    kind: 'load-balancer',
    provider: 'gcp',
    description: 'Global software-defined load balancing with autoscaling.',
    config: {
      algorithm: 'round-robin',
      maxConnections: 500000,
    },
    tags: ['global', 'autoscaling'],
  },
  {
    id: 'azure-lb',
    name: 'Azure Load Balancer',
    kind: 'load-balancer',
    provider: 'azure',
    description: 'High-performance L4 load balancer with zone redundancy.',
    config: {
      algorithm: 'least-connections',
      maxConnections: 300000,
    },
    tags: ['layer-4', 'zone-redundant'],
  },
];
