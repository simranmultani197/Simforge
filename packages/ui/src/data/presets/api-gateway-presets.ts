import type { ComponentPreset } from '@simforge/types';

export const apiGatewayPresets: ComponentPreset<'api-gateway'>[] = [
  {
    id: 'aws-api-gateway',
    name: 'AWS API Gateway',
    kind: 'api-gateway',
    provider: 'aws',
    description: 'Managed API front door with throttling and auth integration.',
    config: {
      rateLimitRps: 10000,
      burstSize: 5000,
      authLatencyMs: { type: 'constant', value: 4 },
      routes: 25,
      failureRate: 0.001,
      maxConcurrentRequests: 10000,
    },
    tags: ['managed', 'throttling'],
  },
  {
    id: 'gcp-cloud-endpoints',
    name: 'GCP Cloud Endpoints',
    kind: 'api-gateway',
    provider: 'gcp',
    description: 'API management with ESPv2 proxy and quota controls.',
    config: {
      rateLimitRps: 8000,
      burstSize: 3000,
      authLatencyMs: { type: 'constant', value: 3 },
      routes: 20,
      failureRate: 0.001,
      maxConcurrentRequests: 9000,
    },
    tags: ['managed', 'quota'],
  },
  {
    id: 'azure-api-management',
    name: 'Azure API Management',
    kind: 'api-gateway',
    provider: 'azure',
    description: 'Policy-driven API gateway with enterprise governance.',
    config: {
      rateLimitRps: 9000,
      burstSize: 4000,
      authLatencyMs: { type: 'constant', value: 4 },
      routes: 30,
      failureRate: 0.001,
      maxConcurrentRequests: 9500,
    },
    tags: ['managed', 'policy'],
  },
];
