/**
 * Seeded pseudo-random number generator using xoshiro256**.
 * Produces deterministic sequences for reproducible simulations.
 */
export class SeededRNG {
  private state: BigInt64Array;

  constructor(seed: number) {
    this.state = new BigInt64Array(4);
    // Initialize state using SplitMix64 from the seed
    let s = BigInt(seed);
    for (let i = 0; i < 4; i++) {
      s += 0x9e3779b97f4a7c15n;
      let z = s;
      z = (z ^ (z >> 30n)) * 0xbf58476d1ce4e5b9n;
      z = (z ^ (z >> 27n)) * 0x94d049bb133111ebn;
      z = z ^ (z >> 31n);
      this.state[i] = z;
    }
  }

  /**
   * Returns a random float in [0, 1).
   */
  next(): number {
    const result = this.rotl(this.state[1]! * 5n, 7n) * 9n;
    const t = this.state[1]! << 17n;

    this.state[2]! ^= this.state[0]!;
    this.state[3]! ^= this.state[1]!;
    this.state[1]! ^= this.state[2]!;
    this.state[0]! ^= this.state[3]!;

    this.state[2]! ^= t;
    this.state[3] = this.rotl(this.state[3]!, 45n);

    // Convert to [0, 1) float
    const u64 = BigInt.asUintN(64, result);
    return Number(u64 >> 11n) / 2 ** 53;
  }

  /**
   * Returns a random integer in [min, max] (inclusive).
   */
  nextInt(min: number, max: number): number {
    return min + Math.floor(this.next() * (max - min + 1));
  }

  private rotl(x: bigint, k: bigint): bigint {
    return BigInt.asIntN(64, (x << k) | (BigInt.asUintN(64, x) >> (64n - k)));
  }
}
