// Simple Perlin Noise implementation for 1D terrain
// Adapted for Vue terrain simulator

function fade(t) {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function lerp(a, b, t) {
  return a + t * (b - a);
}

function grad(hash, x) {
  return (hash & 1) === 0 ? x : -x;
}

function perlinNoise1D(x, perm) {
  const xi = Math.floor(x) & 255;
  const xf = x - Math.floor(x);
  const u = fade(xf);
  const a = perm[xi];
  const b = perm[xi + 1];
  return lerp(grad(a, xf), grad(b, xf - 1), u);
}

export function generatePerlinNoise(width, scale = 0.05) {
  const perm = Array.from({ length: 512 }, () => Math.floor(Math.random() * 256));
  const noise = [];
  for (let i = 0; i < width; i++) {
    noise.push(perlinNoise1D(i * scale, perm));
  }
  return noise;
}
