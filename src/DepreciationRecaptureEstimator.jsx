// PATH: src/DepreciationRecaptureEstimator.jsx
import React, { useMemo, useState } from "react";
import { listStateOptions } from "./utils/loadStateTaxData";
import { incomeTaxLiability } from "./utils/tax";

/**
 * Depreciation Recapture Estimator
 * - Models §1250 unrecaptured gain at up to 25% (override allowed)
 * - Remaining gain treated as long-term capital gain at a user rate
 * - State income tax applied to total taxable gain using state dataset
 * - Includes selling costs and optional mortgage payoff to show net cash
 *
 * Notes:
 * - This is a planning tool. Actual rates/brackets vary and may be lower/higher.
 * - State treatment of depreciation recapture can differ; here we apply the state rate to total gain.
 */

export default function DepreciationRecaptureEstimator() {
  // Location
  const states = useMemo(() => listStateOptions(), []);
  const [stateCode, setStateCode] = useState("VA");

  // Basis inputs
  const [purchasePrice, setPurchasePrice] = useState(400000);
  const [purchaseClosingCosts, setPurchaseClosingCosts] = useState(6000);
  const [improvements, setImprovements] = useState(25000);

  // Depreciation
  const [deprTaken, setDeprTaken] = useState(48000);

  // Sale inputs
  const [salePrice, setSalePrice] = useState(525000);
  const [sellingCosts, setSellingCosts] = useState(28000);

  // Payoff (optional, not tax but affects cash)
  const [mortgageBalance, setMortgageBalance] = useState(315000);

  // Federal rates
  const [recaptureRatePct, setRecaptureRatePct] = useState(25); // §1250 unrecaptured, max 25%
  const [ltcgRatePct, setLtcgRatePct] = useState(15); // user-chosen LT cap gains estimate

  // Derived values
  const basisBeforeDepr =
    Math.max(0, Number(purchasePrice || 0)) +
    Math.max(0, Number(purchaseClosingCosts || 0)) +
    Math.max(0, Number(improvements || 0));

  const adjustedBasis = Math.max(0, basisBeforeDepr - Math.max(0, Number(deprTaken || 0)));

  const amountRealized = Math.max(0, Number(salePrice || 0) - Math.max(0, Number(sellingCosts || 0)));
  const totalGain = Math.max(0, amountRealized - adjustedBasis);

  const recapturePortion = Math.min(Math.max(0, Number(deprTaken || 0)), totalGain);
  const remainingLTCG = Math.max(0, totalGain - recapturePortion);

  const federalRecaptureTax = recapturePortion * (Math.max(0, Number(recaptureRatePct || 0)) / 100);
  const federalLTCGTax = remainingLTCG * (Math.max(0, Number(ltcgRatePct || 0)) / 100);
  const federalTaxTotal = federalRecaptureTax + federalLTCGTax;

  // State tax: apply state income tax rate to the total gain
  const stateTax = incomeTaxLiability(stateCode, totalGain);

  // Net cash at closing (simple)
  const grossProceeds = amountRealized;
  const totalTax = federalTaxTotal + stateTax;
  const netCash = Math.max(0, grossProceeds - Math.max(0, Number(mortgageBalance || 0)) - totalTax);

  return (
    <div className="max-w-6xl mx-auto my-8 p-6 bg-white rounded-2xl shadow">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-blue-800">🏠📉 Depreciation Recapture Estimator</h1>
        <p className="text-sm text-gray-600">
          Estimates §1250 unrecaptured depreciation recapture and remaining long-term capital gains. Applies your state income tax rate to total gain.
          This is a planning estimate, not tax advice.
        </p>
      </header>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Column 1: Location + Rates */}
        <section className="rounded-xl border p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">State</label>
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
            <p className="mt-1 text-xs text-gray-500">Used to estimate state income tax on total gain.</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Recapture Rate (%)</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border border-gray-300 p-2"
                value={recaptureRatePct}
                min={0}
                max={25}
                step={0.1}
                onChange={(e) => setRecaptureRatePct(Number(e.target.value))}
              />
              <p className="mt-1 text-xs text-gray-500">§1250 unrecaptured, capped at 25%.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">LT Capital Gains Rate (%)</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border border-gray-300 p-2"
                value={ltcgRatePct}
                min={0}
                max={37}
                step={0.1}
                onChange={(e) => setLtcgRatePct(Number(e.target.value))}
              />
              <p className="mt-1 text-xs text-gray-500">Simplified federal estimate.</p>
            </div>
          </div>
        </section>

        {/* Column 2: Basis & Depreciation */}
        <section className="rounded-xl border p-4 space-y-4">
          <h2 className="font-semibold text-gray-800">Basis & Depreciation</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700">Purchase Price ($)</label>
            <input
              type="number"
              className="mt-1 w-full rounded-md border border-gray-300 p-2"
              value={purchasePrice}
              min={0}
              onChange={(e) => setPurchasePrice(Number(e.target.value))}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Purchase Closing Costs ($)</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border border-gray-300 p-2"
                value={purchaseClosingCosts}
                min={0}
                onChange={(e) => setPurchaseClosingCosts(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Improvements ($)</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border border-gray-300 p-2"
                value={improvements}
                min={0}
                onChange={(e) => setImprovements(Number(e.target.value))}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Depreciation Taken to Date ($)</label>
            <input
              type="number"
              className="mt-1 w-full rounded-md border border-gray-300 p-2"
              value={deprTaken}
              min={0}
              onChange={(e) => setDeprTaken(Number(e.target.value))}
            />
            <p className="mt-1 text-xs text-gray-500">Enter the total depreciation claimed over ownership.</p>
          </div>
        </section>

        {/* Column 3: Sale & Payoff */}
        <section className="rounded-xl border p-4 space-y-4">
          <h2 className="font-semibold text-gray-800">Sale & Payoff</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700">Sale Price ($)</label>
            <input
              type="number"
              className="mt-1 w-full rounded-md border border-gray-300 p-2"
              value={salePrice}
              min={0}
              onChange={(e) => setSalePrice(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Selling Costs ($)</label>
            <input
              type="number"
              className="mt-1 w-full rounded-md border border-gray-300 p-2"
              value={sellingCosts}
              min={0}
              onChange={(e) => setSellingCosts(Number(e.target.value))}
            />
            <p className="mt-1 text-xs text-gray-500">Agent commissions, transfer taxes, etc.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Mortgage Payoff ($)</label>
            <input
              type="number"
              className="mt-1 w-full rounded-md border border-gray-300 p-2"
              value={mortgageBalance}
              min={0}
              onChange={(e) => setMortgageBalance(Number(e.target.value))}
            />
            <p className="mt-1 text-xs text-gray-500">For net cash illustration only.</p>
          </div>
        </section>
      </div>

      {/* Key Totals */}
      <section className="mt-6 grid md:grid-cols-3 gap-4">
        <div className="rounded-xl border p-4">
          <div className="text-xs uppercase text-gray-500">Adjusted Basis</div>
          <div className="text-xl font-semibold">${adjustedBasis.toLocaleString()}</div>
          <div className="text-xs text-gray-500">Basis − depreciation</div>
        </div>

        <div className="rounded-xl border p-4">
          <div className="text-xs uppercase text-gray-500">Total Gain</div>
          <div className="text-xl font-semibold">${totalGain.toLocaleString()}</div>
          <div className="text-xs text-gray-500">Amount realized − adjusted basis</div>
        </div>

        <div className="rounded-xl border p-4">
          <div className="text-xs uppercase text-gray-500">Amount Realized</div>
          <div className="text-xl font-semibold">${amountRealized.toLocaleString()}</div>
          <div className="text-xs text-gray-500">Sale − selling costs</div>
        </div>
      </section>

      {/* Tax Breakdown */}
      <section className="mt-4 grid md:grid-cols-4 gap-4">
        <div className="rounded-xl border p-4 bg-amber-50 border-amber-200">
          <div className="text-xs uppercase text-amber-700">Recapture Portion</div>
          <div className="text-xl font-semibold text-amber-800">${recapturePortion.toLocaleString()}</div>
          <div className="text-xs text-amber-700">Min(depreciation, total gain)</div>
        </div>

        <div className="rounded-xl border p-4">
          <div className="text-xs uppercase text-gray-500">Remaining LTCG</div>
          <div className="text-xl font-semibold">${remainingLTCG.toLocaleString()}</div>
          <div className="text-xs text-gray-500">Total gain − recapture</div>
        </div>

        <div className="rounded-xl border p-4">
          <div className="text-xs uppercase text-gray-500">Federal Tax (Recapture)</div>
          <div className="text-xl font-semibold">${federalRecaptureTax.toLocaleString()}</div>
          <div className="text-xs text-gray-500">@ {recaptureRatePct}%</div>
        </div>

        <div className="rounded-xl border p-4">
          <div className="text-xs uppercase text-gray-500">Federal Tax (LTCG)</div>
          <div className="text-xl font-semibold">${federalLTCGTax.toLocaleString()}</div>
          <div className="text-xs text-gray-500">@ {ltcgRatePct}%</div>
        </div>
      </section>

      <section className="mt-4 grid md:grid-cols-3 gap-4">
        <div className="rounded-xl border p-4">
          <div className="text-xs uppercase text-gray-500">State Income Tax</div>
          <div className="text-xl font-semibold">${stateTax.toLocaleString()}</div>
          <div className="text-xs text-gray-500">Applied to total gain</div>
        </div>

        <div className="rounded-xl border p-4 bg-gray-50">
          <div className="text-xs uppercase text-gray-500">Total Estimated Tax</div>
          <div className="text-xl font-semibold">${totalTax.toLocaleString()}</div>
          <div className="text-xs text-gray-500">Federal + State</div>
        </div>

        <div className="rounded-xl border p-4 bg-blue-50 border-blue-200">
          <div className="text-xs uppercase text-blue-700">Estimated Net Cash</div>
          <div className="text-xl font-semibold text-blue-900">${netCash.toLocaleString()}</div>
          <div className="text-xs text-blue-700">Amount realized − payoff − taxes</div>
        </div>
      </section>

      <footer className="mt-6 rounded-lg bg-blue-50 p-4 text-sm text-blue-900">
        <ul className="list-disc pl-5 space-y-1">
          <li>Unrecaptured §1250 gain is capped at 25%; tool lets you override for planning.</li>
          <li>State treatment varies. Here, state rate is applied to the total taxable gain.</li>
          <li>Does not model NIIT, AMT, passive activity limitations, or installment sales.</li>
        </ul>
      </footer>
    </div>
  );
}
