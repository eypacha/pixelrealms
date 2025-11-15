// Diamond-Square 1D para terreno procedural
// Genera un array de alturas usando el algoritmo de desplazamiento de punto medio

export function generateDiamondSquare1D(size, roughness = 0.7) {
  // size debe ser potencia de 2 + 1 (ej: 513, 1025)
  const arr = new Array(size).fill(0);
  arr[0] = Math.random() * 2 - 1;
  arr[size - 1] = Math.random() * 2 - 1;

  let step = size - 1;
  let scale = roughness;

  while (step > 1) {
    for (let i = 0; i < size - 1; i += step) {
      const mid = i + step / 2;
      arr[mid] = (arr[i] + arr[i + step]) / 2 + (Math.random() * 2 - 1) * scale;
    }
    step /= 2;
    scale *= roughness;
  }
  return arr;
}
