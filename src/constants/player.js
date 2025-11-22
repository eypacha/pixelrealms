export const PLAYER_SPEED = 5;

export const INITIAL_HEALTH = 10;
export const INITIAL_STRENGTH = 10;
export const INITIAL_DEFENSE = 10;
export const INITIAL_COINS = 10;

export const INITIAL_POTIONS = 2;
export const RECOVERY_STEPS = 5;
export const PLAYER_HIT_CHANCE = 0.7;
export const COVER_AMOUNT = 5;

export const CHARACTERS = [
  {
    key: 'knight',
    name: 'Knight',
    img: 'images/yellowknight.png',
    stats: {
      health: 10,
      strength: 10,
      defense: 10,
      coins: 10,
      potion: 2,
      mana: 0
    }
  },
  {
    key: 'barbarian',
    name: 'Barbarian',
    img: 'images/barbarian.png',
    stats: {
      health: 10,
      strength: 12,
      defense: 8,
      coins: 10,
      potion: 2,
      mana: 0
    }
  },
  {
    key: 'elf',
    name: 'Elf',
    img: 'images/elf.png',
    stats: {
      health: 12,
      strength: 9,
      defense: 9,
      coins: 10,
      potion: 0,
      mana: 3,
    }
  }
];