export const PLAYER_SPEED = 5;
export const RECOVERY_STEPS = 5;
export const PLAYER_HIT_CHANCE = 0.7;
export const COVER_DEFENSE_MULTIPLIER = 1.5; 
export const COVER_DEFENSE_TURNS = 2;

export const CHARACTERS = [
  {
    key: 'knight',
    name: 'Knight',
    img: 'images/players/yellowknight.png',
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
    img: 'images/players/barbarian.png',
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
    img: 'images/players/elfa.png',
    stats: {
      health: 10,
      strength: 9,
      defense: 9,
      coins: 10,
      potion: 0,
      mana: 6,
    }
  },
  {
    key: 'wizard',
    name: 'Wizard',
    img: 'images/players/wizard.png',
    stats: {
      health: 10,
      strength: 8,
      defense: 8,
      coins: 10,
      potion: 4,
      mana: 6
    }
  }
];