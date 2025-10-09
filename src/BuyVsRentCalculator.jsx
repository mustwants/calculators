import React, { useMemo, useState } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { listStateOptions } from "./utils/loadStateTaxData";
import { propertyTaxAnnual } from "./utils/tax";

function pmt(annualRatePct, years, principal) {
  const r = (annualRatePct / 100) / 12;
  const n = years * 12;
  if (r === 0) return principal / n;
  return (r * principal) / (1 - Math.pow(1 + r, -n));
}

export default function BuyVsRentCalculator() {
  // State + horizon
  const [stateCode, setStateCode] = useState("VA");
  const states = useMemo(() => listStateOptions(), []);

  // Buy inputs
  const [price, setPrice] = useState(450000);
  const [downPct, setDownPct] = useState(5);
  const [ratePct, setRatePct] = useState(6.5);
  const [termYrs, setTermYrs] = useState(30);
  const [hoaMonthly, setHoaMonthly] = useState(75);
  const [maintPct, setMaintPct] = useState(1.0); // % of home value per year
  const [insMonthly, setInsMonthly] = useState(110);
  const [homeExpGrowthPct, setHomeExpGrowthPct] = useState(2.0);

  // Rent inputs
  const [rentMonthly, setRentMonthly] = useState(2300);
  const [rentersInsMonthly, setRentersInsMonthly] = useState(20);
  const [rentGrowthPct, setRentGrowthPct] = useState(3.0);

  // Investment alternative
  const [investReturnPct, setInvestReturnPct] = useState(5.0);

  // Analysis horizon
  const [yearsHorizon, setYearsHorizon] = useState(7);

  // Derived
  const downPayment = (price * (downPct / 100)) || 0;
  const loanAmt = Math.max(0, price - downPayment);
  const principalIntMonthly = pmt(ratePct, termYrs, loanAmt);

  const annualPropTax = propertyTaxAnnual(stateCode, price); // from state dataset (percent)
  const propTaxMonthly = annualPropTax / 12;

  const maintMonthly = (price * (maintPct / 100)) / 12;

  const buyBaseMonthlyNow = principalIntMonthly + propTaxMonthly + insMonthly + hoaMonthly + maintMonthly;
  const rentBaseMonthlyNow = rentMonthly + rentersInsMonthly;

  // Cumulative series over horizon with growth
  const chartData = useMemo(() => {
    const rows = [];
    let cumBuy = 0;
    let cumRent = 0;

    let buyMonthly = buyBaseMonthlyNow;
    let rentMonthlyWork = rentBaseMonthlyNow;

    const buyGrow = 1 + (homeExpGrowthPct / 100) / 12;   // monthly growth
    const rentGrow = 1 + (rentGrowthPct / 100) / 12;

    // Simple opportunity cost: invest down payment if renting
    // Track invest value if renting; assume contributions = (buyMonthly - rentMonthlyWork)+ each month if positive
    let investBalance = downPayment; // buyer ties up down payment; renter invests it instead
    let renterInvestBalance = downPayment;
    const investGrow = 1 + (investReturnPct / 100) / 12;

    for (let m = 1; m <= yearsHorizon * 12; m++) {
      // Costs
      cumBuy += buyMonthly;
      cumRent += rentMonthlyWork;

      // Renter invests the payment savings if rent < buy
      const monthlyDiff = Math.max(0, buyMonthly - rentMonthlyWork);
      renterInvestBalance = (renterInvestBalance + monthlyDiff) * investGrow;

      // Buyer’s down payment is opportunity cost; track counterfactual only for display
      investBalance = investBalance * investGrow;

      // Push annual points and final month for readability
      if (m % 12 === 0 || m === yearsHorizon * 12) {
        rows.push({
          month: m,
          year: (m / 12).toFixed(1),
          Cumulative_Buy: cumBuy,
          Cumulative_Rent: cumRent,
          Renter_Invest_Value: renterInvestBalance,
          Buyer_Opportunity_Cost: investBalance
        });
      }

      // Grow monthly streams
      buyMonthly *= buyGrow;
      rentMonthlyWork *= rentGrow;
    }
    return rows;
  }, [
    buyBaseMonthlyNow,
    rentBaseMonthlyNow,
    yearsHorizon,
    homeExpGrowthPct,
    rentGrowthPct,
    investReturnPct,
    downPayment
  ]);

  const last = chartData[chartData.length - 1] || {};
  const netCostBuy = (last.Cumulative_Buy || 0);
  const netCostRent = (last.Cumulative_Rent || 0) - (last.Renter_Invest_Value || 0); // rent cost less investment growth
  const recommendation =
    netCostBuy < netCostRent ? "Buying has lower net cost over the selected horizon." : "Renting has lower net cost over the selected horizon.";

  return (
    <div className="max-w-6xl mx-auto my-8 p-6 bg-white rounded-2xl shadow">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-blue-800">⚖️ Buy vs Rent</h1>
        <p className="text-sm text-gray-600">
          Uses your state’s average property tax rate. Monthly buy costs include P&I, property tax, insurance, HOA, and maintenance. Rent includes rent and renter’s insurance. Renter invests the savings at your chosen return.
        </p>
      </header>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Inputs: State + Horizon */}
        <div className="rounded-xl border p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">State</label>
            <select
              className="mt-1 w-full rounded-md border border-gray-300 p-2 bg-white"
              value={stateCode}
              onChange={(e) => setStateCode(e.target.value)}
            >
              {states.map((s) => (
                <option key={s.code} value={s.code}>{s.name} ({s.code})</option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Property tax auto-filled from state averages.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Analysis Horizon (years)</label>
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

        {/* Inputs: Buy */}
        <div className="rounded-xl border p-4 space-y-4">
          <h2 className="font-semibold text-gray-800">Buy</h2>

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
              <label className="block text-sm font-medium text-gray-700">Rate (%)</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border border-gray-300 p-2"
                value={ratePct}
                min={0}
                step="0.01"
                onChange={(e) => setRatePct(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
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
            <div>
              <label className="block text-sm font-medium text-gray-700">HOA ($/mo)</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border border-gray-300 p-2"
                value={hoaMonthly}
                min={0}
                onChange={(e) => setHoaMonthly(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Maintenance (%/yr of price)</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border border-gray-300 p-2"
                value={maintPct}
                min={0}
                step="0.1"
                onChange={(e) => setMaintPct(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Home Insurance ($/mo)</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border border-gray-300 p-2"
                value={insMonthly}
                min={0}
                onChange={(e) => setInsMonthly(Number(e.target.value))}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Home Expense Growth (%/yr)</label>
            <input
              type="number"
              className="mt-1 w-full rounded-md border border-gray-300 p-2"
              value={homeExpGrowthPct}
              min={0}
              step="0.1"
              onChange={(e) => setHomeExpGrowthPct(Number(e.target.value))}
            />
          </div>
        </div>

        {/* Inputs: Rent + Invest */}
        <div className="rounded-xl border p-4 space-y-4">
          <h2 className="font-semibold text-gray-800">Rent</h2>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Rent ($/mo)</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border border-gray-300 p-2"
                value={rentMonthly}
                min={0}
                onChange={(e) => setRentMonthly(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Renter’s Insurance ($/mo)</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border border-gray-300 p-2"
                value={rentersInsMonthly}
                min={0}
                onChange={(e) => setRentersInsMonthly(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Rent Growth (%/yr)</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border border-gray-300 p-2"
                value={rentGrowthPct}
                min={0}
                step="0.1"
                onChange={(e) => setRentGrowthPct(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Invest Return (%/yr)</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border border-gray-300 p-2"
                value={investReturnPct}
                min={0}
                step="0.1"
                onChange={(e) => setInvestReturnPct(Number(e.target.value))}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <section className="mt-6 grid md:grid-cols-3 gap-4">
        <div className="rounded-xl border p-4">
          <div className="text-xs uppercase text-gray-500">Buyer Monthly (now)</div>
          <div className="text-xl font-semibold">${buyBaseMonthlyNow.toFixed(0)}</div>
          <div className="text-xs text-gray-500">P&I + Tax + Ins + HOA + Maint</div>
        </div>
        <div className="rounded-xl border p-4">
          <div className="text-xs uppercase text-gray-500">Renter Monthly (now)</div>
          <div className="text-xl font-semibold">${(rentBaseMonthlyNow).toFixed(0)}</div>
          <div className="text-xs text-gray-500">Rent + Renter’s Ins</div>
        </div>
        <div className="rounded-xl border p-4">
          <div className="text-xs uppercase text-gray-500">Down Payment</div>
          <div className="text-xl font-semibold">${downPayment.toLocaleString()}</div>
          <div className="text-xs text-gray-500">Opportunity cost if renting</div>
        </div>
      </section>

      {/* Chart */}
      <div className="mt-6 h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip formatter={(v) => `$${Math.round(v).toLocaleString()}`} />
            <Legend />
            <Line type="monotone" dataKey="Cumulative_Buy" name="Cumulative Buy Cost" stroke="#2563eb" />
            <Line type="monotone" dataKey="Cumulative_Rent" name="Cumulative Rent Cost" stroke="#f97316" />
            <Line type="monotone" dataKey="Renter_Invest_Value" name="Renter Invest Value" stroke="#16a34a" strokeDasharray="5 5" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Recommendation */}
      <div className="mt-6 p-4 border-l-4 rounded bg-blue-50 border-blue-400">
        <h2 className="font-semibold text-lg mb-1">Recommendation</h2>
        <p>{recommendation}</p>
        <p className="text-xs text-gray-600 mt-2">
          Notes: Property tax uses state averages and may differ by county and veteran exemptions. Mortgage interest tax treatment, depreciation, and capital gains exclusions are not modeled here.
        </p>
      </div>
    </div>
  );
}

