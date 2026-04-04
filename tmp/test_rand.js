
function deterministicRandom(s) {
  let hash = 0
  for (let i = 0; i < s.length; i++) { hash = (hash << 5) - hash + s.charCodeAt(i); hash |= 0 }
  console.log('Initial hash:', hash)
  return () => { 
    hash = (hash * 16807) % 2147483647; 
    const val = (hash - 1) / 2147483646;
    return val;
  }
}

const seeds = ['1-test-123', '2-test-123', 'anonymous-test-123'];
seeds.forEach(seed => {
  console.log('Seed:', seed);
  const rand = deterministicRandom(seed);
  for (let i = 0; i < 5; i++) {
    console.log('  Rank call', i, ':', rand());
  }
});

const pool = [1, 2, 3, 4, 5];
seeds.forEach(seed => {
    console.log('Sorting with seed:', seed);
    const rand = deterministicRandom(seed);
    const shuffled = [...pool].sort(() => rand() - 0.5);
    console.log('  Result:', shuffled);
});
