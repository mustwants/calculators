// PATH: src/EquityGrowthCalculator.jsx
import React, { useMemo, useState } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, Area, AreaChart } from "recharts";

/**
 * Equity Growth Calculator
 * Models amortization + appreciation and shows equity by year.
 * Assumptions:
 * - Fixed-rate, fully-amortizing loan.
 * - PMI optional; drops when LTV ≤ 80%.
 * - Property tax, insurance, HOA are not part of equity but help user context.
 * - Selling cost toggle to preview net-at-sale.
 * This is planning-only. Not advice.
 */

function pct(x) {
  const n = Number(x);
  return Number.isFinite(n) ? n / 100 : 0;
}
function currency(n) {
  return `$${Math.round(n).toLocaleString()}`;
}
function clamp(n, lo, hi) {
  return Math.min(Math.max(n, lo), hi);
}

export default function EquityGrowthCalculator() {
  // Price & financing
  const [price, setPrice] = useState(450_000);
  const [downPct, setDownPct] = useState(5);
  const [ratePct, setRatePct] = useState(6.25);
  const [termYears, setTermYears] = useState(30);

  // Costs and assumptions
  const [annualAppreciationPct, setAnnualAppreciationPct] = useState(3.0);
  const [annualTaxPct, setAnnualTaxPct] = useState(1.0);
  const [annualInsurancePct, setAnnualInsurancePct] = useState(0.35);
  const [monthlyHOA, setMonthlyHOA] = useState(0);

  // PMI
  const [hasPMI, setHasPMI] = useState(true);
  const [pmiPctAnnual, setPmiPctAnnual] = useState(0.6); // of original loan balance annually until 80% LTV

  // Exit planning
  const [showSellingCost, setShowSellingCost] = useState(true);
  const [sellingCostPct, setSellingCostPct] = useState(7);

  // Derived financing
  const downPayment = price * pct(downPct);
  const loanAmount = Math.max(0, price - downPayment);
  const r = pct(ratePct) / 12;
  const n = termYears * 12;
  const monthlyPI =
    r === 0 ? loanAmount / n : (loanAmount * r) / (1 - Math.pow(1 + r, -n));

  // Yearly projection
  const series = useMemo(() => {
    const rows = [];
    let bal = loanAmount;
    let homeValue = price;
    let months = 0;

    const monthlyTax = (price * pct(annualTaxPct)) / 12; // start estimate
    const monthlyIns = (price * pct(annualInsurancePct)) / 12;

    while (months <= n) {
      // recompute PMI monthly on original balance proxy until LTV <= 80%
      const LTV = bal / homeValue;
      const pmiMonthly =
        hasPMI && LTV > 0.80 ? (loanAmount * pct(pmiPctAnnual)) / 12 : 0;

      // amortize one month (skip at month 0)
      if (months > 0) {
        const interest = bal * r;
        const principal = Math.min(bal, monthlyPI - interest);
        bal = Math.max(0, bal - principal);
      }

      // appreciation yearly at month 12; but to smooth chart we apply per month compounding
      if (months > 0) {
        const apr = pct(annualAppreciationPct);
        const mApp = Math.pow(1 + apr, 1 / 12) - 1;
        homeValue *= 1 + mApp;
      }

      const equity = Math.max(0, homeValue - bal);
      const year = Math.floor(months / 12);

      // collect once per year or for month 0 and final month
      const isYearPoint = months % 12 === 0 || months === n;
      if (isYearPoint) {
        const taxes = (homeValue * pct(annualTaxPct));
        const insurance = (homeValue * pct(annualInsurancePct));
        const carrying = taxes + insurance + monthlyHOA * 12; // context only

        const sellCost = showSellingCost ? homeValue * pct(sellingCostPct) : 0;
        const netAtSale = Math.max(0, homeValue - bal - sellCost);

        rows.push({
          year,
          homeValue: Math.round(homeValue),
          balance: Math.round(bal),
          equity: Math.round(equity),
          netAtSale: Math.round(netAtSale),
          carrying: Math.round(carrying),
          LTV: clamp(LTV * 100, 0, 100)
        });
      }

      months += 1;
      if (bal <= 0 && months % 12 === 0) {
        // paid off; extend one more annual point then stop
        if (rows.length && rows[rows.length - 1].balance === 0) break;
      }
    }

    return rows;
  }, [
    loanAmount,
    price,
    n,
    annualAppreciationPct,
    annualInsurancePct,
    annualTaxPct,
    monthlyHOA,
    hasPMI,
    pmiPctAnnual
  ]);

  const last = series[series.length - 1] || {};
  const year10 = series.find((r) => r.year === 10) || last;
  const year5 = series.find((r) => r.year === 5) || last;

  return (
    <div className="max-w-6xl mx-auto my-8 p-6 bg-white rounded-2xl shadow">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-blue-800">📈 Equity Growth</h1>
        <p className="text-sm text-gray-600">
          Amortization + appreciation. Track equity, balance, LTV, and estimated net at sale.
        </p>
      </header>

      <div className="grid xl:grid-cols-4 gap-6">
        {/* Price & financing */}
        <section className="rounded-xl border p-4 space-y-3">
          <h2 className="font-semibold text-gray-800">Price & Loan</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700">Purchase Price ($)</label>
            <input
              type="number" className="mt-1 w-full rounded-md border p-2"
              value={price} min={50_000}
              onChange={(e) => setPrice(Number(e.target.value))}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Down Payment (%)</label>
              <input
                type="number" className="mt-1 w-full rounded-md border p-2"
                value={downPct} min={0} max={100} step="0.5"
                onChange={(e) => setDownPct(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Rate (APR %)</label>
              <input
                type="number" className="mt-1 w-full rounded-md border p-2"
                value={ratePct} min={0} max={15} step="0.01"
                onChange={(e) => setRatePct(Number(e.target.value))}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Term (years)</label>
            <input
              type="number" className="mt-1 w-full rounded-md border p-2"
              value={termYears} min={5} max={40}
              onChange={(e) => setTermYears(Number(e.target.value))}
            />
          </div>

          <div className="rounded-lg bg-gray-50 p-3 text-sm space-y-1">
            <div className="flex justify-between"><span className="text-gray-600">Down Payment</span><span className="font-semibold">{currency(downPayment)}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Loan Amount</span><span className="font-semibold">{currency(loanAmount)}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">P&I (monthly)</span><span className="font-semibold">{currency(monthlyPI)}</span></div>
          </div>
        </section>

        {/* Costs & PMI */}
        <section className="rounded-xl border p-4 space-y-3">
          <h2 className="font-semibold text-gray-800">Costs & PMI</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Taxes (% of value / yr)</label>
              <input
                type="number" className="mt-1 w-full rounded-md border p-2"
                value={annualTaxPct} min={0} max={5} step="0.05"
                onChange={(e) => setAnnualTaxPct(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Insurance (% of value / yr)</label>
              <input
                type="number" className="mt-1 w-full rounded-md border p-2"
                value={annualInsurancePct} min={0} max={2} step="0.05"
                onChange={(e) => setAnnualInsurancePct(Number(e.target.value))}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">HOA ($/mo)</label>
            <input
              type="number" className="mt-1 w-full rounded-md border p-2"
              value={monthlyHOA} min={0}
              onChange={(e) => setMonthlyHOA(Number(e.target.value))}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              id="pmi"
              type="checkbox"
              className="h-4 w-4"
              checked={hasPMI}
              onChange={(e) => setHasPMI(e.target.checked)}
            />
            <label htmlFor="pmi" className="text-sm text-gray-700">Apply PMI until 80% LTV</label>
          </div>
          {hasPMI && (
            <div>
              <label className="block text-sm font-medium text-gray-700">PMI Rate (annual % of loan)</label>
              <input
                type="number" className="mt-1 w-full rounded-md border p-2"
                value={pmiPctAnnual} min={0} max={2} step="0.05"
                onChange={(e) => setPmiPctAnnual(Number(e.target.value))}
              />
            </div>
          )}
        </section>

        {/* Growth & Exit */}
        <section className="rounded-xl border p-4 space-y-3">
          <h2 className="font-semibold text-gray-800">Growth & Exit</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700">Annual Appreciation (%)</label>
            <input
              type="number" className="mt-1 w-full rounded-md border p-2"
              value={annualAppreciationPct} min={-5} max={15} step="0.1"
              onChange={(e) => setAnnualAppreciationPct(Number(e.target.value))}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              id="sellc"
              type="checkbox"
              className="h-4 w-4"
              checked={showSellingCost}
              onChange={(e) => setShowSellingCost(e.target.checked)}
            />
            <label htmlFor="sellc" className="text-sm text-gray-700">Include Selling Cost</label>
          </div>
          {showSellingCost && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Selling Cost (%)</label>
              <input
                type="number" className="mt-1 w-full rounded-md border p-2"
                value={sellingCostPct} min={0} max={12} step="0.5"
                onChange={(e) => setSellingCostPct(Number(e.target.value))}
              />
            </div>
          )}

          <div className="rounded-lg bg-gray-50 p-3 text-sm space-y-1">
            <div className="flex justify-between"><span className="text-gray-600">Equity Year 5</span><span className="font-semibold">{currency(year5.equity || 0)}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Equity Year 10</span><span className="font-semibold">{currency(year10.equity || 0)}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">LTV Final</span><span className="font-semibold">{(last.LTV || 0).toFixed(1)}%</span></div>
          </div>
        </section>

        {/* Snapshot */}
        <section className="rounded-xl border p-4 space-y-3">
          <h2 className="font-semibold text-gray-800">Snapshot</h2>
          <div className="rounded-lg bg-blue-50 p-3 text-sm space-y-1">
            <div className="flex justify-between"><span className="text-blue-900">Final Home Value</span><span className="font-semibold text-blue-900">{currency(last.homeValue || price)}</span></div>
            <div className="flex justify-between"><span className="text-blue-900">Final Loan Balance</span><span className="font-semibold text-blue-900">{currency(last.balance || loanAmount)}</span></div>
            <div className="flex justify-between"><span className="text-blue-900">Final Equity</span><span className="font-semibold text-blue-900">{currency(last.equity || 0)}</span></div>
            <div className="flex justify-between"><span className="text-blue-900">Net at Sale</span><span className="font-semibold text-blue-900">{currency(last.netAtSale || 0)}</span></div>
          </div>
        </section>
      </div>

      {/* Equity over time */}
      <div className="mt-6 h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={series}>
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip
              formatter={(v, n) => [currency(v), n]}
              labelFormatter={(y) => `Year ${y}`}
            />
            <Legend />
            <Area type="monotone" dataKey="homeValue" name="Home Value" fillOpacity={0.2} />
            <Area type="monotone" dataKey="equity" name="Equity" fillOpacity={0.3} />
            <Area type="monotone" dataKey="netAtSale" name="Net at Sale" fillOpacity={0.25} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Balance vs Value */}
      <div className="mt-6 h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={series}>
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip formatter={(v, n) => [currency(v), n]} labelFormatter={(y) => `Year ${y}`} />
            <Legend />
            <Line type="monotone" dataKey="homeValue" name="Home Value" dot={false} />
            <Line type="monotone" dataKey="balance" name="Loan Balance" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <footer className="mt-6 rounded-lg bg-blue-50 p-4 text-sm text-blue-900">
        <ul className="list-disc pl-5 space-y-1">
          <li>Equity = Home Value − Loan Balance. Net at sale subtracts selling costs.</li>
          <li>Taxes, insurance, and HOA are context only. They do not change equity directly.</li>
          <li>PMI drops when LTV ≤ 80%. VA loans generally do not have monthly PMI.</li>
        </ul>
      </footer>
    </div>
  );
}
