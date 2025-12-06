# GAME_CONCEPT.md

## PixelRealms — Game Design Document (GDD)

---

### 1. Resumen del juego
PixelRealms es un juego de exploración y aventura con generación procedural, combates por turnos y eventos narrativos. El jugador recorre un mundo pixelado, descubre puntos de interés, enfrenta enemigos y toma decisiones que afectan la narrativa.

### 2. Objetivos principales
- Explorar el mundo y descubrir secretos.
- Superar desafíos de combate y eventos especiales.
- Mejorar al personaje y gestionar recursos.
- Completar la historia principal y misiones secundarias.


### 3. Mecánicas clave
- **Exploración:** Mapa procedural, movimiento libre, descubrimiento de POIs.
- **Generación procedural:** El terreno se genera usando el algoritmo de "midpoint displacement" para crear mapas de altura en 2D, simulando montañas, valles y llanuras. Los valores de altura se traducen en tipos de terreno (agua, arena, tierra, montaña) según rangos definidos.
- **Random con semilla:** Tanto el terreno como la disposición de los puntos de interés (POIs) y enemigos se generan de forma determinista usando funciones de random con semilla (`seed`). Esto permite que el mismo mundo y sus elementos se puedan recrear exactamente igual en cada cliente, facilitando la sincronización y la rejugabilidad.
- **Combate:** Sistema por turnos, habilidades, estados y loot.
- **Narrativa:** Eventos ramificados, decisiones con impacto.
- **Gestión:** Inventario, mejoras, tiempo (día/noche).
- **Audio/Visual:** Estética pixel art, música y efectos envolventes.
- **Campamento (Campfire):** Al iniciar cada run, se genera un campfire en el punto de spawn inicial del jugador. El campfire es persistente entre runs y siempre marca la posición inicial. Si el jugador pasa cerca del campfire, recupera toda su vida al máximo instantáneamente.
- **Logros/Achievements:** El juego puede registrar hitos como enemigos derrotados, pasos dados, noches sobrevividas, etc., y mostrar notificaciones al desbloquearlos.
  
### 4. Público objetivo
Jugadores de aventuras, RPG y exploración, interesados en mecánicas clásicas y narrativa interactiva.

### 5. Visión y valores
- Experiencia inmersiva y rejugable.
- Decisiones significativas.
- Equilibrio entre desafío y accesibilidad.
- Estética retro y moderna.

### 6. Referencias e inspiración
- Juegos clásicos de RPG y roguelike.
- Elementos de narrativa interactiva.
- Pixel art y música retro.

### 7. Roadmap y evolución
- MVP: Exploración, combate básico, narrativa simple.
- V1: Más eventos, enemigos, mejoras visuales y de audio.
- Futuro: Multijugador, nuevos modos, expansión de historia.

---

Este documento debe ser consultado por todo el equipo y agentes para mantener coherencia en el desarrollo y evolución de PixelRealms.