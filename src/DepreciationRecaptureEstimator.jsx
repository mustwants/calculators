// PATH: src/DepreciationRecaptureEstimator.jsx
import React, { useMemo, useState } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";

/**
 * Depreciation Recapture Estimator
 * Federal-oriented. User supplies state income tax rate.
 * Assumptions:
 * - Residential rental depreciated straight-line 27.5 yrs.
 * - Unrecaptured §1250 gain taxed at 25% on lesser of accumulated depreciation or total gain.
 * - Remaining LTCG taxed at user long-term rate (0/15/20 input).
 * - Optional NIIT 3.8% on net investment income portion of LTCG (toggle).
 * - State tax is a flat input rate applied to total gain (conservative).
 * - 1031 toggle zeroes current federal/state taxes (deferral), still shows economic gain.
 * This is planning-only. Not tax advice.
 */

function n(v, d = 2) {
  const x = Number.isFinite(+v) ? +v : 0;
  return Number(x.toFixed(d));
}
function clamp(v, lo, hi) {
  return Math.min(Math.max(v, lo), hi);
}

export default function DepreciationRecaptureEstimator() {
  // Purchase inputs
  const [purchasePrice, setPurchasePrice] = useState(400000);
  const [landPct, setLandPct] = useState(20); // non-depreciable
  const [yearsHeld, setYearsHeld] = useState(7);
  const [placedInServiceMidYear, setPlacedInServiceMidYear] = useState(true); // half-year convention simplification

  // Sale inputs
  const [salePrice, setSalePrice] = useState(550000);
  const [sellingCosts, setSellingCosts] = useState(33000); // commissions + closing costs

  // Rates
  const [ltcgRatePct, setLtcgRatePct] = useState(15);
  const [applyNIIT, setApplyNIIT] = useState(true);
  const [stateRatePct, setStateRatePct] = useState(5);

  // Other
  const [suspendedPassiveLosses, setSuspendedPassiveLosses] = useState(0);
  const [is1031, setIs1031] = useState(false);

  // Depreciation math
  const buildingBasis = useMemo(() => purchasePrice * (1 - clamp(landPct, 0, 100) / 100), [purchasePrice, landPct]);
  const annualDepr = useMemo(() => buildingBasis / 27.5, [buildingBasis]);
  const deprYears = Math.max(0, yearsHeld) - (placedInServiceMidYear ? 0.5 : 0); // simple half-year
  const accumulatedDepr = n(Math.max(0, Math.min(27.5, deprYears)) * annualDepr, 0);

  const adjustedBasis = n(purchasePrice - accumulatedDepr, 0);
  const amountRealized = n(salePrice - sellingCosts, 0);
  const totalGainPreLoss = n(amountRealized - adjustedBasis, 0);

  // Apply suspended passive losses against gain (cannot create a loss here)
  const totalGain = n(Math.max(0, totalGainPreLoss - Math.max(0, suspendedPassiveLosses)), 0);

  // Character of gain
  const recaptureBase = Math.max(0, Math.min(accumulatedDepr, totalGain));
  const ltcgBase = Math.max(0, totalGain - recaptureBase);

  // Taxes (if not doing 1031)
  const recaptureTax = is1031 ? 0 : n(recaptureBase * 0.25, 0); // §1250 at 25%
  const ltcgTax = is1031 ? 0 : n(ltcgBase * (clamp(ltcgRatePct, 0, 30) / 100), 0);
  const niitTax = is1031 || !applyNIIT ? 0 : n(ltcgBase * 0.038, 0); // rough proxy
  const stateTax = is1031 ? 0 : n(totalGain * (clamp(stateRatePct, 0, 15) / 100), 0);

  const totalTax = recaptureTax + ltcgTax + niitTax + stateTax;
  const netProceeds = n(amountRealized - totalTax, 0);

  const chartData = [
    { name: "Amount Realized", value: amountRealized },
    { name: "Adj. Basis", value: adjustedBasis },
    { name: "Total Gain", value: totalGain },
    { name: "§1250 Tax", value: recaptureTax },
    { name: "LTCG Tax", value: ltcgTax },
    { name: "NIIT", value: niitTax },
    { name: "State Tax", value: stateTax },
    { name: "Net Proceeds", value: netProceeds }
  ];

  return (
    <div className="max-w-6xl mx-auto my-8 p-6 bg-white rounded-2xl shadow">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-blue-800">🏠📉 Depreciation Recapture Estimator</h1>
        <p className="text-sm text-gray-600">
          Estimates §1250 recapture, long-term capital gains, NIIT, and state tax. Includes 1031 deferral toggle.
        </p>
      </header>

      <div className="grid xl:grid-cols-4 gap-6">
        {/* Purchase */}
        <section className="rounded-xl border p-4 space-y-3">
          <h2 className="font-semibold text-gray-800">Purchase</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700">Purchase Price ($)</label>
            <input
              type="number" className="mt-1 w-full rounded-md border p-2"
              value={purchasePrice} min={0}
              onChange={(e) => setPurchasePrice(Number(e.target.value))}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Land Portion (%)</label>
              <input
                type="number" className="mt-1 w-full rounded-md border p-2"
                value={landPct} min={0} max={90} step="1"
                onChange={(e) => setLandPct(Number(e.target.value))}
              />
            </div>
            <div className="flex items-center gap-2 mt-7">
              <input
                id="midyear" type="checkbox" className="h-4 w-4"
                checked={placedInServiceMidYear}
                onChange={(e) => setPlacedInServiceMidYear(e.target.checked)}
              />
              <label htmlFor="midyear" className="text-sm text-gray-700">Half-Year Convention</label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Years Held</label>
            <input
              type="number" className="mt-1 w-full rounded-md border p-2"
              value={yearsHeld} min={0} max={40}
              onChange={(e) => setYearsHeld(Number(e.target.value))}
            />
          </div>

          <div className="rounded-lg bg-gray-50 p-3 text-sm space-y-1">
            <div className="flex justify-between"><span className="text-gray-600">Building Basis</span><span className="font-semibold">${n(buildingBasis,0).toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Annual Depreciation</span><span className="font-semibold">${n(annualDepr,0).toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Accumulated Depreciation</span><span className="font-semibold">${accumulatedDepr.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Adjusted Basis</span><span className="font-semibold">${adjustedBasis.toLocaleString()}</span></div>
          </div>
        </section>

        {/* Sale */}
        <section className="rounded-xl border p-4 space-y-3">
          <h2 className="font-semibold text-gray-800">Sale</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700">Sale Price ($)</label>
            <input
              type="number" className="mt-1 w-full rounded-md border p-2"
              value={salePrice} min={0}
              onChange={(e) => setSalePrice(Number(e.target.value))}
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
          <div className="rounded-lg bg-gray-50 p-3 text-sm space-y-1">
            <div className="flex justify-between"><span className="text-gray-600">Amount Realized</span><span className="font-semibold">${amountRealized.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Pre-Loss Gain</span><span className="font-semibold">${totalGainPreLoss.toLocaleString()}</span></div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Suspended Passive Losses Applied ($)</label>
            <input
              type="number" className="mt-1 w-full rounded-md border p-2"
              value={suspendedPassiveLosses} min={0}
              onChange={(e) => setSuspendedPassiveLosses(Number(e.target.value))}
            />
          </div>
          <div className="flex items-center gap-2">
            <input id="is1031" type="checkbox" className="h-4 w-4" checked={is1031} onChange={(e) => setIs1031(e.target.checked)} />
            <label htmlFor="is1031" className="text-sm text-gray-700">1031 Exchange (defers current taxes)</label>
          </div>
        </section>

        {/* Rates */}
        <section className="rounded-xl border p-4 space-y-3">
          <h2 className="font-semibold text-gray-800">Rates</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">LTCG Rate (%)</label>
              <input
                type="number" className="mt-1 w-full rounded-md border p-2"
                value={ltcgRatePct} min={0} max={30} step="1"
                onChange={(e) => setLtcgRatePct(Number(e.target.value))}
              />
            </div>
            <div className="flex items-center gap-2 mt-7">
              <input id="niit" type="checkbox" className="h-4 w-4" checked={applyNIIT} onChange={(e) => setApplyNIIT(e.target.checked)} />
              <label htmlFor="niit" className="text-sm text-gray-700">Apply NIIT 3.8%</label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">State Income Tax on Gain (%)</label>
            <input
              type="number" className="mt-1 w-full rounded-md border p-2"
              value={stateRatePct} min={0} max={15} step="0.1"
              onChange={(e) => setStateRatePct(Number(e.target.value))}
            />
            <p className="mt-1 text-xs text-gray-500">Enter your state effective rate on capital gains.</p>
          </div>

          <div className="rounded-lg bg-gray-50 p-3 text-sm space-y-1">
            <div className="flex justify-between"><span className="text-gray-600">Total Gain</span><span className="font-semibold">${totalGain.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Recapture Base (§1250)</span><span className="font-semibold">${recaptureBase.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">LTCG Base</span><span className="font-semibold">${ltcgBase.toLocaleString()}</span></div>
          </div>
        </section>

        {/* Taxes & Proceeds */}
        <section className="rounded-xl border p-4 space-y-3">
          <h2 className="font-semibold text-gray-800">Taxes & Proceeds</h2>
          <div className="rounded-lg bg-blue-50 p-3 text-sm space-y-1">
            <div className="flex justify-between"><span className="text-blue-900">§1250 Recapture (25%)</span><span className="font-semibold text-blue-900">${recaptureTax.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-blue-900">LTCG Tax</span><span className="font-semibold text-blue-900">${ltcgTax.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-blue-900">NIIT 3.8%</span><span className="font-semibold text-blue-900">${niitTax.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-blue-900">State Tax</span><span className="font-semibold text-blue-900">${stateTax.toLocaleString()}</span></div>
            <div className="flex justify-between pt-1 border-t border-blue-200"><span className="text-blue-900">Total Tax</span><span className="font-semibold text-blue-900">${totalTax.toLocaleString()}</span></div>
          </div>
          <div className="rounded-lg bg-gray-50 p-3 text-sm">
            <div className="flex justify-between"><span className="text-gray-700">Net Proceeds (after tax)</span><span className="font-semibold">${netProceeds.toLocaleString()}</span></div>
          </div>
        </section>
      </div>

      {/* Chart */}
      <div className="mt-6 h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(v) => `$${Math.round(v).toLocaleString()}`} />
            <Legend />
            <Bar dataKey="value" name="Amount" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <footer className="mt-6 rounded-lg bg-blue-50 p-4 text-sm text-blue-900">
        <ul className="list-disc pl-5 space-y-1">
          <li>Recapture rate fixed at 25% for unrecaptured §1250 gain.</li>
          <li>LTCG and NIIT approximated. State rate is user-supplied.</li>
          <li>1031 sets current taxes to 0 (defers); gain still exists for basis tracking.</li>
        </ul>
      </footer>
    </div>
  );
}
