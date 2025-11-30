# COPILOT_INSTRUCTIONS.md

Guía para agentes y asistentes automáticos en la reescritura y mantenimiento de PixelRealms.

---

## 1. Convenciones de nombres y estructura
- Componentes: PascalCase (`StatusBar.vue`, `CombatPopup.vue`)
- Stores y servicios: camelCase (`player.js`, `combatService.js`)
- Composables: prefijo `use` (`usePlayerMovement.js`)
- Carpeta por tipo: `components/`, `stores/`, `services/`, `composables/`, `constants/`

## 2. Reglas de migración y refactorización
- Separar lógica de UI y negocio.
- Migrar utilidades a servicios o composables según corresponda.
- Modularizar stores y servicios.
- Usar i18n en todos los textos visibles.

## 3. Ejemplos de prompts y tareas automatizables
- "Migrar el componente CombatPopup a la nueva arquitectura."
- "Crear tests unitarios para combatService.js."
- "Refactorizar usePlayerMovement.js para separar lógica de animación."

## 4. Criterios de aceptación para PRs generados por agentes
- Cumplir convenciones de nombres y estructura.
- Pasar lint y tests.
- Documentar funciones y componentes complejos.
- Mantener cobertura de tests.

## 5. Checklist para agentes
- [ ] Validar lint (`npm run lint`)
- [ ] Ejecutar tests (`npm run test`)
- [ ] Verificar estructura y convenciones
- [ ] Documentar cambios relevantes

## 6. Notas sobre dependencias y configuración
- Usar PrimeVue, Pinia, Vite, ESLint, Prettier, Vitest/Jest.
- Configurar ESLint y Prettier según el estándar del equipo.

## 7. Guía para documentación automática
- Usar comentarios JSDoc/VueDoc en funciones y componentes.
- Mantener actualizado el README y archivos de ayuda.

---

Este archivo debe ser consultado por cualquier agente o asistente automático antes de realizar cambios o migraciones en el proyecto.