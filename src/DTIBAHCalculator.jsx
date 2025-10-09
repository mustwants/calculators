// PATH: src/DTIBAHCalculator.jsx
import React, { useMemo, useState } from "react";
import { listStateOptions } from "./utils/loadStateTaxData";
import { afterStateIncomeTax } from "./utils/tax";

/**
 * DTI + BAH Calculator
 * - Front-end DTI: (PITI + HOA + other housing debts) / gross monthly income
 * - Back-end DTI: (all monthly debts incl. housing) / gross monthly income
 * - BAH is non-taxable and included in income for many lenders (confirm per lender).
 * - Shows net-after-state-income-tax for taxable income portion only.
 *
 * Assumptions:
 * - "Taxable monthly income" excludes BAH.
 * - BAH can be optionally included in qualifying income.
 */

export default function DTIBAHCalculator() {
  // Location
  const states = useMemo(() => listStateOptions(), []);
  const [stateCode, setStateCode] = useState("VA");

  // Income
  const [grossMonthlyTaxableIncome, setGrossMonthlyTaxableIncome] = useState(7000); // base pay + other taxable income
  const [monthlyBAH, setMonthlyBAH] = useState(2300);
  const [includeBAHInIncome, setIncludeBAHInIncome] = useState(true);

  // Housing costs (PITI+HOA)
  const [monthlyPrincipalInterest, setMonthlyPrincipalInterest] = useState(2200);
  const [monthlyPropertyTax, setMonthlyPropertyTax] = useState(450);
  const [monthlyHomeInsurance, setMonthlyHomeInsurance] = useState(110);
  const [monthlyHOA, setMonthlyHOA] = useState(75);
  const [pmIMonthly, setPmIMonthly] = useState(0);

  // Other debts
  const [otherDebtsMonthly, setOtherDebtsMonthly] = useState(600); // auto, cards, student loans, alimony, etc.

  // Derived
  const pitiHoa =
    (Number(monthlyPrincipalInterest) || 0) +
    (Number(monthlyPropertyTax) || 0) +
    (Number(monthlyHomeInsurance) || 0) +
    (Number(monthlyHOA) || 0) +
    (Number(pmIMonthly) || 0);

  const qualifyingIncome =
    (Number(grossMonthlyTaxableIncome) || 0) + (includeBAHInIncome ? (Number(monthlyBAH) || 0) : 0);

  const frontEndDTI = qualifyingIncome > 0 ? (pitiHoa / qualifyingIncome) * 100 : 0;
  const backEndDTI = qualifyingIncome > 0 ? ((pitiHoa + (Number(otherDebtsMonthly) || 0)) / qualifyingIncome) * 100 : 0;

  // Net after state income tax on taxable income only (BAH excluded)
  const netAfterStateTaxTaxableOnly = (() => {
    // convert monthly taxable income to annual for the helper, then divide by 12
    const annualTaxable = (Number(grossMonthlyTaxableIncome) || 0) * 12;
    const annualAfter = afterStateIncomeTax(stateCode, annualTaxable);
    return annualAfter / 12;
  })();

  const netMonthlyAllIn = netAfterStateTaxTaxableOnly + (includeBAHInIncome ? (Number(monthlyBAH) || 0) : 0);

  return (
    <div className="max-w-5xl mx-auto my-8 p-6 bg-white rounded-2xl shadow">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-blue-800">💰📊 DTI + BAH Calculator</h1>
        <p className="text-sm text-gray-600">
          Computes front-end and back-end DTI. BAH is non-taxable and can be included in qualifying
          income depending on lender policy. State tax is applied only to taxable income for net view.
        </p>
      </header>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Column 1: Location + Income */}
        <section className="rounded-xl border p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">State</label>
            <select
              className="mt-1 w-full rounded-md border border-gray-300 p-2 bg-white"
              value={stateCode}
              onChange={(e) => setStateCode(e.target.value)}
            >
              {states.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Used only for net-after-tax display on taxable income. BAH is non-taxable.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Taxable Income ($/mo)</label>
            <input
              type="number"
              className="mt-1 w-full rounded-md border border-gray-300 p-2"
              value={grossMonthlyTaxableIncome}
              min={0}
              onChange={(e) => setGrossMonthlyTaxableIncome(Number(e.target.value))}
            />
            <p className="mt-1 text-xs text-gray-500">Base pay plus any taxable income.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">BAH ($/mo)</label>
            <input
              type="number"
              className="mt-1 w-full rounded-md border border-gray-300 p-2"
              value={monthlyBAH}
              min={0}
              onChange={(e) => setMonthlyBAH(Number(e.target.value))}
            />
            <div className="mt-2 flex items-center gap-2">
              <input
                id="includeBAHInIncome"
                type="checkbox"
                className="h-4 w-4"
                checked={includeBAHInIncome}
                onChange={(e) => setIncludeBAHInIncome(e.target.checked)}
              />
              <label htmlFor="includeBAHInIncome" className="text-sm text-gray-700">
                Include BAH in qualifying income
              </label>
            </div>
            <p className="mt-1 text-xs text-gray-500">BAH is non-taxable.</p>
          </div>
        </section>

        {/* Column 2: Housing Costs (PITI + HOA + PMI) */}
        <section className="rounded-xl border p-4 space-y-4">
          <h2 className="font-semibold text-gray-800">Housing Costs</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700">Principal & Interest ($/mo)</label>
            <input
              type="number"
              className="mt-1 w-full rounded-md border border-gray-300 p-2"
              value={monthlyPrincipalInterest}
              min={0}
              onChange={(e) => setMonthlyPrincipalInterest(Number(e.target.value))}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Property Tax ($/mo)</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border border-gray-300 p-2"
                value={monthlyPropertyTax}
                min={0}
                onChange={(e) => setMonthlyPropertyTax(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Home Insurance ($/mo)</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border border-gray-300 p-2"
                value={monthlyHomeInsurance}
                min={0}
                onChange={(e) => setMonthlyHomeInsurance(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">HOA ($/mo)</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border border-gray-300 p-2"
                value={monthlyHOA}
                min={0}
                onChange={(e) => setMonthlyHOA(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">PMI ($/mo)</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border border-gray-300 p-2"
                value={pmIMonthly}
                min={0}
                onChange={(e) => setPmIMonthly(Number(e.target.value))}
              />
            </div>
          </div>
        </section>

        {/* Column 3: Other Debts */}
        <section className="rounded-xl border p-4 space-y-4">
          <h2 className="font-semibold text-gray-800">Other Monthly Debts</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700">Total Other Debts ($/mo)</label>
            <input
              type="number"
              className="mt-1 w-full rounded-md border border-gray-300 p-2"
              value={otherDebtsMonthly}
              min={0}
              onChange={(e) => setOtherDebtsMonthly(Number(e.target.value))}
            />
            <p className="mt-1 text-xs text-gray-500">Auto, cards, student loans, alimony, etc.</p>
          </div>

          <div className="rounded-lg bg-gray-50 p-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Qualifying Income</span>
              <span className="font-semibold">${qualifyingIncome.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Net After State Tax (taxable only)</span>
              <span className="font-semibold">${netAfterStateTaxTaxableOnly.toFixed(0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Net Monthly All-In (net taxable + BAH if included)</span>
              <span className="font-semibold">${netMonthlyAllIn.toFixed(0)}</span>
            </div>
          </div>
        </section>
      </div>

      {/* DTI Summary */}
      <section className="mt-6 grid md:grid-cols-2 gap-4">
        <div className="rounded-xl border p-4">
          <div className="text-xs uppercase text-gray-500">Front-End DTI</div>
          <div className={`text-xl font-semibold ${frontEndDTI > 36 ? "text-rose-600" : "text-green-700"}`}>
            {frontEndDTI.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500">Target often ≤ 28–36% depending on lender.</div>
        </div>

        <div className="rounded-xl border p-4">
          <div className="text-xs uppercase text-gray-500">Back-End DTI</div>
          <div className={`text-xl font-semibold ${backEndDTI > 45 ? "text-rose-600" : "text-green-700"}`}>
            {backEndDTI.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500">Target often ≤ 41–50% depending on program.</div>
        </div>
      </section>

      <footer className="mt-6 rounded-lg bg-blue-50 p-4 text-sm text-blue-900">
        <ul className="list-disc pl-5 space-y-1">
          <li>Confirm with your lender whether BAH is included in qualifying income for your program.</li>
          <li>This tool applies state income tax only to taxable income for net comparisons.</li>
          <li>Results are estimates and do not constitute underwriting approval.</li>
        </ul>
      </footer>
    </div>
  );
}
