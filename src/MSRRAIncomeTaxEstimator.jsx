// PATH: src/MSRRAIncomeTaxEstimator.jsx
import React, { useMemo, useState } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { listStateOptions, getState } from "./utils/loadStateTaxData.js";

/**
 * MSRRA Income Tax Estimator
 * Purpose: Estimate state income-tax impact for a military family under MSRRA.
 * Assumptions:
 *  - Service member keeps legal residence in Resident State.
 *  - Duty Station State may not tax the spouse if MSRRA applies and residency is maintained.
 *  - Uses dataset incomeTax % as a flat effective rate proxy. This is a planner, not a return.
 * Inputs:
 *  - Resident State, Duty Station State
 *  - Service member taxable wages (state-level)
 *  - Spouse wages
 *  - MSRRA election for spouse (yes/no)
 *  - Checkboxes for state-specific exemptions: military pay exempt, SBP exempt (resident only)
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

export default function MSRRAIncomeTaxEstimator() {
  const states = listStateOptions();
  const [resident, setResident] = useState("VA");
  const [duty, setDuty] = useState("NC");

  const residentMeta = getState(resident);
  const dutyMeta = getState(duty);

  const [memberWages, setMemberWages] = useState(80000);
  const [spouseWages, setSpouseWages] = useState(60000);

  const [spouseClaimsMSRRA, setSpouseClaimsMSRRA] = useState(true);

  // Flags to model common exemptions quickly. Users can toggle to test scenarios.
  const [residentMilitaryPayExempt, setResidentMilitaryPayExempt] = useState(!residentMeta?.militaryRetirementTaxed); // heuristic
  const [residentSBPExempt, setResidentSBPExempt] = useState(!residentMeta?.sbpTaxed);
  const [dutyTaxesNonresidentSpouse, setDutyTaxesNonresidentSpouse] = useState(false); // many states do not if MSRRA applies

  // Optional SBP add-on to show effect of resident taxation vs exemption
  const [annualSBPIncome, setAnnualSBPIncome] = useState(0);

  const rateResident = pct(residentMeta?.incomeTax ?? 0);
  const rateDuty = pct(dutyMeta?.incomeTax ?? 0);

  // Baseline: naive taxes if neither exemption nor MSRRA considered
  const baselineResidentTax =
    (memberWages + spouseWages + annualSBPIncome) * rateResident;

  const baselineDutyTax =
    // model potential dual filing exposure without MSRRA (spouse works in duty state)
    spouseWages * rateDuty;

  // Scenario A: MSRRA applied for spouse. Spouse is treated as resident of Resident State.
  const taxableMemberResident = residentMilitaryPayExempt ? 0 : memberWages;
  const taxableSBPResident = residentSBPExempt ? 0 : annualSBPIncome;

  const scenarioA_residentTax =
    (taxableMemberResident + (spouseClaimsMSRRA ? spouseWages : 0) + taxableSBPResident) *
    rateResident;

  const scenarioA_dutyTax =
    // Most states do not tax nonresident spouse wages when MSRRA applies.
    spouseClaimsMSRRA && !dutyTaxesNonresidentSpouse ? 0 : spouseWages * rateDuty;

  const scenarioA_total = scenarioA_residentTax + scenarioA_dutyTax;

  // Scenario B: No MSRRA for spouse (or lost eligibility). Spouse taxed by duty state.
  const scenarioB_residentTax =
    (taxableMemberResident + 0 + taxableSBPResident) * rateResident;
  const scenarioB_dutyTax = spouseWages * rateDuty;
  const scenarioB_total = scenarioB_residentTax + scenarioB_dutyTax;

  const baselineTotal = baselineResidentTax + baselineDutyTax;

  const chart = [
    { name: "Baseline total", value: Math.round(baselineTotal) },
    { name: "MSRRA total", value: Math.round(scenarioA_total) },
    { name: "No MSRRA total", value: Math.round(scenarioB_total) },
  ];

  const summary = [
    { k: "Resident state", v: residentMeta?.name || resident },
    { k: "Duty station state", v: dutyMeta?.name || duty },
    { k: "Resident rate", v: `${residentMeta?.incomeTax ?? 0}%` },
    { k: "Duty rate", v: `${dutyMeta?.incomeTax ?? 0}%` },
    { k: "Member wages", v: money(memberWages) },
    { k: "Spouse wages", v: money(spouseWages) },
    { k: "SBP income (annual)", v: money(annualSBPIncome) },
    { k: "MSRRA elected for spouse", v: spouseClaimsMSRRA ? "Yes" : "No" },
  ];

  return (
    <div className="max-w-7xl mx-auto my-8 p-6 bg-white rounded-2xl shadow">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-blue-800">🧾 MSRRA Income Tax Estimator</h1>
        <p className="text-sm text-gray-600">
          Estimate state income-tax exposure with or without MSRRA. Flat-rate proxy from dataset. Verify with a tax professional.
        </p>
      </header>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* State selection */}
        <section className="rounded-xl border p-4 space-y-3">
          <h2 className="font-semibold text-gray-800">States</h2>
          <SelectField
            label="Resident state"
            value={resident}
            onChange={setResident}
            options={states}
          />
          <SelectField
            label="Duty station state"
            value={duty}
            onChange={setDuty}
            options={states}
          />
          <div className="rounded-lg bg-gray-50 p-3 text-xs space-y-1">
            <Row label="Resident rate" value={`${residentMeta?.incomeTax ?? 0}%`} />
            <Row label="Duty rate" value={`${dutyMeta?.incomeTax ?? 0}%`} />
          </div>
        </section>

        {/* Incomes */}
        <section className="rounded-xl border p-4 space-y-3">
          <h2 className="font-semibold text-gray-800">Income</h2>
          <NumberField label="Service member wages ($/yr)" value={memberWages} setValue={setMemberWages} min={0} step={1000} />
          <NumberField label="Spouse wages ($/yr)" value={spouseWages} setValue={setSpouseWages} min={0} step={1000} />
          <NumberField label="SBP income ($/yr)" value={annualSBPIncome} setValue={setAnnualSBPIncome} min={0} step={500} />
        </section>

        {/* MSRRA and exemptions */}
        <section className="rounded-xl border p-4 space-y-3">
          <h2 className="font-semibold text-gray-800">MSRRA & Exemptions</h2>
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4 text-blue-600 rounded"
              checked={spouseClaimsMSRRA}
              onChange={(e) => setSpouseClaimsMSRRA(e.target.checked)}
            />
            Spouse claims MSRRA and maintains resident-state domicile
          </label>

          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4 text-blue-600 rounded"
              checked={residentMilitaryPayExempt}
              onChange={(e) => setResidentMilitaryPayExempt(e.target.checked)}
            />
            Resident state exempts (most) military pay
          </label>

          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4 text-blue-600 rounded"
              checked={residentSBPExempt}
              onChange={(e) => setResidentSBPExempt(e.target.checked)}
            />
            Resident state exempts SBP
          </label>

          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4 text-blue-600 rounded"
              checked={dutyTaxesNonresidentSpouse}
              onChange={(e) => setDutyTaxesNonresidentSpouse(e.target.checked)}
            />
            Duty state taxes nonresident spouse even with MSRRA
          </label>

          <div className="rounded-lg bg-blue-50 p-3 text-xs text-blue-900">
            MSRRA generally shields nonresident spouse wages in the duty state if domicile remains in the resident state.
            Always check current state rules.
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
          <div className="rounded-lg bg-gray-50 p-3 text-xs space-y-1 mt-2">
            <Row label="Baseline total tax" value={money(baselineTotal)} />
            <Row label="MSRRA total tax" value={money(scenarioA_total)} />
            <Row label="No MSRRA total tax" value={money(scenarioB_total)} />
          </div>
        </section>
      </div>

      {/* Chart */}
      <div className="mt-6 h-80 w-full bg-white rounded-xl border p-4">
        <h3 className="text-sm font-semibold text-gray-800 mb-2">Annual State Income Tax</h3>
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
        Planner only. Uses flat effective rates from dataset. Not tax advice.
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
        {options.map(({ code, name }) => (
          <option key={code} value={code}>
            {name}
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
