import rules from '../../data/rules/nature-transformations.json'

type NatureKey = keyof typeof rules.baseNatures

export function effectiveness(attacker: string, defender: string) {
  if (!attacker || !defender) return 1.0
  // Normalize names
  const a = attacker.replace(/[-_ ]/g, '')
  const d = defender.replace(/[-_ ]/g, '')

  // Yin-Yang special handling
  if (a.toLowerCase() === 'yinyang') return rules.baseNatures['YinYang'].effectivenessBonus || 1.25
  if (d.toLowerCase() === 'yinyang') return rules.baseNatures['YinYang'].resistance || 0.75

  const base = rules.baseNatures as any
  const attackerRule = Object.values(base).find((r: any) => r.name.replace(/\s+/g, '').toLowerCase() === a.toLowerCase())
  const defenderRule = Object.values(base).find((r: any) => r.name.replace(/\s+/g, '').toLowerCase() === d.toLowerCase())

  if (!attackerRule || !defenderRule) return 1.0

  // direct strengths/weaknesses
  if (attackerRule.strengths && attackerRule.strengths[defenderRule.name]) return attackerRule.strengths[defenderRule.name]
  if (attackerRule.weaknesses && attackerRule.weaknesses[defenderRule.name]) return attackerRule.weaknesses[defenderRule.name]

  // default neutral
  return 1.0
}

export function environmentalCost(chakraCost: number, nature: string, useEnvironment: boolean, chakraControl = 0) {
  const base = rules.baseNatures as any
  const nr = Object.values(base).find((r: any) => r.name.replace(/\s+/g, '').toLowerCase() === nature.replace(/[-_ ]/g, '').toLowerCase())
  if (!nr) return chakraCost
  if (!useEnvironment) {
    // if user can self-form (has enough chakra control) use selfFormMultiplier
    if (nr.environmental && chakraControl >= (nr.environmental.selfFormRequirementChakraControl || 999)) {
      return chakraCost * (nr.environmental.selfFormMultiplier || 1)
    }
    return chakraCost
  }
  // using environmental component
  if (nr.environmental) return chakraCost * (nr.environmental.envCostMultiplier || 1)
  return chakraCost
}

// Example small helper to compute travel-ish multipliers or merged nature multipliers could go here later

export default { effectiveness, environmentalCost }
