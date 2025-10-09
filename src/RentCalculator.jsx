// PATH: src/RentCalculator.jsx
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
 * Rent Calculator — Military-aware
 * - Models total monthly and multi-year cost of renting.
 * - Handles annual rent growth, utilities, parking, renter’s insurance, one-time fees.
 * - Lets you enter BAH/BAS and taxable income to show net-pay impact by state.
 * - Outputs cost timeline and category breakdown.
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

export default function RentCalculator() {
  // State context for net-pay lens
  const states = useMemo(() => listStateOptions(), []);
  const [stateCode, setStateCode] = useState("VA");
  const stateMeta = getState(stateCode);
  const stateIncomeTaxRate =
    stateMeta?.tax?.income?.effectiveRatePct ?? 0; // % of taxable income, monthly basis

  // Rent path
  const [rentNow, setRentNow] = useState(2400);
  const [rentGrowthPct, setRentGrowthPct] = useState(3.0);
  const [leaseYears, setLeaseYears] = useState(3);

  // Monthly add-ons
  const [utilities, setUtilities] = useState(250);
  const [parking, setParking] = useState(0);
  const [rentersInsurance, setRentersInsurance] = useState(20);
  const [otherMonthly, setOtherMonthly] = useState(0);

  // One-time costs
  const [applicationFee, setApplicationFee] = useState(75);
  const [adminFee, setAdminFee] = useState(150);
  const [securityDeposit, setSecurityDeposit] = useState(1000);
  const [moveInCosts, setMoveInCosts] = useState(500);

  // Military income lens
  const [taxableIncomeMonthly, setTaxableIncomeMonthly] = useState(6500);
  const [bah, setBAH] = useState(2400); // non-taxed
  const [bas, setBAS] = useState(450); // non-taxed

  // Compute monthly state tax for net-pay display
  const estStateTaxMonthly = taxableIncomeMonthly * (stateIncomeTaxRate / 100);
  const netTakeHome = taxableIncomeMonthly - estStateTaxMonthly + bah + bas;

  // Build timeline
  const months = leaseYears * 12;
  const mRentGrowth = Math.pow(1 + pct(rentGrowthPct), 1 / 12) - 1;

  const timeline = [];
  let totalAllIn = 0;
  for (let m = 0; m <= months; m++) {
    const rent =
      m === 0 ? rentNow : Math.round(rentNow * Math.pow(1 + mRentGrowth, m));
    const monthly = rent + utilities + parking + rentersInsurance + otherMonthly;
    if (m > 0) totalAllIn += monthly;

    if (m % 12 === 0 || m === months) {
      timeline.push({
        month: m,
        year: Math.floor(m / 12),
        Rent: rent,
        Utilities: utilities,
        Parking: parking,
        "Renter’s ins.": rentersInsurance,
        Other: otherMonthly,
        "All-in monthly": monthly,
        "Cumulative spend": Math.round(totalAllIn + oneTimeTotal()),
      });
    }
  }

  function oneTimeTotal() {
    return (
      n(applicationFee) + n(adminFee) + n(securityDeposit) + n(moveInCosts)
    );
  }

  const latest = timeline[timeline.length - 1] || {};
  const avgMonthly =
    months > 0 ? (latest["Cumulative spend"] || 0) / months : latest["All-in monthly"] || 0;

  // Charts data
  const lineData = timeline.map((r) => ({
    year: r.year,
    "All-in monthly": r["All-in monthly"],
    "Cumulative spend": r["Cumulative spend"],
  }));

  const barData = [
    { name: "Rent", value: n(rentNow) },
    { name: "Utilities", value: n(utilities) },
    { name: "Parking", value: n(parking) },
    { name: "Renter’s ins.", value: n(rentersInsurance) },
    { name: "Other", value: n(otherMonthly) },
  ];

  // Affordability lens vs net take-home and BAH
  const currentAllIn = n(rentNow) + n(utilities) + n(parking) + n(rentersInsurance) + n(otherMonthly);
  const bahCoveragePct = bah > 0 ? Math.min(100, (currentAllIn / bah) * 100) : 0;
  const takeHomeCoveragePct =
    netTakeHome > 0 ? Math.min(100, (currentAllIn / netTakeHome) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto my-8 p-6 bg-white rounded-2xl shadow">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-blue-800">🏢 Rent Calculator</h1>
        <p className="text-sm text-gray-600">
          Projects rent with growth and add-ons. Shows cumulative spend and net-pay lens with BAH/BAS.
        </p>
      </header>

      <div className="grid xl:grid-cols-4 gap-6">
        {/* State & Income */}
        <section className="rounded-xl border p-4 space-y-3">
          <h2 className="font-semibold text-gray-800">State & Income</h2>
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Taxable income ($/mo)</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border p-2"
                value={taxableIncomeMonthly}
                min={0}
                onChange={(e) => setTaxableIncomeMonthly(Number(e.target.value))}
              />
            </div>
            <div className="rounded-lg bg-gray-50 p-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">State tax (est.)</span>
                <span className="font-semibold">{money(estStateTaxMonthly)}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">BAH ($/mo)</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border p-2"
                value={bah}
                min={0}
                onChange={(e) => setBAH(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">BAS ($/mo)</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border p-2"
                value={bas}
                min={0}
                onChange={(e) => setBAS(Number(e.target.value))}
              />
            </div>
            <div className="rounded-lg bg-gray-50 p-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Net take-home est.</span>
                <span className="font-semibold">{money(netTakeHome)}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Rent Path */}
        <section className="rounded-xl border p-4 space-y-3">
          <h2 className="font-semibold text-gray-800">Rent Path</h2>

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

          <div>
            <label className="block text-sm font-medium text-gray-700">Lease length (years)</label>
            <input
              type="number"
              className="mt-1 w-full rounded-md border p-2"
              value={leaseYears}
              min={1}
              max={10}
              onChange={(e) => setLeaseYears(Number(e.target.value))}
            />
          </div>
        </section>

        {/* Monthly Add-ons */}
        <section className="rounded-xl border p-4 space-y-3">
          <h2 className="font-semibold text-gray-800">Monthly Add-ons</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Utilities</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border p-2"
                value={utilities}
                min={0}
                onChange={(e) => setUtilities(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Parking</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border p-2"
                value={parking}
                min={0}
                onChange={(e) => setParking(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Renter’s insurance</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border p-2"
                value={rentersInsurance}
                min={0}
                onChange={(e) => setRentersInsurance(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Other monthly</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border p-2"
                value={otherMonthly}
                min={0}
                onChange={(e) => setOtherMonthly(Number(e.target.value))}
              />
            </div>
          </div>
        </section>

        {/* One-time Costs & Summary */}
        <section className="rounded-xl border p-4 space-y-3">
          <h2 className="font-semibold text-gray-800">One-time Costs & Summary</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Application fee</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border p-2"
                value={applicationFee}
                min={0}
                onChange={(e) => setApplicationFee(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Admin fee</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border p-2"
                value={adminFee}
                min={0}
                onChange={(e) => setAdminFee(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Security deposit</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border p-2"
                value={securityDeposit}
                min={0}
                onChange={(e) => setSecurityDeposit(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Move-in costs</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border p-2"
                value={moveInCosts}
                min={0}
                onChange={(e) => setMoveInCosts(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="rounded-lg bg-blue-50 p-3 text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-blue-900">One-time total</span>
              <span className="font-semibold text-blue-900">{money(oneTimeTotal())}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-900">Current all-in monthly</span>
              <span className="font-semibold text-blue-900">{money(currentAllIn)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-900">Average monthly over term</span>
              <span className="font-semibold text-blue-900">{money(avgMonthly)}</span>
            </div>
          </div>

          <div className="rounded-lg bg-gray-50 p-3 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-700">Covered by BAH</span>
              <span className="font-semibold">{bahCoveragePct.toFixed(0)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Share of net take-home</span>
              <span className="font-semibold">{takeHomeCoveragePct.toFixed(0)}%</span>
            </div>
          </div>
        </section>
      </div>

      {/* Timeline chart */}
      <div className="mt-6 h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={lineData}>
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip formatter={(v, n) => [money(v), n]} labelFormatter={(y) => `Year ${y}`} />
            <Legend />
            <Line type="monotone" dataKey="All-in monthly" dot={false} />
            <Line type="monotone" dataKey="Cumulative spend" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Category bars at start month */}
      <div className="mt-6 h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={barData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(v) => money(v)} />
            <Legend />
            <Bar dataKey="value" name="Monthly amount" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <footer className="mt-6 rounded-lg bg-blue-50 p-4 text-sm text-blue-900">
        <ul className="list-disc pl-5 space-y-1">
          <li>BAH/BAS are non-taxable and improve effective affordability.</li>
          <li>State income tax reduces net take-home. This tool shows a simple monthly estimate.</li>
          <li>Confirm utilities and one-time fees with the landlord. Parking can change materially.</li>
        </ul>
      </footer>
    </div>
  );
}
