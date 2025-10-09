// PATH: src/DTIBAHCalculator.jsx
import React, { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from "recharts";
import { listStateOptions, getState } from "./utils/loadStateTaxData";

/**
 * DTI + BAH Calculator
 * - Computes front-end and back-end DTI.
 * - Treats BAH/BAS as non-taxable. Optional lender “gross-up” credit on non-taxable income.
 * - Shows max PITI by DTI cap and splits into P&I vs escrows.
 * - State tax applied to taxable income only for net-pay context.
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

export default function DTIBAHCalculator() {
  // State context
  const states = useMemo(() => listStateOptions(), []);
  const [stateCode, setStateCode] = useState("VA");
  const stateMeta = getState(stateCode);
  const stateIncomeTaxRate =
    stateMeta?.tax?.income?.effectiveRatePct ?? 0; // % applied to taxable income

  // Income (monthly)
  const [basePayTaxable, setBasePayTaxable] = useState(6500); // taxable
  const [bah, setBAH] = useState(2400); // non-taxable
  const [bas, setBAS] = useState(450); // non-taxable
  const [otherTaxable, setOtherTaxable] = useState(0);
  const [otherNonTaxable, setOtherNonTaxable] = useState(0);

  // Gross-up for non-taxable
  const [grossUpNonTaxablePct, setGrossUpNonTaxablePct] = useState(25);

  // Monthly debts
  const [autoLoan, setAutoLoan] = useState(500);
  const [studentLoan, setStudentLoan] = useState(250);
  const [creditCards, setCreditCards] = useState(150);
  const [otherDebt, setOtherDebt] = useState(0);

  // DTI caps and housing assumptions
  const [frontEndCapPct, setFrontEndCapPct] = useState(31); // common FHA reference; adjust as needed
  const [backEndCapPct, setBackEndCapPct] = useState(43);
  const [escrowsSharePct, setEscrowsSharePct] = useState(28); // % of PITI for taxes+ins+hoa
  const [hoaMonthly, setHoaMonthly] = useState(0);

  // Derived incomes
  const taxableIncome = n(basePayTaxable) + n(otherTaxable);
  const nonTaxable = n(bah) + n(bas) + n(otherNonTaxable);
  const grossUpFactor = 1 + pct(grossUpNonTaxablePct);
  const qualifyingIncome = taxableIncome + nonTaxable * grossUpFactor;

  // State tax context (approx)
  const estStateTaxMonthly = taxableIncome * (stateIncomeTaxRate / 100);
  const netAfterState = taxableIncome - estStateTaxMonthly + nonTaxable;

  // Debts and DTI
  const totalDebts = n(autoLoan) + n(studentLoan) + n(creditCards) + n(otherDebt);

  const maxHousingFront = qualifyingIncome * pct(frontEndCapPct); // PITI cap
  const maxHousingBack = Math.max(0, qualifyingIncome * pct(backEndCapPct) - totalDebts);

  // Use tighter of the two
  const maxPITI = Math.max(0, Math.min(maxHousingFront, maxHousingBack));

  // Split into P&I vs Escrows
  const escrowsTarget = maxPITI * pct(escrowsSharePct) + n(hoaMonthly);
  const piTarget = Math.max(0, maxPITI - escrowsTarget);

  // Ratios at proposed PITI
  function ratio(v) {
    return qualifyingIncome > 0 ? (v / qualifyingIncome) * 100 : 0;
  }
  const frontDTIAtMax = ratio(maxPITI);
  const backDTIAtMax = ratio(maxPITI + totalDebts);

  const chartData = [
    { name: "Qualifying Income", value: Math.round(qualifyingIncome) },
    { name: "Max PITI", value: Math.round(maxPITI) },
    { name: "P&I Target", value: Math.round(piTarget) },
    { name: "Escrows+HOA", value: Math.round(escrowsTarget) },
    { name: "Other Debts", value: Math.round(totalDebts) }
  ];

  return (
    <div className="max-w-6xl mx-auto my-8 p-6 bg-white rounded-2xl shadow">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-blue-800">💰📊 DTI + BAH Calculator</h1>
        <p className="text-sm text-gray-600">
          Computes front-end and back-end DTI with BAH/BAS gross-up and state tax-aware net pay.
        </p>
      </header>

      <div className="grid xl:grid-cols-4 gap-6">
        {/* State & Policy */}
        <section className="rounded-xl border p-4 space-y-3">
          <h2 className="font-semibold text-gray-800">State & Policy</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700">State</label>
            <select
              className="mt-1 w-full rounded-md border p-2 bg-white"
              value={stateCode}
              onChange={(e) => e && setStateCode(e.target.value)}
            >
              {states.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-md bg-gray-50 p-3 text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-600">State income tax (est.)</span>
              <span className="font-semibold">{stateIncomeTaxRate}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">State tax (monthly)</span>
              <span className="font-semibold">{money(estStateTaxMonthly)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Net after state</span>
              <span className="font-semibold">{money(netAfterState)}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Gross-up non-taxable (%)</label>
            <input
              type="number"
              className="mt-1 w-full rounded-md border p-2"
              value={grossUpNonTaxablePct}
              min={0}
              max={35}
              step="0.5"
              onChange={(e) => setGrossUpNonTaxablePct(Number(e.target.value))}
            />
            <p className="mt-1 text-xs text-gray-500">Many lenders use 25%. Check AUS/overlay.</p>
          </div>
        </section>

        {/* Income */}
        <section className="rounded-xl border p-4 space-y-3">
          <h2 className="font-semibold text-gray-800">Monthly Income</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700">Taxable Base Pay ($)</label>
            <input
              type="number"
              className="mt-1 w-full rounded-md border p-2"
              value={basePayTaxable}
              min={0}
              onChange={(e) => setBasePayTaxable(Number(e.target.value))}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">BAH (non-taxable)</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border p-2"
                value={bah}
                min={0}
                onChange={(e) => setBAH(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">BAS (non-taxable)</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border p-2"
                value={bas}
                min={0}
                onChange={(e) => setBAS(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Other non-taxable</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border p-2"
                value={otherNonTaxable}
                min={0}
                onChange={(e) => setOtherNonTaxable(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Other taxable ($)</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border p-2"
                value={otherTaxable}
                min={0}
                onChange={(e) => setOtherTaxable(Number(e.target.value))}
              />
            </div>
            <div className="rounded-lg bg-gray-50 p-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Qualifying Income</span>
                <span className="font-semibold">{money(qualifyingIncome)}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Debts */}
        <section className="rounded-xl border p-4 space-y-3">
          <h2 className="font-semibold text-gray-800">Monthly Debts</h2>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Auto loan</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border p-2"
                value={autoLoan}
                min={0}
                onChange={(e) => setAutoLoan(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Student loan</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border p-2"
                value={studentLoan}
                min={0}
                onChange={(e) => setStudentLoan(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Credit cards (min)</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border p-2"
                value={creditCards}
                min={0}
                onChange={(e) => setCreditCards(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Other debt</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border p-2"
                value={otherDebt}
                min={0}
                onChange={(e) => setOtherDebt(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="rounded-lg bg-gray-50 p-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Total debts</span>
              <span className="font-semibold">{money(totalDebts)}</span>
            </div>
          </div>
        </section>

        {/* Targets */}
        <section className="rounded-xl border p-4 space-y-3">
          <h2 className="font-semibold text-gray-800">DTI Targets & HOA</h2>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Front-end cap (%)</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border p-2"
                value={frontEndCapPct}
                min={20}
                max={40}
                step="0.5"
                onChange={(e) => setFrontEndCapPct(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Back-end cap (%)</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border p-2"
                value={backEndCapPct}
                min={30}
                max={55}
                step="0.5"
                onChange={(e) => setBackEndCapPct(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Escrows share of PITI (%)</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border p-2"
                value={escrowsSharePct}
                min={10}
                max={50}
                onChange={(e) => setEscrowsSharePct(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">HOA ($/mo)</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border p-2"
                value={hoaMonthly}
                min={0}
                onChange={(e) => setHoaMonthly(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="rounded-lg bg-blue-50 p-3 text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-blue-900">Max PITI (front)</span>
              <span className="font-semibold text-blue-900">{money(maxHousingFront)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-900">Max PITI (back)</span>
              <span className="font-semibold text-blue-900">{money(maxHousingBack)}</span>
            </div>
            <div className="flex justify-between border-t border-blue-200 pt-2">
              <span className="text-blue-900">Max PITI (binding)</span>
              <span className="font-semibold text-blue-900">{money(maxPITI)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-900">P&I Target</span>
              <span className="font-semibold text-blue-900">{money(piTarget)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-900">Escrows+HOA</span>
              <span className="font-semibold text-blue-900">{money(escrowsTarget)}</span>
            </div>
          </div>
        </section>
      </div>

      {/* Bars */}
      <div className="mt-6 h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(v) => money(v)} />
            <Legend />
            <Bar dataKey="value" name="Amount" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Ratios */}
      <div className="mt-6 grid md:grid-cols-3 gap-4 text-sm">
        <div className="rounded-lg border p-3">
          <div className="flex justify-between">
            <span className="text-gray-700">Front-end DTI at max</span>
            <span className="font-semibold">{frontDTIAtMax.toFixed(1)}%</span>
          </div>
        </div>
        <div className="rounded-lg border p-3">
          <div className="flex justify-between">
            <span className="text-gray-700">Back-end DTI at max</span>
            <span className="font-semibold">{backDTIAtMax.toFixed(1)}%</span>
          </div>
        </div>
        <div className="rounded-lg border p-3">
          <div className="flex justify-between">
            <span className="text-gray-700">Net after state (monthly)</span>
            <span className="font-semibold">{money(netAfterState)}</span>
          </div>
        </div>
      </div>

      <footer className="mt-6 rounded-lg bg-blue-50 p-4 text-sm text-blue-900">
        <ul className="list-disc pl-5 space-y-1">
          <li>DTI tolerances vary by AUS, product, and overlays. This is a planner.</li>
          <li>BAH/BAS are non-taxable. Gross-up reflects lender credit toward qualifying income.</li>
          <li>State tax applies only to taxable income in this tool.</li>
        </ul>
      </footer>
    </div>
  );
}

