import type { FarmInput, ProgramResult } from "@/lib/types";
import { modelFarmSpend } from "./modelSpend";
import { evalFMC } from "@/lib/programs/fmc";
import { evalBayer } from "@/lib/programs/bayer";
import { evalBASF } from "@/lib/programs/basf";
import { evalUPL } from "@/lib/programs/upl";
import { evalSyngentaWCU } from "@/lib/programs/syngenta";

export function evaluateAll(input: FarmInput): { modeled: ReturnType<typeof modelFarmSpend>, results: ProgramResult[] } {
  const modeled = modelFarmSpend(input);

  const results: ProgramResult[] = [
    evalFMC(modeled),
    evalBayer(input, modeled),
    evalBASF(modeled),
    evalUPL(input, modeled),
    evalSyngentaWCU(input, modeled),
  ].sort((a, b) => b.estimatedCashback - a.estimatedCashback);

  return { modeled, results };
}
