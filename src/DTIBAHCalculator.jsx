// PATH: src/DTIBAHCalculator.jsx
import React, { useMemo, useState } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { listStateOptions } from "./utils/loadStateTaxData";

/**
 * DTI + BAH Calculator
 * - Computes front-end (housing) and back-end DTI.
 * - Allows BAH and non-taxable allowances to improve qualifying income via gross-up.
 * - Outputs max affordable P&I target for 28% / 36% rules and custom targets.
 */

function monthly(num) {
  return Math.max(0, Number(num) || 0);
}
function pct(num) {
  const n = Number(num);
  return Number.isFinite(n) ? Math.max(0, n) / 100 : 0;
}

export default function DTIBAHCalculator() {
  // Context (state is informational only here)
  const states = useMemo(() => listStateOptions(), []);
  const [stateCode, setStateCode] = useState("VA");

  // Income
  const [basePayMonthly, setBasePayMonthly] = useState(6500);
  const [bahMonthly, setBahMonthly] = useState(2400);
  const [basMonthly, setBasMonthly] = useState(450);
  const [otherTaxableMonthly, setOtherTaxableMonthly] = useState(0);
  const [otherNontaxMonthly, setOtherNontaxMonthly] = useState(0);
  const [grossUpPct, setGrossUpPct] = useState(25); // common lender gross-up for non-taxable

  // Debts
  const [minDebtPmtMonthly, setMinDebtPmtMonthly] = useState(350); // credit cards, auto, loans
  const [studentLoansMonthly, setStudentLoansMonthly] = useState(0);
  const [alimonyChildSupportMonthly, setAlimonyChildSupportMonthly] = useState(0);

  // Housing targets
  const [estTaxesMonthly, setEstTaxesMonthly] = useState(450); // escrowed taxes
  const [estInsuranceMonthly, setEstInsuranceMonthly] = useState(125); // HOI
  const [hoaMonthly, setHoaMonthly] = useState(0);
  const [targetFrontPct, setTargetFrontPct] = useState(28);
  const [targetBackPct, setTargetBackPct] = useState(36);

  // Derived income
  const taxableIncome = monthly(basePayMonthly) + monthly(otherTaxableMonthly);
  const nonTaxable = monthly(bahMonthly) + monthly(basMonthly) + monthly(otherNontaxMonthly);
  const grossUpFactor = 1 + pct(grossUpPct);
  const qualifyingIncome = taxableIncome + nonTaxable * grossUpFactor;

  // Debts
  const recurringDebts = monthly(minDebtPmtMonthly) + monthly(studentLoansMonthly) + monthly(alimonyChildSupportMonthly);

  // Escrowed components
  const escrows = monthly(estTaxesMonthly) + monthly(estInsuranceMonthly) + monthly(hoaMonthly);

  // DTI current (if user enters a trial P&I)
  const [trialPI, setTrialPI] = useState(2200);
  const housingPmt = monthly(trialPI) + escrows;
  const frontDTI = qualifyingIncome > 0 ? (housingPmt / qualifyingIncome) * 100 : 0;
  const backDTI = qualifyingIncome > 0 ? ((housingPmt + recurringDebts) / qualifyingIncome) * 100 : 0;

  // Max affordable P&I from front/back targets
  const maxHousingByFront = Math.max(0, qualifyingIncome * pct(targetFrontPct));
  const maxHousingByBack = Math.max(0, qualifyingIncome * pct(targetBackPct) - recurringDebts);
  const maxPIFront = Math.max(0, maxHousingByFront - escrows);
  const maxPIBack = Math.max(0, maxHousingByBack - escrows);
  const conservativePI = Math.min(maxPIFront, maxPIBack);

  const chartData = [
    { name: "Qualifying Income", value: Math.round(qualifyingIncome) },
    { name: "Escrows", value: Math.round(escrows) },
    { name: "Debts", value: Math.round(recurringDebts) },
    { name: "Trial P&I", value: Math.round(trialPI) },
    { name: "Housing Pmt", value: Math.round(housingPmt) }
  ];

  return (
    <div className="max-w-6xl mx-auto my-8 p-6 bg-white rounded-2xl shadow">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-blue-800">💰📊 DTI + BAH</h1>
        <p className="text-sm text-gray-600">
          Grosses up non-taxable allowances (BAH/BAS) for underwriting. Shows front and back DTI and max affordable P&amp;I.
        </p>
      </header>

      <div className="grid xl:grid-cols-4 gap-6">
        {/* Context */}
        <section className="rounded-xl border p-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">State (context)</label>
            <select
              className="mt-1 w-full rounded-md border p-2 bg-white"
              value={stateCode}
              onChange={(e) => setStateCode(e.target.value)}
            >
              {states.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">Used across tools for consistency. No state tax applied here.</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Gross-up Non-taxable (%)</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border p-2"
                value={grossUpPct}
                min={0}
                max={35}
                step="1"
                onChange={(e) => setGrossUpPct(Number(e.target.value))}
              />
            </div>
            <div className="rounded-lg bg-gray-50 p-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Gross-up Factor</span>
                <span className="font-semibold">{grossUpFactor.toFixed(2)}x</span>
              </div>
            </div>
          </div>
        </section>

        {/* Income */}
        <section className="rounded-xl border p-4 space-y-3">
          <h2 className="font-semibold text-gray-800">Monthly Income</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700">Base Pay (taxable)</label>
            <input
              type="number" className="mt-1 w-full rounded-md border p-2"
              value={basePayMonthly} min={0}
              onChange={(e) => setBasePayMonthly(Number(e.target.value))}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">BAH (non-taxable)</label>
              <input
                type="number" className="mt-1 w-full rounded-md border p-2"
                value={bahMonthly} min={0}
                onChange={(e) => setBahMonthly(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">BAS (non-taxable)</label>
              <input
                type="number" className="mt-1 w-full rounded-md border p-2"
                value={basMonthly} min={0}
                onChange={(e) => setBasMonthly(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Other Taxable</label>
              <input
                type="number" className="mt-1 w-full rounded-md border p-2"
                value={otherTaxableMonthly} min={0}
                onChange={(e) => setOtherTaxableMonthly(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Other Non-taxable</label>
              <input
                type="number" className="mt-1 w-full rounded-md border p-2"
                value={otherNontaxMonthly} min={0}
                onChange={(e) => setOtherNontaxMonthly(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="rounded-lg bg-gray-50 p-3 text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-600">Taxable Income</span>
              <span className="font-semibold">${taxableIncome.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Non-taxable</span>
              <span className="font-semibold">${nonTaxable.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Qualifying Income</span>
              <span className="font-semibold">${qualifyingIncome.toLocaleString()}</span>
            </div>
          </div>
        </section>

        {/* Debts + Escrows */}
        <section className="rounded-xl border p-4 space-y-3">
          <h2 className="font-semibold text-gray-800">Debts & Escrows</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Revolving/Installment Debts</label>
              <input
                type="number" className="mt-1 w-full rounded-md border p-2"
                value={minDebtPmtMonthly} min={0}
                onChange={(e) => setMinDebtPmtMonthly(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Student Loans</label>
              <input
                type="number" className="mt-1 w-full rounded-md border p-2"
                value={studentLoansMonthly} min={0}
                onChange={(e) => setStudentLoansMonthly(Number(e.target.value))}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Alimony/Child Support</label>
            <input
              type="number" className="mt-1 w-full rounded-md border p-2"
              value={alimonyChildSupportMonthly} min={0}
              onChange={(e) => setAlimonyChildSupportMonthly(Number(e.target.value))}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Taxes (escrow)</label>
              <input
                type="number" className="mt-1 w-full rounded-md border p-2"
                value={estTaxesMonthly} min={0}
                onChange={(e) => setEstTaxesMonthly(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Insurance (HOI)</label>
              <input
                type="number" className="mt-1 w-full rounded-md border p-2"
                value={estInsuranceMonthly} min={0}
                onChange={(e) => setEstInsuranceMonthly(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">HOA</label>
              <input
                type="number" className="mt-1 w-full rounded-md border p-2"
                value={hoaMonthly} min={0}
                onChange={(e) => setHoaMonthly(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="rounded-lg bg-gray-50 p-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Escrows</span>
              <span className="font-semibold">${escrows.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Recurring Debts</span>
              <span className="font-semibold">${recurringDebts.toLocaleString()}</span>
            </div>
          </div>
        </section>

        {/* Targets + Output */}
        <section className="rounded-xl border p-4 space-y-3">
          <h2 className="font-semibold text-gray-800">Targets & Result</h2>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Front-End Target (%)</label>
              <input
                type="number" className="mt-1 w-full rounded-md border p-2"
                value={targetFrontPct} min={20} max={40} step="0.5"
                onChange={(e) => setTargetFrontPct(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Back-End Target (%)</label>
              <input
                type="number" className="mt-1 w-full rounded-md border p-2"
                value={targetBackPct} min={28} max={50} step="0.5"
                onChange={(e) => setTargetBackPct(Number(e.target.value))}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Trial Principal & Interest ($/mo)</label>
            <input
              type="number" className="mt-1 w-full rounded-md border p-2"
              value={trialPI} min={0}
              onChange={(e) => setTrialPI(Number(e.target.value))}
            />
            <p className="mt-1 text-xs text-gray-500">Use this to test a payment. Escrows are added automatically.</p>
          </div>

          <div className="rounded-lg bg-blue-50 p-3 text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-blue-900">Front DTI</span>
              <span className={`font-semibold ${frontDTI > targetFrontPct ? "text-rose-700" : "text-blue-900"}`}>
                {frontDTI.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-900">Back DTI</span>
              <span className={`font-semibold ${backDTI > targetBackPct ? "text-rose-700" : "text-blue-900"}`}>
                {backDTI.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-900">Max P&I by Front Target</span>
              <span className="font-semibold text-blue-900">${Math.max(0, Math.floor(maxPIFront)).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-900">Max P&I by Back Target</span>
              <span className="font-semibold text-blue-900">${Math.max(0, Math.floor(maxPIBack)).toLocaleString()}</span>
            </div>
            <div className="flex justify-between pt-1 border-t">
              <span className="text-blue-900">Recommended Max P&I</span>
              <span className="font-semibold text-blue-900">${Math.max(0, Math.floor(conservativePI)).toLocaleString()}</span>
            </div>
          </div>
        </section>
      </div>

      {/* Chart */}
      <div className="mt-6 h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(v) => `$${Math.round(v).toLocaleString()}`} />
            <Legend />
            <Bar dataKey="value" name="Amount" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <footer className="mt-6 rounded-lg bg-blue-50 p-4 text-sm text-blue-900">
        <ul className="list-disc pl-5 space-y-1">
          <li>BAH and BAS are non-taxable. Many lenders gross-up non-taxable income; 25% is common but policy varies.</li>
          <li>Front DTI: (P&I + escrows) / qualifying income. Back DTI: (Front + recurring debts) / qualifying income.</li>
          <li>This tool does not determine eligibility. Lender overlays and AUS findings control.</li>
        </ul>
      </footer>
    </div>
  );
}

