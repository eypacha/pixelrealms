// Random Midpoint Displacement 2D para terreno procedural
// Genera una matriz de alturas usando el algoritmo fractal


export function generateMidpointDisplacement2D(size, roughness = 0.7, offsetX = 0, offsetY = 0, seed = 0) {
  // size debe ser potencia de 2 + 1 (ej: 513, 1025)
  // Ahora acepta `offsetX` y `offsetY` (enteros) y `seed` (string|number) para generar
  // valores deterministas por coordenada global, lo que permite generar porciones contiguas.
  const arr = Array.from({ length: size }, () => new Array(size).fill(0));

  // Helper: hash string to uint32
  function hashStringToUint32(str) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    return h >>> 0;
  }

  // Normalize seed to uint32
  let seedInt = 0;
  if (typeof seed === 'string') seedInt = hashStringToUint32(seed);
  else if (typeof seed === 'number') seedInt = seed >>> 0;

  // Deterministic noise based on integer coordinates (gx, gy)
  function noiseAt(gx, gy) {
    // mix coordinates and seed into a uint32
    let x = (gx >>> 0) * 374761393 >>> 0;
    let y = (gy >>> 0) * 668265263 >>> 0;
    let h = (x ^ y ^ seedInt) >>> 0;
    h = Math.imul(h ^ (h >>> 16), 2246822507) >>> 0;
    h = (h ^ (h >>> 13)) >>> 0;
    // map to [0,1)
    const v = (h >>> 0) / 4294967296;
    return v * 0.4 - 0.2;
  }

  // init corners using global coordinates
  arr[0][0] = noiseAt(offsetX + 0, offsetY + 0);
  arr[0][size - 1] = noiseAt(offsetX + (size - 1), offsetY + 0);
  arr[size - 1][0] = noiseAt(offsetX + 0, offsetY + (size - 1));
  arr[size - 1][size - 1] = noiseAt(offsetX + (size - 1), offsetY + (size - 1));

  let step = size - 1;
  let scale = roughness;

  while (step > 1) {
    // Diamond step
    for (let y = 0; y < size - 1; y += step) {
      for (let x = 0; x < size - 1; x += step) {
        const midX = x + step / 2;
        const midY = y + step / 2;
        const avg = (
          arr[y][x] +
          arr[y][x + step] +
          arr[y + step][x] +
          arr[y + step][x + step]
        ) / 4;
        const perturb = noiseAt(offsetX + midX, offsetY + midY) * scale;
        arr[midY][midX] = avg + perturb;
      }
    }

    // Square step
    for (let y = 0; y < size; y += step / 2) {
      for (let x = (y % step === 0 ? step / 2 : 0); x < size; x += step) {
        let sum = 0;
        let count = 0;
        if (y - step / 2 >= 0) {
          sum += arr[y - step / 2][x];
          count++;
        }
        if (y + step / 2 < size) {
          sum += arr[y + step / 2][x];
          count++;
        }
        if (x - step / 2 >= 0) {
          sum += arr[y][x - step / 2];
          count++;
        }
        if (x + step / 2 < size) {
          sum += arr[y][x + step / 2];
          count++;
        }
        const avg = sum / count;
        const perturb = noiseAt(offsetX + x, offsetY + y) * scale;
        arr[y][x] = avg + perturb;
      }
    }
    step /= 2;
    scale *= roughness;
  }
  return arr;
}
