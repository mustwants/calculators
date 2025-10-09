// PATH: src/DisabledVetPropertyTaxReliefEstimator.jsx
import React, { useMemo, useState } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { getState } from "./utils/loadStateTaxData.js";

/**
 * Disabled Veteran Property-Tax Relief Estimator
 * Purpose: Estimate annual property-tax savings from state-level disabled-veteran relief.
 * Inputs:
 *  - State (baseline property tax % from dataset)
 *  - Home value
 *  - Assessed value ratio (% of market used by locality, if not 100%)
 *  - Disability rating and inferred relief (string match on dataset comments)
 *  - Manual override: either $ exemption or % exemption of assessed value
 *
 * Notes:
 *  - Dataset provides baseline propertyTax % and a free-text "propertyTaxRelief".
 *  - If “Full exemption” appears and user marks 100% disabled, default to 100% exemption.
 *  - Otherwise default to 0% unless user sets overrides.
 *  - This is a planner. Local rules vary by county and certification status.
 */

function n(x) {
  const v = Number(x);
  return Number.isFinite(v) ? v : 0;
}
function pct(x) {
  const v = Number(x);
  return Number.isFinite(v) ? v / 100 : 0;
}
function money(v) {
  return `$${Math.round(n(v)).toLocaleString()}`;
}

const ALL_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT",
  "NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY",
];

export default function DisabledVetPropertyTaxReliefEstimator() {
  const [stateCode, setStateCode] = useState("VA");
  const meta = getState(stateCode);

  const [homeValue, setHomeValue] = useState(500_000);
  const [assessedRatioPct, setAssessedRatioPct] = useState(100); // many localities use ~100%
  const [disabilityRatingPct, setDisabilityRatingPct] = useState(100);
  const [isSurvivingSpouse, setIsSurvivingSpouse] = useState(false);

  // Manual overrides
  const [overrideType, setOverrideType] = useState("none"); // none | amount | percent
  const [overrideAmount, setOverrideAmount] = useState(0);  // $ off assessed value
  const [overridePercent, setOverridePercent] = useState(0); // % off assessed value

  // Infer a default relief rule from dataset free-text if user is 100% disabled (or surviving spouse flagged).
  const inferred = useMemo(() => {
    const txt = (meta?.veteranBenefits?.propertyTaxRelief || "").toLowerCase();
    const full = /full exemption/.test(txt) || /100%/.test(txt);
    return {
      fullExemptionIf100: full, // suggest full exemption for 100% disabled
      note: meta?.veteranBenefits?.propertyTaxRelief || "No specific note in dataset.",
    };
  }, [meta]);

  // Baseline property tax
  const propRate = pct(meta?.propertyTax ?? 0.85);
  const assessed = homeValue * pct(assessedRatioPct);

  // Determine exemption on assessed value
  let exemptBase = 0;

  if (overrideType === "amount") {
    exemptBase = Math.max(0, Math.min(assessed, overrideAmount));
  } else if (overrideType === "percent") {
    exemptBase = assessed * pct(overridePercent);
  } else {
    // No manual override: apply a simple inference
    if ((disabilityRatingPct >= 100 || isSurvivingSpouse) && inferred.fullExemptionIf100) {
      exemptBase = assessed; // full exemption of assessed value
    } else {
      // Heuristic: if text mentions "partial" or "up to", default to 25% when rating >= 50
      const txt = (meta?.veteranBenefits?.propertyTaxRelief || "").toLowerCase();
      const partialHint = /partial|up to|additional/.test(txt);
      if (partialHint && disabilityRatingPct >= 50) {
        exemptBase = assessed * 0.25;
      } else {
        exemptBase = 0;
      }
    }
  }

  const taxableAssessed = Math.max(0, assessed - exemptBase);
  const baselineAnnualTax = assessed * propRate;
  const relievedAnnualTax = taxableAssessed * propRate;
  const savings = baselineAnnualTax - relievedAnnualTax;

  const chart = [
    { name: "Before relief", value: Math.round(baselineAnnualTax) },
    { name: "After relief", value: Math.round(relievedAnnualTax) },
    { name: "Savings", value: Math.round(savings) },
  ];

  const summary = [
    { k: "State", v: meta?.name || stateCode },
    { k: "Baseline property tax rate", v: `${(meta?.propertyTax ?? 0)}%` },
    { k: "Assessed value", v: money(assessed) },
    { k: "Exempted assessed", v: money(exemptBase) },
    { k: "Taxable assessed", v: money(taxableAssessed) },
    { k: "Annual tax (before)", v: money(baselineAnnualTax) },
    { k: "Annual tax (after)", v: money(relievedAnnualTax) },
    { k: "Annual savings", v: money(savings) },
  ];

  return (
    <div className="max-w-7xl mx-auto my-8 p-6 bg-white rounded-2xl shadow">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-blue-800">🏡 Disabled Veteran Property-Tax Relief</h1>
        <p className="text-sm text-gray-600">
          Estimate property-tax savings using your state baseline and relief heuristics. Verify locally.
        </p>
      </header>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* State & Home */}
        <section className="rounded-xl border p-4 space-y-3">
          <h2 className="font-semibold text-gray-800">State & Home</h2>
          <SelectField label="State" value={stateCode} onChange={setStateCode} options={ALL_STATES} />
          <NumberField label="Home value ($)" value={homeValue} setValue={setHomeValue} min={0} step={1000} />
          <NumberField
            label="Assessed ratio (% of market)"
            value={assessedRatioPct}
            setValue={setAssessedRatioPct}
            min={50}
            max={120}
            step={0.5}
          />
          <div className="rounded-lg bg-gray-50 p-3 text-xs">
            <p className="font-semibold text-gray-800 mb-1">State note</p>
            <p className="text-gray-700">{inferred.note}</p>
          </div>
        </section>

        {/* Eligibility */}
        <section className="rounded-xl border p-4 space-y-3">
          <h2 className="font-semibold text-gray-800">Eligibility</h2>
          <NumberField
            label="VA disability rating (%)"
            value={disabilityRatingPct}
            setValue={setDisabilityRatingPct}
            min={0}
            max={100}
            step={1}
          />
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4 text-blue-600 rounded"
              checked={isSurvivingSpouse}
              onChange={(e) => setIsSurvivingSpouse(e.target.checked)}
            />
            Surviving spouse eligible
          </label>

          <div className="rounded-lg bg-blue-50 p-3 text-xs text-blue-900">
            {inferred.fullExemptionIf100
              ? "Dataset indicates full exemption may apply at 100% rating or surviving spouse."
              : "Dataset does not indicate an automatic full exemption; consider manual overrides below."}
          </div>
        </section>

        {/* Overrides */}
        <section className="rounded-xl border p-4 space-y-3">
          <h2 className="font-semibold text-gray-800">Manual Override (optional)</h2>

          <div className="grid grid-cols-3 gap-2 text-sm">
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="ov"
                className="h-4 w-4 text-blue-600"
                checked={overrideType === "none"}
                onChange={() => setOverrideType("none")}
              />
              None
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="ov"
                className="h-4 w-4 text-blue-600"
                checked={overrideType === "amount"}
                onChange={() => setOverrideType("amount")}
              />
              $ Amount
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="ov"
                className="h-4 w-4 text-blue-600"
                checked={overrideType === "percent"}
                onChange={() => setOverrideType("percent")}
              />
              % of assessed
            </label>
          </div>

          <NumberField
            label="Override amount ($)"
            value={overrideAmount}
            setValue={setOverrideAmount}
            min={0}
            step={1000}
            disabled={overrideType !== "amount"}
          />

          <NumberField
            label="Override percent (%)"
            value={overridePercent}
            setValue={setOverridePercent}
            min={0}
            max={100}
            step={1}
            disabled={overrideType !== "percent"}
          />

          <div className="rounded-lg bg-gray-50 p-3 text-xs space-y-1">
            <Row label="Assessed value" value={money(assessed)} />
            <Row label="Exempted assessed" value={money(exemptBase)} />
            <Row label="Taxable assessed" value={money(taxableAssessed)} />
          </div>
        </section>

        {/* Summary */}
        <section className="rounded-xl border p-4 space-y-2">
          <h2 className="font-semibold text-gray-800">Summary</h2>
          <ul className="text-sm text-gray-700 space-y-1">
            {summary.map((s) => (
              <li key={s.k} className="flex justify-between">
                <span>{s.k}</span>
                <span className="font-semibold">{s.v}</span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-gray-500 mt-2">
            Local exemptions, documentation, and deadlines vary. Confirm with county assessor.
          </p>
        </section>
      </div>

      {/* Chart */}
      <div className="mt-6 h-80 w-full bg-white rounded-xl border p-4">
        <h3 className="text-sm font-semibold text-gray-800 mb-2">Annual Property Tax</h3>
        <ResponsiveContainer width="100%" height="90%">
          <BarChart data={chart}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(v) => money(v)} />
            <Legend />
            <Bar dataKey="value" name="Amount" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <footer className="mt-6 rounded-lg bg-blue-50 p-4 text-sm text-blue-900">
        Planner only. This tool uses a baseline property tax rate and heuristic relief. Always verify with your locality.
      </footer>
    </div>
  );
}

function NumberField({ label, value, setValue, min = 0, max, step = 1, disabled = false }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        type="number"
        className="mt-1 w-full rounded-md border p-2 disabled:bg-gray-100"
        value={value}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        onChange={(e) => setValue(Number(e.target.value))}
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <select
        className="mt-1 w-full rounded-md border p-2 bg-white"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-700">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
