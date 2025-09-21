import React, { useState, useEffect } from 'react';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
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
  ArcElement,
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
  Legend,
  ArcElement
);

function DepreciationRecaptureEstimator() {
  const depreciationDefaults = nationalAverages.phase3Data?.depreciation || {};
  const rentalDefaults = depreciationDefaults.residentialRental || {};
  
  const [inputs, setInputs] = useState({
    originalPurchasePrice: 350000,
    currentValue: 485000,
    yearsPurchased: 8,
    yearsTurnedRental: 5,
    majorImprovements: 45000,
    appliances: 8000,
    carpeting: 3500,
    hvacSystem: 12000,
    sellingCosts: 29000,
    taxBracket: 24,
    stateIncomeRate: 6.5,
    capitalGainsRate: 15,
    anticipatedAppreciation: 3.5,
    annualRentalIncome: 2400
  });

  const [analysis, setAnalysis] = useState({
    totalDepreciation: 0,
    recaptureAmount: 0,
    recaptureTax: 0,
    capitalGain: 0,
    capitalGainsTax: 0,
    totalTaxLiability: 0,
    netProceeds: 0,
    recommendations: [],
    holdVsSellAnalysis: {},
    depreciationBreakdown: {}
  });

  const calculateDepreciation = () => {
    const depreciationPeriod = rentalDefaults.depreciationPeriod || 27.5;
    const recaptureRate = rentalDefaults.recaptureRate || 25;
    
    // Calculate depreciable basis
    const buildingValue = inputs.originalPurchasePrice * 0.8; // Assume 80% building, 20% land
    const depreciableBasis = buildingValue + inputs.majorImprovements + inputs.hvacSystem;
    
    // Calculate annual depreciation
    const annualBuildingDepreciation = depreciableBasis / depreciationPeriod;
    const applianceDepreciation = inputs.appliances / 5; // 5-year depreciation
    const carpetDepreciation = inputs.carpeting / 5; // 5-year depreciation
    
    // Total depreciation taken
    const yearsOfRental = inputs.yearsTurnedRental;
    const totalBuildingDepreciation = annualBuildingDepreciation * yearsOfRental;
    const totalApplianceDepreciation = Math.min(inputs.appliances, applianceDepreciation * yearsOfRental);
    const totalCarpetDepreciation = Math.min(inputs.carpeting, carpetDepreciation * yearsOfRental);
    
    const totalDepreciation = totalBuildingDepreciation + totalApplianceDepreciation + totalCarpetDepreciation;
    
    // Calculate gain/loss on sale
    const adjustedBasis = inputs.originalPurchasePrice + inputs.majorImprovements + 
                         inputs.appliances + inputs.carpeting + inputs.hvacSystem - totalDepreciation;
    const netSalePrice = inputs.currentValue - inputs.sellingCosts;
    const totalGainOnSale = Math.max(0, netSalePrice - adjustedBasis);
    
    // Depreciation recapture (taxed at 25%)
    const recaptureAmount = Math.min(totalDepreciation, totalGainOnSale);
    const recaptureTax = recaptureAmount * (recaptureRate / 100);
    
    // Capital gains (remaining gain after recapture)
    const capitalGain = Math.max(0, totalGainOnSale - recaptureAmount);
    const capitalGainsTax = capitalGain * (inputs.capitalGainsRate / 100);
    
    // State taxes
    const stateTaxOnRecapture = recaptureAmount * (inputs.stateIncomeRate / 100);
    const stateTaxOnGains = capitalGain * (inputs.stateIncomeRate / 100);
    
    const totalTaxLiability = recaptureTax + capitalGainsTax + stateTaxOnRecapture + stateTaxOnGains;
    const netProceeds = netSalePrice - totalTaxLiability;
    
    // Hold vs Sell Analysis - project forward 5 years
    const holdVsSellAnalysis = {};
    for (let year = 1; year <= 5; year++) {
      const futureValue = inputs.currentValue * Math.pow(1 + inputs.anticipatedAppreciation / 100, year);
      const futureRentalIncome = inputs.annualRentalIncome * 12 * year;
      const futureTotalDepreciation = totalDepreciation + (annualBuildingDepreciation * year);
      
      const futureAdjustedBasis = inputs.originalPurchasePrice + inputs.majorImprovements + 
                                 inputs.appliances + inputs.carpeting + inputs.hvacSystem - futureTotalDepreciation;
      const futureNetSalePrice = futureValue - inputs.sellingCosts;
      const futureTotalGain = Math.max(0, futureNetSalePrice - futureAdjustedBasis);
      
      const futureRecapture = Math.min(futureTotalDepreciation, futureTotalGain);
      const futureCapitalGain = Math.max(0, futureTotalGain - futureRecapture);
      
      const futureTaxLiability = (futureRecapture * (recaptureRate / 100)) + 
                               (futureCapitalGain * (inputs.capitalGainsRate / 100)) +
                               (futureRecapture * (inputs.stateIncomeRate / 100)) +
                               (futureCapitalGain * (inputs.stateIncomeRate / 100));
      
      const futureNetProceeds = futureNetSalePrice - futureTaxLiability;
      
      holdVsSellAnalysis[year] = {
        value: futureValue,
        totalGain: futureTotalGain,
        recapture: futureRecapture,
        capitalGain: futureCapitalGain,
        taxLiability: futureTaxLiability,
        netProceeds: futureNetProceeds,
        cumulativeRentalIncome: futureRentalIncome,
        totalReturn: futureNetProceeds + futureRentalIncome
      };
    }
    
    // Depreciation breakdown
    const depreciationBreakdown = {
      building: totalBuildingDepreciation,
      appliances: totalApplianceDepreciation,
      carpeting: totalCarpetDepreciation,
      hvac: 0 // HVAC is part of building depreciation
    };
    
    // Generate recommendations
    const recommendations = [];
    
    if (recaptureAmount > 50000) {
      recommendations.push('High depreciation recapture - consider installment sale to spread tax burden');
    }
    
    if (totalTaxLiability > netSalePrice * 0.25) {
      recommendations.push('Tax liability exceeds 25% of sale price - review timing strategy');
    }
    
    const bestYear = Object.entries(holdVsSellAnalysis).reduce((best, [year, data]) => {
      return data.totalReturn > (holdVsSellAnalysis[best] || {totalReturn: 0}).totalReturn ? year : best;
    }, '1');
    
    if (parseInt(bestYear) > 1) {
      recommendations.push(`Consider holding for ${bestYear} more year(s) to optimize total return`);
    }
    
    if (yearsOfRental >= 2) {
      recommendations.push('Property qualifies for Section 1031 like-kind exchange consideration');
    }
    
    if (inputs.yearsPurchased >= 5 && totalGainOnSale > 0) {
      recommendations.push('Consider converting back to primary residence for capital gains exclusion');
    }

    setAnalysis({
      totalDepreciation,
      recaptureAmount,
      recaptureTax: recaptureTax + stateTaxOnRecapture,
      capitalGain,
      capitalGainsTax: capitalGainsTax + stateTaxOnGains,
      totalTaxLiability,
      netProceeds,
      recommendations,
      holdVsSellAnalysis,
      depreciationBreakdown
    });
  };

  useEffect(() => {
    calculateDepreciation();
  }, [inputs]);

  // Tax breakdown pie chart
  const taxBreakdownData = {
    labels: ['Depreciation Recapture Tax', 'Capital Gains Tax', 'Net Proceeds'],
    datasets: [{
      data: [
        analysis.recaptureTax,
        analysis.capitalGainsTax,
        analysis.netProceeds
      ],
      backgroundColor: ['#ef4444', '#f97316', '#22c55e'],
      borderWidth: 2,
      borderColor: '#ffffff'
    }]
  };

  // Hold vs Sell comparison
  const holdVsSellData = {
    labels: Object.keys(analysis.holdVsSellAnalysis || {}).map(year => `Year ${year}`),
    datasets: [
      {
        label: 'Net Sale Proceeds',
        data: Object.values(analysis.holdVsSellAnalysis || {}).map(item => item.netProceeds),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2
      },
      {
        label: 'Total Return (with Rental Income)',
        data: Object.values(analysis.holdVsSellAnalysis || {}).map(item => item.totalReturn),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 2
      }
    ]
  };

  // Depreciation timeline
  const depreciationTimelineData = {
    labels: Object.keys(analysis.holdVsSellAnalysis || {}).map(year => `Year ${year}`),
    datasets: [{
      label: 'Cumulative Recapture Tax',
      data: Object.values(analysis.holdVsSellAnalysis || {}).map(item => 
        item.recapture * 0.25 + item.recapture * (inputs.stateIncomeRate / 100)
      ),
      borderColor: 'rgb(239, 68, 68)',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      borderWidth: 3,
      fill: true
    }]
  };

  return (
    <div className="max-w-7xl mx-auto p-4 bg-white">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          🏠📉 Depreciation Recapture Estimator
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Calculate depreciation recapture taxes on rental property sales. 
          Optimize timing and strategy for military real estate investors.
        </p>
      </div>

      {/* Input Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 p-6 bg-gray-50 rounded-lg">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Original Purchase Price
          </label>
          <input
            type="range"
            min="200000"
            max="800000"
            step="10000"
            value={inputs.originalPurchasePrice}
            onChange={(e) => setInputs({...inputs, originalPurchasePrice: parseInt(e.target.value)})}
            className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>$200K</span>
            <span className="font-medium">${inputs.originalPurchasePrice.toLocaleString()}</span>
            <span>$800K</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Market Value
          </label>
          <input
            type="range"
            min="250000"
            max="1000000"
            step="10000"
            value={inputs.currentValue}
            onChange={(e) => setInputs({...inputs, currentValue: parseInt(e.target.value)})}
            className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>$250K</span>
            <span className="font-medium">${inputs.currentValue.toLocaleString()}</span>
            <span>$1M</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Years as Rental Property
          </label>
          <input
            type="range"
            min="1"
            max="15"
            step="1"
            value={inputs.yearsTurnedRental}
            onChange={(e) => setInputs({...inputs, yearsTurnedRental: parseInt(e.target.value)})}
            className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>1yr</span>
            <span className="font-medium">{inputs.yearsTurnedRental}yr</span>
            <span>15yr</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tax Bracket %
          </label>
          <select
            value={inputs.taxBracket}
            onChange={(e) => setInputs({...inputs, taxBracket: parseInt(e.target.value)})}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="10">10%</option>
            <option value="12">12%</option>
            <option value="22">22%</option>
            <option value="24">24%</option>
            <option value="32">32%</option>
            <option value="35">35%</option>
            <option value="37">37%</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Major Improvements
          </label>
          <input
            type="number"
            min="0"
            max="100000"
            value={inputs.majorImprovements}
            onChange={(e) => setInputs({...inputs, majorImprovements: parseInt(e.target.value)})}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Appliances
          </label>
          <input
            type="number"
            min="0"
            max="25000"
            value={inputs.appliances}
            onChange={(e) => setInputs({...inputs, appliances: parseInt(e.target.value)})}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            HVAC System
          </label>
          <input
            type="number"
            min="0"
            max="30000"
            value={inputs.hvacSystem}
            onChange={(e) => setInputs({...inputs, hvacSystem: parseInt(e.target.value)})}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Monthly Rental Income
          </label>
          <input
            type="number"
            min="1000"
            max="5000"
            value={inputs.annualRentalIncome}
            onChange={(e) => setInputs({...inputs, annualRentalIncome: parseInt(e.target.value)})}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            State Income Tax Rate %
          </label>
          <input
            type="range"
            min="0"
            max="13"
            step="0.5"
            value={inputs.stateIncomeRate}
            onChange={(e) => setInputs({...inputs, stateIncomeRate: parseFloat(e.target.value)})}
            className="w-full h-2 bg-yellow-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>0%</span>
            <span className="font-medium">{inputs.stateIncomeRate}%</span>
            <span>13%</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Capital Gains Rate %
          </label>
          <select
            value={inputs.capitalGainsRate}
            onChange={(e) => setInputs({...inputs, capitalGainsRate: parseInt(e.target.value)})}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="0">0%</option>
            <option value="15">15%</option>
            <option value="20">20%</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Selling Costs
          </label>
          <input
            type="number"
            min="10000"
            max="75000"
            value={inputs.sellingCosts}
            onChange={(e) => setInputs({...inputs, sellingCosts: parseInt(e.target.value)})}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Expected Appreciation %
          </label>
          <input
            type="range"
            min="2"
            max="8"
            step="0.5"
            value={inputs.anticipatedAppreciation}
            onChange={(e) => setInputs({...inputs, anticipatedAppreciation: parseFloat(e.target.value)})}
            className="w-full h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>2%</span>
            <span className="font-medium">{inputs.anticipatedAppreciation}%</span>
            <span>8%</span>
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              ${analysis.totalDepreciation.toLocaleString()}
            </div>
            <div className="text-sm text-blue-700">Total Depreciation Taken</div>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600 mb-1">
              ${Math.round(analysis.recaptureTax).toLocaleString()}
            </div>
            <div className="text-sm text-red-700">Recapture Tax</div>
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 mb-1">
              ${Math.round(analysis.capitalGainsTax).toLocaleString()}
            </div>
            <div className="text-sm text-orange-700">Capital Gains Tax</div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              ${Math.round(analysis.netProceeds).toLocaleString()}
            </div>
            <div className="text-sm text-green-700">Net Proceeds</div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Tax Breakdown */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
            Sale Proceeds Breakdown
          </h3>
          <div className="h-80">
            <Doughnut data={taxBreakdownData} options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'bottom',
                },
                tooltip: {
                  callbacks: {
                    label: function(context) {
                      const label = context.label || '';
                      const value = context.parsed;
                      const total = context.dataset.data.reduce((a, b) => a + b, 0);
                      const percentage = ((value / total) * 100).toFixed(1);
                      return `${label}: $${Math.round(value).toLocaleString()} (${percentage}%)`;
                    }
                  }
                }
              }
            }} />
          </div>
        </div>

        {/* Hold vs Sell Analysis */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
            Hold vs Sell Analysis
          </h3>
          <div className="h-80">
            <Bar data={holdVsSellData} options={{
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

      {/* Depreciation Timeline */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 mb-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
          Recapture Tax Growth Timeline
        </h3>
        <div className="h-80">
          <Line data={depreciationTimelineData} options={{
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

      {/* Detailed Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Depreciation Breakdown */}
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <h3 className="text-xl font-bold text-blue-800 mb-4">📊 Depreciation Breakdown</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-blue-700">Building/Structure:</span>
              <span className="font-semibold text-blue-800">
                ${Math.round(analysis.depreciationBreakdown.building || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Appliances (5-year):</span>
              <span className="font-semibold text-blue-800">
                ${Math.round(analysis.depreciationBreakdown.appliances || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Carpeting (5-year):</span>
              <span className="font-semibold text-blue-800">
                ${Math.round(analysis.depreciationBreakdown.carpeting || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between border-t pt-2 font-bold">
              <span className="text-blue-700">Total Depreciation:</span>
              <span className="text-blue-800">
                ${Math.round(analysis.totalDepreciation).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Tax Impact Summary */}
        <div className="bg-red-50 rounded-xl p-6 border border-red-200">
          <h3 className="text-xl font-bold text-red-800 mb-4">💰 Tax Impact Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-red-700">Recapture Amount:</span>
              <span className="font-semibold text-red-800">
                ${Math.round(analysis.recaptureAmount).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-red-700">Federal Recapture Tax (25%):</span>
              <span className="font-semibold text-red-800">
                ${Math.round(analysis.recaptureAmount * 0.25).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-red-700">State Tax:</span>
              <span className="font-semibold text-red-800">
                ${Math.round((analysis.recaptureAmount + analysis.capitalGain) * (inputs.stateIncomeRate / 100)).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-red-700">Capital Gains Tax:</span>
              <span className="font-semibold text-red-800">
                ${Math.round(analysis.capitalGain * (inputs.capitalGainsRate / 100)).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between border-t pt-2 font-bold">
              <span className="text-red-700">Total Tax Liability:</span>
              <span className="text-red-800">
                ${Math.round(analysis.totalTaxLiability).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {analysis.recommendations.length > 0 && (
        <div className="bg-purple-50 rounded-xl p-6 border border-purple-200 mb-8">
          <h3 className="text-xl font-bold text-purple-800 mb-4">💡 Strategic Recommendations</h3>
          <div className="space-y-3">
            {analysis.recommendations.map((rec, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="text-purple-600 text-lg">•</div>
                <div className="text-purple-700">{rec}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          📈 Depreciation Recapture Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="text-lg font-semibold text-blue-600 mb-2">Effective Tax Rate</div>
            <div className="text-2xl font-bold text-gray-800 mb-1">
              {(((analysis.totalTaxLiability / Math.max(inputs.currentValue - inputs.sellingCosts, 1)) * 100).toFixed(1))}%
            </div>
            <div className="text-sm text-gray-600">
              Of gross sale proceeds
            </div>
          </div>
          <div>
            <div className="text-lg font-semibold text-purple-600 mb-2">Break-Even Point</div>
            <div className="text-2xl font-bold text-gray-800 mb-1">
              ${Math.round(inputs.originalPurchasePrice + analysis.totalDepreciation + inputs.sellingCosts).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">
              Minimum sale price to avoid loss
            </div>
          </div>
          <div>
            <div className="text-lg font-semibold text-green-600 mb-2">Annual Tax Impact</div>
            <div className="text-2xl font-bold text-gray-800 mb-1">
              ${Math.round(analysis.totalTaxLiability / Math.max(inputs.yearsTurnedRental, 1)).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">
              Average tax per year of ownership
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DepreciationRecaptureEstimator;