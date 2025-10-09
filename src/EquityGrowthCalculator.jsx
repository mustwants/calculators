// PATH: src/EquityGrowthCalculator.jsx
import React, { useMemo, useState } from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { listStateOptions } from "./utils/loadStateTaxData";

function pmt(ratePct, years, principal) {
  const r = (ratePct / 100) / 12;
  const n = years * 12;
  if (r === 0) return principal / n;
  return (r * principal) / (1 - Math.pow(1 + r, -n));
}

export default function EquityGrowthCalculator() {
  // State (for context only)
  const states = useMemo(() => listStateOptions(), []);
  const [stateCode, setStateCode] = useState("VA");

  // Inputs
  const [price, setPrice] = useState(450000);
  const [downPct, setDownPct] = useState(5);
  const [ratePct, setRatePct] = useState(6.5);
  const [termYrs, setTermYrs] = useState(30);
  const [yearsHorizon, setYearsHorizon] = useState(10);

  const [annualAppreciationPct, setAnnualAppreciationPct] = useState(3.0);
  const [extraPrincipalMonthly, setExtraPrincipalMonthly] = useState(0);
  const [sellCostPct, setSellCostPct] = useState(6); // for “sell today” equity net

  // Derived
  const downPayment = Math.max(0, price * (downPct / 100));
  const loanAmt = Math.max(0, price - downPayment);
  const basePI = pmt(ratePct, termYrs, loanAmt);
  const monthlyRate = (ratePct / 100) / 12;
  const apprMonthly = 1 + (annualAppreciationPct / 100) / 12;

  const { chart, last } = useMemo(() => {
    let bal = loanAmt;
    let homeVal = price;
    const rows = [];
    let cumPrincipal = 0;

    for (let m = 1; m <= yearsHorizon * 12; m++) {
      // interest and principal split
      const interest = monthlyRate > 0 ? bal * monthlyRate : 0;
      let principal = Math.min(bal, basePI - interest);
      if (extraPrincipalMonthly > 0 && bal - principal > 0) {
        const extra = Math.min(extraPrincipalMonthly, bal - principal);
        principal += extra;
      }
      bal = Math.max(0, bal - principal);
      cumPrincipal += principal;

      // home value growth
      homeVal = homeVal * apprMonthly;

      if (m % 12 === 0 || m === yearsHorizon * 12) {
        const equity = Math.max(0, homeVal - bal);
        const netIfSold = Math.max(0, homeVal * (1 - sellCostPct / 100) - bal);
        rows.push({
          month: m,
          year: (m / 12).toFixed(1),
          Home_Value: homeVal,
          Loan_Balance: bal,
          Equity: equity,
          Net_If_Sold: netIfSold,
          Principal_Paid: cumPrincipal
        });
      }
      if (bal <= 0) {
        // fill remaining annual points with flat balance if horizon extends past payoff
        // equity and netIfSold will keep tracking appreciation
      }
    }
    const lastRow = rows[rows.length - 1] || {
      Home_Value: price,
      Loan_Balance: loanAmt,
      Equity: price - loanAmt,
      Net_If_Sold: price * (1 - sellCostPct / 100) - loanAmt,
      Principal_Paid: 0
    };
    return { chart: rows, last: lastRow };
  }, [loanAmt, price, yearsHorizon, basePI, monthlyRate, apprMonthly, extraPrincipalMonthly, sellCostPct]);

  return (
    <div className="max-w-6xl mx-auto my-8 p-6 bg-white rounded-2xl shadow">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-blue-800">📈 Equity Growth</h1>
        <p className="text-sm text-gray-600">
          Projects equity from principal paydown and appreciation. Includes optional extra principal and selling cost estimate.
        </p>
      </header>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Column 1 */}
        <section className="rounded-xl border p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">State (context)</label>
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
            <p className="mt-1 text-xs text-gray-500">For consistency across tools. No tax applied here.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Home Price ($)</label>
            <input
              type="number"
              className="mt-1 w-full rounded-md border border-gray-300 p-2"
              value={price}
              min={0}
              onChange={(e) => setPrice(Number(e.target.value))}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Down Payment (%)</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border border-gray-300 p-2"
                value={downPct}
                min={0}
                max={100}
                step="0.1"
                onChange={(e) => setDownPct(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Term (years)</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border border-gray-300 p-2"
                value={termYrs}
                min={5}
                max={40}
                onChange={(e) => setTermYrs(Number(e.target.value))}
              />
            </div>
          </div>
        </section>

        {/* Column 2 */}
        <section className="rounded-xl border p-4 space-y-4">
          <h2 className="font-semibold text-gray-800">Loan & Growth</h2>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Rate (% APR)</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border border-gray-300 p-2"
                value={ratePct}
                min={0}
                step="0.01"
                onChange={(e) => setRatePct(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Horizon (years)</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border border-gray-300 p-2"
                value={yearsHorizon}
                min={1}
                max={40}
                onChange={(e) => setYearsHorizon(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Appreciation (%/yr)</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border border-gray-300 p-2"
                value={annualAppreciationPct}
                min={-10}
                max={20}
                step="0.1"
                onChange={(e) => setAnnualAppreciationPct(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Extra Principal ($/mo)</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border border-gray-300 p-2"
                value={extraPrincipalMonthly}
                min={0}
                onChange={(e) => setExtraPrincipalMonthly(Number(e.target.value))}
              />
            </div>
          </div>
        </section>

        {/* Column 3 */}
        <section className="rounded-xl border p-4 space-y-4">
          <h2 className="font-semibold text-gray-800">Selling Cost</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700">Sell Cost (% of price)</label>
            <input
              type="number"
              className="mt-1 w-full rounded-md border border-gray-300 p-2"
              value={sellCostPct}
              min={0}
              max={15}
              step="0.1"
              onChange={(e) => setSellCostPct(Number(e.target.value))}
            />
            <p className="mt-1 text-xs text-gray-500">Used to estimate “Net if Sold” in each year.</p>
          </div>

          <div className="rounded-lg bg-gray-50 p-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Loan Amount</span>
              <span className="font-semibold">${loanAmt.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Base P&I</span>
              <span className="font-semibold">${basePI.toFixed(0)}/mo</span>
            </div>
          </div>
        </section>
      </div>

      {/* Chart */}
      <div className="mt-6 h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chart}>
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip formatter={(v) => `$${Math.round(v).toLocaleString()}`} />
            <Legend />
            <Area type="monotone" dataKey="Home_Value" name="Home Value" stroke="#2563eb" fillOpacity={0.15} fill="#93c5fd" />
            <Area type="monotone" dataKey="Loan_Balance" name="Loan Balance" stroke="#f97316" fillOpacity={0.12} fill="#fdba74" />
            <Area type="monotone" dataKey="Equity" name="Equity" stroke="#16a34a" fillOpacity={0.15} fill="#86efac" />
            <Area type="monotone" dataKey="Net_If_Sold" name="Net If Sold" stroke="#0ea5e9" fillOpacity={0.1} fill="#7dd3fc" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Summary */}
      <section className="mt-6 grid md:grid-cols-4 gap-4">
        <div className="rounded-xl border p-4">
          <div className="text-xs uppercase text-gray-500">Equity (Year {yearsHorizon})</div>
          <div className="text-xl font-semibold">${(last.Equity || 0).toLocaleString()}</div>
        </div>
        <div className="rounded-xl border p-4">
          <div className="text-xs uppercase text-gray-500">Net If Sold (Year {yearsHorizon})</div>
          <div className="text-xl font-semibold">${(last.Net_If_Sold || 0).toLocaleString()}</div>
        </div>
        <div className="rounded-xl border p-4">
          <div className="text-xs uppercase text-gray-500">Principal Paid</div>
          <div className="text-xl font-semibold">${(last.Principal_Paid || 0).toLocaleString()}</div>
        </div>
        <div className="rounded-xl border p-4">
          <div className="text-xs uppercase text-gray-500">Home Value (Year {yearsHorizon})</div>
          <div className="text-xl font-semibold">${(last.Home_Value || 0).toLocaleString()}</div>
        </div>
      </section>

      <footer className="mt-6 rounded-lg bg-blue-50 p-4 text-sm text-blue-900">
        <ul className="list-disc pl-5 space-y-1">
          <li>Equity = Home value − Loan balance. Net if Sold subtracts selling costs.</li>
          <li>No taxes modeled here. See Capital Gains and Depreciation tools for tax impacts.</li>
          <li>Results are estimates. Actual schedules vary with escrow, rate changes, and prepayment timing.</li>
        </ul>
      </footer>
    </div>
  );
}
