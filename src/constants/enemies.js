export const ENCOUNTER_RATE_DAY = 0.05;
export const ENCOUNTER_RATE_NIGHT = 0.3;
export const ENEMY_HIT_CHANCE = 0.7;
export const ENEMY_PAUSE = 1000;

export const ENEMIES = {
	 goblin: {
	  type: 'goblin',
	  health: 5,
	  strength: 3,
	  defense: 3,
	  image: 'images/enemies/goblin.png',
	  chance: 0.4
	 },
	 orc: {
	  type: 'orc',
	  health: 10,
	  strength: 10,
	  defense: 9,
	  image: 'images/enemies/medium-orc.png',
	  chance: 0.4
	 },
	 darkknight: {
	  type: 'darkknight',
	  health: 20,
	  strength: 20,
	  defense: 15,
	  image: 'images/enemies/darkknight.png',
	  chance: 0,
	  freezeChance: 0.2
	 },
	 knight: {
	  type: 'knight',
	  health: 20,
	  strength: 20,
	  defense: 15,
	  image: 'images/enemies/knight.png',
	  chance: 0.02,
	  freezeChance: 0.1
	 },
	 skeleton: {
	  type: 'skeleton',
	  health: 13,
	  strength: 13,
	  defense: 13,
	  image: 'images/enemies/skeleton.png',
	  chance: 0.18,
	  freezeChance: 0.5
	 }
};