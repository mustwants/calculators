//PATH calculators/src/SBPDecisionCalculators.jsx

import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

function SBPDecisionCalculator() {
  const [inputs, setInputs] = useState({
    yourAge: 47,
    spouseAge: 40,
    yearsService: 24,
    pensionBase: 6000,     // months retirement pay basis
    assets: 0,
    expectedReturn: 0.06,  // 6%
    taxRate: 0.22,         // 22%
    lifeInsuranceCost: 0,  // annual cost of a life insurer path
    lifeInsuranceFace: 0,  // face value
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs(prev => ({
      ...prev,
      [name]: parseFloat(value),
    }));
  };

  // Helper: compute SBP premium (approx 6.5% of the base)
  function computeSBPPremium() {
    // base = pensionBase * 12 (annual)
    const annualBase = inputs.pensionBase * 12;
    const premium = 0.065 * annualBase;
    return premium;
  }

  // Compute SBP benefit (annual) to spouse if you die
  function computeSBPBenefit() {
    const annualBase = inputs.pensionBase * 12;
    const benefit = 0.55 * annualBase;
    return benefit;
  }

  // Project future values over N years: SBP path and investment path
  function makeProjections(durationYears = 40) {
    const premium = computeSBPPremium();
    const benefit = computeSBPBenefit();
    const r = inputs.expectedReturn;
    const t = inputs.taxRate;

    // arrays for chart
    const data = [];

    // For “self-invest / life insurance” path: assume you pay life insurance + invest remainder
    // Lump sum invested each year = premium savings
    // For simplicity assume at death of spouse you pay out face value and residual invested capital.

    // For SBP path: you pay premiums until “paid-up” or death, then spouse gets annuity

    // We'll model both paths in a simplified way:
    let investBalance = 0;
    let cumulativePremiums = 0;

    for (let year = 0; year <= durationYears; year++) {
      // SBP: spouse gets benefit if you died that year
      const sbpPayout = year > 0 ? benefit : 0;

      // Investment path:
      // Each year you “save” the premium — you don’t pay SBP, you invest that instead
      if (year > 0) {
        investBalance = investBalance * (1 + r) + premium;
        cumulativePremiums += premium;
      }
      // At spouse death assumed at end, you “pay life insurance face value”
      const investNet = investBalance + inputs.assets - inputs.lifeInsuranceCost * year - inputs.lifeInsuranceFace;

      data.push({
        year,
        SBP: sbpPayout,
        InvestmentNet: investNet,
        InvestBalance: investBalance,
      });
    }

    return data;
  }

  const chartData = makeProjections(40);
  const premium = computeSBPPremium();
  const benefit = computeSBPBenefit();

  // Final decision (very simplified)
  // Compare present values roughly: benefit / premium > threshold?
  const ratio = benefit / premium;
  const recommendation = ratio > 1.5
    ? "Take SBP"
    : "Consider life insurance / self-invest path";

  return (
    <div className="sbp-calculator p-4 border rounded">
      <h2>SBP vs Insurance Decision Calculator</h2>
      <div className="inputs grid grid-cols-2 gap-4">
        {[
          { label: "Your Age", name: "yourAge" },
          { label: "Spouse Age", name: "spouseAge" },
          { label: "Years of Service", name: "yearsService" },
          { label: "Monthly Pension Base ($)", name: "pensionBase" },
          { label: "Current Assets ($)", name: "assets" },
          { label: "Expected Return (decimal)", name: "expectedReturn" },
          { label: "Tax Rate (decimal)", name: "taxRate" },
          { label: "Life Insurance Cost / yr ($)", name: "lifeInsuranceCost" },
          { label: "Life Insurance Face Value ($)", name: "lifeInsuranceFace" },
        ].map(({ label, name }) => (
          <div key={name} className="input-item">
            <label>{label}</label>
            <input
              type="number"
              name={name}
              value={inputs[name]}
              onChange={handleChange}
              className="border px-2 py-1 w-full"
            />
          </div>
        ))}
      </div>

      <div className="outputs my-4">
        <p>Estimated SBP Premium: ${premium.toFixed(2)} / yr</p>
        <p>Estimated SBP Beneficiary Annuity: ${benefit.toFixed(2)} / yr</p>
        <p>Benefit / Premium Ratio: {ratio.toFixed(2)}</p>
        <h3>Recommendation: <strong>{recommendation}</strong></h3>
      </div>

      <div style={{ width: "100%", height: 400 }}>
        <ResponsiveContainer>
          <BarChart data={chartData}>
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="SBP" fill="#8884d8" name="Annual SBP Payout" />
            <Bar dataKey="InvestBalance" fill="#82ca9d" name="Investment Balance" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default SBPDecisionCalculator;
