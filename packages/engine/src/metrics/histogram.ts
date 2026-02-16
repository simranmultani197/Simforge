/**
 * Simple histogram for tracking value distributions.
 * Used for latency tracking with fixed bucket boundaries.
 */
export class Histogram {
  private readonly buckets: number[];
  private readonly boundaries: number[];
  private count = 0;
  private sum = 0;
  private min = Infinity;
  private max = -Infinity;

  constructor(boundaries: number[]) {
    this.boundaries = [...boundaries].sort((a, b) => a - b);
    // One extra bucket for values above the highest boundary
    this.buckets = new Array(this.boundaries.length + 1).fill(0) as number[];
  }

  record(value: number): void {
    this.count++;
    this.sum += value;
    if (value < this.min) this.min = value;
    if (value > this.max) this.max = value;

    // Find the right bucket
    let i = 0;
    while (i < this.boundaries.length && value > this.boundaries[i]!) {
      i++;
    }
    this.buckets[i]!++;
  }

  getCount(): number {
    return this.count;
  }

  getMean(): number {
    return this.count > 0 ? this.sum / this.count : 0;
  }

  getMin(): number {
    return this.count > 0 ? this.min : 0;
  }

  getMax(): number {
    return this.count > 0 ? this.max : 0;
  }

  reset(): void {
    this.buckets.fill(0);
    this.count = 0;
    this.sum = 0;
    this.min = Infinity;
    this.max = -Infinity;
  }
}

/**
 * Create default latency histogram boundaries (in ms).
 * Buckets: 0-1, 1-5, 5-10, 10-25, 25-50, 50-100, 100-250, 250-500, 500-1000, 1000+
 */
export function createLatencyHistogram(): Histogram {
  return new Histogram([1, 5, 10, 25, 50, 100, 250, 500, 1000]);
}
