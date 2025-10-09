// PATH: src/PCSStateTaxImpactCalculator.jsx
import React, { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { getState } from "./utils/loadStateTaxData.js";

/**
 * PCS State Tax Impact Calculator
 * Compare annual state tax impact when moving from one state to another.
 * Inputs:
 *  - Household taxable income (wages)
 *  - Property value
 *  - Military retirement pay (if applicable)
 *  - SBP annuity (if applicable)
 *  - VA disability (excluded in all states in our dataset)
 * Notes:
 *  - Uses baseline state income tax % and property tax % from dataset.
 *  - Treats "militaryRetirementTaxed" and "sbpTaxed" flags for inclusion.
 *  - Approximates state tax on wages as flat rate from dataset. This is a planner, not advice.
 */

function n(x) {
  const v = Number(x);
  return Number.isFinite(v) ? v : 0;
}
function pct(p) {
  const v = Number(p);
  return Number.isFinite(v) ? v / 100 : 0;
}
function money(v) {
  return `$${Math.round(n(v)).toLocaleString()}`;
}

export default function PCSStateTaxImpactCalculator() {
  // States
  const [fromCode, setFromCode] = useState("VA");
  const [toCode, setToCode] = useState("FL");

  // Income
  const [wages, setWages] = useState(120_000);

  // Housing
  const [homeValue, setHomeValue] = useState(500_000);

  // Military income streams
  const [hasMilRet, setHasMilRet] = useState(true);
  const [milRetAnnual, setMilRetAnnual] = useState(48_000);

  const [hasSBP, setHasSBP] = useState(false);
  const [sbpAnnual, setSbpAnnual] = useState(18_000);

  const [vaDisabilityAnnual, setVaDisabilityAnnual] = useState(0); // not taxed by any state in our dataset

  // Local maps
  const FROM = getState(fromCode);
  const TO = getState(toCode);

  const calc = useMemo(() => {
    function stateTaxes(codeMeta) {
      if (!codeMeta) return { income: 0, property: 0, total: 0, details: {} };

      const rate = pct(codeMeta.incomeTax ?? 0);
      const propRate = pct(codeMeta.propertyTax ?? 0);

      // Taxable bases
      const wageTax = wages * rate;

      const retTaxBase = hasMilRet && codeMeta.militaryRetirementTaxed ? milRetAnnual : 0;
      const retTax = retTaxBase * rate;

      const sbpTaxBase = hasSBP && codeMeta.sbpTaxed ? sbpAnnual : 0;
      const sbpTax = sbpTaxBase * rate;

      // VA disability excluded (modeled as zero)
      const vaTax = 0;

      // Property tax
      const propertyTax = homeValue * propRate;

      const incomeTotal = wageTax + retTax + sbpTax + vaTax;
      const total = incomeTotal + propertyTax;

      return {
        income: incomeTotal,
        property: propertyTax,
        total,
        details: {
          wageTax,
          retTax,
          sbpTax,
          vaTax,
          propRate,
          rate,
        },
      };
    }

    const from = stateTaxes(FROM);
    const to = stateTaxes(TO);

    const delta = {
      income: to.income - from.income,
      property: to.property - from.property,
      total: to.total - from.total,
    };

    return { from, to, delta };
  }, [
    FROM,
    TO,
    wages,
    homeValue,
    hasMilRet,
    milRetAnnual,
    hasSBP,
    sbpAnnual,
    vaDisabilityAnnual, // kept for completeness
  ]);

  const chartData = [
    { name: "Income tax", From: Math.round(calc.from.income), To: Math.round(calc.to.income) },
    { name: "Property tax", From: Math.round(calc.from.property), To: Math.round(calc.to.property) },
    { name: "Total", From: Math.round(calc.from.total), To: Math.round(calc.to.total) },
  ];

  const states = [
    "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY",
  ];

  return (
    <div className="max-w-7xl mx-auto my-8 p-6 bg-white rounded-2xl shadow">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-blue-800">🚚 PCS State Tax Impact</h1>
        <p className="text-sm text-gray-600">
          Compare baseline state income and property taxes for a PCS move.
        </p>
      </header>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* From/To */}
        <section className="rounded-xl border p-4 space-y-3">
          <h2 className="font-semibold text-gray-800">States</h2>
          <SelectField label="From" value={fromCode} onChange={setFromCode} options={states} />
          <SelectField label="To" value={toCode} onChange={setToCode} options={states} />

          <div className="rounded-lg bg-gray-50 p-3 text-xs space-y-1">
            <Row label="From income tax %" value={`${FROM?.incomeTax ?? 0}%`} />
            <Row label="From property tax %" value={`${FROM?.propertyTax ?? 0}%`} />
            <Row label="To income tax %" value={`${TO?.incomeTax ?? 0}%`} />
            <Row label="To property tax %" value={`${TO?.propertyTax ?? 0}%`} />
          </div>
        </section>

        {/* Income */}
        <section className="rounded-xl border p-4 space-y-3">
          <h2 className="font-semibold text-gray-800">Income</h2>
          <NumberField label="Household wages ($/yr)" value={wages} setValue={setWages} min={0} step={1000} />

          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4 text-blue-600 rounded"
              checked={hasMilRet}
              onChange={(e) => setHasMilRet(e.target.checked)}
            />
            Military retirement pay
          </label>
          <NumberField
            label="Military retirement ($/yr)"
            value={milRetAnnual}
            setValue={setMilRetAnnual}
            min={0}
            step={500}
            disabled={!hasMilRet}
          />

          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4 text-blue-600 rounded"
              checked={hasSBP}
              onChange={(e) => setHasSBP(e.target.checked)}
            />
            SBP annuity
          </label>
          <NumberField
            label="SBP annuity ($/yr)"
            value={sbpAnnual}
            setValue={setSbpAnnual}
            min={0}
            step={500}
            disabled={!hasSBP}
          />

          <NumberField
            label="VA disability ($/yr) — excluded"
            value={vaDisabilityAnnual}
            setValue={setVaDisabilityAnnual}
            min={0}
            step={100}
          />
        </section>

        {/* Housing */}
        <section className="rounded-xl border p-4 space-y-3">
          <h2 className="font-semibold text-gray-800">Housing</h2>
          <NumberField label="Home value ($)" value={homeValue} setValue={setHomeValue} min={0} step={1000} />

          <div className="rounded-lg bg-gray-50 p-3 text-xs space-y-1">
            <Row label="From property tax (est.)" value={money(calc.from.property)} />
            <Row label="To property tax (est.)" value={money(calc.to.property)} />
          </div>
        </section>

        {/* Summary */}
        <section className="rounded-xl border p-4 space-y-2">
          <h2 className="font-semibold text-gray-800">Summary</h2>
          <ul className="text-sm text-gray-700 space-y-1">
            <li className="flex justify-between">
              <span>From total (annual)</span>
              <span className="font-semibold">{money(calc.from.total)}</span>
            </li>
            <li className="flex justify-between">
              <span>To total (annual)</span>
              <span className="font-semibold">{money(calc.to.total)}</span>
            </li>
            <li className="flex justify-between">
              <span>Δ Income taxes</span>
              <span className="font-semibold">{money(calc.delta.income)}</span>
            </li>
            <li className="flex justify-between">
              <span>Δ Property taxes</span>
              <span className="font-semibold">{money(calc.delta.property)}</span>
            </li>
            <li className="flex justify-between">
              <span>Δ Total</span>
              <span className={`font-semibold ${calc.delta.total <= 0 ? "text-green-700" : "text-red-700"}`}>
                {money(calc.delta.total)}
              </span>
            </li>
          </ul>
          <p className="text-xs text-gray-500 mt-2">
            Baseline rates only. State brackets, local levies, and exemptions can change results.
          </p>
        </section>
      </div>

      {/* Chart */}
      <div className="mt-6 h-80 w-full bg-white rounded-xl border p-4">
        <h3 className="text-sm font-semibold text-gray-800 mb-2">Annual Taxes: From vs To</h3>
        <ResponsiveContainer width="100%" height="90%">
          <BarChart data={chartData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(v) => money(v)} />
            <Legend />
            <Bar dataKey="From" />
            <Bar dataKey="To" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <footer className="mt-6 rounded-lg bg-blue-50 p-4 text-sm text-blue-900">
        Estimates only. Verify with state revenue and county assessor. Planner, not advice.
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
