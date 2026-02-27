import type { Category, Crop, FarmInput, ModeledSpend, CropModeledSpend } from "@/lib/types";
import { spendPerAcre } from "@/lib/assumptions/spendPerAcre";

const ALL_CATEGORIES: Category[] = [
  "preSeedHerb",
  "inCropHerb",
  "fungicide",
  "insecticide",
  "seedTreatment",
  "biologicalsPGR",
  "seedTrait",
];

function emptySpend(): CropModeledSpend {
  const byCategory: Record<Category, number> = Object.fromEntries(ALL_CATEGORIES.map((c) => [c, 0])) as any;
  const acresByCategory: Record<Category, number> = Object.fromEntries(ALL_CATEGORIES.map((c) => [c, 0])) as any;
  return { byCategory, acresByCategory, total: 0 };
}

export function modelFarmSpend(input: FarmInput): ModeledSpend {
  const overall = emptySpend();
  const byCrop: Partial<Record<Crop, CropModeledSpend>> = {};

  for (const plan of input.plans) {
    const cropAssumptions = spendPerAcre[plan.crop] ?? spendPerAcre.other;

    if (!byCrop[plan.crop]) byCrop[plan.crop] = emptySpend();
    const cropBucket = byCrop[plan.crop]!;

    for (const cat of ALL_CATEGORIES) {
      const intent = plan.intents?.[cat];
      if (!intent?.enabled) continue;

      const budget = intent.budget;
      const perAcre = cropAssumptions?.[cat]?.[budget];

      // If we don't have a per-acre assumption for this crop/category, treat as 0 (safe default)
      const dollars = (perAcre ?? 0) * plan.acres;

      overall.byCategory[cat] += dollars;
      overall.acresByCategory[cat] += plan.acres;

      cropBucket.byCategory[cat] += dollars;
      cropBucket.acresByCategory[cat] += plan.acres;
    }
  }

  overall.total = Object.values(overall.byCategory).reduce((a, b) => a + b, 0);

  for (const c of Object.keys(byCrop) as Crop[]) {
    byCrop[c]!.total = Object.values(byCrop[c]!.byCategory).reduce((a, b) => a + b, 0);
  }

  return { ...overall, byCrop };
}
