"use client";

import React, { useMemo, useState } from "react";
import type { BudgetLevel, Category, Crop, FarmInput, Province } from "@/lib/types";
import { evaluateAll } from "@/lib/engine/evaluate";
import { money } from "@/lib/engine/utils";

const CROP_OPTIONS: Array<{ value: Crop; label: string }> = [
  { value: "canola", label: "Canola" },
  { value: "wheat", label: "Wheat" },
  { value: "barley", label: "Barley" },
  { value: "oats", label: "Oats" },
  { value: "durum", label: "Durum" },
  { value: "peas", label: "Peas" },
  { value: "lentils", label: "Lentils" },
  { value: "soybeans", label: "Soybeans" },
  { value: "corn", label: "Corn" },
  { value: "sunflowers", label: "Sunflowers" },
  { value: "other", label: "Other" },
];

const CATEGORY_OPTIONS: Array<{ key: Category; label: string; short: string }> = [
  { key: "preSeedHerb", label: "Pre-seed herbicide", short: "Pre" },
  { key: "inCropHerb", label: "In-crop herbicide", short: "In" },
  { key: "fungicide", label: "Fungicide", short: "Fung" },
  { key: "insecticide", label: "Insecticide", short: "Ins" },
  { key: "seedTreatment", label: "Seed treatment", short: "Seed" },
  { key: "biologicalsPGR", label: "Biologicals / PGR", short: "Bio" },
];

const BUDGETS: Array<{ value: BudgetLevel; label: string }> = [
  { value: "low", label: "Low" },
  { value: "med", label: "Med" },
  { value: "high", label: "High" },
];

function defaultPlan(): FarmInput["plans"][number] {
  return {
    crop: "canola",
    acres: 1000,
    intents: {
      preSeedHerb: { enabled: true, budget: "med" },
      inCropHerb: { enabled: true, budget: "med" },
      fungicide: { enabled: true, budget: "low" },
      seedTreatment: { enabled: true, budget: "low" },
      insecticide: { enabled: false, budget: "low" },
      biologicalsPGR: { enabled: false, budget: "low" },
    },
  };
}

function CompactIntentCell({
  enabled,
  budget,
  label,
  onEnabled,
  onBudget,
}: {
  enabled: boolean;
  budget: BudgetLevel;
  label: string;
  onEnabled: (v: boolean) => void;
  onBudget: (v: BudgetLevel) => void;
}) {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <label title={label} style={{ display: "flex", alignItems: "center", gap: 8, margin: 0, whiteSpace: "nowrap" }}>
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => onEnabled(e.target.checked)}
          style={{ width: 16, height: 16 }}
        />
        <span style={{ fontSize: 12, opacity: 0.95 }}>{label}</span>
      </label>
      <select
        value={budget}
        disabled={!enabled}
        onChange={(e) => onBudget(e.target.value as BudgetLevel)}
        style={{ width: 78, padding: "6px 8px" }}
        title="Budget level"
      >
        {BUDGETS.map((b) => (
          <option key={b.value} value={b.value}>
            {b.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function Page() {
  const [province, setProvince] = useState<Province>("SK");
  const [year, setYear] = useState<number>(2026);
  const [earlyPurchase, setEarlyPurchase] = useState<boolean>(false);
  const [bundleFriendly, setBundleFriendly] = useState<boolean>(true);
  const [plans, setPlans] = useState<FarmInput["plans"]>([
    defaultPlan(),
    { ...defaultPlan(), crop: "wheat", acres: 1500 },
    { ...defaultPlan(), crop: "peas", acres: 500, intents: { ...defaultPlan().intents, insecticide: { enabled: true, budget: "low" } } },
  ]);

  const input: FarmInput = useMemo(
    () => ({ province, year, earlyPurchase, bundleFriendly, plans }),
    [province, year, earlyPurchase, bundleFriendly, plans]
  );
  const { modeled, results } = useMemo(() => evaluateAll(input), [input]);

  const totalAcres = useMemo(() => plans.reduce((s, p) => s + (Number(p.acres) || 0), 0), [plans]);

  return (
    <main className="grid" style={{ gap: 18 }}>
      <header className="card">
        <div className="h1">Rebate Optimizer MVP</div>
        <p className="sub">
          Grower-facing calculator (Model B): enter crops + acres + category intent, and we rank program outcomes across companies.
        </p>

        <div className="grid grid3">
          <div>
            <label>Province</label>
            <select value={province} onChange={(e) => setProvince(e.target.value as Province)}>
              <option value="BC">BC</option>
              <option value="AB">AB</option>
              <option value="SK">SK</option>
              <option value="MB">MB</option>
              <option value="ON">ON</option>
              <option value="QC">QC</option>
              <option value="NB">NB</option>
              <option value="NS">NS</option>
              <option value="PE">PE</option>
              <option value="NL">NL</option>
            </select>
          </div>

          <div>
            <label>Program year</label>
            <input type="number" value={year} onChange={(e) => setYear(Number(e.target.value || 2026))} min={2025} max={2030} />
          </div>

          <div>
            <label>Scenario toggles</label>
            <div className="card" style={{ padding: 12 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 10, margin: 0 }}>
                <input type="checkbox" checked={earlyPurchase} onChange={(e) => setEarlyPurchase(e.target.checked)} style={{ width: 18, height: 18 }} />
                Early purchase / early book
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: 10, margin: "10px 0 0" }}>
                <input type="checkbox" checked={bundleFriendly} onChange={(e) => setBundleFriendly(e.target.checked)} style={{ width: 18, height: 18 }} />
                Will coordinate bundles
              </label>

              <div style={{ fontSize: 12, opacity: 0.85, marginTop: 8 }}>
                These affect UPL and early-book logic (and can be extended program-by-program).
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="grid grid2">
        {/* LEFT: compact crop entry */}
        <div className="card">
          <div className="row" style={{ alignItems: "baseline" }}>
            <div>
              <div className="h1" style={{ fontSize: 18, marginBottom: 0 }}>
                Crops & acres
              </div>
              <div className="sub" style={{ marginTop: 6 }}>
                Add 3–4 crops quickly. Toggle intent + budget per crop.
              </div>
            </div>
            <div style={{ maxWidth: 180 }}>
              <button onClick={() => setPlans((p) => [...p, defaultPlan()])}>+ Add crop</button>
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
  {plans.map((p, idx) => (
    <div key={idx} className="cropCard" style={{ marginBottom: 12 }}>
      <div className="cropCardHeader">
        <div className="cropHeaderLeft">
          <div>
            <label>Crop</label>
            <select
              value={p.crop}
              onChange={(e) => {
                const crop = e.target.value as Crop;
                setPlans((arr) => arr.map((x, i) => (i === idx ? { ...x, crop } : x)));
              }}
            >
              {CROP_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Acres</label>
            <div className="acresWrap">
              <input
                type="number"
                value={p.acres}
                min={0}
                onChange={(e) => {
                  const acres = Number(e.target.value || 0);
                  setPlans((arr) => arr.map((x, i) => (i === idx ? { ...x, acres } : x)));
                }}
              />
              <span className="acUnit">ac</span>
            </div>
          </div>
        </div>

        <div className="cropHeaderRight">
          <button
            onClick={() => setPlans((arr) => arr.filter((_, i) => i !== idx))}
            disabled={plans.length === 1}
            className="dangerBtn"
          >
            Remove
          </button>
        </div>
      </div>

      <div className="intentGrid">
        {CATEGORY_OPTIONS.map((cat) => {
          const intent = p.intents?.[cat.key] ?? { enabled: false, budget: "low" as BudgetLevel };
          return (
            <div key={cat.key} className={"intentChip " + (intent.enabled ? "on" : "")} title={cat.label}>
              <label className="intentChipLeft">
                <input
                  type="checkbox"
                  checked={intent.enabled}
                  onChange={(e) => {
                    const enabled = e.target.checked;
                    setPlans((arr) =>
                      arr.map((x, i) =>
                        i === idx
                          ? { ...x, intents: { ...x.intents, [cat.key]: { enabled, budget: intent.budget } } }
                          : x
                      )
                    );
                  }}
                />
                <span>{cat.short}</span>
              </label>

              <select
                value={intent.budget}
                disabled={!intent.enabled}
                onChange={(e) => {
                  const budget = e.target.value as BudgetLevel;
                  setPlans((arr) =>
                    arr.map((x, i) =>
                      i === idx
                        ? { ...x, intents: { ...x.intents, [cat.key]: { enabled: intent.enabled, budget } } }
                        : x
                    )
                  );
                }}
              >
                {BUDGETS.map((b) => (
                  <option key={b.value} value={b.value}>
                    {b.label}
                  </option>
                ))}
              </select>
            </div>
          );
        })}
      </div>
    </div>
  ))}

  <div className="row" style={{ marginTop: 6 }}>
    <div className="pill">
      Total acres: <span className="mono">{totalAcres.toLocaleString()}</span>
    </div>
    <div className="pill">
      Modeled spend: <span className="mono">{money(modeled.total)}</span>
    </div>
  </div>
</div>

        </div>

        {/* RIGHT: show all 5 ranked */}
        <div className="card">
          <div className="h1" style={{ fontSize: 18, marginBottom: 6 }}>
            Ranked results (all companies)
          </div>
          <div className="sub" style={{ marginTop: 0 }}>
            Ranked by estimated cash back. Use “Modeled spend breakdown” to audit inputs.
          </div>

          <div className="grid" style={{ marginTop: 12 }}>
            {results.map((r, i) => (
              <div
                key={r.company}
                className="card"
                style={{
                  background: i === 0 ? "rgba(70,130,255,0.12)" : "rgba(255,255,255,0.04)",
                  borderColor: i === 0 ? "rgba(70,130,255,0.35)" : "rgba(255,255,255,0.10)",
                }}
              >
                <div className="row" style={{ alignItems: "baseline" }}>
                  <div>
                    <div style={{ fontSize: 12, opacity: 0.85 }}>#{i + 1}</div>
                    <div style={{ fontSize: 16, fontWeight: 800 }}>{r.company}</div>
                    <div style={{ fontSize: 12, opacity: 0.85, marginTop: 4 }}>
                      {r.notes.slice(0, 2).join(" • ")}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 12, opacity: 0.85 }}>Estimated cash back</div>
                    <div style={{ fontSize: 18, fontWeight: 900 }}>{money(r.estimatedCashback)}</div>
                    <div style={{ fontSize: 12, opacity: 0.85 }}>{r.estimatedPerAcre.toFixed(2)} / ac</div>
                  </div>
                </div>

                <details style={{ marginTop: 10 }}>
                  <summary style={{ cursor: "pointer", fontWeight: 700, opacity: 0.95 }}>Show breakdown</summary>
                  <table className="table" style={{ marginTop: 10 }}>
                    <thead>
                      <tr>
                        <th>Line item</th>
                        <th>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {r.breakdown.map((b) => (
                        <tr key={b.label}>
                          <td>{b.label}</td>
                          <td className="mono">{money(b.value)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {r.notes.length > 2 && (
                    <div style={{ marginTop: 10, fontSize: 12, opacity: 0.9 }}>
                      <div style={{ fontWeight: 700, marginBottom: 6 }}>Notes</div>
                      <ul style={{ margin: 0, paddingLeft: 18 }}>
                        {r.notes.slice(2).map((n, idx) => (
                          <li key={idx} style={{ marginBottom: 6 }}>
                            {n}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </details>
              </div>
            ))}
          </div>

          <details className="card" style={{ marginTop: 12, background: "rgba(255,255,255,0.04)" }}>
            <summary style={{ cursor: "pointer", fontWeight: 700 }}>Modeled spend breakdown</summary>
            <div style={{ marginTop: 10, opacity: 0.95 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Modeled spend</th>
                    <th>Acres (proxy)</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(modeled.byCategory).map(([k, v]) => (
                    <tr key={k}>
                      <td>{k}</td>
                      <td className="mono">{money(v)}</td>
                      <td className="mono">{Math.round((modeled.acresByCategory as any)[k] || 0).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </div>
      </section>

      <footer className="card" style={{ opacity: 0.9 }}>
        <div style={{ fontWeight: 700, marginBottom: 6 }}>Next improvements (now that you have Excel calculators)</div>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          <li>Import Bayer + UPL Excel tables into versioned JSON rules (so updates are data, not code).</li>
          <li>Add an “Audit mode” that lists every triggered rule, threshold, and cap for each company.</li>
          <li>Add “Exact mode” later (optional): paste product list or upload invoices to match official calculators exactly.</li>
        </ul>
      </footer>
    </main>
  );
}
