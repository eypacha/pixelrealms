// Utilidad para calcular daño entre atacante y defensor
// Opciones: criticalChance (0-1), criticalMultiplier (número), randomFn (opcional)
export function calculateDamage(strength, defense, options = {}) {
  const criticalChance = 0.1
  const criticalMultiplier = 2
  const baseDamage = Math.max(1, strength - defense);
  const minDmg = 1;
  const maxDmg = baseDamage;
  let damage = Math.floor(Math.random() * (maxDmg - minDmg + 1)) + minDmg;
  let isCritical = false;
  if (Math.random() < criticalChance) {
    damage = Math.floor(damage * criticalMultiplier);
    isCritical = true;
  }
  return { damage, isCritical };
}
