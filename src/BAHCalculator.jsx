// Simple BAH Calculator
import React, { useMemo, useState } from "react";
import { listStateOptions, getState } from "./utils/loadStateTaxData";

export default function BAHCalculator() {
  const [bah, setBah] = useState(2100);
  const [rent, setRent] = useState(1850);
  const [utilities, setUtilities] = useState(250);
  const [stateCode, setStateCode] = useState("VA");

  const states = useMemo(() => listStateOptions(), []);
  const state = getState(stateCode);

  const totalHousing = (Number(rent) || 0) + (Number(utilities) || 0);
  const monthlyDelta = (Number(bah) || 0) - totalHousing;
  const status =
    monthlyDelta > 0 ? "surplus" : monthlyDelta < 0 ? "shortfall" : "break-even";

  return (
    <div className="max-w-2xl mx-auto my-8 p-6 bg-white rounded-2xl shadow">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-blue-800">🎖️ BAH Calculator</h1>
        <p className="text-sm text-gray-600">
          BAH is non-taxable income. Use this to see your monthly surplus or shortfall
          after rent and utilities.
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-5">
        <div>
          <label htmlFor="bah" className="block text-sm font-medium text-gray-700">
            Monthly BAH ($)
          </label>
          <input
            id="bah"
            type="number"
            inputMode="decimal"
            className="mt-1 w-full rounded-md border border-gray-300 p-2"
            value={bah}
            onChange={(e) => setBah(Number(e.target.value))}
            min={0}
          />
        </div>

        <div>
          <label htmlFor="rent" className="block text-sm font-medium text-gray-700">
            Monthly Rent ($)
          </label>
          <input
            id="rent"
            type="number"
            inputMode="decimal"
            className="mt-1 w-full rounded-md border border-gray-300 p-2"
            value={rent}
            onChange={(e) => setRent(Number(e.target.value))}
            min={0}
          />
        </div>

        <div>
          <label htmlFor="utilities" className="block text-sm font-medium text-gray-700">
            Monthly Utilities ($)
          </label>
          <input
            id="utilities"
            type="number"
            inputMode="decimal"
            className="mt-1 w-full rounded-md border border-gray-300 p-2"
            value={utilities}
            onChange={(e) => setUtilities(Number(e.target.value))}
            min={0}
          />
        </div>

        <div>
          <label htmlFor="state" className="block text-sm font-medium text-gray-700">
            State (for context)
          </label>
          <select
            id="state"
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
          <p className="mt-1 text-xs text-gray-500">
            BAH is not taxed by states. Shown to keep results consistent with other
            tools using state policy.
          </p>
        </div>
      </div>

      <section className="mt-6 grid md:grid-cols-3 gap-4">
        <div className="rounded-xl border p-4">
          <div className="text-xs uppercase text-gray-500">Total Housing</div>
          <div className="text-xl font-semibold">${totalHousing.toLocaleString()}</div>
          <div className="text-xs text-gray-500">Rent + Utilities</div>
        </div>

        <div className="rounded-xl border p-4">
          <div className="text-xs uppercase text-gray-500">Monthly BAH</div>
          <div className="text-xl font-semibold">${Number(bah).toLocaleString()}</div>
          <div className="text-xs text-gray-500">Non-taxable</div>
        </div>

        <div
          className={`rounded-xl border p-4 ${
            status === "surplus"
              ? "bg-green-50 border-green-200"
              : status === "shortfall"
              ? "bg-rose-50 border-rose-200"
              : "bg-gray-50 border-gray-200"
          }`}
        >
          <div className="text-xs uppercase text-gray-500">Result</div>
          <div className="text-xl font-semibold">
            {monthlyDelta >= 0 ? "+" : "-"}${Math.abs(monthlyDelta).toLocaleString()}
          </div>
          <div className="text-xs text-gray-500">
            {status === "surplus"
              ? "Surplus after housing"
              : status === "shortfall"
              ? "Shortfall to cover"
              : "Break-even"}
          </div>
        </div>
      </section>

      <footer className="mt-6 rounded-lg bg-gray-50 p-4 text-sm text-gray-700">
        <ul className="list-disc pl-5 space-y-1">
          <li>BAH is non-taxable at federal and state levels.</li>
          <li>
            This tool does not estimate deposits, fees, or one-time move-in costs.
          </li>
          <li>
            State shown: <span className="font-medium">{state?.name || stateCode}</span>. No
            tax applied to BAH.
          </li>
        </ul>
      </footer>
    </div>
  );
}
