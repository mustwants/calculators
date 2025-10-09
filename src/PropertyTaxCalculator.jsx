// PATH: src/PropertyTaxCalculator.jsx
import React, { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { listStateOptions, getState } from "./utils/loadStateTaxData";

/**
 * Property Tax Calculator — State + Veteran-aware
 * - Prefills effective state rate. Optional county override.
 * - Models homestead and veteran exemptions as % or $ off assessed value.
 * - Supports assessed ratio (assessment = ratio × market value).
 * - Shows annual vs monthly burden and visual breakdown.
 * - Planner only. Rates vary by locality.
 */

function n(x) {
  const v = Number(x);
  return Number.isFinite(v) ? v : 0;
}
function pct(x) {
  const v = Number(x);
  return Number.isFinite(v) ? v / 100 : 0;
}
function money(x) {
  return `$${Math.round(n(x)).toLocaleString()}`;
}

export default function PropertyTaxCalculator() {
  // State dataset
  const states = useMemo(() => listStateOptions(), []);
  const [stateCode, setStateCode] = useState("VA");
  const stateMeta = getState(stateCode);

  // Prefill baseline effective rate and assessment ratio if present
  const inferredRate =
    stateMeta?.tax?.property?.effectiveRatePct ??
    stateMeta?.tax?.property?.notes?.defaultRatePct ??
    1.00;

  const inferredAssessRatio =
    stateMeta?.tax?.property?.assessmentRatioPct ??
    stateMeta?.tax?.property?.notes?.assessmentRatioPct ??
    100;

  // Inputs
  const [homeValue, setHomeValue] = useState(450_000);
  const [effectiveRatePct, setEffectiveRatePct] = useState(inferredRate); // % of assessed value
  const [assessmentRatioPct, setAssessmentRatioPct] = useState(inferredAssessRatio); // % of market
  const [countyRateOverridePct, setCountyRateOverridePct] = useState(""); // optional add/sub

  // Exemptions
  const [homesteadPct, setHomesteadPct] = useState(0); // % off assessed value
  const [homesteadDollar, setHomesteadDollar] = useState(0); // $ off assessed value
  const [veteranPct, setVeteranPct] = useState(0); // % off assessed value
  const [veteranDollar, setVeteranDollar] = useState(0); // $ off assessed value
  const [capMonthlyOutput, setCapMonthlyOutput] = useState(false);

  // Derived assessed base
  const assessedBase = n(homeValue) * pct(assessmentRatioPct);

  // Apply exemptions
  const pctExemption =
    clampPct(homesteadPct) + clampPct(veteranPct); // simple additive percent cap at 100%
  const assessedAfterPct = Math.max(0, assessedBase * (1 - pct(pctExemption)));

  const assessedAfterDollar = Math.max(
    0,
    assessedAfterPct - n(homesteadDollar) - n(veteranDollar)
  );

  // Rate with county override
  const finalRatePct =
    n(effectiveRatePct) + (countyRateOverridePct === "" ? 0 : Number(countyRateOverridePct));

  const annualTax = Math.max(0, assessedAfterDollar * pct(finalRatePct));
  const monthlyTax = annualTax / 12;

  // For visuals
  const exemptionDollars = Math.max(0, assessedBase - assessedAfterDollar);
  const taxableAssessed = Math.max(0, assessedAfterDollar);

  const pieData = [
    { name: "Taxable assessed value", value: taxableAssessed },
    { name: "Exemptions (assessed)", value: exemptionDollars },
  ].filter((x) => x.value > 0);

  const barData = [
    { name: "Annual property tax", value: annualTax },
    { name: "Monthly property tax", value: monthlyTax },
  ];

  // Utility
  function clampPct(p) {
    const v = Math.max(0, Math.min(100, Number(p) || 0));
    return v;
  }

  // Handle state change and re-prefill rate/ratio
  function onChangeState(code) {
    setStateCode(code);
    const meta = getState(code);
    const nextRate =
      meta?.tax?.property?.effectiveRatePct ??
      meta?.tax?.property?.notes?.defaultRatePct ??
      effectiveRatePct;
    const nextAssessRatio =
      meta?.tax?.property?.assessmentRatioPct ??
      meta?.tax?.property?.notes?.assessmentRatioPct ??
      assessmentRatioPct;
    setEffectiveRatePct(Number(nextRate));
    setAssessmentRatioPct(Number(nextAssessRatio));
  }

  return (
    <div className="max-w-6xl mx-auto my-8 p-6 bg-white rounded-2xl shadow">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-blue-800">📊 Property Tax Calculator</h1>
        <p className="text-sm text-gray-600">
          State- and veteran-aware property tax estimate with exemptions and assessment ratio.
        </p>
      </header>

      <div className="grid xl:grid-cols-4 gap-6">
        {/* State & Setup */}
        <section className="rounded-xl border p-4 space-y-3">
          <h2 className="font-semibold text-gray-800">State & Setup</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700">State</label>
            <select
              className="mt-1 w-full rounded-md border p-2 bg-white"
              value={stateCode}
              onChange={(e) => onChangeState(e.target.value)}
            >
              {states.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Home value ($)</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border p-2"
                value={homeValue}
                min={10_000}
                onChange={(e) => setHomeValue(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Assessment ratio (% of value)</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border p-2"
                value={assessmentRatioPct}
                min={1}
                max={100}
                step="0.5"
                onChange={(e) => setAssessmentRatioPct(Number(e.target.value))}
              />
              <p className="mt-1 text-xs text-gray-500">Some states assess below 100% of market.</p>
            </div>
          </div>
        </section>

        {/* Rates */}
        <section className="rounded-xl border p-4 space-y-3">
          <h2 className="font-semibold text-gray-800">Rates</h2>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Effective state rate (% of assessed)</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border p-2"
                value={effectiveRatePct}
                min={0}
                max={5}
                step="0.01"
                onChange={(e) => setEffectiveRatePct(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">County override (±% pts)</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border p-2"
                value={countyRateOverridePct}
                placeholder="e.g. 0.25 or -0.10"
                onChange={(e) => setCountyRateOverridePct(e.target.value)}
              />
              <p className="mt-1 text-xs text-gray-500">Optional add/subtract to state rate.</p>
            </div>
          </div>

          <div className="rounded-lg bg-gray-50 p-3 text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-700">Assessed base</span>
              <span className="font-semibold">{money(assessedBase)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Final effective rate</span>
              <span className="font-semibold">{(finalRatePct).toFixed(2)}%</span>
            </div>
          </div>
        </section>

        {/* Exemptions */}
        <section className="rounded-xl border p-4 space-y-3">
          <h2 className="font-semibold text-gray-800">Exemptions</h2>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Homestead (% of assessed)</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border p-2"
                value={homesteadPct}
                min={0}
                max={100}
                step="0.5"
                onChange={(e) => setHomesteadPct(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Homestead ($)</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border p-2"
                value={homesteadDollar}
                min={0}
                step="500"
                onChange={(e) => setHomesteadDollar(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Veteran (% of assessed)</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border p-2"
                value={veteranPct}
                min={0}
                max={100}
                step="0.5"
                onChange={(e) => setVeteranPct(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Veteran ($)</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border p-2"
                value={veteranDollar}
                min={0}
                step="500"
                onChange={(e) => setVeteranDollar(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="capmo"
              type="checkbox"
              className="h-4 w-4"
              checked={capMonthlyOutput}
              onChange={(e) => setCapMonthlyOutput(e.target.checked)}
            />
            <label htmlFor="capmo" className="text-sm text-gray-700">
              Show monthly output only in summary
            </label>
          </div>

          <div className="rounded-lg bg-gray-50 p-3 text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-700">Assessed after exemptions</span>
              <span className="font-semibold">{money(assessedAfterDollar)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Total exemptions (assessed)</span>
              <span className="font-semibold">{money(exemptionDollars)}</span>
            </div>
          </div>
        </section>

        {/* Output */}
        <section className="rounded-xl border p-4 space-y-3">
          <h2 className="font-semibold text-gray-800">Output</h2>

          <div className="rounded-lg bg-blue-50 p-3 text-sm space-y-1">
            {!capMonthlyOutput && (
              <div className="flex justify-between">
                <span className="text-blue-900">Annual property tax</span>
                <span className="font-semibold text-blue-900">{money(annualTax)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-blue-900">Monthly property tax</span>
              <span className="font-semibold text-blue-900">{money(monthlyTax)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-900">Final rate applied</span>
              <span className="font-semibold text-blue-900">{finalRatePct.toFixed(2)}%</span>
            </div>
          </div>

          <p className="text-xs text-gray-500">
            Local millage, school, or special district levies can change totals. Verify with county.
          </p>
        </section>
      </div>

      {/* Visuals */}
      <div className="mt-6 grid lg:grid-cols-2 gap-6">
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip formatter={(v) => money(v)} />
              <Legend />
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                innerRadius="45%"
                outerRadius="70%"
                paddingAngle={2}
              >
                {pieData.map((_, i) => (
                  <Cell key={i} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(v) => money(v)} />
              <Legend />
              <Bar dataKey="value" name="Amount" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <footer className="mt-6 rounded-lg bg-blue-50 p-4 text-sm text-blue-900">
        <ul className="list-disc pl-5 space-y-1">
          <li>Some states offer 100% exemptions for qualified disabled veterans. Use the %/$ fields to reflect it.</li>
          <li>Assessment ratios vary. Enter your local ratio if not 100%.</li>
          <li>This is an estimate. Confirm with your county tax assessor.</li>
        </ul>
      </footer>
    </div>
  );
}
