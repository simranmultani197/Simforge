/**
 * Statistical distribution types for modeling latency, processing time, etc.
 */
export type Distribution =
  | { type: 'constant'; value: number }
  | { type: 'uniform'; min: number; max: number }
  | { type: 'exponential'; rate: number }
  | { type: 'normal'; mean: number; stddev: number };

/**
 * Component configuration — discriminated union.
 * Each component type has a unique `kind` tag for exhaustive switch handling.
 */
export type ComponentConfig =
  | ServiceConfig
  | LoadBalancerConfig
  | QueueConfig
  | DatabaseConfig
  | CacheConfig
  | ApiGatewayConfig;

export interface ServiceConfig {
  kind: 'service';
  replicas: number;
  latencyMs: Distribution;
  failureRate: number;
  maxConcurrency: number;
}

export interface LoadBalancerConfig {
  kind: 'load-balancer';
  algorithm: 'round-robin' | 'least-connections' | 'random';
  maxConnections: number;
}

export interface QueueConfig {
  kind: 'queue';
  maxDepth: number;
  processingTimeMs: Distribution;
  deadLetterEnabled: boolean;
}

export interface DatabaseConfig {
  kind: 'database';
  engine: 'postgres' | 'mysql' | 'dynamodb' | 'redis';
  maxConnections: number;
  queryLatencyMs: Distribution;
  writeLatencyMs: Distribution;
  failureRate: number;
  connectionPoolSize: number;
  replicationFactor: number;
}

export interface CacheConfig {
  kind: 'cache';
  evictionPolicy: 'lru' | 'lfu' | 'ttl';
  maxSizeMb: number;
  hitRate: number;
  hitLatencyMs: Distribution;
  missLatencyMs: Distribution;
  ttlMs: number;
  maxEntries: number;
}

export interface ApiGatewayConfig {
  kind: 'api-gateway';
  rateLimitRps: number;
  burstSize: number;
  authLatencyMs: Distribution;
  routes: number;
  failureRate: number;
  maxConcurrentRequests: number;
}
