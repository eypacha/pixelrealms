export const ENCOUNTER_RATE_DAY = 0.05;
export const ENCOUNTER_RATE_NIGHT = 0.2;
export const ENEMY_PAUSE = 1000;

export const ENEMIES = {
	 goblin: {
	  type: 'goblin',
	  health: 5,
	  strength: 3,
	  defense: 3,
	  image: 'images/enemies/goblin.png',
	  width: 60,
	  height: 80,
	  chance: 0.4
	 },
	 orc: {
	  type: 'orc',
	  health: 10,
	  strength: 10,
	  defense: 9,
	  image: 'images/enemies/medium-orc.png',
	  width: 60,
	  height: 80,
	  chance: 0.4
	 },
	 darkknight: {
	  type: 'darkknight',
	  health: 20,
	  strength: 20,
	  defense: 15,
	  image: 'images/enemies/darkknight.png',
	  width: 60,
	  height: 80,
	  chance: 0,
	  freezeChance: 0.2
	 },
	 knight: {
	  type: 'knight',
	  health: 20,
	  strength: 20,
	  defense: 15,
	  image: 'images/enemies/knight.png',
	  width: 60,
	  height: 80,
	  chance: 0.02,
	  freezeChance: 0.1
	 },
	 skeleton: {
	  type: 'skeleton',
	  health: 13,
	  strength: 10,
	  defense: 10,
	  image: 'images/enemies/skeleton.png',
	  width: 60,
	  height: 80,
	  chance: 0.18,
	  freezeChance: 0.3
	 },
	 dragon: {
	  type: 'dragon',
	  health: 25,
	  strength: 25,
	  defense: 25,
	  image: 'images/enemies/dragon.png',
	  width: 90,
	  height: 80,
	  chance: 0
	 }
};