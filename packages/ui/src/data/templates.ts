import type { SimTopology, SimulationConfig } from '@simforge/types';

export interface SimforgeTemplate {
  id: string;
  name: string;
  description: string;
  topology: SimTopology;
  config?: Partial<SimulationConfig>;
}

const DEFAULT_EDGE_CONFIG = {
  latencyMs: { type: 'constant', value: 2 } as const,
  bandwidthMbps: 1000,
  failureRate: 0,
};

export const builtInTemplates: SimforgeTemplate[] = [
  {
    id: 'template-lb-services',
    name: 'Load-Balanced Services',
    description: 'Edge LB distributing traffic to three services.',
    topology: {
      nodes: [
        {
          id: 'lb-edge',
          config: {
            kind: 'load-balancer',
            algorithm: 'round-robin',
            maxConnections: 10000,
          },
          position: { x: 320, y: 80 },
          metadata: { label: 'Edge LB' },
        },
        {
          id: 'svc-auth',
          config: {
            kind: 'service',
            replicas: 2,
            latencyMs: { type: 'constant', value: 25 },
            failureRate: 0.005,
            maxConcurrency: 200,
          },
          position: { x: 80, y: 260 },
          metadata: { label: 'Auth Service' },
        },
        {
          id: 'svc-api',
          config: {
            kind: 'service',
            replicas: 2,
            latencyMs: { type: 'constant', value: 30 },
            failureRate: 0.005,
            maxConcurrency: 200,
          },
          position: { x: 320, y: 260 },
          metadata: { label: 'API Service' },
        },
        {
          id: 'svc-billing',
          config: {
            kind: 'service',
            replicas: 2,
            latencyMs: { type: 'constant', value: 35 },
            failureRate: 0.005,
            maxConcurrency: 200,
          },
          position: { x: 560, y: 260 },
          metadata: { label: 'Billing Service' },
        },
      ],
      edges: [
        { id: 'edge-lb-auth', source: 'lb-edge', target: 'svc-auth', config: DEFAULT_EDGE_CONFIG },
        { id: 'edge-lb-api', source: 'lb-edge', target: 'svc-api', config: DEFAULT_EDGE_CONFIG },
        { id: 'edge-lb-billing', source: 'lb-edge', target: 'svc-billing', config: DEFAULT_EDGE_CONFIG },
      ],
    },
    config: {
      seed: 42,
      maxTimeMs: 10000,
      requestRateRps: 600,
      requestDistribution: 'constant',
    },
  },
  {
    id: 'template-event-driven',
    name: 'Event-Driven Pipeline',
    description: 'Gateway ingress through queue and async worker into database.',
    topology: {
      nodes: [
        {
          id: 'api-gw',
          config: {
            kind: 'api-gateway',
            rateLimitRps: 2000,
            burstSize: 120,
            authLatencyMs: { type: 'constant', value: 4 },
            routes: 12,
            failureRate: 0.002,
            maxConcurrentRequests: 1500,
          },
          position: { x: 120, y: 140 },
          metadata: { label: 'Public API Gateway' },
        },
        {
          id: 'queue-jobs',
          config: {
            kind: 'queue',
            maxDepth: 5000,
            processingTimeMs: { type: 'constant', value: 8 },
            deadLetterEnabled: true,
          },
          position: { x: 360, y: 140 },
          metadata: { label: 'Jobs Queue' },
        },
        {
          id: 'svc-worker',
          config: {
            kind: 'service',
            replicas: 4,
            latencyMs: { type: 'constant', value: 45 },
            failureRate: 0.01,
            maxConcurrency: 180,
          },
          position: { x: 620, y: 140 },
          metadata: { label: 'Worker Service' },
        },
        {
          id: 'db-events',
          config: {
            kind: 'database',
            engine: 'postgres',
            maxConnections: 240,
            queryLatencyMs: { type: 'normal', mean: 6, stddev: 2 },
            writeLatencyMs: { type: 'normal', mean: 12, stddev: 3 },
            failureRate: 0.001,
            connectionPoolSize: 200,
            replicationFactor: 2,
          },
          position: { x: 860, y: 140 },
          metadata: { label: 'Events DB' },
        },
      ],
      edges: [
        { id: 'edge-gw-queue', source: 'api-gw', target: 'queue-jobs', config: DEFAULT_EDGE_CONFIG },
        { id: 'edge-queue-worker', source: 'queue-jobs', target: 'svc-worker', config: DEFAULT_EDGE_CONFIG },
        { id: 'edge-worker-db', source: 'svc-worker', target: 'db-events', config: DEFAULT_EDGE_CONFIG },
      ],
    },
    config: {
      seed: 42,
      maxTimeMs: 12000,
      requestRateRps: 350,
      requestDistribution: 'poisson',
    },
  },
  {
    id: 'template-cached-read-api',
    name: 'Cached Read API',
    description: 'API + service with cache fronting a backing database.',
    topology: {
      nodes: [
        {
          id: 'gw-read',
          config: {
            kind: 'api-gateway',
            rateLimitRps: 2500,
            burstSize: 150,
            authLatencyMs: { type: 'constant', value: 2 },
            routes: 20,
            failureRate: 0.001,
            maxConcurrentRequests: 2200,
          },
          position: { x: 80, y: 300 },
          metadata: { label: 'Read API Gateway' },
        },
        {
          id: 'svc-read',
          config: {
            kind: 'service',
            replicas: 3,
            latencyMs: { type: 'constant', value: 18 },
            failureRate: 0.004,
            maxConcurrency: 240,
          },
          position: { x: 320, y: 300 },
          metadata: { label: 'Read Service' },
        },
        {
          id: 'cache-hot',
          config: {
            kind: 'cache',
            evictionPolicy: 'lru',
            maxSizeMb: 512,
            hitRate: 0.9,
            hitLatencyMs: { type: 'constant', value: 1 },
            missLatencyMs: { type: 'constant', value: 3 },
            ttlMs: 120000,
            maxEntries: 250000,
          },
          position: { x: 560, y: 300 },
          metadata: { label: 'Hot Cache' },
        },
        {
          id: 'db-core',
          config: {
            kind: 'database',
            engine: 'postgres',
            maxConnections: 200,
            queryLatencyMs: { type: 'normal', mean: 5, stddev: 2 },
            writeLatencyMs: { type: 'normal', mean: 10, stddev: 3 },
            failureRate: 0.001,
            connectionPoolSize: 160,
            replicationFactor: 2,
          },
          position: { x: 800, y: 300 },
          metadata: { label: 'Core DB' },
        },
      ],
      edges: [
        { id: 'edge-gw-svc', source: 'gw-read', target: 'svc-read', config: DEFAULT_EDGE_CONFIG },
        { id: 'edge-svc-cache', source: 'svc-read', target: 'cache-hot', config: DEFAULT_EDGE_CONFIG },
        { id: 'edge-cache-db', source: 'cache-hot', target: 'db-core', config: DEFAULT_EDGE_CONFIG },
      ],
    },
    config: {
      seed: 42,
      maxTimeMs: 10000,
      requestRateRps: 900,
      requestDistribution: 'constant',
    },
  },
];

export function getTemplateById(id: string): SimforgeTemplate | undefined {
  return builtInTemplates.find((template) => template.id === id);
}
