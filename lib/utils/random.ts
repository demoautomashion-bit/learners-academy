
/**
 * Generates an unsigned 32-bit hash from a string (DJB2 improved).
 * Prevents the "negative hash" trap identified in the audit.
 */
export function getSeedFromId(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    // hash * 33 + charCode
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
  }
  return hash >>> 0; // Force unsigned 32-bit integer
}

/**
 * Seeded PRNG: Mulberry32
 * Fast, deterministic, and returns [0, 1) float.
 */
export function createPRNG(seed: number) {
  return function() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

/**
 * Fisher-Yates (Knuth) Shuffle
 * Statistically valid, O(n) complexity.
 */
export function shuffleArray<T>(array: T[], randFn: () => number): T[] {
  const result = [...array]; // Deep copy of the array reference structure
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(randFn() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
