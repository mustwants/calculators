// PATH: src/RentCalculator.jsx
import React, { useMemo, useState } from "react";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import stateTaxAndBenefits from "./data/stateTaxAndBenefits.js";

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend);

/**
 * Rent Calculator
 * - Compares total monthly renting cost vs BAH and target budget
 * - Includes utilities, parking, renters insurance, fees, and concessions
 * - Optionally factors state tax on military retirement or disability income (display only)
 * - Visuals: cost breakdown and BAH coverage
 */

function n(v) {
  const x = Number(v);
  return Number.isFinite(x) ? x : 0;
}
function money(x) {
  return `$${Math.round(n(x)).toLocaleString()}`;
}

export default function RentCalculator() {
  // Inputs
  const [state, setState] = useState("VA");
  const [zip, setZip] = useState("22314");
  const [paygrade, setPaygrade] = useState("O-5");
  const [withDeps, setWithDeps] = useState(true);

  const [baseRent, setBaseRent] = useState(2800);
  const [utilities, setUtilities] = useState(250);
  const [parking, setParking] = useState(150);
  const [rentersIns, setRentersIns] = useState(20);
  const [fees, setFees] = useState(25); // pet, trash, amenity, etc.
  const [concessionPct, setConcessionPct] = useState(0); // % off base rent
  const [targetBudget, setTargetBudget] = useState(3200);

  // BAH manual entry for now; wire your BAH data source later
  const [bahMonthly, setBahMonthly] = useState(3200);

  // Derived totals
  const concessionAmt = useMemo(() => baseRent * (concessionPct / 100), [baseRent, concessionPct]);
  const effectiveRent = useMemo(() => Math.max(0, baseRent - concessionAmt), [baseRent, concessionAmt]);

  const totalMonthly = useMemo(
    () => effectiveRent + utilities + parking + rentersIns + fees,
    [effectiveRent, utilities, parking, rentersIns, fees]
  );

  const coverageGap = useMemo(() => bahMonthly - totalMonthly, [bahMonthly, totalMonthly]);
  const budgetGap = useMemo(() => targetBudget - totalMonthly, [targetBudget, totalMonthly]);

  // State policy snippet (display only, not applied to monthly rent math)
  const policy = stateTaxAndBenefits[state] || {};
  const retireTax = policy.retirementTax || "N/A";
  const disabilityTax = policy.disabilityTax || "N/A";
  const notes = policy.notes || "";

  // Charts
  const breakdownData = useMemo(
    () => ({
      labels: ["Rent (net)", "Utilities", "Parking", "Renters Ins.", "Fees"],
      datasets: [
        {
          label: "Monthly Cost",
          data: [effectiveRent, utilities, parking, rentersIns, fees],
          backgroundColor: ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6"],
          borderWidth: 0,
        },
      ],
    }),
    [effectiveRent, utilities, parking, rentersIns, fees]
  );

  const coverageData = useMemo(
    () => ({
      labels: ["Covered by BAH", "Out-of-Pocket"],
      datasets: [
        {
          data: [
            Math.max(0, Math.min(bahMonthly, totalMonthly)),
            Math.max(0, totalMonthly - bahMonthly),
          ],
          backgroundColor: ["#10b981", "#ef4444"],
          borderWidth: 0,
        },
      ],
    }),
    [bahMonthly, totalMonthly]
  );

  return (
    <div className="max-w-7xl mx-auto p-4 bg-white">
      <header className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🏢 Rent Analysis</h1>
        <p className="text-gray-600">Compare monthly renting costs to BAH and your budget.</p>
      </header>

      {/* Inputs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Location + Profile */}
        <section className="rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 className="font-semibold text-gray-800">Location & Profile</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              {Object.keys(stateTaxAndBenefits).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ZIP</label>
              <input
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                inputMode="numeric"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Paygrade</label>
              <select
                value={paygrade}
                onChange={(e) => setPaygrade(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                {[
                  "E-1","E-2","E-3","E-4","E-5","E-6","E-7","E-8","E-9",
                  "W-1","W-2","W-3","W-4","W-5",
                  "O-1","O-2","O-3","O-4","O-5","O-6","O-7","O-8","O-9","O-10",
                ].map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={withDeps}
              onChange={(e) => setWithDeps(e.target.checked)}
              className="h-4 w-4 text-blue-600 rounded"
            />
            With dependents
          </label>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">BAH (manual)</label>
            <input
              type="number"
              min={0}
              value={bahMonthly}
              onChange={(e) => setBahMonthly(Number(e.target.value))}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter current BAH for ZIP and status. Auto-fill to be wired later.
            </p>
          </div>
        </section>

        {/* Rent inputs */}
        <section className="rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 className="font-semibold text-gray-800">Monthly Costs</h2>

          <NumberField label="Base Rent" value={baseRent} setValue={setBaseRent} step={50} min={0} />
          <NumberField label="Utilities" value={utilities} setValue={setUtilities} step={10} min={0} />
          <NumberField label="Parking" value={parking} setValue={setParking} step={10} min={0} />
          <NumberField label="Renters Insurance" value={rentersIns} setValue={setRentersIns} step={5} min={0} />
          <NumberField label="Other Fees" value={fees} setValue={setFees} step={5} min={0} />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Concession (% off base rent)
            </label>
            <input
              type="range"
              min={0}
              max={20}
              step={1}
              value={concessionPct}
              onChange={(e) => setConcessionPct(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>0%</span>
              <span>{concessionPct}%</span>
              <span>20%</span>
            </div>
          </div>
        </section>

        {/* Targets and policy */}
        <section className="rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 className="font-semibold text-gray-800">Budget & Policy</h2>

          <NumberField label="Target Budget" value={targetBudget} setValue={setTargetBudget} step={50} min={0} />

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="text-sm font-semibold text-blue-800 mb-1">State Policy Snapshot</div>
            <ul className="text-xs text-blue-900 space-y-1 list-disc pl-4">
              <li>Military retirement: {retireTax}</li>
              <li>VA disability: {disabilityTax}</li>
              {notes ? <li>{notes}</li> : null}
            </ul>
          </div>

          <div className="bg-gray-50 border rounded-lg p-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Effective Rent</span>
              <span className="font-semibold">{money(effectiveRent)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Monthly</span>
              <span className="font-semibold">{money(totalMonthly)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">BAH Coverage</span>
              <span className={`font-semibold ${coverageGap >= 0 ? "text-green-600" : "text-rose-600"}`}>
                {coverageGap >= 0 ? `${money(coverageGap)} surplus` : `${money(-coverageGap)} short`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Budget Gap</span>
              <span className={`font-semibold ${budgetGap >= 0 ? "text-green-600" : "text-rose-600"}`}>
                {budgetGap >= 0 ? `${money(budgetGap)} under` : `${money(-budgetGap)} over`}
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 text-center">Monthly Cost Breakdown</h3>
          <Bar
            data={breakdownData}
            options={{
              responsive: true,
              plugins: { legend: { display: false }, tooltip: { enabled: true } },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: (v) => `$${v.toLocaleString()}`,
                  },
                },
              },
            }}
          />
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 text-center">BAH Coverage</h3>
          <div className="w-full max-w-sm mx-auto">
            <Doughnut
              data={coverageData}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: "bottom" },
                  tooltip: {
                    callbacks: {
                      label: (ctx) => `${ctx.label}: ${money(ctx.parsed)}`
                    }
                  }
                },
                cutout: "65%",
              }}
            />
          </div>
          <p className="text-xs text-gray-500 text-center mt-3">
            Shows portion of monthly rent costs covered by your current BAH.
          </p>
        </div>
      </div>
    </div>
  );
}

function NumberField({ label, value, setValue, step = 10, min = 0 }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type="number"
        min={min}
        step={step}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}
