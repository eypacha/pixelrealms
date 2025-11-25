// src/utilities/poiGenerator.js
import { DARK_KNIGHT_COUNT, LOOT_MIN, LOOT_MAX, TREASURE_COUNT, WIZARD_COUNT, DRAGON_COUNT } from '../constants/poi.js';

// Recibe terrainUtils, rand, width, height, terrain, seed
export function generatePoisForTile({ terrainUtils, rand, width, height, terrain, seed, count = DARK_KNIGHT_COUNT }) {
  const arr = [];
  const poiConfigs = [
    {
      type: 'darkknight',
      count,
      isValid: (x, y) => terrainUtils.isValidTerrain(x, y, width, height, terrain),
      extra: () => ({ loot: Math.floor(rand() * (LOOT_MAX - LOOT_MIN + 1)) + LOOT_MIN })
    },
    {
      type: 'wizard',
      count: WIZARD_COUNT,
      isValid: (x, y) => terrainUtils.isValidTerrain(x, y, width, height, terrain),
      extra: () => ({})
    },
    {
      type: 'treasure',
      count: TREASURE_COUNT,
      isValid: (x, y) => {
        const tx = Math.floor(x * (terrain.length - 1) / (width - 1));
        const ty = Math.floor(y * (terrain.length - 1) / (height - 1));
        return terrain[ty]?.[tx] > -0.05;
      },
      extra: () => ({})
    },
    {
      type: 'dragon',
      count: DRAGON_COUNT,
      isValid: (x, y) => terrainUtils.isValidTerrain(x, y, width, height, terrain),
      extra: () => ({ loot: Math.floor(rand() * (LOOT_MAX - LOOT_MIN + 1)) + LOOT_MIN })
    }
  ];

  poiConfigs.forEach(config => {
    for (let i = 0; i < config.count; i++) {
      const x = Math.floor(rand() * width);
      const y = Math.floor(rand() * height);
      if (config.isValid(x, y)) {
        arr.push({
          id: `${config.type}-${i}`,
          type: config.type,
          position: { x, y },
          discovered: false,
          revealed: false,
          ...config.extra()
        });
      }
    }
  });
  return arr;
}
