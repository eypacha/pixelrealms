// randomWithSeed.js
// Generador de números aleatorios con semilla (LCG)

export function createSeededRandom(seed) {
  let s = typeof seed === 'string' ? hashString(seed) : seed;
  return function() {
    // LCG params
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

// Simple hash para strings
function hashString(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
  }
  return hash >>> 0;
}
