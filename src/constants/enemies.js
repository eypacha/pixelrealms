export const ENCOUNTER_RATE_DAY = 0.05;
export const ENCOUNTER_RATE_NIGHT = 0.3;
export const ENEMY_HIT_CHANCE = 0.7;
export const ENEMY_PAUSE = 1000;

export const DARK_KNIGHT = 'darkknight';
export const DARK_KNIGHT_HEALTH = 20;
export const DARK_KNIGHT_STRENGTH = 15;
export const DARK_KNIGHT_DEFENSE = 10;

export const ENEMIES = {
	 goblin: {
	  type: 'goblin',
	  health: 5,
	  strength: 3,
	  defense: 3,
	  image: 'images/goblin.png',
	  chance: 0.4
	 },
	 orc: {
	  type: 'orc',
	  health: 10,
	  strength: 8,
	  defense: 5,
	  image: 'images/medium-orc.png',
	  chance: 0.4
	 },
	 darkknight: {
	  type: 'darkknight',
	  health: 20,
	  strength: 15,
	  defense: 10,
	  image: 'images/darkknight.png',
	  chance: 0.02
	 },
	 skeleton: {
	  type: 'skeleton',
	  health: 8,
	  strength: 11,
	  defense: 9,
	  image: 'images/skeleton.png',
	  chance: 0.18,
	  freezeChance: 0.50
	 }
};