// Random Midpoint Displacement 1D para terreno procedural
// Genera un array de alturas usando el algoritmo fractal

export function generateMidpointDisplacement1D(size, roughness = 0.7) {
  // size debe ser potencia de 2 + 1 (ej: 513, 1025)
  const arr = new Array(size).fill(0);
  // Rango inicial reducido para terreno más llano
  arr[0] = Math.random() * 0.4 - 0.2;
  arr[size - 1] = Math.random() * 0.4 - 0.2;

  let step = size - 1;
  let scale = roughness;

  while (step > 1) {
    for (let i = 0; i < size - 1; i += step) {
      const mid = i + step / 2;
      arr[mid] = (arr[i] + arr[i + step]) / 2 + (Math.random() * 0.4 - 0.2) * scale;
    }
    step /= 2;
    scale *= roughness;
  }
  return arr;
}
