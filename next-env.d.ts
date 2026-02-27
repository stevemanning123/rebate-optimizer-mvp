import type { FarmInput, ModeledSpend, ProgramResult } from "@/lib/types";
import { round2 } from "@/lib/engine/utils";

/**
 * BayerValue West Rewards (simplified):
 * - Segments: Seed Treatments, Herbicides, Fungicides
 * - Segment Savings: 2 segments = 5%; 3 segments = 10%
 * - Minimum 300 acres per segment to pay in that segment
 * This MVP uses category intents as proxy for segment participation:
 * - Seed Treatments segment => seedTreatment enabled
 * - Herbicides segment => preSeedHerb OR inCropHerb enabled
 * - Fungicides segment => fungicide enabled
 */
export function evalBayer(input: FarmInput, modeled: ModeledSpend): ProgramResult {
  const notes: string[] = [];

  const seedAc = modeled.acresByCategory.seedTreatment;
  const herbAc = Math.max(modeled.acresByCategory.preSeedHerb, modeled.acresByCategory.inCropHerb);
  const fungAc = modeled.acresByCategory.fungicide;

  const seedQual = seedAc >= 300;
  const herbQual = herbAc >= 300;
  const fungQual = fungAc >= 300;

  const segments = [seedQual, herbQual, fungQual].filter(Boolean).length;

  let segRate = 0;
  if (segments >= 3) segRate = 0.10;
  else if (segments >= 2) segRate = 0.05;

  if (segments < 2) notes.push("Fewer than 2 qualifying segments at 300 acres: Segment Savings not reached.");
  else notes.push(`Segment Savings applied at ${(segRate*100).toFixed(0)}% for ${segments} qualifying segments.`);

  const eligibleSpend =
    (seedQual ? modeled.byCategory.seedTreatment : 0) +
    (herbQual ? (modeled.byCategory.preSeedHerb + modeled.byCategory.inCropHerb) : 0) +
    (fungQual ? modeled.byCategory.fungicide : 0);

  const estimatedCashback = eligibleSpend * segRate;

  const totalAcres = Math.max(seedAc, herbAc, fungAc);

  return {
    company: "BayerValue (modeled segment savings)",
    estimatedCashback: round2(estimatedCashback),
    estimatedPerAcre: round2(totalAcres ? estimatedCashback / totalAcres : 0),
    notes: [
      ...notes,
      "This MVP does not model Trait Rewards, Pre-burn Tank Mix Bonus, FieldView rewards, or early-book (unless you extend it).",
    ],
    breakdown: [
      { label: "Eligible spend (qualified segments only)", value: eligibleSpend },
      { label: "Segment savings rebate", value: estimatedCashback },
    ],
  };
}
