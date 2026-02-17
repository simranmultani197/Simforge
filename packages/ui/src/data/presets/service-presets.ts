import type { ComponentPreset } from '@simforge/types';

export const servicePresets: ComponentPreset<'service'>[] = [
  {
    id: 'aws-lambda',
    name: 'AWS Lambda',
    kind: 'service',
    provider: 'aws',
    description: 'Event-driven serverless service with moderate startup latency.',
    config: {
      replicas: 50,
      latencyMs: { type: 'normal', mean: 35, stddev: 10 },
      failureRate: 0.002,
      maxConcurrency: 1000,
    },
    tags: ['serverless', 'event-driven'],
  },
  {
    id: 'aws-ecs-fargate',
    name: 'AWS ECS Fargate',
    kind: 'service',
    provider: 'aws',
    description: 'Containerized compute with steady latency and higher concurrency.',
    config: {
      replicas: 6,
      latencyMs: { type: 'normal', mean: 18, stddev: 4 },
      failureRate: 0.001,
      maxConcurrency: 2000,
    },
    tags: ['containers'],
  },
  {
    id: 'gcp-cloud-run',
    name: 'GCP Cloud Run',
    kind: 'service',
    provider: 'gcp',
    description: 'Scale-to-zero container service with variable warm-up latency.',
    config: {
      replicas: 20,
      latencyMs: { type: 'normal', mean: 24, stddev: 6 },
      failureRate: 0.0015,
      maxConcurrency: 1200,
    },
    tags: ['serverless', 'containers'],
  },
  {
    id: 'azure-functions',
    name: 'Azure Functions',
    kind: 'service',
    provider: 'azure',
    description: 'Function-as-a-service baseline with burst-friendly concurrency.',
    config: {
      replicas: 30,
      latencyMs: { type: 'normal', mean: 28, stddev: 8 },
      failureRate: 0.002,
      maxConcurrency: 1500,
    },
    tags: ['serverless'],
  },
];
