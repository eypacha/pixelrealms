export const ENCOUNTER_RATE_DAY = 0.05;
export const ENCOUNTER_RATE_NIGHT = 0.2;
export const ENEMY_PAUSE = 1000;

export const ENEMIES = [
	{
		id: 'goblin',
		type: 'goblin',
		health: 5,
		strength: 3,
		defense: 3,
		image: 'images/enemies/goblin.png',
		width: 60,
		height: 80,
		baseProbability: 0.6,
		fleeingChance: 1,
		minDefeated: 0,
		maxDefeated: 20,
		loot: () => ({
			coins: Math.floor(Math.random() * 10) + 1,
			potions: 1,
			scrolls: 0
		})
	},
	{
		id: 'orc',
		type: 'orc',
		health: 10,
		strength: 10,
		defense: 9,
		image: 'images/enemies/medium-orc.png',
		width: 60,
		height: 80,
		fleeingChance: 0.2,
		baseProbability: 0.2,
		minDefeated: 0,
		loot: () => ({
			coins: Math.floor(Math.random() * 10) + 5,
			potions: Math.floor(Math.random() * 3),
			scrolls: 0
		})
	},
	{
		id: 'darkknight',
		type: 'darkknight',
		health: 20,
		strength: 20,
		defense: 15,
		image: 'images/enemies/darkknight.png',
		width: 60,
		height: 80,
		baseProbability: 0.1,
		minDefeated: 20,
		freezeChance: 0.2,
		loot: () => ({
			coins: Math.floor(Math.random() * 31) + 30,
			potions: Math.floor(Math.random() * 3),
			scrolls: 1
		})
	},
	{
		id: 'knight',
		type: 'knight',
		health: 20,
		strength: 20,
		defense: 15,
		image: 'images/enemies/knight.png',
		width: 60,
		height: 80,
		baseProbability: 0.1,
		minDefeated: 0,
		freezeChance: 0.1,
		loot: () => ({
			coins: Math.floor(Math.random() * 20) + 10,
			potions: Math.floor(Math.random() * 2),
			scrolls: Math.floor(Math.random() * 2)
		})
	},
	{
		id: 'skeleton',
		type: 'skeleton',
		health: 10,
		strength: 10,
		defense: 10,
		image: 'images/enemies/skeleton.png',
		width: 60,
		height: 80,
		baseProbability: 0.1,
		minDefeated: 0,
		freezeChance: 0.3,
		loot: () => ({
			coins: Math.floor(Math.random() * 20),
			potions: Math.floor(Math.random() * 5),
			scrolls: Math.floor(Math.random() * 3) + 2
		})
	},
	{
		id: 'dragon',
		type: 'dragon',
		health: 100,
		strength: 100,
		defense: 100,
		image: 'images/enemies/dragon.png',
		width: 90,
		height: 80,
		baseProbability: 0.05,
		minDefeated: 20,
        fireballChance: 0.3,
		loot: () => ({
			coins: Math.floor(Math.random() * 10) + 20,
			potions: Math.floor(Math.random() * 3) + 5,
			scrolls: Math.floor(Math.random() * 3) + 5
		})
	}
];