import React, { useState, useEffect } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import nationalAverages from './data/nationalAverages.json';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

function LandlordProfitabilityTool() {
  const rentalDefaults = nationalAverages.phase2Data?.rentalProperty || {};
  const housingDefaults = nationalAverages.housing?.nationalAverages || {};
  
  const [inputs, setInputs] = useState({
    propertyValue: 300000,
    monthlyRent: 2200,
    mortgagePayment: 1800,
    propertyTax: 350,
    insurance: 120,
    maintenance: 150,
    managementFee: rentalDefaults.managementFeeRange?.average || 8,
    vacancyRate: rentalDefaults.vacancyRateRange?.average || 6.8,
    capExReserve: 100,
    includeManagement: true,
    loanAmount: 240000,
    appreciationRate: 3.5
  });

  const [profitability, setProfitability] = useState({
    monthlyData: {},
    annualData: {},
    cashFlow: 0,
    capRate: 0,
    cashOnCashReturn: 0,
    totalReturn: 0
  });

  const calculateProfitability = () => {
    // Monthly Income
    const grossRent = inputs.monthlyRent;
    const vacancyLoss = grossRent * (inputs.vacancyRate / 100);
    const effectiveRent = grossRent - vacancyLoss;
    
    // Monthly Expenses
    const mortgage = inputs.mortgagePayment;
    const propertyTax = inputs.propertyTax;
    const insurance = inputs.insurance;
    const maintenance = inputs.maintenance;
    const management = inputs.includeManagement ? 
      (grossRent * inputs.managementFee / 100) : 0;
    const capEx = inputs.capExReserve;
    
    const totalExpenses = mortgage + propertyTax + insurance + maintenance + management + capEx;
    const monthlyCashFlow = effectiveRent - totalExpenses;
    
    // Annual Calculations
    const annualRent = effectiveRent * 12;
    const annualExpenses = totalExpenses * 12;
    const annualCashFlow = monthlyCashFlow * 12;
    
    // Key Metrics
    const capRate = ((annualRent - (annualExpenses - mortgage * 12)) / inputs.propertyValue) * 100;
    const downPayment = inputs.propertyValue - inputs.loanAmount;
    const cashOnCashReturn = downPayment > 0 ? (annualCashFlow / downPayment) * 100 : 0;
    
    // Total Return (including appreciation)
    const annualAppreciation = inputs.propertyValue * (inputs.appreciationRate / 100);
    const totalAnnualReturn = annualCashFlow + annualAppreciation;
    const totalReturn = downPayment > 0 ? (totalAnnualReturn / downPayment) * 100 : 0;
    
    const monthlyData = {
      income: {
        grossRent,
        vacancyLoss,
        effectiveRent
      },
      expenses: {
        mortgage,
        propertyTax,
        insurance,
        maintenance,
        management,
        capEx,
        total: totalExpenses
      },
      cashFlow: monthlyCashFlow
    };
    
    const annualData = {
      income: annualRent,
      expenses: annualExpenses,
      cashFlow: annualCashFlow,
      appreciation: annualAppreciation
    };
    
    setProfitability({
      monthlyData,
      annualData,
      cashFlow: monthlyCashFlow,
      capRate,
      cashOnCashReturn,
      totalReturn
    });
  };

  useEffect(() => {
    calculateProfitability();
  }, [inputs]);

  // Stacked Bar Chart Data - Income vs Expenses
  const stackedBarData = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June'],
    datasets: [
      {
        label: 'Gross Rent',
        data: Array(6).fill(profitability.monthlyData.income?.grossRent || 0),
        backgroundColor: '#22c55e',
        borderColor: '#16a34a',
        borderWidth: 1
      },
      {
        label: 'Vacancy Loss',
        data: Array(6).fill(-(profitability.monthlyData.income?.vacancyLoss || 0)),
        backgroundColor: '#ef4444',
        borderColor: '#dc2626',
        borderWidth: 1
      },
      {
        label: 'Mortgage',
        data: Array(6).fill(-(profitability.monthlyData.expenses?.mortgage || 0)),
        backgroundColor: '#3b82f6',
        borderColor: '#2563eb',
        borderWidth: 1
      },
      {
        label: 'Property Tax',
        data: Array(6).fill(-(profitability.monthlyData.expenses?.propertyTax || 0)),
        backgroundColor: '#f59e0b',
        borderColor: '#d97706',
        borderWidth: 1
      },
      {
        label: 'Insurance',
        data: Array(6).fill(-(profitability.monthlyData.expenses?.insurance || 0)),
        backgroundColor: '#8b5cf6',
        borderColor: '#7c3aed',
        borderWidth: 1
      },
      {
        label: 'Maintenance',
        data: Array(6).fill(-(profitability.monthlyData.expenses?.maintenance || 0)),
        backgroundColor: '#ec4899',
        borderColor: '#db2777',
        borderWidth: 1
      },
      {
        label: 'Management',
        data: Array(6).fill(-(profitability.monthlyData.expenses?.management || 0)),
        backgroundColor: '#06b6d4',
        borderColor: '#0891b2',
        borderWidth: 1
      }
    ]
  };

  // Expense Breakdown Pie Chart
  const expenseBreakdownData = {
    labels: ['Mortgage', 'Property Tax', 'Insurance', 'Maintenance', 'Management', 'CapEx Reserve'],
    datasets: [{
      data: [
        profitability.monthlyData.expenses?.mortgage || 0,
        profitability.monthlyData.expenses?.propertyTax || 0,
        profitability.monthlyData.expenses?.insurance || 0,
        profitability.monthlyData.expenses?.maintenance || 0,
        profitability.monthlyData.expenses?.management || 0,
        profitability.monthlyData.expenses?.capEx || 0
      ],
      backgroundColor: [
        '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#10b981'
      ],
      borderWidth: 2,
      borderColor: '#ffffff'
    }]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        text: 'Monthly Rental Property Cash Flow'
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '$' + value.toLocaleString();
          }
        }
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 bg-white">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          🏠 Landlord Profitability Tool
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Analyze rental property cash flow, expenses, and profitability metrics 
          for military real estate investment decisions.
        </p>
      </div>

      {/* Input Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 p-6 bg-gray-50 rounded-lg">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Property Value
          </label>
          <input
            type="range"
            min="150000"
            max="600000"
            step="10000"
            value={inputs.propertyValue}
            onChange={(e) => setInputs({...inputs, propertyValue: parseInt(e.target.value)})}
            className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>$150K</span>
            <span className="font-medium">${inputs.propertyValue.toLocaleString()}</span>
            <span>$600K</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Monthly Rent
          </label>
          <input
            type="range"
            min="1000"
            max="5000"
            step="100"
            value={inputs.monthlyRent}
            onChange={(e) => setInputs({...inputs, monthlyRent: parseInt(e.target.value)})}
            className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>$1K</span>
            <span className="font-medium">${inputs.monthlyRent.toLocaleString()}</span>
            <span>$5K</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mortgage Payment
          </label>
          <input
            type="range"
            min="800"
            max="4000"
            step="50"
            value={inputs.mortgagePayment}
            onChange={(e) => setInputs({...inputs, mortgagePayment: parseInt(e.target.value)})}
            className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>$800</span>
            <span className="font-medium">${inputs.mortgagePayment.toLocaleString()}</span>
            <span>$4K</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Management Fee %
          </label>
          <input
            type="range"
            min="6"
            max="12"
            step="0.5"
            value={inputs.managementFee}
            onChange={(e) => setInputs({...inputs, managementFee: parseFloat(e.target.value)})}
            className="w-full h-2 bg-yellow-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>6%</span>
            <span className="font-medium">{inputs.managementFee}%</span>
            <span>12%</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Property Tax (Monthly)
          </label>
          <input
            type="number"
            min="100"
            max="1000"
            value={inputs.propertyTax}
            onChange={(e) => setInputs({...inputs, propertyTax: parseInt(e.target.value)})}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Insurance (Monthly)
          </label>
          <input
            type="number"
            min="50"
            max="500"
            value={inputs.insurance}
            onChange={(e) => setInputs({...inputs, insurance: parseInt(e.target.value)})}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Maintenance (Monthly)
          </label>
          <input
            type="number"
            min="50"
            max="500"
            value={inputs.maintenance}
            onChange={(e) => setInputs({...inputs, maintenance: parseInt(e.target.value)})}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Vacancy Rate %
          </label>
          <input
            type="range"
            min="2"
            max="15"
            step="0.5"
            value={inputs.vacancyRate}
            onChange={(e) => setInputs({...inputs, vacancyRate: parseFloat(e.target.value)})}
            className="w-full h-2 bg-red-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>2%</span>
            <span className="font-medium">{inputs.vacancyRate}%</span>
            <span>15%</span>
          </div>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="includeManagement"
            checked={inputs.includeManagement}
            onChange={(e) => setInputs({...inputs, includeManagement: e.target.checked})}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="includeManagement" className="ml-2 text-sm font-medium text-gray-700">
            Include Property Management
          </label>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className={`rounded-lg p-4 ${profitability.cashFlow >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border`}>
          <div className="text-center">
            <div className={`text-2xl font-bold mb-1 ${profitability.cashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${Math.round(profitability.cashFlow).toLocaleString()}
            </div>
            <div className={`text-sm ${profitability.cashFlow >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              Monthly Cash Flow
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {profitability.capRate.toFixed(2)}%
            </div>
            <div className="text-sm text-blue-700">Cap Rate</div>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {profitability.cashOnCashReturn.toFixed(2)}%
            </div>
            <div className="text-sm text-purple-700">Cash-on-Cash Return</div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600 mb-1">
              {profitability.totalReturn.toFixed(2)}%
            </div>
            <div className="text-sm text-yellow-700">Total Return (w/ Appreciation)</div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Stacked Bar Chart - Income vs Expenses */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
            Monthly Income vs Expenses
          </h3>
          <div className="h-80">
            <Bar data={stackedBarData} options={chartOptions} />
          </div>
        </div>

        {/* Expense Breakdown Pie Chart */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
            Expense Breakdown
          </h3>
          <div className="h-80">
            <Doughnut data={expenseBreakdownData} options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'bottom',
                },
                tooltip: {
                  callbacks: {
                    label: function(context) {
                      return context.label + ': $' + context.parsed.toLocaleString();
                    }
                  }
                }
              }
            }} />
          </div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Income Breakdown */}
        <div className="bg-green-50 rounded-xl p-6 border border-green-200">
          <h3 className="text-xl font-bold text-green-800 mb-4">💰 Monthly Income</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-green-700">Gross Rent:</span>
              <span className="font-semibold text-green-800">
                ${(profitability.monthlyData.income?.grossRent || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-red-600">Vacancy Loss ({inputs.vacancyRate}%):</span>
              <span className="font-semibold text-red-700">
                -${(profitability.monthlyData.income?.vacancyLoss || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between border-t pt-2 font-bold">
              <span className="text-green-700">Effective Rent:</span>
              <span className="text-green-800">
                ${(profitability.monthlyData.income?.effectiveRent || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Expense Breakdown */}
        <div className="bg-red-50 rounded-xl p-6 border border-red-200">
          <h3 className="text-xl font-bold text-red-800 mb-4">📊 Monthly Expenses</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-red-700">Mortgage P&I:</span>
              <span className="font-semibold text-red-800">
                ${(profitability.monthlyData.expenses?.mortgage || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-red-700">Property Tax:</span>
              <span className="font-semibold text-red-800">
                ${(profitability.monthlyData.expenses?.propertyTax || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-red-700">Insurance:</span>
              <span className="font-semibold text-red-800">
                ${(profitability.monthlyData.expenses?.insurance || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-red-700">Maintenance:</span>
              <span className="font-semibold text-red-800">
                ${(profitability.monthlyData.expenses?.maintenance || 0).toLocaleString()}
              </span>
            </div>
            {inputs.includeManagement && (
              <div className="flex justify-between">
                <span className="text-red-700">Management ({inputs.managementFee}%):</span>
                <span className="font-semibold text-red-800">
                  ${(profitability.monthlyData.expenses?.management || 0).toLocaleString()}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-red-700">CapEx Reserve:</span>
              <span className="font-semibold text-red-800">
                ${(profitability.monthlyData.expenses?.capEx || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between border-t pt-2 font-bold">
              <span className="text-red-700">Total Expenses:</span>
              <span className="text-red-800">
                ${(profitability.monthlyData.expenses?.total || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Investment Analysis */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          📈 Investment Analysis
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="text-lg font-semibold text-blue-600 mb-2">Annual Cash Flow</div>
            <div className="text-2xl font-bold text-gray-800 mb-1">
              ${Math.round(profitability.annualData.cashFlow || 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">
              {profitability.cashFlow >= 0 ? 'Positive cash flow property' : 'Negative cash flow - consider adjustments'}
            </div>
          </div>
          <div>
            <div className="text-lg font-semibold text-purple-600 mb-2">Break-Even Analysis</div>
            <div className="text-2xl font-bold text-gray-800 mb-1">
              ${Math.round((profitability.monthlyData.expenses?.total || 0) + (profitability.monthlyData.income?.vacancyLoss || 0)).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">
              Minimum rent needed to break even
            </div>
          </div>
          <div>
            <div className="text-lg font-semibold text-green-600 mb-2">1% Rule Check</div>
            <div className="text-2xl font-bold text-gray-800 mb-1">
              {((inputs.monthlyRent / inputs.propertyValue) * 100).toFixed(2)}%
            </div>
            <div className="text-sm text-gray-600">
              {(inputs.monthlyRent / inputs.propertyValue) >= 0.01 ? 'Meets 1% rule ✓' : 'Below 1% rule'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandlordProfitabilityTool;