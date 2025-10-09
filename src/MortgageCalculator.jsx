// PATH: src/MortgageCalculator.jsx
import React, { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Legend,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { listStateOptions, getState } from "./utils/loadStateTaxData";

/**
 * Mortgage Calculator — Military-aware
 * - Fixed-rate, fully amortizing.
 * - VA loan toggle with Funding Fee (financed or paid upfront).
 * - PMI for non-VA until LTV ≤ 80% (simple % of original balance).
 * - Property tax prefilled from state dataset when available.
 * - Insurance percent of value, HOA monthly.
 * - Shows payment breakdown and 10-year principal vs interest.
 *
 * Planner only. Not advice.
 */

function pct(x) {
  const n = Number(x);
  return Number.isFinite(n) ? n / 100 : 0;
}
function n(x) {
  const v = Number(x);
  return Number.isFinite(v) ? v : 0;
}
function money(v) {
  return `$${Math.round(n(v)).toLocaleString()}`;
}

export default function MortgageCalculator() {
  // State taxes
  const states = useMemo(() => listStateOptions(), []);
  const [stateCode, setStateCode] = useState("VA");
  const stateMeta = getState(stateCode);
  const inferredPropTaxPct =
    stateMeta?.tax?.property?.effectiveRatePct ??
    stateMeta?.tax?.property?.notes?.defaultRatePct ??
    1.0;

  // Price + financing
  const [price, setPrice] = useState(450_000);
  const [downPct, setDownPct] = useState(5);
  const [ratePct, setRatePct] = useState(6.25);
  const [termYears, setTermYears] = useState(30);

  // Costs
  const [propTaxPct, setPropTaxPct] = useState(inferredPropTaxPct);
  const [insPct, setInsPct] = useState(0.35);
  const [hoaMonthly, setHoaMonthly] = useState(0);

  // PMI (non-VA)
  const [pmiEnabled, setPmiEnabled] = useState(true);
  const [pmiAnnualPct, setPmiAnnualPct] = useState(0.6); // of original balance until 80% LTV

  // VA specific
  const [isVA, setIsVA] = useState(true);
  const [firstUse, setFirstUse] = useState(true);
  const [financeFundingFee, setFinanceFundingFee] = useState(true);

  // VA Funding Fee matrix (simplified defaults)
  // First use: 2.15% (down <5%), 1.5% (5–9.99%), 1.25% (>=10%)
  // Subsequent: 3.3% (<5%), 1.5% (5–9.99%), 1.25% (>=10%)
  function vaFundingFeeRate(downP, first) {
    if (downP >= 10) return 1.25;
    if (downP >= 5) return 1.5;
    return first ? 2.15 : 3.3;
  }

  // Derived amounts
  const downPayment = price * pct(downPct);

  // Base loan before funding fee
  const baseLoan = Math.max(0, price - (isVA ? 0 : downPayment));

  // Funding fee
  const ffRate = isVA ? vaFundingFeeRate(downPct, firstUse) : 0;
  const fundingFee = baseLoan * pct(ffRate);

  // Final loan amount
  const loanAmount = isVA
    ? (financeFundingFee ? baseLoan + fundingFee : baseLoan)
    : Math.max(0, price - downPayment);

  // Rate/Term
  const r = pct(ratePct) / 12;
  const nper = termYears * 12;
  const monthlyPI =
    r === 0 ? loanAmount / nper : (loanAmount * r) / (1 - Math.pow(1 + r, -nper));

  // Monthly escrows on current value (approx)
  const taxMonthly = (price * pct(propTaxPct)) / 12;
  const insMonthly = (price * pct(insPct)) / 12;

  // PMI monthly (non-VA) until LTV ≤ 80% — we show current-month approximation
  const initialLTV = isVA ? (loanAmount / price) : ((loanAmount) / price);
  const pmiMonthlyApprox =
    !isVA && pmiEnabled && initialLTV > 0.8
      ? ( (price - downPayment) * pct(pmiAnnualPct) ) / 12
      : 0;

  const piti = monthlyPI + taxMonthly + insMonthly + hoaMonthly + pmiMonthlyApprox;

  // 10-year amortization breakdown
  const amort = useMemo(() => {
    let bal = loanAmount;
    let rows = [];
    let totalInterest = 0;
    let totalPrincipal = 0;

    for (let m = 1; m <= Math.min(120, nper); m++) {
      const interest = bal * r;
      const principal = Math.min(bal, monthlyPI - interest);
      bal = Math.max(0, bal - principal);

      totalInterest += interest;
      totalPrincipal += principal;

      if (m % 12 === 0 || m === nper) {
        rows.push({
          year: m / 12,
          Interest: Math.round(totalInterest),
          Principal: Math.round(totalPrincipal),
          Balance: Math.round(bal),
        });
      }
    }
    return rows;
  }, [loanAmount, monthlyPI, r, nper]);

  // Payment breakdown pie
  const pieData = [
    { name: "Principal+Interest", value: monthlyPI },
    { name: "Property Tax", value: taxMonthly },
    { name: "Insurance", value: insMonthly },
    { name: "PMI", value: pmiMonthlyApprox },
    { name: "HOA", value: hoaMonthly },
  ].filter((s) => s.value > 0.5);

  return (
    <div className="max-w-6xl mx-auto my-8 p-6 bg-white rounded-2xl shadow">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-blue-800">🏠 Mortgage Calculator</h1>
        <p className="text-sm text-gray-600">
          Fixed-rate payment with VA option, funding fee, PMI, and state-prefilled property tax.
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
              onChange={(e) => {
                const code = e.target.value;
                setStateCode(code);
                const meta = getState(code);
                const next =
                  meta?.tax?.property?.effectiveRatePct ??
                  meta?.tax?.property?.notes?.defaultRatePct ??
                  propTaxPct;
                setPropTaxPct(Number(next));
              }}
            >
              {states.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="isva"
              type="checkbox"
              className="h-4 w-4"
              checked={isVA}
              onChange={(e) => setIsVA(e.target.checked)}
            />
            <label htmlFor="isva" className="text-sm text-gray-700">VA Loan</label>
          </div>

          {isVA ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  id="firstuse"
                  type="checkbox"
                  className="h-4 w-4"
                  checked={firstUse}
                  onChange={(e) => setFirstUse(e.target.checked)}
                />
                <label htmlFor="firstuse" className="text-sm text-gray-700">First-use funding fee</label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="financeff"
                  type="checkbox"
                  className="h-4 w-4"
                  checked={financeFundingFee}
                  onChange={(e) => setFinanceFundingFee(e.target.checked)}
                />
                <label htmlFor="financeff" className="text-sm text-gray-700">Finance funding fee</label>
              </div>
              <div className="rounded-md bg-blue-50 p-2 text-xs text-blue-900">
                Estimated VA Funding Fee Rate: <b>{vaFundingFeeRate(downPct, firstUse).toFixed(2)}%</b>
                <br />
                Estimated Funding Fee: <b>{money(fundingFee)}</b>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  id="pmi"
                  type="checkbox"
                  className="h-4 w-4"
                  checked={pmiEnabled}
                  onChange={(e) => setPmiEnabled(e.target.checked)}
                />
                <label htmlFor="pmi" className="text-sm text-gray-700">Apply PMI until 80% LTV</label>
              </div>
              {pmiEnabled && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">PMI Rate (annual %)</label>
                  <input
                    type="number"
                    className="mt-1 w-full rounded-md border p-2"
                    value={pmiAnnualPct}
                    min={0}
                    max={2}
                    step="0.05"
                    onChange={(e) => setPmiAnnualPct(Number(e.target.value))}
                  />
                </div>
              )}
            </div>
          )}
        </section>

        {/* Price & Loan */}
        <section className="rounded-xl border p-4 space-y-3">
          <h2 className="font-semibold text-gray-800">Price & Loan</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700">Home Price ($)</label>
            <input
              type="number"
              className="mt-1 w-full rounded-md border p-2"
              value={price}
              min={50_000}
              onChange={(e) => setPrice(Number(e.target.value))}
            />
          </div>

          {!isVA && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Down Payment (%)</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border p-2"
                value={downPct}
                min={0}
                max={100}
                step="0.5"
                onChange={(e) => setDownPct(Number(e.target.value))}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Rate (APR %)</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border p-2"
                value={ratePct}
                min={0}
                max={15}
                step="0.01"
                onChange={(e) => setRatePct(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Term (years)</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border p-2"
                value={termYears}
                min={5}
                max={40}
                onChange={(e) => setTermYears(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="rounded-lg bg-gray-50 p-3 text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-600">Down Payment</span>
              <span className="font-semibold">{money(isVA ? 0 : downPayment)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Loan Amount</span>
              <span className="font-semibold">{money(loanAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">P&I (monthly)</span>
              <span className="font-semibold">{money(monthlyPI)}</span>
            </div>
          </div>
        </section>

        {/* Escrows & HOA */}
        <section className="rounded-xl border p-4 space-y-3">
          <h2 className="font-semibold text-gray-800">Escrows & HOA</h2>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Property Tax (%/yr)</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border p-2"
                value={propTaxPct}
                min={0}
                max={5}
                step="0.05"
                onChange={(e) => setPropTaxPct(Number(e.target.value))}
              />
              <p className="mt-1 text-xs text-gray-500">Prefilled by state when available.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Insurance (%/yr)</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border p-2"
                value={insPct}
                min={0}
                max={2}
                step="0.05"
                onChange={(e) => setInsPct(Number(e.target.value))}
              />
            </div>
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

          <div className="rounded-lg bg-blue-50 p-3 text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-blue-900">Property Tax (mo)</span>
              <span className="font-semibold text-blue-900">{money(taxMonthly)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-900">Insurance (mo)</span>
              <span className="font-semibold text-blue-900">{money(insMonthly)}</span>
            </div>
            {!isVA && pmiMonthlyApprox > 0 && (
              <div className="flex justify-between">
                <span className="text-blue-900">PMI (mo)</span>
                <span className="font-semibold text-blue-900">{money(pmiMonthlyApprox)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-blue-200 pt-2">
              <span className="text-blue-900">Estimated PITI</span>
              <span className="font-semibold text-blue-900">{money(piti)}</span>
            </div>
          </div>
        </section>

        {/* Snapshot */}
        <section className="rounded-xl border p-4 space-y-3">
          <h2 className="font-semibold text-gray-800">Snapshot</h2>
          <div className="rounded-lg bg-gray-50 p-3 text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-700">Initial LTV</span>
              <span className="font-semibold">{(initialLTV * 100).toFixed(1)}%</span>
            </div>
            {isVA && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-700">Funding Fee Rate</span>
                  <span className="font-semibold">{ffRate.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Funding Fee</span>
                  <span className="font-semibold">{money(fundingFee)}</span>
                </div>
              </>
            )}
            <div className="flex justify-between">
              <span className="text-gray-700">P&I</span>
              <span className="font-semibold">{money(monthlyPI)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">PITI</span>
              <span className="font-semibold">{money(piti)}</span>
            </div>
          </div>
        </section>
      </div>

      {/* Payment breakdown pie */}
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

        {/* 10-year principal vs interest */}
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={amort}>
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip formatter={(v) => money(v)} />
              <Legend />
              <Bar dataKey="Principal" />
              <Bar dataKey="Interest" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <footer className="mt-6 rounded-lg bg-blue-50 p-4 text-sm text-blue-900">
        <ul className="list-disc pl-5 space-y-1">
          <li>VA funding fee varies by use and down payment; exempt if certain disability ratings apply.</li>
          <li>PMI shown for non-VA loans until LTV ≤ 80% (simplified estimate).</li>
          <li>Property tax prefill is an estimate. Local rates vary by county and exemptions.</li>
        </ul>
      </footer>
    </div>
  );
}
