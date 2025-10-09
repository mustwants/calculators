// PATH: src/BuyVsRentCalculator.jsx
import React, { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import { listStateOptions, getState } from "./utils/loadStateTaxData";

/**
 * Buy vs Rent — Military-friendly, state-aware
 *
 * Compares after-tax total cost and net worth over a holding period.
 * Includes:
 *  - Mortgage amortization (fixed-rate)
 *  - Property tax (prefilled by state effective rate if available)
 *  - Insurance, HOA, maintenance
 *  - Appreciation and selling costs on exit
 *  - Rent with annual growth
 *  - Simple tax effect: mortgage interest + property tax * marginal rate (capped by user via SALT slider)
 *
 * Notes:
 *  - BAH/BAS are not taxed; if using BAH toward housing, you can model it by
 *    reducing the effective “cost” manually outside this tool or by noting
 *    that rent and PITI are paid with a mix of taxable and non-taxable income.
 *  - Planner only. Not advice. Numbers are estimates.
 */

function pct(x) {
  const n = Number(x);
  return Number.isFinite(n) ? n / 100 : 0;
}
function money(x) {
  const v = Math.round(Number(x) || 0);
  return `$${v.toLocaleString()}`;
}
function clamp(n, lo, hi) {
  return Math.min(Math.max(n, lo), hi);
}

export default function BuyVsRentCalculator() {
  // State tax context
  const states = useMemo(() => listStateOptions(), []);
  const [stateCode, setStateCode] = useState("VA");
  const stateMeta = getState(stateCode);

  // Purchase inputs
  const [price, setPrice] = useState(450_000);
  const [downPct, setDownPct] = useState(5);
  const [ratePct, setRatePct] = useState(6.25);
  const [termYears, setTermYears] = useState(30);

  // Carry costs
  const inferredPropTaxPct =
    stateMeta?.tax?.property?.effectiveRatePct ??
    stateMeta?.tax?.property?.notes?.defaultRatePct ??
    1.0;
  const [propTaxPct, setPropTaxPct] = useState(inferredPropTaxPct); // % of value / yr
  const [insPct, setInsPct] = useState(0.35); // % of value / yr
  const [hoaMonthly, setHoaMonthly] = useState(0);
  const [maintPct, setMaintPct] = useState(1.0); // % of value / yr

  // Appreciation & exit
  const [yearsHold, setYearsHold] = useState(7);
  const [appreciationPct, setAppreciationPct] = useState(3.0);
  const [sellCostPct, setSellCostPct] = useState(7.0);

  // Rent path
  const [rentNow, setRentNow] = useState(2500);
  const [rentGrowthPct, setRentGrowthPct] = useState(3.0);
  const [rentersInsuranceMonthly, setRentersInsuranceMonthly] = useState(20);

  // Tax effect (simple)
  const [marginalRatePct, setMarginalRatePct] = useState(22); // federal+state effective
  const [saltCapAnnual, setSaltCapAnnual] = useState(10_000); // cap for deductible property tax (user-controlled)
  const [applyTaxEffects, setApplyTaxEffects] = useState(true);

  // Derived financing
  const downPayment = price * pct(downPct);
  const loanAmount = Math.max(0, price - downPayment);
  const r = pct(ratePct) / 12;
  const n = termYears * 12;
  const monthlyPI =
    r === 0 ? loanAmount / n : (loanAmount * r) / (1 - Math.pow(1 + r, -n));

  // Projection
  const series = useMemo(() => {
    const rows = [];
    let bal = loanAmount;
    let value = price;

    let cumBuyCost = 0; // cumulative outflows for owning
    let cumRentCost = 0; // cumulative outflows for renting
    const mApp = Math.pow(1 + pct(appreciationPct), 1 / 12) - 1;

    for (let month = 0; month <= yearsHold * 12; month++) {
      // Value path
      if (month > 0) value *= 1 + mApp;

      // Amortize one month
      let interest = 0;
      let principal = 0;
      if (month > 0) {
        interest = bal * r;
        principal = Math.min(bal, monthlyPI - interest);
        bal = Math.max(0, bal - principal);
      }

      // Monthly owner costs
      const taxMonthly = (value * pct(propTaxPct)) / 12;
      const insMonthly = (value * pct(insPct)) / 12;
      const maintMonthly = (value * pct(maintPct)) / 12;
      const hoa = hoaMonthly;

      // Tax benefit approximation
      // Annualized then spread monthly for display simplicity.
      // Deductible portion = min(property tax, SALT cap) + mortgage interest, times marginal rate.
      const monthlyInterest = interest;
      const monthlyPropTaxDeductible = Math.min(
        saltCapAnnual / 12,
        taxMonthly
      );
      const monthlyTaxBenefit =
        applyTaxEffects
          ? (monthlyInterest + monthlyPropTaxDeductible) * pct(marginalRatePct)
          : 0;

      const ownerMonthlyCost =
        monthlyPI + taxMonthly + insMonthly + maintMonthly + hoa - monthlyTaxBenefit;

      // Renter path
      const rentMonthly =
        month === 0
          ? rentNow
          : Math.round(rentNow * Math.pow(1 + pct(rentGrowthPct), month / 12));
      const renterMonthlyCost = rentMonthly + rentersInsuranceMonthly;

      // Cumulate
      if (month > 0) {
        cumBuyCost += ownerMonthlyCost;
        cumRentCost += renterMonthlyCost;
      }

      // Record yearly points and month 0
      if (month % 12 === 0 || month === yearsHold * 12) {
        const year = Math.floor(month / 12);

        rows.push({
          month,
          year,
          homeValue: Math.round(value),
          loanBalance: Math.round(bal),
          equity: Math.max(0, Math.round(value - bal)),
          cumBuyCost: Math.round(cumBuyCost),
          cumRentCost: Math.round(cumRentCost),
          diffRentMinusBuy: Math.round(cumRentCost - cumBuyCost), // positive favors buying
        });
      }
    }

    return rows;
  }, [
    loanAmount,
    price,
    yearsHold,
    appreciationPct,
    propTaxPct,
    insPct,
    maintPct,
    hoaMonthly,
    monthlyPI,
    marginalRatePct,
    saltCapAnnual,
    applyTaxEffects,
    rentNow,
    rentGrowthPct,
    rentersInsuranceMonthly,
    r,
  ]);

  const last = series[series.length - 1] || {};
  const sellCost = (last.homeValue || 0) * pct(sellCostPct);
  const ownerNetProceeds = Math.max(0, (last.homeValue || 0) - (last.loanBalance || 0) - sellCost);

  // Net worth comparison at exit
  // Owners: Equity net of selling costs minus cumulative owner outflows (already captured),
  // but for apples-to-apples, compare cash position:
  //   Owner Net Position = Equity after selling costs - Cumulative Owner Costs
  //   Renter Net Position = 0 - Cumulative Renter Costs (no asset, ignores investing surplus)
  // Optionally, a user could invest the "difference", but we keep base case simple.
  const ownerNetPosition = ownerNetProceeds - (last.cumBuyCost || 0);
  const renterNetPosition = 0 - (last.cumRentCost || 0);
  const advantage = ownerNetPosition - renterNetPosition; // positive favors buying

  const lineData = series.map((r) => ({
    year: r.year,
    "Rent cumulative": r.cumRentCost,
    "Buy cumulative": r.cumBuyCost,
    "Rent − Buy": r.diffRentMinusBuy,
  }));

  const barData = [
    { name: "Owner net position", value: ownerNetPosition },
    { name: "Renter net position", value: renterNetPosition },
    { name: "Advantage (Owner − Renter)", value: advantage },
  ];

  return (
    <div className="max-w-6xl mx-auto my-8 p-6 bg-white rounded-2xl shadow">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-blue-800">⚖️ Buy vs Rent</h1>
        <p className="text-sm text-gray-600">
          Compares total cost paths and exit net worth. Prefills property tax by state if available. Estimates simple tax effects.
        </p>
      </header>

      <div className="grid xl:grid-cols-4 gap-6">
        {/* State & Taxes */}
        <section className="rounded-xl border p-4 space-y-3">
          <h2 className="font-semibold text-gray-800">State & Taxes</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700">State</label>
            <select
              className="mt-1 w-full rounded-md border p-2 bg-white"
              value={stateCode}
              onChange={(e) => {
                const code = e.target.value;
                setStateCode(code);
                const meta = getState(code);
                const nextRate =
                  meta?.tax?.property?.effectiveRatePct ??
                  meta?.tax?.property?.notes?.defaultRatePct ??
                  propTaxPct;
                setPropTaxPct(Number(nextRate));
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
              id="taxfx"
              type="checkbox"
              className="h-4 w-4"
              checked={applyTaxEffects}
              onChange={(e) => setApplyTaxEffects(e.target.checked)}
            />
            <label htmlFor="taxfx" className="text-sm text-gray-700">
              Apply simple tax effects
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Marginal Rate (%)</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border p-2"
                value={marginalRatePct}
                min={0}
                max={45}
                step="0.5"
                onChange={(e) => setMarginalRatePct(Number(e.target.value))}
              />
              <p className="mt-1 text-xs text-gray-500">Approx federal + state combined.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">SALT Cap (annual $)</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border p-2"
                value={saltCapAnnual}
                min={0}
                step="500"
                onChange={(e) => setSaltCapAnnual(Number(e.target.value))}
              />
            </div>
          </div>
        </section>

        {/* Purchase & Loan */}
        <section className="rounded-xl border p-4 space-y-3">
          <h2 className="font-semibold text-gray-800">Purchase & Loan</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700">Price ($)</label>
            <input
              type="number"
              className="mt-1 w-full rounded-md border p-2"
              value={price}
              min={50_000}
              onChange={(e) => setPrice(Number(e.target.value))}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Down (%)</label>
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

          <div className="rounded-lg bg-gray-50 p-3 text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-600">Down Payment</span>
              <span className="font-semibold">{money(downPayment)}</span>
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

        {/* Carry & Exit */}
        <section className="rounded-xl border p-4 space-y-3">
          <h2 className="font-semibold text-gray-800">Carry & Exit</h2>

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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Maintenance (%/yr)</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border p-2"
                value={maintPct}
                min={0}
                max={5}
                step="0.1"
                onChange={(e) => setMaintPct(Number(e.target.value))}
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Hold (years)</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border p-2"
                value={yearsHold}
                min={1}
                max={30}
                onChange={(e) => setYearsHold(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Appreciation (%/yr)</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border p-2"
                value={appreciationPct}
                min={-5}
                max={15}
                step="0.1"
                onChange={(e) => setAppreciationPct(Number(e.target.value))}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Selling Cost (% of value)</label>
            <input
              type="number"
              className="mt-1 w-full rounded-md border p-2"
              value={sellCostPct}
              min={0}
              max={12}
              step="0.5"
              onChange={(e) => setSellCostPct(Number(e.target.value))}
            />
          </div>
        </section>

        {/* Rent Path */}
        <section className="rounded-xl border p-4 space-y-3">
          <h2 className="font-semibold text-gray-800">Rent Path</h2>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Current Rent ($/mo)</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border p-2"
                value={rentNow}
                min={0}
                onChange={(e) => setRentNow(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Rent Growth (%/yr)</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border p-2"
                value={rentGrowthPct}
                min={-5}
                max={15}
                step="0.1"
                onChange={(e) => setRentGrowthPct(Number(e.target.value))}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Renter's Insurance ($/mo)</label>
            <input
              type="number"
              className="mt-1 w-full rounded-md border p-2"
              value={rentersInsuranceMonthly}
              min={0}
              onChange={(e) => setRentersInsuranceMonthly(Number(e.target.value))}
            />
          </div>

          <div className="rounded-lg bg-gray-50 p-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-700">Owner Net Proceeds at Exit</span>
              <span className="font-semibold">{money(ownerNetProceeds)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Owner Net Position</span>
              <span className="font-semibold">{money(ownerNetPosition)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Renter Net Position</span>
              <span className="font-semibold">{money(renterNetPosition)}</span>
            </div>
          </div>
        </section>
      </div>

      {/* Cumulative cost lines */}
      <div className="mt-6 h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={lineData}>
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip formatter={(v, n) => [money(v), n]} labelFormatter={(y) => `Year ${y}`} />
            <Legend />
            <Line type="monotone" dataKey="Rent cumulative" dot={false} />
            <Line type="monotone" dataKey="Buy cumulative" dot={false} />
            <Line type="monotone" dataKey="Rent − Buy" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Exit net position bars */}
      <div className="mt-6 h-72 w-full">
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

      <footer className="mt-6 rounded-lg bg-blue-50 p-4 text-sm text-blue-900">
        <ul className="list-disc pl-5 space-y-1">
          <li>
            Tax effects are simplified: interest + capped property tax × marginal rate. Real results depend on itemizing and current law.
          </li>
          <li>
            Military users paying housing with BAH can interpret affordability separately. This tool focuses on cash flows and asset value.
          </li>
          <li>
            You can simulate conservative or aggressive cases by adjusting appreciation, rent growth, and selling costs.
          </li>
        </ul>
      </footer>
    </div>
  );
}

