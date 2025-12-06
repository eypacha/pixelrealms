# 🕹️ PixelRealms — Game Mechanics

**PixelRealms** is a prototype for exploration and turn-based encounters on a procedurally generated terrain. The world is created using a midpoint displacement heightmap and explored screen-by-screen using a deterministic seed. This document explains the game mechanics and points to key files in the codebase. Installation and run instructions are intentionally omitted.

## 📝 Summary
- Genre: Exploration with turn-based encounters.
- Generation: 2D procedural terrain using midpoint displacement; the visible canvas is a window into the generated grid.
- Goal: Explore, discover points of interest (POIs), collect loot, and survive encounters.

## 🌍 Core Mechanics
- Terrain: Heights are generated with `midpointDisplacement2D`. The canvas is painted from the heightmap using the current `seed` and `worldOffset`. Height ranges map to water / sand / land / mountain colors.
- Seed & tiles: Changing the `seed` or shifting the `worldOffset` reveals different regions of the world deterministically. The UI allows seed changes and quick randomization.
- POIs: Each tile deterministically spawns POIs (e.g., wizards, dark knights, campfires). Approaching a POI marks it as discovered and immediately awards its loot (coins and sometimes a potion).
- Campfire: At the start of each run, a campfire is generated at the player's initial spawn point. The campfire persists between runs and always marks the initial position. If the player passes near the campfire, their health is instantly restored to maximum.
- Encounters: After each valid movement, a probabilistic check (`ENCOUNTER_RATE`, default 0.1) may trigger a combat encounter.

## 🎮 Movement & Controls
- Movement: Arrow keys (`ArrowUp`, `ArrowDown`, `ArrowLeft`, `ArrowRight`) move the player across the canvas.
- Tile shift (wrap): If the player reaches a canvas edge and movement would cross the boundary, the game may adjust `worldOffset` (shifting to the adjacent tile) and place the player at the opposite edge to continue exploration seamlessly.
- POI interaction: Discovery occurs automatically when the player gets close to a POI — no explicit input required.

## ⚔️ Combat (Simple Turn-Based)
- Start: Movement and the `checkDiscovery` function can call `startCombat` via `checkEncounter`, opening the `CombatPopup` component.
- Turn flow: Player and enemy alternate turns. Player actions include: attack, take cover (temporary defense boost), use a potion, or flee.
- Attack: Hit probability depends on attack and defense. Damage is calculated proportionally and can be critical. The enemy uses the same logic.
- Cover: Multiplies defense by a fixed value for several turns, reducing damage received.
- Potions: Restore a fixed HP amount and consume the player's turn.
- Loot: Defeating an enemy grants coins and sometimes a potion.

## 🔊 Audio & Localization
- Sounds: The project uses `howler` for sound effects (hit, coin, miss, etc.); sound logic is centralized in `src/stores/sound.js`.
- Localization: Basic i18n support exists under `src/i18n` with `en.json` and `es.json`.

## 📁 Relevant Files
- `src/views/HomeView.vue`: Main view — canvas rendering, input handling, and popups (`CombatPopup`, `GameOverPopup`).
- `src/composables/useTerrain.js`: Terrain generation, seed control, and tile offset management.
- `src/stores/player.js`: Player state, movement, encounter checks, and combat logic.
- `src/stores/poi.js`: POI generation per tile and discovery handling.
- `src/utilities/midpointDisplacement2D.js`: Heightmap generator implementation.
- `src/utilities/draw.js`: Canvas rendering helpers (`drawAll` paints terrain, POIs, and player).
- `src/utilities/combatCalcs.js`: Combat damage and hit probability logic.

---

## 🚀 Demo
- Live demo: https://dev.eypacha.com/pixelrealms

---
🗓️ Last updated: game mechanics and combat system (November 2025).
