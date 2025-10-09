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
  AreaChart,
  Area,
} from "recharts";
import { listStateOptions, getState } from "./utils/loadStateTaxData";

/**
 * Buy vs Rent — Military-aware
 * Compares 10–30 year horizon.
 * Includes VA option with funding fee, PMI for non-VA, property tax by state, insurance, HOA,
 * maintenance, buyer and seller closing costs, rent growth, investment return on renter surplus,
 * and home appreciation with equity build via amortization.
 * Planner only. Not advice.
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

export default function BuyVsRentCalculator() {
  // State property tax baseline
  const states = useMemo(() => listStateOptions(), []);
  const [stateCode, setStateCode] = useState("VA");
  const stateMeta = getState(stateCode);
  const inferredPropTaxPct =
    stateMeta?.tax?.property?.effectiveRatePct ??
    stateMeta?.tax?.property?.notes?.defaultRatePct ??
    1.0;

  // Horizon
  const [years, setYears] = useState(10);

  // Buy inputs
  const [price, setPrice] = useState(450_000);
  const [isVA, setIsVA] = useState(true);
  const [firstUse, setFirstUse] = useState(true);
  const [financeFundingFee, setFinanceFundingFee] = useState(true);
  const [downPct, setDownPct] = useState(5);
  const [ratePct, setRatePct] = useState(6.25);
  const [termYears, setTermYears] = useState(30);
  const [propTaxPct, setPropTaxPct] = useState(inferredPropTaxPct);
  const [insPct, setInsPct] = useState(0.35);
  const [hoaMonthly, setHoaMonthly] = useState(0);
  const [maintPct, setMaintPct] = useState(1.0); // % of value annually
  const [buyerCCPct, setBuyerCCPct] = useState(2.0); // at purchase
  const [sellerCCPct, setSellerCCPct] = useState(6.0); // at sale (agent + costs)
  const [appreciationPct, setAppreciationPct] = useState(3.0);

  // Rent inputs
  const [rentNow, setRentNow] = useState(2400);
  const [rentGrowthPct, setRentGrowthPct] = useState(3.0);
  const [rentersIns, setRentersIns] = useState(20);
  const [utilities, setUtilities] = useState(250);
  const [parking, setParking] = useState(0);

  // Opportunity cost
  const [investReturnPct, setInvestReturnPct] = useState(5.0); // annual return on renter surplus or buyer cash

  // VA funding fee helper (basic)
  function vaFundingFeeRate(downP, first) {
    if (downP >= 10) return 1.25;
    if (downP >= 5) return 1.5;
    return first ? 2.15 : 3.3;
  }

  // Mortgage and paths
  const down = isVA ? 0 : price * pct(downPct);
  const baseLoan = Math.max(0, price - down);
  const ffRate = isVA ? vaFundingFeeRate(downPct, firstUse) : 0;
  const fundingFee = baseLoan * pct(ffRate);
  const loanAmount = isVA ? (financeFundingFee ? baseLoan + fundingFee : baseLoan) : baseLoan;

  const r = pct(ratePct) / 12;
  const nper = termYears * 12;
  const monthlyPI = r === 0 ? loanAmount / nper : (loanAmount * r) / (1 - Math.pow(1 + r, -nper));

  // PMI (simple, until 80% LTV, as % of original balance)
  const [pmiAnnualPct, setPmiAnnualPct] = useState(0.6);
  const pmiStartMonthly = !isVA && (loanAmount / price) > 0.8 ? ((loanAmount) * pct(pmiAnnualPct)) / 12 : 0;

  const months = Math.min(years * 12, nper);
  const mAppreciation = Math.pow(1 + pct(appreciationPct), 1 / 12) - 1;
  const mInvest = Math.pow(1 + pct(investReturnPct), 1 / 12) - 1;
  const mRentGrowth = Math.pow(1 + pct(rentGrowthPct), 1 / 12) - 1;

  // Buyer up-front cost
  const buyerCC = price * pct(buyerCCPct);
  const upfrontCash = (isVA ? 0 : down) + (financeFundingFee ? 0 : fundingFee) + buyerCC;

  // Amortization and cost build
  let bal = loanAmount;
  let homeVal = price;
  let rent = rentNow;

  let buyCashOut = upfrontCash; // positive = cash paid out
  let rentCashOut = 0;

  let buyerEquity = isVA ? 0 : down; // starting equity
  let renterPortfolio = upfrontCash; // assume renter invests what buyer spends upfront

  // For charting
  const series = [];

  for (let m = 1; m <= months; m++) {
    // Update home value
    homeVal *= (1 + mAppreciation);

    // Mortgage P&I
    const interest = bal * r;
    const principal = Math.min(bal, monthlyPI - interest);
    bal = Math.max(0, bal - principal);

    // PMI check based on current LTV
    const ltv = bal / homeVal;
    const pmiMonthly = (!isVA && ltv > 0.8) ? pmiStartMonthly : 0;

    // Escrows and maintenance
    const taxMonthly = (homeVal * pct(propTaxPct)) / 12;
    const insMonthly = (homeVal * pct(insPct)) / 12;
    const maintMonthly = (homeVal * pct(maintPct)) / 12;

    const buyMonthly = monthlyPI + taxMonthly + insMonthly + maintMonthly + hoaMonthly + pmiMonthly;

    // Rent all-in
    rent = Math.round(rent * (1 + mRentGrowth));
    const rentMonthly = rent + rentersIns + utilities + parking;

    // Cash outflows tracked
    buyCashOut += buyMonthly;
    rentCashOut += rentMonthly;

    // Equity increases by principal plus appreciation less selling friction later
    buyerEquity = (homeVal - bal);

    // Opportunity cost: if renting is cheaper this month than buying, invest surplus
    const surplus = Math.max(0, buyMonthly - rentMonthly);
    renterPortfolio *= (1 + mInvest);
    renterPortfolio += Math.max(0, -surplus); // if rent cheaper, surplus positive for renter
    // If buying is cheaper, renter cannot invest more; portfolio still compounds.

    if (m % 12 === 0 || m === months) {
      // “Net worth” lens at this point:
      // Buyer net = equity minus hypothetical sale costs if they sold now
      const saleCosts = homeVal * pct(sellerCCPct);
      const buyerNetAfterSale = Math.max(0, homeVal - saleCosts - bal);

      // Renter net = portfolio
      const renterNet = renterPortfolio;

      // Total cost lens:
      const buyTotalCost = buyCashOut - buyerNetAfterSale;
      const rentTotalCost = rentCashOut - renterNet;

      series.push({
        year: m / 12,
        "Buy total cost (net)": Math.round(buyTotalCost),
        "Rent total cost (net)": Math.round(rentTotalCost),
        "Buyer equity if sold": Math.round(buyerNetAfterSale),
        "Renter portfolio": Math.round(renterNet),
      });
    }
  }

  const last = series[series.length - 1] || {};
  const verdict =
    (last["Buy total cost (net)"] ?? Infinity) < (last["Rent total cost (net)"] ?? Infinity)
      ? "Buying likely wins over this horizon."
      : "Renting likely wins over this horizon.";

  return (
    <div className="max-w-6xl mx-auto my-8 p-6 bg-white rounded-2xl shadow">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-blue-800">⚖️ Buy vs Rent</h1>
        <p className="text-sm text-gray-600">
          Full-path comparison with VA, PMI, state property tax, closing costs, appreciation, and investment of surplus.
        </p>
      </header>

      <div className="grid xl:grid-cols-4 gap-6">
        {/* State & Horizon */}
        <section className="rounded-xl border p-4 space-y-3">
          <h2 className="font-semibold text-gray-800">State & Horizon</h2>

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

          <div>
            <label className="block text-sm font-medium text-gray-700">Horizon (years)</label>
            <input
              type="number"
              className="mt-1 w-full rounded-md border p-2"
              value={years}
              min={3}
              max={30}
              onChange={(e) => setYears(Number(e.target.value))}
            />
          </div>

          <div className="rounded-lg bg-gray-50 p-3 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-700">Property tax default</span>
              <span className="font-semibold">{propTaxPct.toFixed(2)}%</span>
            </div>
          </div>
        </section>

        {/* Buy inputs */}
        <section className="rounded-xl border p-4 space-y-3">
          <h2 className="font-semibold text-gray-800">Buy Inputs</h2>

          <div className="grid grid-cols-2 gap-3">
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
            <div className="flex items-center gap-2 mt-6">
              <input
                id="isva"
                type="checkbox"
                className="h-4 w-4"
                checked={isVA}
                onChange={(e) => setIsVA(e.target.checked)}
              />
              <label htmlFor="isva" className="text-sm text-gray-700">VA loan</label>
            </div>
          </div>

          {!isVA && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Down payment (%)</label>
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

          {isVA && (
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <input
                  id="first"
                  type="checkbox"
                  className="h-4 w-4"
                  checked={firstUse}
                  onChange={(e) => setFirstUse(e.target.checked)}
                />
                <label htmlFor="first" className="text-sm text-gray-700">First-use fee</label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="financeFF"
                  type="checkbox"
                  className="h-4 w-4"
                  checked={financeFundingFee}
                  onChange={(e) => setFinanceFundingFee(e.target.checked)}
                />
                <label htmlFor="financeFF" className="text-sm text-gray-700">Finance fee</label>
              </div>
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

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Property tax (%/yr)</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border p-2"
                value={propTaxPct}
                min={0}
                max={5}
                step="0.05"
                onChange={(e) => setPropTaxPct(Number(e.target.value))}
              />
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

          <div className="grid grid-cols-3 gap-3">
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
              <label className="block text-sm font-medium text-gray-700">Buyer CC at purchase (%)</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border p-2"
                value={buyerCCPct}
                min={0}
                max={5}
                step="0.1"
                onChange={(e) => setBuyerCCPct(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Seller CC at sale (%)</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border p-2"
                value={sellerCCPct}
                min={0}
                max={10}
                step="0.1"
                onChange={(e) => setSellerCCPct(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="rounded-lg bg-gray-50 p-3 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-700">Funding fee rate</span>
              <span className="font-semibold">{ffRate.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Funding fee</span>
              <span className="font-semibold">{money(fundingFee)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Up-front cash out</span>
              <span className="font-semibold">{money(upfrontCash)}</span>
            </div>
          </div>
        </section>

        {/* Rent inputs */}
        <section className="rounded-xl border p-4 space-y-3">
          <h2 className="font-semibold text-gray-800">Rent Inputs</h2>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Current rent ($/mo)</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border p-2"
                value={rentNow}
                min={0}
                onChange={(e) => setRentNow(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Rent growth (%/yr)</label>
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

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Renter’s insurance ($/mo)</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border p-2"
                value={rentersIns}
                min={0}
                onChange={(e) => setRentersIns(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Utilities ($/mo)</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border p-2"
                value={utilities}
                min={0}
                onChange={(e) => setUtilities(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Parking ($/mo)</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border p-2"
                value={parking}
                min={0}
                onChange={(e) => setParking(Number(e.target.value))}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Invest return on surplus (%/yr)</label>
            <input
              type="number"
              className="mt-1 w-full rounded-md border p-2"
              value={investReturnPct}
              min={0}
              max={15}
              step="0.1"
              onChange={(e) => setInvestReturnPct(Number(e.target.value))}
            />
          </div>
        </section>
      </div>

      {/* Results */}
      <div className="mt-6 grid lg:grid-cols-2 gap-6">
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series}>
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip formatter={(v, n) => [money(v), n]} labelFormatter={(y) => `Year ${y}`} />
              <Legend />
              <Line type="monotone" dataKey="Buy total cost (net)" dot={false} />
              <Line type="monotone" dataKey="Rent total cost (net)" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series}>
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip formatter={(v, n) => [money(v), n]} labelFormatter={(y) => `Year ${y}`} />
              <Legend />
              <Area type="monotone" dataKey="Buyer equity if sold" stackId="1" />
              <Area type="monotone" dataKey="Renter portfolio" stackId="1" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Verdict */}
      <div className="mt-6 rounded-lg bg-blue-50 p-4">
        <p className="text-blue-900 text-sm">
          {verdict} Compares total cash out minus net equity or portfolio value at the selected horizon.
        </p>
        <p className="text-xs text-blue-900 mt-1">
          Sale costs assumed at {sellerCCPct}% of home value. Maintenance at {maintPct}% of value annually.
          Property tax prefilled from state dataset but editable.
        </p>
      </div>
    </div>
  );
}
