// PATH: src/CapitalGainsExclusionCalculator.jsx
import React, { useMemo, useState } from "react";
import { listStateOptions } from "./utils/loadStateTaxData";
import { incomeTaxLiability } from "./utils/tax";

export default function CapitalGainsExclusionCalculator() {
  const states = useMemo(() => listStateOptions(), []);
  const [stateCode, setStateCode] = useState("VA");

  const [filingStatus, setFilingStatus] = useState("married"); // 'single' | 'married'
  const [exclusionEligible, setExclusionEligible] = useState(true); // meets 2 of last 5 years rule (PCS nuances not modeled)

  // Purchase side
  const [purchasePrice, setPurchasePrice] = useState(400000);
  const [purchaseClosingCosts, setPurchaseClosingCosts] = useState(4000); // title, transfer, etc., that increase basis
  const [improvements, setImprovements] = useState(15000); // capital improvements only

  // Sale side
  const [salePrice, setSalePrice] = useState(525000);
  const [sellingCosts, setSellingCosts] = useState(26000); // agent commissions, transfer taxes, etc.

  // Optional: simple federal estimate toggle (off by default to keep scope state-focused)
  const [estimateFederal, setEstimateFederal] = useState(false);
  const [federalRatePct, setFederalRatePct] = useState(15); // coarse LT capital gains bracket

  // Calculations
  const basis = Math.max(0, Number(purchasePrice || 0) + Number(purchaseClosingCosts || 0) + Number(improvements || 0));
  const grossGain = Math.max(0, Number(salePrice || 0) - Number(sellingCosts || 0) - basis);
  const exclusionCap = exclusionEligible ? (filingStatus === "married" ? 500000 : 250000) : 0;
  const taxableGain = Math.max(0, grossGain - exclusionCap);

  const estStateTax = incomeTaxLiability(stateCode, taxableGain);
  const estFederalTax = estimateFederal ? Math.max(0, taxableGain) * (Number(federalRatePct || 0) / 100) : 0;
  const totalEstimatedTax = estStateTax + estFederalTax;

  return (
    <div className="max-w-5xl mx-auto my-8 p-6 bg-white rounded-2xl shadow">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-blue-800">📊 Capital Gains Exclusion</h1>
        <p className="text-sm text-gray-600">
          Estimates taxable home-sale gain and applies the $250k/$500k primary residence exclusion when eligible.
          State income tax is calculated from your selected state’s rate. This is a planning estimate, not tax advice.
        </p>
      </header>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Column 1: Location + Filing */}
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
            <p className="mt-1 text-xs text-gray-500">Used to estimate state tax on the taxable gain.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Filing Status</label>
            <select
              className="mt-1 w-full rounded-md border border-gray-300 p-2 bg-white"
              value={filingStatus}
              onChange={(e) => setFilingStatus(e.target.value)}
            >
              <option value="single">Single</option>
              <option value="married">Married Filing Jointly</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">$250k exclusion for single, $500k for married when eligible.</p>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="exclusionEligible"
              type="checkbox"
              className="h-4 w-4"
              checked={exclusionEligible}
              onChange={(e) => setExclusionEligible(e.target.checked)}
            />
            <label htmlFor="exclusionEligible" className="text-sm text-gray-700">
              Eligible for primary residence exclusion
            </label>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="estimateFederal"
              type="checkbox"
              className="h-4 w-4"
              checked={estimateFederal}
              onChange={(e) => setEstimateFederal(e.target.checked)}
            />
            <label htmlFor="estimateFederal" className="text-sm text-gray-700">
              Include simple federal estimate
            </label>
          </div>

          {estimateFederal && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Federal LTCG Rate (%)</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border border-gray-300 p-2"
                value={federalRatePct}
                min={0}
                max={37}
                step={0.1}
                onChange={(e) => setFederalRatePct(Number(e.target.value))}
              />
            </div>
          )}
        </section>

        {/* Column 2: Purchase */}
        <section className="rounded-xl border p-4 space-y-4">
          <h2 className="font-semibold text-gray-800">Purchase</h2>

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

          <div>
            <label className="block text-sm font-medium text-gray-700">Purchase Closing Costs ($)</label>
            <input
              type="number"
              className="mt-1 w-full rounded-md border border-gray-300 p-2"
              value={purchaseClosingCosts}
              min={0}
              onChange={(e) => setPurchaseClosingCosts(Number(e.target.value))}
            />
            <p className="mt-1 text-xs text-gray-500">Only costs that increase basis (title, transfer, certain fees).</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Capital Improvements ($)</label>
            <input
              type="number"
              className="mt-1 w-full rounded-md border border-gray-300 p-2"
              value={improvements}
              min={0}
              onChange={(e) => setImprovements(Number(e.target.value))}
            />
            <p className="mt-1 text-xs text-gray-500">Permanent improvements. Repairs don’t increase basis.</p>
          </div>
        </section>

        {/* Column 3: Sale */}
        <section className="rounded-xl border p-4 space-y-4">
          <h2 className="font-semibold text-gray-800">Sale</h2>

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
            <p className="mt-1 text-xs text-gray-500">Commissions, transfer taxes, other disposition costs.</p>
          </div>
        </section>
      </div>

      {/* Summary */}
      <section className="mt-6 grid md:grid-cols-4 gap-4">
        <div className="rounded-xl border p-4">
          <div className="text-xs uppercase text-gray-500">Basis</div>
          <div className="text-xl font-semibold">${basis.toLocaleString()}</div>
          <div className="text-xs text-gray-500">Purchase + closing + improvements</div>
        </div>

        <div className="rounded-xl border p-4">
          <div className="text-xs uppercase text-gray-500">Gross Gain</div>
          <div className="text-xl font-semibold">${grossGain.toLocaleString()}</div>
          <div className="text-xs text-gray-500">Sale - selling costs - basis</div>
        </div>

        <div className="rounded-xl border p-4">
          <div className="text-xs uppercase text-gray-500">Exclusion Applied</div>
          <div className="text-xl font-semibold">
            ${Math.min(grossGain, exclusionCap).toLocaleString()}
          </div>
          <div className="text-xs text-gray-500">
            {exclusionEligible ? (filingStatus === "married" ? "$500k" : "$250k") : "$0"} maximum
          </div>
        </div>

        <div className="rounded-xl border p-4">
          <div className="text-xs uppercase text-gray-500">Taxable Gain</div>
          <div className="text-xl font-semibold">${taxableGain.toLocaleString()}</div>
          <div className="text-xs text-gray-500">After exclusion</div>
        </div>
      </section>

      {/* Taxes */}
      <section className="mt-4 grid md:grid-cols-3 gap-4">
        <div className="rounded-xl border p-4">
          <div className="text-xs uppercase text-gray-500">Est. State Tax</div>
          <div className="text-xl font-semibold">${estStateTax.toLocaleString()}</div>
          <div className="text-xs text-gray-500">Based on state income tax rate</div>
        </div>

        <div className="rounded-xl border p-4">
          <div className="text-xs uppercase text-gray-500">Est. Federal (optional)</div>
          <div className="text-xl font-semibold">${estFederalTax.toLocaleString()}</div>
          <div className="text-xs text-gray-500">{estimateFederal ? `${federalRatePct}% assumed` : "Not included"}</div>
        </div>

        <div className="rounded-xl border p-4 bg-gray-50">
          <div className="text-xs uppercase text-gray-500">Total Estimated Tax</div>
          <div className="text-xl font-semibold">${totalEstimatedTax.toLocaleString()}</div>
          <div className="text-xs text-gray-500">State + optional federal</div>
        </div>
      </section>

      <footer className="mt-6 rounded-lg bg-blue-50 p-4 text-sm text-blue-900">
        <ul className="list-disc pl-5 space-y-1">
          <li>This tool applies the federal primary residence exclusion at $250k/$500k when eligible.</li>
          <li>State treatment of home-sale gains varies; this estimate uses your state’s income tax rate.</li>
          <li>Military PCS suspension of the 5-year test is not modeled here. Confirm eligibility before filing.</li>
        </ul>
      </footer>
    </div>
  );
}
