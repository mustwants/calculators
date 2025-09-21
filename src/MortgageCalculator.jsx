import React, { useState } from 'react';
import { Doughnut, Radar, Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  RadialLinearScale,
  PointElement,
  LineElement,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js';
import { validateNumber, validatePercentage, formatCurrency } from './utils';

ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend, 
  RadialLinearScale, 
  PointElement, 
  LineElement,
  CategoryScale,
  LinearScale,
  BarElement
);

function MortgageCalculator() {
  const [chartType, setChartType] = useState('doughnut');
  const [homePrice, setHomePrice] = useState('420000'); // National median home price 2024
  const [downPayment, setDownPayment] = useState('84000'); // 20% down
  const [interestRate, setInterestRate] = useState('6.75'); // Average 30-year rate 2024
  const [loanTermYears, setLoanTermYears] = useState('30');
  const [annualTaxes, setAnnualTaxes] = useState('6300'); // National average property tax
  const [annualInsurance, setAnnualInsurance] = useState('1800'); // National average homeowner's insurance
  const [pmiRate, setPmiRate] = useState('0.5');
  const [isVALoan, setIsVALoan] = useState(false);
  const [vaFundingFee, setVaFundingFee] = useState('2.15');
  const [militaryStatus, setMilitaryStatus] = useState('first-time');

  const homeValue = validateNumber(homePrice, 0, 10000000);
  const downPaymentAmount = validateNumber(downPayment, 0, homeValue);
  const loanAmount = Math.max(homeValue - downPaymentAmount, 0);
  const downPaymentPercent = homeValue > 0 ? (downPaymentAmount / homeValue) * 100 : 0;

  const monthlyPayment = (() => {
    const rate = validatePercentage(interestRate) / 100 / 12;
    const termMonths = validateNumber(loanTermYears, 1, 50) * 12;
    const taxes = validateNumber(annualTaxes, 0, 1000000) / 12;
    const insurance = validateNumber(annualInsurance, 0, 100000) / 12;
    
    // VA Loan specific calculations
    let effectiveLoanAmount = loanAmount;
    let pmi = 0;
    
    if (isVALoan) {
      // VA loans don't require PMI but have funding fee
      const fundingFeePercent = validatePercentage(vaFundingFee) / 100;
      const fundingFeeAmount = loanAmount * fundingFeePercent;
      effectiveLoanAmount = loanAmount + fundingFeeAmount;
      pmi = 0; // No PMI for VA loans
    } else {
      // Conventional loan PMI calculation
      pmi = downPaymentPercent < 20 
        ? (loanAmount * validatePercentage(pmiRate) / 100) / 12 
        : 0;
    }

    if (rate === 0 || effectiveLoanAmount === 0) {
      return effectiveLoanAmount / termMonths + taxes + insurance + pmi;
    }

    const basePayment =
      effectiveLoanAmount * rate / (1 - Math.pow(1 + rate, -termMonths));

    return basePayment + taxes + insurance + pmi;
  })();

  // Chart data
  const pmiAmount = downPaymentPercent < 20 
    ? (loanAmount * (parseFloat(pmiRate) || 0.5) / 100) / 12 
    : 0;
    
  const principalAndInterest = monthlyPayment - ((parseFloat(annualTaxes) || 0) / 12) - ((parseFloat(annualInsurance) || 0) / 12) - pmiAmount;
  
  const chartLabels = ['Principal & Interest', 'Property Taxes', 'Insurance', ...(pmiAmount > 0 ? ['PMI'] : [])];
  const chartValues = [
    principalAndInterest,
    (parseFloat(annualTaxes) || 0) / 12,
    (parseFloat(annualInsurance) || 0) / 12,
    ...(pmiAmount > 0 ? [pmiAmount] : []),
  ];

  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Monthly Payment Breakdown',
        data: chartValues,
        backgroundColor: [
          '#2563eb',
          '#10b981',
          '#f59e0b',
          '#ef4444',
        ],
        borderColor: [
          '#1d4ed8',
          '#059669',
          '#d97706',
          '#dc2626',
        ],
        borderWidth: 2,
      },
    ],
  };

  const barData = {
    ...chartData,
    datasets: [{
      ...chartData.datasets[0],
      backgroundColor: chartData.datasets[0].backgroundColor.map(color => color + '80'),
    }]
  };

  const radarData = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Monthly Payment Breakdown',
        data: chartValues,
        backgroundColor: 'rgba(37,99,235,0.2)',
        borderColor: '#2563eb',
        pointBackgroundColor: '#2563eb',
        pointBorderColor: '#1d4ed8',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#2563eb',
      },
    ],
  };

  const lineData = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Monthly Payment Breakdown',
        data: chartValues,
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37,99,235,0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#2563eb',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.label}: $${context.parsed.toFixed(2)}`;
          }
        }
      }
    },
  };

  const barOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '$' + value.toFixed(0);
          }
        }
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-8 bg-white rounded-2xl shadow-xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 text-blue-800 flex items-center justify-center gap-3">
          🏠 VA Mortgage Calculator
        </h1>
        <p className="text-gray-600">Calculate your mortgage payments with VA loan benefits and military-specific considerations</p>
      </div>

      {/* VA Loan Toggle */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-blue-800">VA Loan Benefits</h3>
            <p className="text-sm text-blue-600">No down payment • No PMI • Competitive rates</p>
          </div>
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isVALoan}
              onChange={(e) => setIsVALoan(e.target.checked)}
              className="sr-only"
            />
            <div className={`relative w-12 h-6 rounded-full transition-colors ${isVALoan ? 'bg-blue-600' : 'bg-gray-300'}`}>
              <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${isVALoan ? 'translate-x-6' : ''}`} />
            </div>
            <span className="ml-2 text-sm font-medium text-blue-800">
              {isVALoan ? 'VA Loan' : 'Conventional'}
            </span>
          </label>
        </div>
      </div>
      {/* Input Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div>
          <label htmlFor="homePrice" className="block text-sm font-medium text-gray-700 mb-2">Home Price</label>
          <input 
            id="homePrice"
            type="number" 
            value={homePrice} 
            onChange={(e) => setHomePrice(e.target.value)} 
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors" 
            placeholder="e.g., 400,000"
            min="0"
            max="10000000"
          />
          <p className="mt-1 text-xs text-gray-500">Total purchase price</p>
        </div>

        <div>
          <label htmlFor="downPayment" className="block text-sm font-medium text-gray-700 mb-2">
            Down Payment {isVALoan && <span className="text-green-600">(VA: $0 Required)</span>}
          </label>
          <input 
            id="downPayment"
            type="number" 
            value={downPayment} 
            onChange={(e) => setDownPayment(e.target.value)} 
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors" 
            placeholder={isVALoan ? "0 (VA Loan)" : "e.g., 80,000"}
            min="0"
            max={homeValue}
          />
          <p className="mt-1 text-xs text-gray-500">
            {isVALoan ? 'VA loans allow 0% down' : 'Amount paid upfront'}
          </p>
        </div>

        <div>
          <label htmlFor="interestRate" className="block text-sm font-medium text-gray-700 mb-2">Interest Rate (%)</label>
          <input 
            id="interestRate"
            type="number" 
            value={interestRate} 
            onChange={(e) => setInterestRate(e.target.value)} 
            step="0.01" 
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors" 
            placeholder="e.g., 6.5"
            min="0"
            max="30"
          />
          <p className="mt-1 text-xs text-gray-500">Annual percentage rate</p>
        </div>

        <div>
          <label htmlFor="loanTerm" className="block text-sm font-medium text-gray-700 mb-2">Loan Term (Years)</label>
          <select 
            id="loanTerm"
            value={loanTermYears} 
            onChange={(e) => setLoanTermYears(e.target.value)} 
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
          >
            <option value="15">15 years</option>
            <option value="20">20 years</option>
            <option value="25">25 years</option>
            <option value="30">30 years</option>
          </select>
          <p className="mt-1 text-xs text-gray-500">Length of mortgage</p>
        </div>

        <div>
          <label htmlFor="annualTaxes" className="block text-sm font-medium text-gray-700 mb-2">Annual Property Tax</label>
          <input 
            id="annualTaxes"
            type="number" 
            value={annualTaxes} 
            onChange={(e) => setAnnualTaxes(e.target.value)} 
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors" 
            placeholder="e.g., 8,000"
            min="0"
          />
          <p className="mt-1 text-xs text-gray-500">Yearly property taxes</p>
        </div>

        <div>
          <label htmlFor="annualInsurance" className="block text-sm font-medium text-gray-700 mb-2">Annual Insurance</label>
          <input 
            id="annualInsurance"
            type="number" 
            value={annualInsurance} 
            onChange={(e) => setAnnualInsurance(e.target.value)} 
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors" 
            placeholder="e.g., 1,200"
            min="0"
          />
          <p className="mt-1 text-xs text-gray-500">Homeowner's insurance</p>
        </div>

        {/* VA-specific inputs */}
        {isVALoan ? (
          <div>
            <label htmlFor="vaFundingFee" className="block text-sm font-medium text-gray-700 mb-2">VA Funding Fee (%)</label>
            <select 
              id="vaFundingFee"
              value={vaFundingFee} 
              onChange={(e) => setVaFundingFee(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
            >
              <option value="2.15">2.15% (First-time use)</option>
              <option value="3.30">3.30% (Subsequent use)</option>
              <option value="1.25">1.25% (Reserve/Guard)</option>
              <option value="0">0% (Disabled veteran)</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">One-time fee (can be financed)</p>
          </div>
        ) : (
          <div>
            <label htmlFor="pmiRate" className="block text-sm font-medium text-gray-700 mb-2">PMI Rate (% annually)</label>
            <input 
              id="pmiRate"
              type="number" 
              value={pmiRate} 
              onChange={(e) => setPmiRate(e.target.value)} 
              step="0.1" 
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors" 
              min="0"
              max="5"
              placeholder="0.5"
            />
            <p className="mt-1 text-xs text-gray-500">Private mortgage insurance rate</p>
          </div>
        )}
      </div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Results</h2>
        <div className="flex flex-col gap-2">
          <span>🏠 Loan Amount: <strong>${loanAmount.toLocaleString()}</strong></span>
          <span>📊 Down Payment: <strong>{downPaymentPercent.toFixed(1)}%</strong></span>
          <span>💵 Estimated Monthly Payment: <strong>${monthlyPayment.toFixed(2)}</strong></span>
          {pmiAmount > 0 && (
            <span className="text-amber-600">⚠️ PMI Required: <strong>${pmiAmount.toFixed(2)}/month</strong> (Remove when equity reaches 20%)</span>
          )}
        </div>
      </div>
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">Chart Type</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { value: 'doughnut', label: 'Doughnut', icon: '🍩' },
            { value: 'radar', label: 'Radar', icon: '📡' },
            { value: 'bar', label: 'Bar', icon: '📊' },
            { value: 'line', label: 'Line', icon: '📈' }
          ].map(({ value, label, icon }) => (
            <button
              key={value}
              onClick={() => setChartType(value)}
              className={`p-3 rounded-lg border-2 transition-all ${
                chartType === value 
                  ? 'border-blue-500 bg-blue-50 text-blue-700' 
                  : 'border-gray-200 hover:border-gray-300 text-gray-600 hover:text-gray-800'
              }`}
            >
              <div className="text-2xl mb-1">{icon}</div>
              <div className="text-sm font-medium">{label}</div>
            </button>
          ))}
        </div>
      </div>
      
      <div className="bg-gray-50 p-6 rounded-lg mb-6">
        <div className="h-96">
          {chartType === 'doughnut' && <Doughnut data={chartData} options={chartOptions} />}
          {chartType === 'radar' && <Radar data={radarData} options={chartOptions} />}
          {chartType === 'bar' && <Bar data={barData} options={barOptions} />}
          {chartType === 'line' && <Line data={lineData} options={chartOptions} />}
        </div>
      </div>
            {/* Footer Links */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Resources</h4>
            <div className="space-y-2 text-xs">
              <a href="https://www.mustwants.com" target="_blank" rel="noopener noreferrer" className="block text-blue-600 hover:underline">
                🔗 MustWants.com
              </a>
              <a href="https://www.militarygrad.com" target="_blank" rel="noopener noreferrer" className="block text-blue-600 hover:underline">
                🎓 MilitaryGrad.com
              </a>
              <a href="https://mustwants.com/podcast" target="_blank" rel="noopener noreferrer" className="block text-blue-600 hover:underline">
                🎧 Listen to Our Podcast
              </a>
              <a href="https://mustwants.com/app" target="_blank" rel="noopener noreferrer" className="block text-blue-600 hover:underline">
                📱 Download Our App
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Follow MustWants</h4>
            <div className="grid grid-cols-3 gap-2">
              <a href="https://facebook.com/mustwants" target="_blank" rel="noopener noreferrer" 
                 className="bg-blue-600 hover:bg-blue-500 text-white p-1 rounded text-center text-xs transition-colors" title="Facebook">
                📘
              </a>
              <a href="https://instagram.com/mustwants" target="_blank" rel="noopener noreferrer" 
                 className="bg-pink-600 hover:bg-pink-500 text-white p-1 rounded text-center text-xs transition-colors" title="Instagram">
                📷
              </a>
              <a href="https://twitter.com/mustwants" target="_blank" rel="noopener noreferrer" 
                 className="bg-gray-800 hover:bg-gray-700 text-white p-1 rounded text-center text-xs transition-colors" title="Twitter/X">
                ❌
              </a>
              <a href="https://linkedin.com/company/mustwants" target="_blank" rel="noopener noreferrer" 
                 className="bg-blue-700 hover:bg-blue-600 text-white p-1 rounded text-center text-xs transition-colors" title="LinkedIn">
                💼
              </a>
              <a href="https://youtube.com/mustwants" target="_blank" rel="noopener noreferrer" 
                 className="bg-red-600 hover:bg-red-500 text-white p-1 rounded text-center text-xs transition-colors" title="YouTube">
                📺
              </a>
              <a href="https://bsky.app/profile/mustwants" target="_blank" rel="noopener noreferrer" 
                 className="bg-sky-600 hover:bg-sky-500 text-white p-1 rounded text-center text-xs transition-colors" title="BlueSky">
                🦋
              </a>
            </div>
          </div>
        </div>
        
        <div className="text-center mt-6 pt-4 border-t border-gray-100">
          <div className="flex flex-wrap justify-center items-center gap-3 mb-2 text-xs">
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">📌 MustWants Pin</span>
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded">🏆 SDVOSB</span>
            <span className="bg-red-100 text-red-800 px-2 py-1 rounded">🇺🇸 Veteran Owned</span>
          </div>
          <p className="text-xs text-gray-500">
            VetMover™ is sponsored by <a href="https://www.mustwants.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">MustWants.com</a> and is a trademark of MustWants.
          </p>
        </div>
      </div>
    </div>
  );
}

export default MortgageCalculator;

