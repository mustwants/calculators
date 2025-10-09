// PATH: src/MilitaryRetTaxImpactCalculator.jsx
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
 * Military Retirement Tax Impact Calculator
 * Compares annual state income tax on:
 *  - Military retirement pay (state may exempt)
 *  - SBP annuity (state may tax or exempt)
 *  - Wages (flat baseline from dataset)
 * VA disability is excluded in all states in our dataset.
 * Adds property tax for a chosen home value.
 * Planner only.
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

const ALL_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT",
  "NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY",
];

export default function MilitaryRetTaxImpactCalculator() {
  // Up to three target states to compare
  const [stateA, setStateA] = useState("VA");
  const [stateB, setStateB] = useState("FL");
  const [stateC, setStateC] = useState("TX");

  // Income streams
  const [milRetAnnual, setMilRetAnnual] = useState(48_000);
  const [sbpAnnual, setSbpAnnual] = useState(12_000);
  const [wagesAnnual, setWagesAnnual] = useState(40_000);
  const [vaDisabilityAnnual, setVaDisabilityAnnual] = useState(0); // excluded

  // Housing
  const [homeValue, setHomeValue] = useState(450_000);

  const rows = useMemo(() => {
    function evalState(code) {
      const s = getState(code);
      if (!s) return null;

      const incRate = pct(s.incomeTax ?? 0);
      const propRate = pct(s.propertyTax ?? 0);

      // What is taxed by state?
      const retTaxBase = s.militaryRetirementTaxed ? milRetAnnual : 0;
      const sbpTaxBase = s.sbpTaxed ? sbpAnnual : 0;
      const wagesTaxBase = wagesAnnual; // approximated at flat baseline

      const retTax = retTaxBase * incRate;
      const sbpTax = sbpTaxBase * incRate;
      const wagesTax = wagesTaxBase * incRate;
      const vaTax = 0; // modeled as excluded

      const incomeTaxTotal = retTax + sbpTax + wagesTax + vaTax;
      const propertyTax = homeValue * propRate;
      const total = incomeTaxTotal + propertyTax;

      return {
        code,
        name: s.name || code,
        incomeRatePct: s.incomeTax ?? 0,
        propertyRatePct: s.propertyTax ?? 0,
        retTax,
        sbpTax,
        wagesTax,
        incomeTaxTotal,
        propertyTax,
        total,
      };
    }

    const evaluated = [stateA, stateB, stateC]
      .filter(Boolean)
      .map(evalState)
      .filter(Boolean);

    return evaluated;
  }, [stateA, stateB, stateC, milRetAnnual, sbpAnnual, wagesAnnual, vaDisabilityAnnual, homeValue]);

  const chartIncome = rows.map((r) => ({
    State: r.code,
    "Wages tax": Math.round(r.wagesTax),
    "Retirement tax": Math.round(r.retTax),
    "SBP tax": Math.round(r.sbpTax),
  }));

  const chartTotals = rows.map((r) => ({
    State: r.code,
    "Income taxes": Math.round(r.incomeTaxTotal),
    "Property tax": Math.round(r.propertyTax),
    Total: Math.round(r.total),
  }));

  return (
    <div className="max-w-7xl mx-auto my-8 p-6 bg-white rounded-2xl shadow">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-blue-800">🎖️ Military Retirement: State Tax Impact</h1>
        <p className="text-sm text-gray-600">
          Compare estimated annual state taxes on wages, military retirement, SBP, plus property tax.
        </p>
      </header>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* States */}
        <section className="rounded-xl border p-4 space-y-3">
          <h2 className="font-semibold text-gray-800">States</h2>
          <SelectField label="State A" value={stateA} onChange={setStateA} options={ALL_STATES} />
          <SelectField label="State B" value={stateB} onChange={setStateB} options={ALL_STATES} />
          <SelectField label="State C" value={stateC} onChange={setStateC} options={ALL_STATES} />

          <div className="rounded-lg bg-gray-50 p-3 text-xs">
            <p className="font-semibold text-gray-800 mb-1">Dataset rules</p>
            <ul className="space-y-1 text-gray-700 list-disc list-inside">
              <li>Income and property tax are baseline rates from dataset.</li>
              <li>VA disability excluded.</li>
              <li>Retirement and SBP taxed per-state flags.</li>
            </ul>
          </div>
        </section>

        {/* Income */}
        <section className="rounded-xl border p-4 space-y-3">
          <h2 className="font-semibold text-gray-800">Annual Income</h2>
          <NumberField label="Military retirement ($/yr)" value={milRetAnnual} setValue={setMilRetAnnual} min={0} step={500} />
          <NumberField label="SBP annuity ($/yr)" value={sbpAnnual} setValue={setSbpAnnual} min={0} step={250} />
          <NumberField label="Wages ($/yr)" value={wagesAnnual} setValue={setWagesAnnual} min={0} step={1000} />
          <NumberField label="VA disability ($/yr) — excluded" value={vaDisabilityAnnual} setValue={setVaDisabilityAnnual} min={0} step={100} />
        </section>

        {/* Housing */}
        <section className="rounded-xl border p-4 space-y-3">
          <h2 className="font-semibold text-gray-800">Housing</h2>
          <NumberField label="Home value ($)" value={homeValue} setValue={setHomeValue} min={0} step={1000} />
          <div className="rounded-lg bg-gray-50 p-3 text-xs space-y-1">
            {rows.map((r) => (
              <Row key={r.code} label={`Property tax ${r.code}`} value={money(r.propertyTax)} />
            ))}
          </div>
        </section>

        {/* Summary table */}
        <section className="rounded-xl border p-4">
          <h2 className="font-semibold text-gray-800 mb-3">Summary</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 pr-4">State</th>
                  <th className="py-2 pr-4">Income tax %</th>
                  <th className="py-2 pr-4">Property tax %</th>
                  <th className="py-2 pr-4">Income taxes</th>
                  <th className="py-2 pr-4">Property tax</th>
                  <th className="py-2 pr-0">Total</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.code} className="border-b last:border-0">
                    <td className="py-2 pr-4 font-medium">{r.name}</td>
                    <td className="py-2 pr-4">{(r.incomeRatePct ?? 0)}%</td>
                    <td className="py-2 pr-4">{(r.propertyRatePct ?? 0)}%</td>
                    <td className="py-2 pr-4">{money(r.incomeTaxTotal)}</td>
                    <td className="py-2 pr-4">{money(r.propertyTax)}</td>
                    <td className="py-2 pr-0 font-semibold">{money(r.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Charts */}
      <div className="mt-6 grid lg:grid-cols-2 gap-6">
        <div className="h-80 w-full bg-white rounded-xl border p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-2">Income Taxes by Component</h3>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={chartIncome}>
              <XAxis dataKey="State" />
              <YAxis />
              <Tooltip formatter={(v) => money(v)} />
              <Legend />
              <Bar dataKey="Wages tax" />
              <Bar dataKey="Retirement tax" />
              <Bar dataKey="SBP tax" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="h-80 w-full bg-white rounded-xl border p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-2">Totals (Income + Property)</h3>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={chartTotals}>
              <XAxis dataKey="State" />
              <YAxis />
              <Tooltip formatter={(v) => money(v)} />
              <Legend />
              <Bar dataKey="Income taxes" />
              <Bar dataKey="Property tax" />
              <Bar dataKey="Total" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <footer className="mt-6 rounded-lg bg-blue-50 p-4 text-sm text-blue-900">
        Baseline state rates only. Local surtaxes and brackets can change outcomes. Verify with state revenue sites.
      </footer>
    </div>
  );
}

function NumberField({ label, value, setValue, min = 0, max, step = 1 }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        type="number"
        className="mt-1 w-full rounded-md border p-2"
        value={value}
        min={min}
        max={max}
        step={step}
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
