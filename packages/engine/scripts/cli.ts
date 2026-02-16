#!/usr/bin/env npx tsx
/**
 * Simforge CLI — Run a simulation from a JSON scenario file.
 *
 * Usage:
 *   npx tsx packages/engine/scripts/cli.ts scenarios/basic.json [--seed 42]
 *
 * The scenario JSON must contain:
 *   { topology: SimTopology, config: SimulationConfig }
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import type { SimTopology, SimulationConfig, SimulationMetrics } from '@simforge/types';
import { Simulator } from '../src/simulator/simulator';

// ---------------------------------------------------------------------------
// Argument parsing
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
let scenarioPath: string | undefined;
let seedOverride: number | undefined;

for (let i = 0; i < args.length; i++) {
  const arg = args[i]!;
  if (arg === '--seed' && args[i + 1]) {
    seedOverride = parseInt(args[i + 1]!, 10);
    i++; // skip next arg
  } else if (!arg.startsWith('--')) {
    scenarioPath = arg;
  }
}

if (!scenarioPath) {
  console.error('Usage: npx tsx scripts/cli.ts <scenario.json> [--seed N]');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Load scenario
// ---------------------------------------------------------------------------

const resolvedPath = path.resolve(process.cwd(), scenarioPath);
if (!fs.existsSync(resolvedPath)) {
  console.error(`File not found: ${resolvedPath}`);
  process.exit(1);
}

const raw = JSON.parse(fs.readFileSync(resolvedPath, 'utf-8')) as {
  topology: SimTopology;
  config: SimulationConfig;
};

const topology = raw.topology;
const config: SimulationConfig = {
  ...raw.config,
  ...(seedOverride !== undefined ? { seed: seedOverride } : {}),
};

// ---------------------------------------------------------------------------
// Run simulation
// ---------------------------------------------------------------------------

console.log('╔══════════════════════════════════════════════════════════╗');
console.log('║              SIMFORGE — Discrete-Event Simulator        ║');
console.log('╚══════════════════════════════════════════════════════════╝');
console.log();
console.log(`Scenario : ${path.basename(scenarioPath)}`);
console.log(`Nodes    : ${topology.nodes.length}`);
console.log(`Edges    : ${topology.edges.length}`);
console.log(`Seed     : ${config.seed}`);
console.log(`Duration : ${config.maxTimeMs}ms`);
console.log(`RPS      : ${config.requestRateRps}`);
console.log(`Max Events: ${config.maxEvents}`);
console.log();

const startReal = performance.now();
const sim = new Simulator({ topology, config });
const metrics = sim.run();
const elapsedReal = performance.now() - startReal;

printMetrics('Run 1', metrics);

// ---------------------------------------------------------------------------
// Deterministic replay check
// ---------------------------------------------------------------------------

console.log('─── Deterministic Replay Check ───────────────────────────');
console.log();

const sim2 = new Simulator({ topology, config });
const metrics2 = sim2.run();

printMetrics('Run 2', metrics2);

const replayOk = metricsEqual(metrics, metrics2);
if (replayOk) {
  console.log('✅ Deterministic replay PASSED — both runs produced identical metrics.');
} else {
  console.error('❌ Deterministic replay FAILED — metrics differ between runs!');
  process.exit(1);
}

console.log();
console.log(`Wall-clock time: ${elapsedReal.toFixed(1)}ms (Run 1)`);
console.log();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function printMetrics(label: string, m: SimulationMetrics): void {
  console.log(`─── ${label} ${'─'.repeat(Math.max(0, 53 - label.length))}`);
  console.log();
  console.log(`  Total Requests     : ${m.totalRequests}`);
  console.log(`  Completed          : ${m.completedRequests}`);
  console.log(`  Dropped            : ${m.droppedRequests}`);
  console.log(`  Success Rate       : ${((m.completedRequests / m.totalRequests) * 100).toFixed(1)}%`);
  console.log(`  Avg Latency        : ${m.avgLatencyMs.toFixed(2)}ms`);
  console.log(`  P50 Latency        : ${m.p50LatencyMs.toFixed(2)}ms`);
  console.log(`  P95 Latency        : ${m.p95LatencyMs.toFixed(2)}ms`);
  console.log(`  P99 Latency        : ${m.p99LatencyMs.toFixed(2)}ms`);
  console.log(`  Max Throughput     : ${m.maxThroughputRps.toFixed(0)} rps`);
  console.log(`  Sim Duration       : ${m.simulationDurationMs.toFixed(0)}ms`);
  console.log(`  Events Processed   : ${m.eventsProcessed}`);
  console.log();
}

function metricsEqual(a: SimulationMetrics, b: SimulationMetrics): boolean {
  return (
    a.totalRequests === b.totalRequests &&
    a.completedRequests === b.completedRequests &&
    a.droppedRequests === b.droppedRequests &&
    a.avgLatencyMs === b.avgLatencyMs &&
    a.p50LatencyMs === b.p50LatencyMs &&
    a.p95LatencyMs === b.p95LatencyMs &&
    a.p99LatencyMs === b.p99LatencyMs &&
    a.maxThroughputRps === b.maxThroughputRps &&
    a.simulationDurationMs === b.simulationDurationMs &&
    a.eventsProcessed === b.eventsProcessed
  );
}
