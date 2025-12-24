const rules = require('../../data/rules/nature-transformations.json')

function effectiveness(attacker, defender) {
  if (!attacker || !defender) return 1.0
  const a = attacker.replace(/[-_ ]/g, '')
  const d = defender.replace(/[-_ ]/g, '')
  if (a.toLowerCase() === 'yinyang') return (rules.baseNatures['YinYang'].effectivenessBonus || 1.25)
  if (d.toLowerCase() === 'yinyang') return (rules.baseNatures['YinYang'].resistance || 0.75)

  const base = rules.baseNatures
  const attackerRule = Object.values(base).find((r) => r.name.replace(/\s+/g, '').toLowerCase() === a.toLowerCase())
  const defenderRule = Object.values(base).find((r) => r.name.replace(/\s+/g, '').toLowerCase() === d.toLowerCase())
  if (!attackerRule || !defenderRule) return 1.0
  if (attackerRule.strengths && attackerRule.strengths[defenderRule.name]) return attackerRule.strengths[defenderRule.name]
  if (attackerRule.weaknesses && attackerRule.weaknesses[defenderRule.name]) return attackerRule.weaknesses[defenderRule.name]
  return 1.0
}

function environmentalCost(chakraCost, nature, useEnvironment, chakraControl) {
  chakraControl = chakraControl || 0
  const base = rules.baseNatures
  const nr = Object.values(base).find((r) => r.name.replace(/\s+/g, '').toLowerCase() === nature.replace(/[-_ ]/g, '').toLowerCase())
  if (!nr) return chakraCost
  if (!useEnvironment) {
    if (nr.environmental && chakraControl >= (nr.environmental.selfFormRequirementChakraControl || 999)) {
      return chakraCost * (nr.environmental.selfFormMultiplier || 1)
    }
    return chakraCost
  }
  if (nr.environmental) return chakraCost * (nr.environmental.envCostMultiplier || 1)
  return chakraCost
}

module.exports = { effectiveness, environmentalCost }
