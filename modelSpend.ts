export type Province = "AB" | "SK" | "MB" | "BC" | "ON" | "QC" | "NB" | "NS" | "PE" | "NL";

export type BudgetLevel = "low" | "med" | "high";

export type Category =
  | "preSeedHerb"
  | "inCropHerb"
  | "fungicide"
  | "insecticide"
  | "seedTreatment"
  | "biologicalsPGR"
  | "seedTrait"; // optional toggle for Bayer-like trait/seed programs

export type Crop =
  | "canola"
  | "wheat"
  | "barley"
  | "oats"
  | "durum"
  | "peas"
  | "lentils"
  | "soybeans"
  | "corn"
  | "sunflowers"
  | "other";

export type CropPlan = {
  crop: Crop;
  acres: number;
  intents: Partial<Record<Category, { enabled: boolean; budget: BudgetLevel }>>;
};

export type FarmInput = {
  province: Province;
  year: number;
  earlyPurchase: boolean;   // generic toggle for programs with early-book incentives
  bundleFriendly: boolean;  // user indicates they are willing to coordinate product choices to hit bundles
  plans: CropPlan[];
};

export type CropModeledSpend = {
  byCategory: Record<Category, number>;
  total: number;
  acresByCategory: Record<Category, number>;
};

export type ModeledSpend = CropModeledSpend & {
  byCrop: Partial<Record<Crop, CropModeledSpend>>;
};

export type ProgramResult = {
  company: string;
  estimatedCashback: number;
  estimatedPerAcre: number;
  notes: string[];
  breakdown: Array<{ label: string; value: number }>;
};
