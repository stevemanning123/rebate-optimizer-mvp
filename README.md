import type { FarmInput, ModeledSpend, ProgramResult } from "@/lib/types";
import { round2 } from "@/lib/engine/utils";

/**
 * UPL (from provided table image) is modeled as:
 * - Base Rewards: 5% when category acres >= 300 (in-season)
 * - Smart Buy Rewards: 15% when earlyPurchase=true AND category acres >= 300
 * - Bundle-style top-ups when bundleFriendly=true:
 *   - If seedTreatment + (fungicide OR biologicalsPGR) both >= 300 acres => +15% on fungicide/biostim buckets (capped)
 *   - If multiple categories selected (>=3) => +5% on eligible buckets (proxy for Interline/Select & similar bonuses)
 * - Category maximums (from bottom row): Herb 25, Fung 25, Insect 25, SeedTreat 20, Bio/PGR 25
 *
 * This is a conservative "optimizer-friendly" approximation.
 */
export function evalUPL(input: FarmInput, modeled: ModeledSpend): ProgramResult {
  const notes: string[] = [];

  const baseRate = 0.05;
  const smartRate = 0.15;

  const herbAc = Math.max(modeled.acresByCategory.preSeedHerb, modeled.acresByCategory.inCropHerb);
  const fungAc = modeled.acresByCategory.fungicide;
  const insAc = modeled.acresByCategory.insecticide;
  const seedAc = modeled.acresByCategory.seedTreatment;
  const bioAc = modeled.acresByCategory.biologicalsPGR;

  const herbQual = herbAc >= 300;
  const fungQual = fungAc >= 300;
  const insQual = insAc >= 300;
  const seedQual = seedAc >= 300;
  const bioQual = bioAc >= 300;

  const baseOrSmart = input.earlyPurchase ? smartRate : baseRate;
  if (input.earlyPurchase) notes.push("Early purchase toggle ON: Smart Buy rates used where qualified.");
  else notes.push("Early purchase toggle OFF: Base rates used where qualified.");

  const herbSpend = herbQual ? (modeled.byCategory.preSeedHerb + modeled.byCategory.inCropHerb) : 0;
  const fungSpend = fungQual ? modeled.byCategory.fungicide : 0;
  const insSpend = insQual ? modeled.byCategory.insecticide : 0;
  const seedSpend = seedQual ? modeled.byCategory.seedTreatment : 0;
  const bioSpend = bioQual ? modeled.byCategory.biologicalsPGR : 0;

  // Base payouts
  let herbPay = herbSpend * baseOrSmart;
  let fungPay = fungSpend * baseOrSmart;
  let insPay = insSpend * baseOrSmart;
  let seedPay = seedSpend * baseOrSmart;
  let bioPay = bioSpend * baseOrSmart;

  // Bundle top-ups
  const selectedCats = [herbQual, fungQual, insQual, seedQual, bioQual].filter(Boolean).length;

  if (input.bundleFriendly) {
    if (seedQual && (fungQual || bioQual)) {
      // top-up on fungicide/biostim buckets
      const topUp = 0.15;
      fungPay += fungSpend * topUp;
      bioPay += bioSpend * topUp;
      notes.push("Bundle-friendly: Seed Treatment + Fungicide/Biostimulant top-up applied (+15% on fungicide/biostim).");
    }
    if (selectedCats >= 3) {
      const bonus = 0.05;
      herbPay += herbSpend * bonus;
      fungPay += fungSpend * bonus;
      insPay += insSpend * bonus;
      seedPay += seedSpend * bonus;
      bioPay += bioSpend * bonus;
      notes.push("Bundle-friendly: Multi-category bonus applied (+5% proxy).");
    }
  } else {
    notes.push("Bundle-friendly toggle OFF: no bundle top-ups modeled.");
  }

  // Cap by category maximums
  const cap = (pay: number, spend: number, maxPct: number) => Math.min(pay, spend * maxPct);

  herbPay = cap(herbPay, herbSpend, 0.25);
  fungPay = cap(fungPay, fungSpend, 0.25);
  insPay = cap(insPay, insSpend, 0.25);
  seedPay = cap(seedPay, seedSpend, 0.20);
  bioPay = cap(bioPay, bioSpend, 0.25);

  const estimatedCashback = herbPay + fungPay + insPay + seedPay + bioPay;
  const totalAcres = Math.max(herbAc, fungAc, insAc, seedAc, bioAc);

  return {
    company: "UPL (modeled)",
    estimatedCashback: round2(estimatedCashback),
    estimatedPerAcre: round2(totalAcres ? estimatedCashback / totalAcres : 0),
    notes,
    breakdown: [
      { label: "Herbicides payout", value: herbPay },
      { label: "Fungicides payout", value: fungPay },
      { label: "Insecticides payout", value: insPay },
      { label: "Seed treatments payout", value: seedPay },
      { label: "Biostimulants/PGR payout", value: bioPay },
    ],
  };
}
