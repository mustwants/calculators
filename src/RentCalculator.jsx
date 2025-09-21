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

function RentCalculator() {
  const [chartType, setChartType] = useState('doughnut');
  const [monthlyRent, setMonthlyRent] = useState('1650'); // National average rent 2024
  const [annualIncrease, setAnnualIncrease] = useState('3.5'); // Average annual rent increase
  const [years, setYears] = useState('5'); // Default 5-year projection
  const [securityDeposit, setSecurityDeposit] = useState('1650'); // Typically 1 month rent
  const [petFee, setPetFee] = useState('25'); // Average monthly pet fee
  const [utilities, setUtilities] = useState('120'); // Average monthly utilities

  const totalRent = (() => {
    let total = 0;
    let rent = parseFloat(monthlyRent) || 0;
    let increase = (parseFloat(annualIncrease) || 0) / 100;
    let secDeposit = parseFloat(securityDeposit) || 0;
    let monthlyPet = parseFloat(petFee) || 0;
    let monthlyUtil = parseFloat(utilities) || 0;
    
    // Add security deposit upfront
    total += secDeposit;
    
    for (let i = 0; i < (parseInt(years) || 1); i++) {
      // Add rent + pet fee + utilities for 12 months
      total += (rent + monthlyPet + monthlyUtil) * 12;
      rent += rent * increase;
    }
    return total;
  })();

  const currentMonthlyTotal = (parseFloat(monthlyRent) || 0) + (parseFloat(petFee) || 0) + (parseFloat(utilities) || 0);
  
  // Chart data
  const chartLabels = ['Base Rent', 'Utilities', 'Pet Fee'];
  const chartValues = [
    parseFloat(monthlyRent) || 0,
    parseFloat(utilities) || 0,
    parseFloat(petFee) || 0,
  ];

  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Monthly Rent Breakdown',
        data: chartValues,
        backgroundColor: [
          '#10b981',
          '#f59e0b',
          '#8b5cf6',
        ],
        borderColor: [
          '#059669',
          '#d97706',
          '#7c3aed',
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
        label: 'Monthly Rent Breakdown',
        data: chartValues,
        backgroundColor: 'rgba(16,185,129,0.2)',
        borderColor: '#10b981',
        pointBackgroundColor: '#10b981',
        pointBorderColor: '#059669',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#10b981',
      },
    ],
  };

  const lineData = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Monthly Rent Breakdown',
        data: chartValues,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16,185,129,0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#10b981',
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
        <h1 className="text-3xl font-bold mb-2 text-green-800 flex items-center justify-center gap-3">
          🏠 Military Housing Rent Calculator
        </h1>
        <p className="text-gray-600">Calculate total rental costs including utilities and fees for your military housing needs</p>
      </div>

      {/* Input Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div>
          <label htmlFor="monthlyRent" className="block text-sm font-medium text-gray-700 mb-2">Monthly Rent</label>
          <input 
            id="monthlyRent"
            type="number" 
            value={monthlyRent} 
            onChange={(e) => setMonthlyRent(e.target.value)} 
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors" 
            placeholder="e.g., 1,650"
            min="0"
          />
          <p className="mt-1 text-xs text-gray-500">National average: $1,650/month</p>
        </div>
        
        <div>
          <label htmlFor="utilities" className="block text-sm font-medium text-gray-700 mb-2">Monthly Utilities</label>
          <input 
            id="utilities"
            type="number" 
            value={utilities} 
            onChange={(e) => setUtilities(e.target.value)} 
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors" 
            placeholder="e.g., 120"
            min="0"
          />
          <p className="mt-1 text-xs text-gray-500">Electric, water, gas, internet</p>
        </div>

        <div>
          <label htmlFor="petFee" className="block text-sm font-medium text-gray-700 mb-2">Monthly Pet Fee</label>
          <input 
            id="petFee"
            type="number" 
            value={petFee} 
            onChange={(e) => setPetFee(e.target.value)} 
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors" 
            placeholder="e.g., 25"
            min="0"
          />
          <p className="mt-1 text-xs text-gray-500">If applicable</p>
        </div>

        <div>
          <label htmlFor="securityDeposit" className="block text-sm font-medium text-gray-700 mb-2">Security Deposit</label>
          <input 
            id="securityDeposit"
            type="number" 
            value={securityDeposit} 
            onChange={(e) => setSecurityDeposit(e.target.value)} 
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors" 
            placeholder="e.g., 1,650"
            min="0"
          />
          <p className="mt-1 text-xs text-gray-500">Usually 1 month's rent</p>
        </div>

        <div>
          <label htmlFor="annualIncrease" className="block text-sm font-medium text-gray-700 mb-2">Annual Rent Increase (%)</label>
          <input 
            id="annualIncrease"
            type="number" 
            value={annualIncrease} 
            onChange={(e) => setAnnualIncrease(e.target.value)} 
            step="0.1" 
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors" 
            min="0"
            max="20"
            placeholder="3.5"
          />
          <p className="mt-1 text-xs text-gray-500">National average: 3.5%</p>
        </div>

        <div>
          <label htmlFor="years" className="block text-sm font-medium text-gray-700 mb-2">Projection Years</label>
          <input 
            id="years"
            type="number" 
            value={years} 
            onChange={(e) => setYears(e.target.value)} 
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors" 
            min="1"
            max="30"
            placeholder="5"
          />
          <p className="mt-1 text-xs text-gray-500">Typical tour length: 3-4 years</p>
        </div>
      </div>

      {/* Results */}
      <div className="mb-6 p-6 bg-green-50 rounded-lg border border-green-200">
        <h2 className="text-lg font-semibold mb-4 text-green-800">💰 Rental Cost Analysis</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <span className="text-green-700">🏠 Current Monthly Total: <strong>${currentMonthlyTotal.toLocaleString()}</strong></span>
            <span className="text-green-700">🏦 Security Deposit: <strong>${parseFloat(securityDeposit || 0).toLocaleString()}</strong></span>
            <span className="text-green-700">📊 {years}-Year Total Cost: <strong>${totalRent.toLocaleString()}</strong></span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-green-700">📈 Average Monthly Cost: <strong>${(totalRent / (parseInt(years) * 12)).toLocaleString()}</strong></span>
            <span className="text-green-700">💵 Total Without Deposit: <strong>${(totalRent - parseFloat(securityDeposit || 0)).toLocaleString()}</strong></span>
          </div>
        </div>
      </div>

      {/* Chart Selection */}
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
                  ? 'border-green-500 bg-green-50 text-green-700' 
                  : 'border-gray-200 hover:border-gray-300 text-gray-600 hover:text-gray-800'
              }`}
            >
              <div className="text-2xl mb-1">{icon}</div>
              <div className="text-sm font-medium">{label}</div>
            </button>
          ))}
        </div>
      </div>
      
      {/* Chart Display */}
      <div className="bg-gray-50 p-6 rounded-lg mb-6">
        <div className="h-96">
          {chartType === 'doughnut' && <Doughnut data={chartData} options={chartOptions} />}
          {chartType === 'radar' && <Radar data={radarData} options={chartOptions} />}
          {chartType === 'bar' && <Bar data={barData} options={barOptions} />}
          {chartType === 'line' && <Line data={lineData} options={chartOptions} />}
        </div>
      </div>

      {/* Footer Links */}
      <div className="mt-6 text-center">
        <div className="space-y-2">
          <div>
            <a href="https://www.mustwants.com" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">
              🔗 Visit MustWants.com
            </a>
            <span className="mx-2">|</span>
            <a href="https://www.militarygrad.com" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">
              🎓 Visit MilitaryGrad.com
            </a>
          </div>
          <p className="text-xs text-gray-500">
            VetMover™ is sponsored by <a href="https://www.mustwants.com" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">MustWants.com</a> and is a trademark of MustWants.
          </p>
        </div>
      </div>
    </div>
  );
}

export default RentCalculator;
