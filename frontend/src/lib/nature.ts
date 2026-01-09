import rules from "../../data/rules/nature-transformations.json";

// Define the shape of each nature rule
interface NatureRule {
  name: string;
  strengths?: Record<string, number>;
  weaknesses?: Record<string, number>;
  effectivenessBonus?: number;
  resistance?: number;
  environmental?: {
    selfFormRequirementChakraControl?: number;
    selfFormMultiplier?: number;
    envCostMultiplier?: number;
  };
}

// Type the JSON structure
interface NatureRulesFile {
  baseNatures: Record<string, NatureRule>;
}

// Cast JSON to typed structure
const typedRules = rules as NatureRulesFile;

export function effectiveness(attacker: string, defender: string) {
  if (!attacker || !defender) return 1.0;

  const a = attacker.replace(/[-_ ]/g, "");
  const d = defender.replace(/[-_ ]/g, "");

  // Yin-Yang special handling
  if (a.toLowerCase() === "yinyang")
    return typedRules.baseNatures["YinYang"].effectivenessBonus ?? 1.25;

  if (d.toLowerCase() === "yinyang")
    return typedRules.baseNatures["YinYang"].resistance ?? 0.75;

  const base = typedRules.baseNatures;

  const attackerRule = Object.values(base).find(
    (r) => r.name.replace(/\s+/g, "").toLowerCase() === a.toLowerCase()
  );

  const defenderRule = Object.values(base).find(
    (r) => r.name.replace(/\s+/g, "").toLowerCase() === d.toLowerCase()
  );

  if (!attackerRule || !defenderRule) return 1.0;

  // direct strengths/weaknesses
  if (attackerRule.strengths?.[defenderRule.name])
    return attackerRule.strengths[defenderRule.name];

  if (attackerRule.weaknesses?.[defenderRule.name])
    return attackerRule.weaknesses[defenderRule.name];

  return 1.0;
}

export function environmentalCost(
  chakraCost: number,
  nature: string,
  useEnvironment: boolean,
  chakraControl = 0
) {
  const base = typedRules.baseNatures;

  const nr = Object.values(base).find(
    (r) =>
      r.name.replace(/\s+/g, "").toLowerCase() ===
      nature.replace(/[-_ ]/g, "").toLowerCase()
  );

  if (!nr) return chakraCost;

  if (!useEnvironment) {
    if (
      nr.environmental &&
      chakraControl >=
        (nr.environmental.selfFormRequirementChakraControl ?? 999)
    ) {
      return chakraCost * (nr.environmental.selfFormMultiplier ?? 1);
    }
    return chakraCost;
  }

  if (nr.environmental)
    return chakraCost * (nr.environmental.envCostMultiplier ?? 1);

  return chakraCost;
}

export default { effectiveness, environmentalCost };
