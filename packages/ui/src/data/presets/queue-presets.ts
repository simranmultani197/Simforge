import type { ComponentPreset } from '@simforge/types';

export const queuePresets: ComponentPreset<'queue'>[] = [
  {
    id: 'aws-sqs',
    name: 'AWS SQS',
    kind: 'queue',
    provider: 'aws',
    description: 'Fully managed message queuing with standard and FIFO options.',
    config: {
      maxDepth: 120000,
      processingTimeMs: { type: 'normal', mean: 8, stddev: 3 },
      deadLetterEnabled: true,
    },
    tags: ['messaging', 'decoupling'],
  },
  {
    id: 'aws-sns',
    name: 'AWS SNS (Fan-out)',
    kind: 'queue',
    provider: 'aws',
    description: 'Pub/sub messaging with fan-out to multiple subscribers.',
    config: {
      maxDepth: 10000000,
      processingTimeMs: { type: 'constant', value: 2 },
      deadLetterEnabled: true,
    },
    tags: ['pub-sub', 'fan-out'],
  },
  {
    id: 'gcp-pub-sub',
    name: 'GCP Pub/Sub',
    kind: 'queue',
    provider: 'gcp',
    description: 'Global real-time messaging with at-least-once delivery.',
    config: {
      maxDepth: 10000000,
      processingTimeMs: { type: 'normal', mean: 10, stddev: 4 },
      deadLetterEnabled: true,
    },
    tags: ['pub-sub', 'global'],
  },
  {
    id: 'azure-service-bus',
    name: 'Azure Service Bus',
    kind: 'queue',
    provider: 'azure',
    description: 'Enterprise message broker with transactions and sessions.',
    config: {
      maxDepth: 80000,
      processingTimeMs: { type: 'normal', mean: 12, stddev: 4 },
      deadLetterEnabled: true,
    },
    tags: ['enterprise', 'messaging'],
  },
];
