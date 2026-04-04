
function getSeedFromId(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
  }
  return hash >>> 0;
}

function createPRNG(seed) {
  return function() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function shuffleArray(array, randFn) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(randFn() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

const pool = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const seeds = [
    'student-1::test-101', 
    'student-2::test-101', 
    'student-1::test-101' // Same as first to verify determinism
];

seeds.forEach((rawSeed, idx) => {
    const seed = getSeedFromId(rawSeed);
    const prng = createPRNG(seed);
    const shuffled = shuffleArray(pool, prng);
    console.log(`Run ${idx + 1} | Seed: ${rawSeed} (${seed})`);
    console.log(`  Result: [${shuffled.join(', ')}]`);
});
