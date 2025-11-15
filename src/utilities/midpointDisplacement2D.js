// Random Midpoint Displacement 2D para terreno procedural
// Genera una matriz de alturas usando el algoritmo fractal

export function generateMidpointDisplacement2D(size, roughness = 0.7) {
  // size debe ser potencia de 2 + 1 (ej: 513, 1025)
  const arr = Array.from({ length: size }, () => new Array(size).fill(0));
  // Inicializar esquinas
  arr[0][0] = Math.random() * 0.4 - 0.2;
  arr[0][size - 1] = Math.random() * 0.4 - 0.2;
  arr[size - 1][0] = Math.random() * 0.4 - 0.2;
  arr[size - 1][size - 1] = Math.random() * 0.4 - 0.2;

  let step = size - 1;
  let scale = roughness;

  while (step > 1) {
    // Diamond step
    for (let y = 0; y < size - 1; y += step) {
      for (let x = 0; x < size - 1; x += step) {
        const midX = x + step / 2;
        const midY = y + step / 2;
        arr[midY][midX] = (
          arr[y][x] +
          arr[y][x + step] +
          arr[y + step][x] +
          arr[y + step][x + step]
        ) / 4 + (Math.random() * 0.4 - 0.2) * scale;
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
        arr[y][x] = sum / count + (Math.random() * 0.4 - 0.2) * scale;
      }
    }
    step /= 2;
    scale *= roughness;
  }
  return arr;
}
