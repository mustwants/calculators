// PATH: src/GIBillHousingStipendEstimator.jsx
import React, { useState } from "react";

/**
 * GI Bill Housing Stipend Estimator
 * - Estimates monthly and term total using a user-provided MHA (E-5 w/ dependents at school ZIP).
 * - Notes: Actual MHA is set by DoD BAH tables and varies by campus ZIP and training mode (online vs in-person).
 * - State taxes do not apply to MHA; it is non-taxable.
 */

export default function GIBillHousingStipendEstimator() {
  // Inputs
  const [mhaMonthly, setMhaMonthly] = useState(2100); // User provides MHA for campus ZIP (E-5 w/ dep)
  const [monthsPerTerm, setMonthsPerTerm] = useState(4); // e.g., 4-month term
  const [termsPerYear, setTermsPerYear] = useState(2);  // semesters = 2, quarters = 3
  const [attendanceRatePct, setAttendanceRatePct] = useState(100); // 0–100% training time
  const [onlineOnly, setOnlineOnly] = useState(false); // online-only reduces to half national avg (not modeled here; user toggles)

  // Derived
  const adjMha = Math.max(0, Number(mhaMonthly) || 0) * (Math.max(0, Number(attendanceRatePct) || 0) / 100);
  const monthlyStipend = onlineOnly ? adjMha * 0.5 : adjMha; // simplified: online-only at 50% of entered MHA (user guidance)
  const termTotal = monthlyStipend * Math.max(0, Number(monthsPerTerm) || 0);
  const annualTotal = termTotal * Math.max(0, Number(termsPerYear) || 0);

  return (
    <div className="max-w-3xl mx-auto my-8 p-6 bg-white rounded-2xl shadow">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-blue-800">🎓💰 GI Bill Housing Stipend</h1>
        <p className="text-sm text-gray-600">
          Enter the monthly MHA for your campus ZIP (E-5 with dependents). Stipend scales with training
          time and may be reduced for online-only programs. MHA is non-taxable.
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-6">
        <section className="rounded-xl border p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Monthly MHA ($)</label>
            <input
              type="number"
              inputMode="decimal"
              className="mt-1 w-full rounded-md border border-gray-300 p-2"
              value={mhaMonthly}
              min={0}
              onChange={(e) => setMhaMonthly(Number(e.target.value))}
            />
            <p className="mt-1 text-xs text-gray-500">
              Use E-5 w/ dependents for the campus ZIP. Check VA’s GI Bill Comparison Tool for the exact amount.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Months per Term</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border border-gray-300 p-2"
                value={monthsPerTerm}
                min={1}
                max={12}
                onChange={(e) => setMonthsPerTerm(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Terms per Year</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border border-gray-300 p-2"
                value={termsPerYear}
                min={1}
                max={6}
                onChange={(e) => setTermsPerYear(Number(e.target.value))}
              />
            </div>
          </div>
        </section>

        <section className="rounded-xl border p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Attendance Rate (%)</label>
            <input
              type="number"
              className="mt-1 w-full rounded-md border border-gray-300 p-2"
              value={attendanceRatePct}
              min={0}
              max={100}
              step="1"
              onChange={(e) => setAttendanceRatePct(Number(e.target.value))}
            />
            <p className="mt-1 text-xs text-gray-500">Scaled stipend based on training load (e.g., 60%, 80%, 100%).</p>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="onlineOnly"
              type="checkbox"
              className="h-4 w-4"
              checked={onlineOnly}
              onChange={(e) => setOnlineOnly(e.target.checked)}
            />
            <label htmlFor="onlineOnly" className="text-sm text-gray-700">
              Online-only program
            </label>
          </div>

          <div className="rounded-lg bg-gray-50 p-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Adjusted Monthly Stipend</span>
              <span className="font-semibold">${monthlyStipend.toFixed(0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Per-Term Total</span>
              <span className="font-semibold">${termTotal.toFixed(0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Annual Total</span>
              <span className="font-semibold">${annualTotal.toFixed(0)}</span>
            </div>
          </div>
        </section>
      </div>

      <footer className="mt-6 rounded-lg bg-blue-50 p-4 text-sm text-blue-900">
        <ul className="list-disc pl-5 space-y-1">
          <li>MHA is generally the BAH for an E-5 with dependents at the school ZIP.</li>
          <li>Online-only programs typically receive a lower stipend. This tool applies 50% as a simple proxy.</li>
          <li>Confirm exact MHA with VA’s GI Bill Comparison Tool and your school’s certifying official.</li>
        </ul>
      </footer>
    </div>
  );
}
