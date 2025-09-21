import React, { useState, useEffect } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import nationalAverages from './data/nationalAverages.json';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function RefinanceVsPCSSellTool() {
  const mortgageDefaults = nationalAverages.phase2Data?.mortgageRates || {};
  const refinanceDefaults = nationalAverages.phase2Data?.refinancing || {};
  
  const [inputs, setInputs] = useState({
    currentHomeValue: 350000,
    currentLoanBalance: 280000,
    currentInterestRate: 6.5,
    currentPayment: 1950,
    refinanceRate: 5.8,
    refinanceClosingCosts: 8500,
    pcsTimeframe: 36,
    sellingCosts: 6.0,
    newLocationHousePrice: 400000,
    downPaymentPercent: 10,
    appreciationRate: 3.5,
    rentBackOption: false,
    expectedRent: 2400
  });

  const [comparison, setComparison] = useState({
    refinanceScenario: {},
    sellScenario: {},
    recommendation: '',
    financialDifference: 0,
    chartData: {}
  });

  const calculateScenarios = () => {
    // Refinance Scenario
    const refinanceLoanAmount = inputs.currentLoanBalance;
    const newMonthlyPayment = calculateMonthlyPayment(
      refinanceLoanAmount, 
      inputs.refinanceRate, 
      30 * 12 // 30 year term
    );
    
    const monthlySavings = inputs.currentPayment - newMonthlyPayment;
    const breakEvenMonths = inputs.refinanceClosingCosts / monthlySavings;
    const totalSavingsAtPCS = (inputs.pcsTimeframe - breakEvenMonths) * monthlySavings;
    
    // Future home value at PCS
    const futureHomeValue = inputs.currentHomeValue * 
      Math.pow(1 + inputs.appreciationRate / 100, inputs.pcsTimeframe / 12);
    
    // Remaining balance after refinance
    const remainingBalanceRefinance = calculateRemainingBalance(
      refinanceLoanAmount,
      inputs.refinanceRate,
      30 * 12,
      inputs.pcsTimeframe
    );
    
    const equityAtPCSRefinance = futureHomeValue - remainingBalanceRefinance;
    
    // Sell Scenario
    const sellingCostAmount = inputs.currentHomeValue * (inputs.sellingCosts / 100);
    const currentEquity = inputs.currentHomeValue - inputs.currentLoanBalance;
    const netProceedsFromSale = currentEquity - sellingCostAmount;
    
    // New home purchase
    const newHomeDownPayment = inputs.newLocationHousePrice * (inputs.downPaymentPercent / 100);
    const newHomeLoanAmount = inputs.newLocationHousePrice - newHomeDownPayment;
    const newHomePayment = calculateMonthlyPayment(newHomeLoanAmount, inputs.refinanceRate, 30 * 12);
    
    // Cash difference from sale proceeds
    const cashDifferenceFromSale = netProceedsFromSale - newHomeDownPayment;
    
    // Calculate comparison
    const refinanceNetPosition = equityAtPCSRefinance - inputs.refinanceClosingCosts + 
      (totalSavingsAtPCS > 0 ? totalSavingsAtPCS : 0);
    
    const sellNetPosition = cashDifferenceFromSale + 
      (inputs.newLocationHousePrice * Math.pow(1 + inputs.appreciationRate / 100, inputs.pcsTimeframe / 12)) - 
      calculateRemainingBalance(newHomeLoanAmount, inputs.refinanceRate, 30 * 12, inputs.pcsTimeframe);
    
    const financialDifference = refinanceNetPosition - sellNetPosition;
    
    // Generate chart data
    const months = Array.from({length: inputs.pcsTimeframe + 1}, (_, i) => i);
    const refinanceEquity = months.map(month => {
      const monthlyValue = inputs.currentHomeValue * 
        Math.pow(1 + inputs.appreciationRate / 100, month / 12);
      const monthlyBalance = calculateRemainingBalance(
        refinanceLoanAmount, inputs.refinanceRate, 30 * 12, month
      );
      return monthlyValue - monthlyBalance;
    });
    
    const sellEquity = months.map(month => {
      if (month === 0) return currentEquity;
      const newHomeValue = inputs.newLocationHousePrice * 
        Math.pow(1 + inputs.appreciationRate / 100, month / 12);
      const newHomeBalance = calculateRemainingBalance(
        newHomeLoanAmount, inputs.refinanceRate, 30 * 12, month
      );
      return (newHomeValue - newHomeBalance) + cashDifferenceFromSale;
    });

    const refinanceScenario = {
      newPayment: newMonthlyPayment,
      monthlySavings,
      breakEvenMonths,
      totalSavingsAtPCS,
      equityAtPCS: equityAtPCSRefinance,
      closingCosts: inputs.refinanceClosingCosts,
      netPosition: refinanceNetPosition
    };

    const sellScenario = {
      sellingCosts: sellingCostAmount,
      netProceeds: netProceedsFromSale,
      newHomePayment,
      cashDifference: cashDifferenceFromSale,
      newHomeDownPayment,
      netPosition: sellNetPosition
    };

    const recommendation = financialDifference > 0 ? 'Refinance' : 'Sell';

    setComparison({
      refinanceScenario,
      sellScenario,
      recommendation,
      financialDifference: Math.abs(financialDifference),
      chartData: {
        refinanceEquity,
        sellEquity,
        months
      }
    });
  };

  const calculateMonthlyPayment = (principal, annualRate, months) => {
    const monthlyRate = annualRate / 100 / 12;
    return principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / 
           (Math.pow(1 + monthlyRate, months) - 1);
  };

  const calculateRemainingBalance = (principal, annualRate, totalMonths, elapsedMonths) => {
    if (elapsedMonths === 0) return principal;
    const monthlyRate = annualRate / 100 / 12;
    const monthlyPayment = calculateMonthlyPayment(principal, annualRate, totalMonths);
    
    let balance = principal;
    for (let i = 0; i < elapsedMonths; i++) {
      const interestPayment = balance * monthlyRate;
      const principalPayment = monthlyPayment - interestPayment;
      balance -= principalPayment;
    }
    return Math.max(0, balance);
  };

  useEffect(() => {
    calculateScenarios();
  }, [inputs]);

  // Chart data for equity comparison
  const equityChartData = {
    labels: comparison.chartData.months || [],
    datasets: [
      {
        label: 'Refinance Equity',
        data: comparison.chartData.refinanceEquity || [],
        borderColor: '#3b82f6',
        backgroundColor: '#3b82f6',
        borderWidth: 3,
        fill: false
      },
      {
        label: 'Sell & Buy Equity',
        data: comparison.chartData.sellEquity || [],
        borderColor: '#ef4444',
        backgroundColor: '#ef4444',
        borderWidth: 3,
        fill: false
      }
    ]
  };

  // Bar chart for costs comparison
  const costsComparisonData = {
    labels: ['Refinance Costs', 'Selling Costs', 'New Home Down Payment'],
    datasets: [{
      label: 'Costs',
      data: [
        inputs.refinanceClosingCosts,
        comparison.sellScenario.sellingCosts || 0,
        comparison.sellScenario.newHomeDownPayment || 0
      ],
      backgroundColor: ['#3b82f6', '#ef4444', '#f59e0b'],
      borderColor: ['#2563eb', '#dc2626', '#d97706'],
      borderWidth: 2
    }]
  };

  return (
    <div className="max-w-7xl mx-auto p-4 bg-white">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          🏠↔️🏠 Refinance vs PCS Sell Tool
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Compare refinancing your current home versus selling when you PCS. 
          Make the best financial decision for your military move.
        </p>
      </div>

      {/* Input Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 p-6 bg-gray-50 rounded-lg">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Home Value
          </label>
          <input
            type="range"
            min="200000"
            max="800000"
            step="10000"
            value={inputs.currentHomeValue}
            onChange={(e) => setInputs({...inputs, currentHomeValue: parseInt(e.target.value)})}
            className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>$200K</span>
            <span className="font-medium">${inputs.currentHomeValue.toLocaleString()}</span>
            <span>$800K</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Loan Balance
          </label>
          <input
            type="range"
            min="100000"
            max="600000"
            step="5000"
            value={inputs.currentLoanBalance}
            onChange={(e) => setInputs({...inputs, currentLoanBalance: parseInt(e.target.value)})}
            className="w-full h-2 bg-red-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>$100K</span>
            <span className="font-medium">${inputs.currentLoanBalance.toLocaleString()}</span>
            <span>$600K</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Interest Rate %
          </label>
          <input
            type="range"
            min="3.0"
            max="8.0"
            step="0.1"
            value={inputs.currentInterestRate}
            onChange={(e) => setInputs({...inputs, currentInterestRate: parseFloat(e.target.value)})}
            className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>3.0%</span>
            <span className="font-medium">{inputs.currentInterestRate}%</span>
            <span>8.0%</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            New Refinance Rate %
          </label>
          <input
            type="range"
            min="3.0"
            max="7.5"
            step="0.1"
            value={inputs.refinanceRate}
            onChange={(e) => setInputs({...inputs, refinanceRate: parseFloat(e.target.value)})}
            className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>3.0%</span>
            <span className="font-medium">{inputs.refinanceRate}%</span>
            <span>7.5%</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            PCS Timeframe (Months)
          </label>
          <input
            type="range"
            min="12"
            max="72"
            step="6"
            value={inputs.pcsTimeframe}
            onChange={(e) => setInputs({...inputs, pcsTimeframe: parseInt(e.target.value)})}
            className="w-full h-2 bg-yellow-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>12mo</span>
            <span className="font-medium">{inputs.pcsTimeframe}mo</span>
            <span>72mo</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            New Location House Price
          </label>
          <input
            type="range"
            min="200000"
            max="900000"
            step="10000"
            value={inputs.newLocationHousePrice}
            onChange={(e) => setInputs({...inputs, newLocationHousePrice: parseInt(e.target.value)})}
            className="w-full h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>$200K</span>
            <span className="font-medium">${inputs.newLocationHousePrice.toLocaleString()}</span>
            <span>$900K</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Refinance Closing Costs
          </label>
          <input
            type="number"
            min="2000"
            max="15000"
            value={inputs.refinanceClosingCosts}
            onChange={(e) => setInputs({...inputs, refinanceClosingCosts: parseInt(e.target.value)})}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Selling Costs %
          </label>
          <input
            type="range"
            min="4.0"
            max="10.0"
            step="0.5"
            value={inputs.sellingCosts}
            onChange={(e) => setInputs({...inputs, sellingCosts: parseFloat(e.target.value)})}
            className="w-full h-2 bg-pink-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>4%</span>
            <span className="font-medium">{inputs.sellingCosts}%</span>
            <span>10%</span>
          </div>
        </div>
      </div>

      {/* Recommendation Banner */}
      <div className={`rounded-lg p-6 mb-8 text-center ${
        comparison.recommendation === 'Refinance' 
          ? 'bg-green-50 border-green-200 border' 
          : 'bg-red-50 border-red-200 border'
      }`}>
        <h2 className={`text-2xl font-bold mb-2 ${
          comparison.recommendation === 'Refinance' ? 'text-green-700' : 'text-red-700'
        }`}>
          🎯 Recommendation: {comparison.recommendation}
        </h2>
        <p className={`text-lg ${
          comparison.recommendation === 'Refinance' ? 'text-green-600' : 'text-red-600'
        }`}>
          Based on your PCS timeline, {comparison.recommendation.toLowerCase()}ing 
          could save you approximately <strong>${Math.round(comparison.financialDifference).toLocaleString()}</strong>
        </p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              ${Math.round(comparison.refinanceScenario.monthlySavings || 0).toLocaleString()}
            </div>
            <div className="text-sm text-blue-700">Monthly Savings (Refinance)</div>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {Math.round(comparison.refinanceScenario.breakEvenMonths || 0)}
            </div>
            <div className="text-sm text-purple-700">Break-Even (Months)</div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600 mb-1">
              ${Math.round(comparison.sellScenario.netProceeds || 0).toLocaleString()}
            </div>
            <div className="text-sm text-yellow-700">Net Proceeds (Sell)</div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              ${Math.round((inputs.currentHomeValue - inputs.currentLoanBalance)).toLocaleString()}
            </div>
            <div className="text-sm text-green-700">Current Equity</div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Equity Growth Comparison */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
            Equity Growth Comparison
          </h3>
          <div className="h-80">
            <Line data={equityChartData} options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'bottom',
                },
                tooltip: {
                  callbacks: {
                    label: function(context) {
                      return context.dataset.label + ': $' + Math.round(context.parsed.y).toLocaleString();
                    }
                  }
                }
              },
              scales: {
                y: {
                  beginAtZero: false,
                  ticks: {
                    callback: function(value) {
                      return '$' + (value/1000).toFixed(0) + 'K';
                    }
                  }
                },
                x: {
                  title: {
                    display: true,
                    text: 'Months'
                  }
                }
              }
            }} />
          </div>
        </div>

        {/* Costs Comparison */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
            Upfront Costs Comparison
          </h3>
          <div className="h-80">
            <Bar data={costsComparisonData} options={{
              responsive: true,
              plugins: {
                legend: {
                  display: false,
                },
                tooltip: {
                  callbacks: {
                    label: function(context) {
                      return '$' + context.parsed.y.toLocaleString();
                    }
                  }
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: function(value) {
                      return '$' + (value/1000).toFixed(0) + 'K';
                    }
                  }
                }
              }
            }} />
          </div>
        </div>
      </div>

      {/* Detailed Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Refinance Scenario */}
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <h3 className="text-xl font-bold text-blue-800 mb-4">🏠 Refinance Scenario</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-blue-700">New Monthly Payment:</span>
              <span className="font-semibold text-blue-800">
                ${Math.round(comparison.refinanceScenario.newPayment || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Monthly Savings:</span>
              <span className="font-semibold text-green-600">
                ${Math.round(comparison.refinanceScenario.monthlySavings || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Closing Costs:</span>
              <span className="font-semibold text-blue-800">
                ${inputs.refinanceClosingCosts.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Break-Even Time:</span>
              <span className="font-semibold text-blue-800">
                {Math.round(comparison.refinanceScenario.breakEvenMonths || 0)} months
              </span>
            </div>
            <div className="flex justify-between border-t pt-2 font-bold">
              <span className="text-blue-700">Equity at PCS:</span>
              <span className="text-blue-800">
                ${Math.round(comparison.refinanceScenario.equityAtPCS || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Sell Scenario */}
        <div className="bg-red-50 rounded-xl p-6 border border-red-200">
          <h3 className="text-xl font-bold text-red-800 mb-4">🏠➡️💰 Sell Scenario</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-red-700">Selling Costs ({inputs.sellingCosts}%):</span>
              <span className="font-semibold text-red-800">
                ${Math.round(comparison.sellScenario.sellingCosts || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-red-700">Net Sale Proceeds:</span>
              <span className="font-semibold text-green-600">
                ${Math.round(comparison.sellScenario.netProceeds || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-red-700">New Home Down Payment:</span>
              <span className="font-semibold text-red-800">
                ${Math.round(comparison.sellScenario.newHomeDownPayment || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-red-700">New Home Payment:</span>
              <span className="font-semibold text-red-800">
                ${Math.round(comparison.sellScenario.newHomePayment || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between border-t pt-2 font-bold">
              <span className="text-red-700">Cash Difference:</span>
              <span className={`${comparison.sellScenario.cashDifference >= 0 ? 'text-green-600' : 'text-red-800'}`}>
                ${Math.round(comparison.sellScenario.cashDifference || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Analysis Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          📊 PCS Financial Analysis
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="text-lg font-semibold text-blue-600 mb-2">Time to Break-Even</div>
            <div className="text-2xl font-bold text-gray-800 mb-1">
              {Math.round(comparison.refinanceScenario.breakEvenMonths || 0)} months
            </div>
            <div className="text-sm text-gray-600">
              {comparison.refinanceScenario.breakEvenMonths <= inputs.pcsTimeframe 
                ? '✅ Will break even before PCS' 
                : '❌ Won\'t break even before PCS'}
            </div>
          </div>
          <div>
            <div className="text-lg font-semibold text-purple-600 mb-2">Net Position Difference</div>
            <div className="text-2xl font-bold text-gray-800 mb-1">
              ${Math.round(comparison.financialDifference).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">
              Advantage: {comparison.recommendation}
            </div>
          </div>
          <div>
            <div className="text-lg font-semibold text-green-600 mb-2">Liquidity Impact</div>
            <div className="text-2xl font-bold text-gray-800 mb-1">
              ${Math.round(Math.abs(comparison.sellScenario.cashDifference || 0)).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">
              {comparison.sellScenario.cashDifference >= 0 ? 'Extra cash from sale' : 'Additional cash needed'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RefinanceVsPCSSellTool;