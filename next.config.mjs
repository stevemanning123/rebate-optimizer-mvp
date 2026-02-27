import type { ModeledSpend, ProgramResult } from "@/lib/types";
import { round2 } from "@/lib/engine/utils";

/**
 * FMC CashBack (simplified) based on the uploaded 2026 sell sheet:
 * - Tiers by total eligible MSRP: 5k-29,999; 30k-49,999; 50k-74,999; >=75k
 * - Category rebates:
 *   Biologicals: 2/4/6/8
 *   Pre-seed herbicides: 2/4/6/8
 *   In-crop herbicides: 6/9/12/15
 * - $1 matching acre bonus when both pre-seed and in-crop acres are present
 */
function tier(total: number): 1 | 2 | 3 | 4 | 0 {
  if (total >= 75000) return 4;
  if (total >= 50000) return 3;
  if (total >= 30000) return 2;
  if (total >= 5000) return 1;
  return 0;
}

export function evalFMC(modeled: ModeledSpend): ProgramResult {
  const t = tier(modeled.total);
  const notes: string[] = [];
  if (t === 0) notes.push("Below $5,000 modeled eligible spend: program tier not reached.");

  const bioRate = t === 4 ? 0.08 : t === 3 ? 0.06 : t === 2 ? 0.04 : t === 1 ? 0.02 : 0;
  const preRate = bioRate;
  const inCropRate = t === 4 ? 0.15 : t === 3 ? 0.12 : t === 2 ? 0.09 : t === 1 ? 0.06 : 0;

  const bio = modeled.byCategory.biologicalsPGR * bioRate;
  const pre = modeled.byCategory.preSeedHerb * preRate;
  const inc = modeled.byCategory.inCropHerb * inCropRate;

  // Matching acre bonus (simplified): $1 per acre matched between pre-seed and in-crop selections.
  const matchAcres = Math.min(modeled.acresByCategory.preSeedHerb, modeled.acresByCategory.inCropHerb);
  const matchBonus = matchAcres > 0 ? matchAcres * 1.0 : 0;
  if (matchAcres > 0) notes.push(`Matching-acre bonus applied on ${Math.round(matchAcres)} acres.`);

  const estimatedCashback = bio + pre + inc + matchBonus;

  const totalAcres = Math.max(
    modeled.acresByCategory.preSeedHerb,
    modeled.acresByCategory.inCropHerb,
    modeled.acresByCategory.fungicide,
    modeled.acresByCategory.insecticide,
    modeled.acresByCategory.seedTreatment,
    modeled.acresByCategory.biologicalsPGR
  );

  return {
    company: "FMC CashBack (modeled)",
    estimatedCashback: round2(estimatedCashback),
    estimatedPerAcre: round2(totalAcres ? estimatedCashback / totalAcres : 0),
    notes: [
      `Tier ${t === 0 ? "not reached" : t} based on modeled total spend.`,
      ...notes,
    ],
    breakdown: [
      { label: "Biologicals rebate", value: bio },
      { label: "Pre-seed herbicide rebate", value: pre },
      { label: "In-crop herbicide rebate", value: inc },
      { label: "Matching-acre bonus", value: matchBonus },
    ],
  };
}
