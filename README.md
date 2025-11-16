# PixelRealms — Game Mechanics

**PixelRealms** is a prototype for exploration and turn-based encounters built on a procedurally generated terrain. The world is created using a midpoint displacement heightmap and explored screen-by-screen using a deterministic seed. This document explains the game's mechanics and points to the key files in the codebase. It intentionally omits installation and run instructions.

Summary
- Genre: Tile-based exploration with simple turn-based encounters.
- Generation: 2D procedural terrain using midpoint displacement; the visible canvas is a window into that generated grid.
- Goal: Explore, discover points of interest (POIs), collect loot, and survive encounters.

Core Mechanics
- Terrain: Heights are produced by `midpointDisplacement2D`. The canvas is painted from the generated heightmap using the current `seed` and `worldOffset`. Height ranges map to water / sand / land / mountain colors.
- Seed & tiles: Changing the `seed` or shifting `worldOffset` yields different world regions deterministically. The UI exposes a `Seed` input and a `Random` button for quick experimentation.
- POIs: Each tile (world chunk) deterministically spawns POIs (e.g., castles). Approaching a POI marks it as discovered and immediately awards its loot (coins and sometimes a potion).
- Encounters: After each valid movement, the player runs a probabilistic check (`ENCOUNTER_RATE`, default 0.1) that may trigger a combat encounter.

Player & Stats
- Health (HP): `INITIAL_HEALTH`. Reaching zero sets `gameOver`.
- Strength / Defense: Modify damage dealt and received.
- Coins / Inventory: Earned via POIs and combat loot. Potions are consumables that heal during combat.

Movement & Controls
- Movement: Arrow keys (`ArrowUp`, `ArrowDown`, `ArrowLeft`, `ArrowRight`) move the player across the canvas.
- Tile shift (wrap): If the player reaches a canvas edge and movement would cross the boundary, the game may adjust `worldOffset` (shifting to the adjacent tile) and place the player at the opposite edge to continue exploration seamlessly.
- POI interaction: Discovery occurs automatically when the player gets close to a POI — no explicit input required.

Combat (Simple Turn-Based)
- Start: `checkDiscovery` and movement code can call `startCombat` via `checkEncounter`, opening the `CombatPopup` component.
- Turn flow: Player and enemy alternate turns. Player actions include: attack, take cover (temporarily increase defense), use a potion, or flee.
- Attack: Player has a hit probability (e.g., 70%). Damage equals attack minus defense with a minimum of 1.
- Cover: `activateCover` increases player defense by `COVER_AMOUNT` until the enemy's next attack.
- Potions: Restore a fixed HP amount (e.g., 5) and consume the player's turn.
- Loot: Defeating an enemy allows `collectLoot` to grant coins and sometimes a potion.

Audio & Localization
- Sounds: The project uses `howler` for sound effects (hit, coin, miss, etc.); sound logic is centralized in `src/stores/sound.js`.
- Localization: Basic i18n support exists under `src/i18n` with `en.json` and `es.json`.

Relevant Files
- `src/views/HomeView.vue`: Main view — canvas rendering, input handling, and popups (`CombatPopup`, `GameOverPopup`).
- `src/composables/useTerrain.js`: Terrain generation, seed control, and tile offset management.
- `src/stores/player.js`: Player state, movement, encounter checks, and combat logic.
- `src/stores/poi.js`: POI generation per tile and discovery handling.
- `src/utilities/midpointDisplacement2D.js`: Heightmap generator implementation.
- `src/utilities/draw.js`: Canvas rendering helpers (`drawAll` paints terrain, POIs, and player).


---
Last updated: game mechanics overview (English, no run instructions).
