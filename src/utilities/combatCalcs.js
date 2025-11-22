export function performAttack(attacker, defender, options = {}) {
  const {
    criticalChance = 0.1,
    criticalMultiplier = 2
  } = options;

  // 1) Golpe exitoso o fallo
  const ACC = 10 + attacker.attack;
  const EVA = 10 + defender.defense / 2;
  const chanceToHit = ACC / (ACC + EVA);

  if (Math.random() > chanceToHit) {
    return { missed: true, damage: 0, isCritical: false };
  }

  // 2) Daño ajustado (más bajo)
  const reduction = defender.defense / (defender.defense + 50);
  const modifier = 0.9 + Math.random() * 0.1; // 0.90–1.10

  // 🔥 NUEVO: daño base reducido
  let damage = (attacker.attack / 3) * (1 - reduction) * modifier;

  let isCritical = false;
  if (Math.random() < criticalChance) {
    damage *= criticalMultiplier;
    isCritical = true;
  }

  damage = Math.max(1, Math.floor(damage));

  return { missed: false, damage, isCritical };
}
