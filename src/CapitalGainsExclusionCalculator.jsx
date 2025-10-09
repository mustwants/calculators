// PATH: src/CapitalGainsExclusionCalculator.jsx
import React, { useMemo, useState } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { listStateOptions } from "./utils/loadStateTaxData";

/**
 * Capital Gains Exclusion (Primary Residence) — Military-aware
 *
 * Implements IRC §121 exclusion:
 * - $250k Single / $500k Married Filing Joint if ownership+use tests met.
 * - Military suspension: 5-year “lookback” period may be suspended (paused) for up to 10 years
 *   during qualified official extended duty (use-test clock can pause).
 *
 * Notes:
 * - This is a planner. It does not file taxes or give tax advice.
 * - State capital gains rate is user-supplied; many states follow ordinary income.
 * - Net investment income tax (NIIT) not modeled here.
 */

function n(v) {
  const x = Number.isFinite(+v) ? +v : 0;
  return x;
}
function money(v) {
  return `$${Math.round(n(v)).toLocaleString()}`;
}

export default function CapitalGainsExclusionCalculator() {
  // Context
  const states = useMemo(() => listStateOptions(), []);
  const [stateCode, setStateCode] = useState("VA");
  const [stateRatePct, setStateRatePct] = useState(5.0); // user-supplied

  // Inputs
  const [filingStatus, setFilingStatus] = useState("MFJ"); // MFJ or Single
  const [purchasePrice, setPurchasePrice] = useState(400_000);
  const [capitalImprovements, setCapitalImprovements] = useState(35_000);
  const [sellingPrice, setSellingPrice] = useState(600_000);
  const [sellingCosts, setSellingCosts] = useState(36_000); // commissions+closing
  const [federalLTCGPct, setFederalLTCGPct] = useState(15);

  // Ownership/use timeline
  const [yearsOwned, setYearsOwned] = useState(6); // total ownership years
  const [yearsLivedMainHome, setYearsLivedMainHome] = useState(2); // lived-in within lookback
  const [militarySuspensionApplies, setMilitarySuspensionApplies] = useState(true);
  const [suspensionYearsUsed, setSuspensionYearsUsed] = useState(5); // 0..10 yrs

  // Computations
  const amountRealized = n(sellingPrice) - n(sellingCosts);
  const adjustedBasis = n(purchasePrice) + n(capitalImprovements);
  const totalGain = Math.max(0, amountRealized - adjustedBasis);

  // §121 tests
  // Ownership test: owned ≥ 2 years in 5-year lookback (assume true if yearsOwned ≥ 2)
  const ownershipOK = yearsOwned >= 2;

  // Use test: lived-in ≥ 2 years in lookback window.
  // If military suspension applies, the 5-year lookback window is extended by suspensionYearsUsed (cap 10).
  const effectiveLookbackYears = 5 + Math.max(0, Math.min(10, militarySuspensionApplies ? suspensionYearsUsed : 0));
  // For planning, we approximate that if user has ≥ 2 years lived-in within that effective window, they pass.
  const useOK = yearsLivedMainHome >= 2;

  const exclusionLimit = filingStatus === "MFJ" ? 500_000 : 250_000;
  const exclusionEligible = ownershipOK && useOK;
  const exclusionApplied = exclusionEligible ? Math.min(exclusionLimit, totalGain) : 0;

  const taxableGain = Math.max(0, totalGain - exclusionApplied);

  const fedTax = taxableGain * (n(federalLTCGPct) / 100);
  const stateTax = taxableGain * (n(stateRatePct) / 100);
  const totalTax = fedTax + stateTax;

  const netProceedsAfterTax = amountRealized - totalTax;

  const chartData = [
    { name: "Amount Realized", value: amountRealized },
    { name: "Adjusted Basis", value: adjustedBasis },
    { name: "Total Gain", value: totalGain },
    { name: "§121 Exclusion", value: exclusionApplied },
    { name: "Taxable Gain", value: taxableGain },
    { name: "Federal LTCG", value: fedTax },
    { name: "State CG Tax", value: stateTax },
    { name: "Net Proceeds", value: netProceedsAfterTax }
  ];

  return (
    <div className="max-w-6xl mx-auto my-8 p-6 bg-white rounded-2xl shadow">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-blue-800">📊💰 Capital Gains Exclusion (Primary Residence)</h1>
        <p className="text-sm text-gray-600">
          Models IRC §121 and military suspension. Enter your figures to estimate taxable gain and after-tax proceeds.
        </p>
      </header>

      <div className="grid xl:grid-cols-4 gap-6">
        {/* Filing + State */}
        <section className="rounded-xl border p-4 space-y-3">
          <h2 className="font-semibold text-gray-800">Filing & State</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700">Filing Status</label>
            <select
              className="mt-1 w-full rounded-md border p-2 bg-white"
              value={filingStatus}
              onChange={(e) => setFilingStatus(e.target.value)}
            >
              <option value="MFJ">Married Filing Jointly ($500k exclusion)</option>
              <option value="Single">Single / MFS ($250k exclusion)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">State</label>
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
            <p className="mt-1 text-xs text-gray-500">
              Supply an effective state capital gains rate below.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Federal LTCG Rate (%)</label>
              <input
                type="number" className="mt-1 w-full rounded-md border p-2"
                value={federalLTCGPct} min={0} max={23.8} step="0.1"
                onChange={(e) => setFederalLTCGPct(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">State CG Rate (%)</label>
              <input
                type="number" className="mt-1 w-full rounded-md border p-2"
                value={stateRatePct} min={0} max={15} step="0.1"
                onChange={(e) => setStateRatePct(Number(e.target.value))}
              />
            </div>
          </div>
        </section>

        {/* Purchase/Sale */}
        <section className="rounded-xl border p-4 space-y-3">
          <h2 className="font-semibold text-gray-800">Purchase & Sale</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700">Purchase Price ($)</label>
            <input
              type="number" className="mt-1 w-full rounded-md border p-2"
              value={purchasePrice} min={0}
              onChange={(e) => setPurchasePrice(Number(e.target.value))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Capital Improvements ($)</label>
            <input
              type="number" className="mt-1 w-full rounded-md border p-2"
              value={capitalImprovements} min={0}
              onChange={(e) => setCapitalImprovements(Number(e.target.value))}
            />
            <p className="mt-1 text-xs text-gray-500">Roof, additions, major systems. Not repairs.</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Selling Price ($)</label>
              <input
                type="number" className="mt-1 w-full rounded-md border p-2"
                value={sellingPrice} min={0}
                onChange={(e) => setSellingPrice(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Selling Costs ($)</label>
              <input
                type="number" className="mt-1 w-full rounded-md border p-2"
                value={sellingCosts} min={0}
                onChange={(e) => setSellingCosts(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="rounded-lg bg-gray-50 p-3 text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-600">Amount Realized</span>
              <span className="font-semibold">{money(amountRealized)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Adjusted Basis</span>
              <span className="font-semibold">{money(adjustedBasis)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Gain</span>
              <span className="font-semibold">{money(totalGain)}</span>
            </div>
          </div>
        </section>

        {/* Ownership & Use */}
        <section className="rounded-xl border p-4 space-y-3">
          <h2 className="font-semibold text-gray-800">Ownership & Use</h2>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Years Owned</label>
              <input
                type="number" className="mt-1 w-full rounded-md border p-2"
                value={yearsOwned} min={0} max={50} step="0.5"
                onChange={(e) => setYearsOwned(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Years Lived As Main Home</label>
              <input
                type="number" className="mt-1 w-full rounded-md border p-2"
                value={yearsLivedMainHome} min={0} max={50} step="0.5"
                onChange={(e) => setYearsLivedMainHome(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="milSusp"
              type="checkbox"
              className="h-4 w-4"
              checked={militarySuspensionApplies}
              onChange={(e) => setMilitarySuspensionApplies(e.target.checked)}
            />
            <label htmlFor="milSusp" className="text-sm text-gray-700">
              Military suspension applies (official extended duty)
            </label>
          </div>

          {militarySuspensionApplies && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Suspension Years Used (0–10)</label>
              <input
                type="number" className="mt-1 w-full rounded-md border p-2"
                value={suspensionYearsUsed} min={0} max={10} step="0.5"
                onChange={(e) => setSuspensionYearsUsed(Number(e.target.value))}
              />
              <p className="mt-1 text-xs text-gray-500">
                Extends the 5-year lookback window to up to {5 + Math.min(10, Math.max(0, suspensionYearsUsed))} years.
              </p>
            </div>
          )}

          <div className="rounded-lg bg-gray-50 p-3 text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-600">Ownership Test</span>
              <span className={`font-semibold ${ownershipOK ? "text-emerald-700" : "text-rose-700"}`}>
                {ownershipOK ? "Pass" : "Fail"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Use Test (with suspension)</span>
              <span className={`font-semibold ${useOK ? "text-emerald-700" : "text-rose-700"}`}>
                {useOK ? "Pass" : "Fail"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Eligible Exclusion</span>
              <span className="font-semibold">{money(exclusionEligible ? exclusionLimit : 0)}</span>
            </div>
          </div>
        </section>

        {/* Result */}
        <section className="rounded-xl border p-4 space-y-3">
          <h2 className="font-semibold text-gray-800">Result</h2>

          <div className="rounded-lg bg-blue-50 p-3 text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-blue-900">§121 Exclusion Applied</span>
              <span className="font-semibold text-blue-900">{money(exclusionApplied)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-900">Taxable Gain</span>
              <span className="font-semibold text-blue-900">{money(taxableGain)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-900">Federal LTCG</span>
              <span className="font-semibold text-blue-900">{money(fedTax)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-900">State CG Tax</span>
              <span className="font-semibold text-blue-900">{money(stateTax)}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-blue-200">
              <span className="text-blue-900">Total Tax</span>
              <span className="font-semibold text-blue-900">{money(totalTax)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-900">Net Proceeds (after tax)</span>
              <span className="font-semibold text-blue-900">{money(netProceedsAfterTax)}</span>
            </div>
          </div>

          <div className="text-xs text-gray-500">
            Exclusion requires ownership and use tests. Military suspension may extend the lookback period up to 10 years.
          </div>
        </section>
      </div>

      {/* Chart */}
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

      <footer className="mt-6 rounded-lg bg-blue-50 p-4 text-sm text-blue-900">
        <ul className="list-disc pl-5 space-y-1">
          <li>Single exclusion $250k. Married filing jointly $500k.</li>
          <li>Ownership and use: each at least 2 years in the lookback period.</li>
          <li>Military suspension can extend the lookback by up to 10 years during qualified duty.</li>
          <li>State rate is user-supplied. Many states tax capital gains as ordinary income.</li>
        </ul>
      </footer>
    </div>
  );
}
