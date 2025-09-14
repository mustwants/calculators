import React, { useState } from 'react';
import { Doughnut, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  RadialLinearScale,
  PointElement,
  LineElement,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, RadialLinearScale, PointElement, LineElement);

function MortgageCalculator() {
  const [chartType, setChartType] = useState('doughnut');
  const [homePrice, setHomePrice] = useState('');
  const [downPayment, setDownPayment] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [loanTermYears, setLoanTermYears] = useState('30');
  const [annualTaxes, setAnnualTaxes] = useState('');
  const [annualInsurance, setAnnualInsurance] = useState('');

  const loanAmount = Math.max(
    (parseFloat(homePrice) || 0) - (parseFloat(downPayment) || 0),
    0
  );

  const monthlyPayment = (() => {
    const rate = (parseFloat(interestRate) || 0) / 100 / 12;
    const termMonths = (parseInt(loanTermYears) || 30) * 12;
    const taxes = (parseFloat(annualTaxes) || 0) / 12;
    const insurance = (parseFloat(annualInsurance) || 0) / 12;

    if (rate === 0) {
      return loanAmount / termMonths + taxes + insurance;
    }

    const basePayment =
      loanAmount * rate / (1 - Math.pow(1 + rate, -termMonths));

    return basePayment + taxes + insurance;
  })();

  // Chart data
  const chartData = {
    labels: ['Principal', 'Taxes', 'Insurance'],
    datasets: [
      {
        label: 'Monthly Breakdown',
        data: [
          monthlyPayment - ((parseFloat(annualTaxes) || 0) / 12) - ((parseFloat(annualInsurance) || 0) / 12),
          (parseFloat(annualTaxes) || 0) / 12,
          (parseFloat(annualInsurance) || 0) / 12,
        ],
        backgroundColor: [
          '#2563eb',
          '#22d3ee',
          '#fbbf24',
        ],
        borderWidth: 1,
      },
    ],
  };

  const radarData = {
    labels: ['Principal', 'Taxes', 'Insurance'],
    datasets: [
      {
        label: 'Monthly Breakdown',
        data: [
          monthlyPayment - ((parseFloat(annualTaxes) || 0) / 12) - ((parseFloat(annualInsurance) || 0) / 12),
          (parseFloat(annualTaxes) || 0) / 12,
          (parseFloat(annualInsurance) || 0) / 12,
        ],
        backgroundColor: 'rgba(37,99,235,0.2)',
        borderColor: '#2563eb',
        pointBackgroundColor: '#2563eb',
      },
    ],
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg">
      <h1 className="text-2xl font-bold mb-6 text-blue-700 flex items-center gap-2">📊 Mortgage Calculator</h1>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Home Price</label>
          <input type="number" value={homePrice} onChange={(e) => setHomePrice(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Down Payment</label>
          <input type="number" value={downPayment} onChange={(e) => setDownPayment(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Interest Rate (%)</label>
          <input type="number" value={interestRate} onChange={(e) => setInterestRate(e.target.value)} step="0.01" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Loan Term (Years)</label>
          <input type="number" value={loanTermYears} onChange={(e) => setLoanTermYears(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Annual Property Tax</label>
          <input type="number" value={annualTaxes} onChange={(e) => setAnnualTaxes(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Annual Insurance</label>
          <input type="number" value={annualInsurance} onChange={(e) => setAnnualInsurance(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
        </div>
      </div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Results</h2>
        <div className="flex flex-col gap-2">
          <span>🏠 Loan Amount: <strong>${loanAmount.toFixed(2)}</strong></span>
          <span>💵 Estimated Monthly Payment: <strong>${monthlyPayment.toFixed(2)}</strong></span>
        </div>
      </div>
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Chart Type</label>
        <select value={chartType} onChange={e => setChartType(e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm">
          <option value="doughnut">Doughnut</option>
          <option value="radar">Radar</option>
        </select>
      </div>
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        {chartType === 'doughnut' ? (
          <Doughnut data={chartData} />
        ) : (
          <Radar data={radarData} />
        )}
      </div>
      <div className="mt-6 text-center">
        <a href="https://www.mustwants.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
          🔗 Visit MustWants.com
        </a>
        <span className="mx-2">|</span>
        <a href="https://www.militarygrad.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
          🎓 Visit MilitaryGrad.com
        </a>
      </div>
    </div>
  );
}

export default MortgageCalculator;

