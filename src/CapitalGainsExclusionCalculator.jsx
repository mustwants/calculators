import React, { useState, useEffect } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
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
  Filler,
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
  ArcElement,
  Filler
);

function CapitalGainsExclusionCalculator() {
  const capitalGainsDefaults = nationalAverages.phase3Data?.capitalGains || {};
  const exclusionLimits = capitalGainsDefaults.primaryResidenceExclusion || {};
  
  const [inputs, setInputs] = useState({
    purchasePrice: 300000,
    currentValue: 450000,
    ownershipMonths: 30,
    residencyMonths: 24,
    filingStatus: 'marriedFilingJointly',
    improvementCosts: 25000,
    sellingCosts: 27000,
    pcsExtensions: 0,
    maxPcsExtensions: 2,
    anticipatedAppreciation: 3.5,
    timeToSale: 12,
    isPrimaryResidence: true,
    hasPcsOrders: true
  });

  const [analysis, setAnalysis] = useState({
    totalGain: 0,
    excludedGain: 0,
    taxableGain: 0,
    qualificationStatus: '',
    potentialTaxSavings: 0,
    timelineAnalysis: {},
    futureValue: 0,
    recommendations: []
  });

  const calculateCapitalGains = () => {
    // Calculate current gain
    const netSalePrice = inputs.currentValue - inputs.sellingCosts;
    const adjustedBasis = inputs.purchasePrice + inputs.improvementCosts;
    const totalGain = Math.max(0, netSalePrice - adjustedBasis);
    
    // Determine exclusion limits based on filing status
    const exclusionLimit = inputs.filingStatus === 'marriedFilingJointly' 
      ? exclusionLimits.marriedFilingJointly || 500000
      : exclusionLimits.single || 250000;
    
    // Check qualification criteria
    const ownershipQualified = inputs.ownershipMonths >= (exclusionLimits.ownershipRequirement || 24);
    const useTestQualified = inputs.residencyMonths >= (exclusionLimits.useTest || 24);
    const pcsExtensionMonths = inputs.pcsExtensions * (exclusionLimits.pcsExtension || 60);
    const totalAllowedTime = (exclusionLimits.useTest || 24) + pcsExtensionMonths;
    const pcsQualified = inputs.hasPcsOrders && inputs.residencyMonths <= totalAllowedTime;
    
    let qualificationStatus = 'Not Qualified';
    if (ownershipQualified && (useTestQualified || pcsQualified)) {
      qualificationStatus = 'Fully Qualified';
    } else if (ownershipQualified && inputs.hasPcsOrders) {
      qualificationStatus = 'PCS Extension Available';
    } else if (ownershipQualified) {
      qualificationStatus = 'Ownership Qualified Only';
    }
    
    // Calculate excluded vs taxable gain
    let excludedGain = 0;
    if (qualificationStatus === 'Fully Qualified') {
      excludedGain = Math.min(totalGain, exclusionLimit);
    } else if (qualificationStatus === 'PCS Extension Available') {
      // Partial exclusion based on time lived in home
      const partialQualification = inputs.residencyMonths / (exclusionLimits.useTest || 24);
      excludedGain = Math.min(totalGain, exclusionLimit * partialQualification);
    }
    
    const taxableGain = Math.max(0, totalGain - excludedGain);
    
    // Estimate tax savings (using 15% long-term capital gains rate)
    const estimatedTaxRate = 0.15;
    const potentialTaxSavings = excludedGain * estimatedTaxRate;
    
    // Future value calculation
    const futureValue = inputs.currentValue * 
      Math.pow(1 + inputs.anticipatedAppreciation / 100, inputs.timeToSale / 12);
    
    // Generate timeline analysis for next 5 years
    const timelineAnalysis = {};
    for (let months = 0; months <= 60; months += 6) {
      const futureVal = inputs.currentValue * 
        Math.pow(1 + inputs.anticipatedAppreciation / 100, months / 12);
      const futureGain = Math.max(0, futureVal - inputs.sellingCosts - adjustedBasis);
      const futureOwnership = inputs.ownershipMonths + months;
      const futureResidency = Math.min(inputs.residencyMonths + months, 
        totalAllowedTime);
      
      const futureOwnershipQualified = futureOwnership >= (exclusionLimits.ownershipRequirement || 24);
      const futureUseQualified = futureResidency >= (exclusionLimits.useTest || 24);
      const futurePcsQualified = inputs.hasPcsOrders && futureResidency <= totalAllowedTime;
      
      let futureExcluded = 0;
      if (futureOwnershipQualified && (futureUseQualified || futurePcsQualified)) {
        futureExcluded = Math.min(futureGain, exclusionLimit);
      } else if (futureOwnershipQualified && inputs.hasPcsOrders) {
        const partialQual = futureResidency / (exclusionLimits.useTest || 24);
        futureExcluded = Math.min(futureGain, exclusionLimit * partialQual);
      }
      
      const futureTaxable = Math.max(0, futureGain - futureExcluded);
      
      timelineAnalysis[months] = {
        value: futureVal,
        gain: futureGain,
        excluded: futureExcluded,
        taxable: futureTaxable,
        taxSavings: futureExcluded * estimatedTaxRate
      };
    }
    
    // Generate recommendations
    const recommendations = [];
    if (qualificationStatus === 'Not Qualified') {
      const monthsToQualify = Math.max(0, (exclusionLimits.ownershipRequirement || 24) - inputs.ownershipMonths);
      if (monthsToQualify > 0) {
        recommendations.push(`Wait ${monthsToQualify} more months to meet ownership requirement`);
      }
      const residencyNeeded = Math.max(0, (exclusionLimits.useTest || 24) - inputs.residencyMonths);
      if (residencyNeeded > 0 && !inputs.hasPcsOrders) {
        recommendations.push(`Need ${residencyNeeded} more months of primary residence use`);
      }
    }
    
    if (inputs.hasPcsOrders && inputs.pcsExtensions < inputs.maxPcsExtensions) {
      recommendations.push(`You can extend the use test by ${inputs.maxPcsExtensions - inputs.pcsExtensions} more PCS moves`);
    }
    
    if (taxableGain > 0) {
      recommendations.push('Consider timing sale to optimize tax implications');
    }
    
    if (excludedGain === exclusionLimit && totalGain > exclusionLimit) {
      recommendations.push(`Consider selling now to maximize $${exclusionLimit.toLocaleString()} exclusion`);
    }

    setAnalysis({
      totalGain,
      excludedGain,
      taxableGain,
      qualificationStatus,
      potentialTaxSavings,
      timelineAnalysis,
      futureValue,
      recommendations
    });
  };

  useEffect(() => {
    calculateCapitalGains();
  }, [inputs]);

  // Area chart data for gain timeline
  const timelineChartData = {
    labels: Object.keys(analysis.timelineAnalysis || {}).map(months => 
      months === '0' ? 'Today' : `${months}mo`
    ),
    datasets: [
      {
        label: 'Excluded Gain',
        data: Object.values(analysis.timelineAnalysis || {}).map(item => item.excluded),
        backgroundColor: 'rgba(34, 197, 94, 0.3)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 2,
        fill: true
      },
      {
        label: 'Taxable Gain',
        data: Object.values(analysis.timelineAnalysis || {}).map(item => item.taxable),
        backgroundColor: 'rgba(239, 68, 68, 0.3)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 2,
        fill: true
      }
    ]
  };

  // Tax savings over time
  const taxSavingsChartData = {
    labels: Object.keys(analysis.timelineAnalysis || {}).map(months => 
      months === '0' ? 'Today' : `${months}mo`
    ),
    datasets: [{
      label: 'Tax Savings',
      data: Object.values(analysis.timelineAnalysis || {}).map(item => item.taxSavings),
      backgroundColor: 'rgba(59, 130, 246, 0.8)',
      borderColor: 'rgb(59, 130, 246)',
      borderWidth: 2
    }]
  };

  // Current gain breakdown pie chart
  const gainBreakdownData = {
    labels: ['Excluded Gain', 'Taxable Gain'],
    datasets: [{
      data: [analysis.excludedGain, analysis.taxableGain],
      backgroundColor: ['#22c55e', '#ef4444'],
      borderWidth: 2,
      borderColor: '#ffffff'
    }]
  };

  const getQualificationColor = (status) => {
    switch(status) {
      case 'Fully Qualified': return 'text-green-600 bg-green-50 border-green-200';
      case 'PCS Extension Available': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'Ownership Qualified Only': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Not Qualified': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 bg-white">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          🏠💰 Capital Gains Exclusion Calculator
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Analyze your primary residence capital gains exclusion eligibility, 
          including special PCS extensions for military families.
        </p>
      </div>

      {/* Input Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 p-6 bg-gray-50 rounded-lg">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Purchase Price
          </label>
          <input
            type="range"
            min="150000"
            max="800000"
            step="10000"
            value={inputs.purchasePrice}
            onChange={(e) => setInputs({...inputs, purchasePrice: parseInt(e.target.value)})}
            className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>$150K</span>
            <span className="font-medium">${inputs.purchasePrice.toLocaleString()}</span>
            <span>$800K</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Value
          </label>
          <input
            type="range"
            min="200000"
            max="1200000"
            step="10000"
            value={inputs.currentValue}
            onChange={(e) => setInputs({...inputs, currentValue: parseInt(e.target.value)})}
            className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>$200K</span>
            <span className="font-medium">${inputs.currentValue.toLocaleString()}</span>
            <span>$1.2M</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ownership (Months)
          </label>
          <input
            type="range"
            min="6"
            max="120"
            step="3"
            value={inputs.ownershipMonths}
            onChange={(e) => setInputs({...inputs, ownershipMonths: parseInt(e.target.value)})}
            className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>6mo</span>
            <span className="font-medium">{inputs.ownershipMonths}mo</span>
            <span>120mo</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Residency (Months)
          </label>
          <input
            type="range"
            min="0"
            max="60"
            step="3"
            value={inputs.residencyMonths}
            onChange={(e) => setInputs({...inputs, residencyMonths: parseInt(e.target.value)})}
            className="w-full h-2 bg-yellow-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>0mo</span>
            <span className="font-medium">{inputs.residencyMonths}mo</span>
            <span>60mo</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filing Status
          </label>
          <select
            value={inputs.filingStatus}
            onChange={(e) => setInputs({...inputs, filingStatus: e.target.value})}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="single">Single</option>
            <option value="marriedFilingJointly">Married Filing Jointly</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Improvement Costs
          </label>
          <input
            type="number"
            min="0"
            max="100000"
            value={inputs.improvementCosts}
            onChange={(e) => setInputs({...inputs, improvementCosts: parseInt(e.target.value)})}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Selling Costs
          </label>
          <input
            type="number"
            min="5000"
            max="75000"
            value={inputs.sellingCosts}
            onChange={(e) => setInputs({...inputs, sellingCosts: parseInt(e.target.value)})}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            PCS Extensions Used
          </label>
          <input
            type="range"
            min="0"
            max="5"
            step="1"
            value={inputs.pcsExtensions}
            onChange={(e) => setInputs({...inputs, pcsExtensions: parseInt(e.target.value)})}
            className="w-full h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>0</span>
            <span className="font-medium">{inputs.pcsExtensions}</span>
            <span>5</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPrimaryResidence"
              checked={inputs.isPrimaryResidence}
              onChange={(e) => setInputs({...inputs, isPrimaryResidence: e.target.checked})}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isPrimaryResidence" className="ml-2 text-sm font-medium text-gray-700">
              Primary Residence
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="hasPcsOrders"
              checked={inputs.hasPcsOrders}
              onChange={(e) => setInputs({...inputs, hasPcsOrders: e.target.checked})}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="hasPcsOrders" className="ml-2 text-sm font-medium text-gray-700">
              PCS Orders
            </label>
          </div>
        </div>
      </div>

      {/* Qualification Status Banner */}
      <div className={`rounded-lg p-6 mb-8 text-center border ${getQualificationColor(analysis.qualificationStatus)}`}>
        <h2 className="text-2xl font-bold mb-2">
          📋 Status: {analysis.qualificationStatus}
        </h2>
        <p className="text-lg">
          {analysis.qualificationStatus === 'Fully Qualified' && 
            `You qualify for the full $${(inputs.filingStatus === 'marriedFilingJointly' ? 500000 : 250000).toLocaleString()} exclusion`}
          {analysis.qualificationStatus === 'PCS Extension Available' && 
            'You may qualify for partial exclusion with PCS extensions'}
          {analysis.qualificationStatus === 'Ownership Qualified Only' && 
            'You meet ownership requirements but need more residency time'}
          {analysis.qualificationStatus === 'Not Qualified' && 
            'You do not currently meet qualification requirements'}
        </p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              ${analysis.totalGain.toLocaleString()}
            </div>
            <div className="text-sm text-blue-700">Total Capital Gain</div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              ${analysis.excludedGain.toLocaleString()}
            </div>
            <div className="text-sm text-green-700">Excluded Gain</div>
          </div>
        </div>

        <div className={`border rounded-lg p-4 ${analysis.taxableGain > 0 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
          <div className="text-center">
            <div className={`text-2xl font-bold mb-1 ${analysis.taxableGain > 0 ? 'text-red-600' : 'text-gray-600'}`}>
              ${analysis.taxableGain.toLocaleString()}
            </div>
            <div className={`text-sm ${analysis.taxableGain > 0 ? 'text-red-700' : 'text-gray-700'}`}>Taxable Gain</div>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              ${Math.round(analysis.potentialTaxSavings).toLocaleString()}
            </div>
            <div className="text-sm text-purple-700">Estimated Tax Savings</div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Gain Timeline Area Chart */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
            Capital Gains Timeline
          </h3>
          <div className="h-80">
            <Line data={timelineChartData} options={{
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
                  stacked: true,
                  ticks: {
                    callback: function(value) {
                      return '$' + (value/1000).toFixed(0) + 'K';
                    }
                  }
                },
                x: {
                  title: {
                    display: true,
                    text: 'Time Until Sale'
                  }
                }
              }
            }} />
          </div>
        </div>

        {/* Tax Savings Over Time */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
            Tax Savings Timeline
          </h3>
          <div className="h-80">
            <Bar data={taxSavingsChartData} options={{
              responsive: true,
              plugins: {
                legend: {
                  display: false,
                },
                tooltip: {
                  callbacks: {
                    label: function(context) {
                      return 'Tax Savings: $' + Math.round(context.parsed.y).toLocaleString();
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

      {/* Current Gain Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
            Current Gain Breakdown
          </h3>
          <div className="h-80">
            <Doughnut data={gainBreakdownData} options={{
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
                      const percentage = ((value / analysis.totalGain) * 100).toFixed(1);
                      return `${label}: $${value.toLocaleString()} (${percentage}%)`;
                    }
                  }
                }
              }
            }} />
          </div>
        </div>

        {/* Qualification Requirements */}
        <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
          <h3 className="text-xl font-bold text-yellow-800 mb-4">📋 Qualification Requirements</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-yellow-700">Ownership Test (24 months):</span>
              <span className={`font-semibold ${inputs.ownershipMonths >= 24 ? 'text-green-600' : 'text-red-600'}`}>
                {inputs.ownershipMonths >= 24 ? '✅ Met' : '❌ Need ' + (24 - inputs.ownershipMonths) + 'mo'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-yellow-700">Use Test (24 months):</span>
              <span className={`font-semibold ${inputs.residencyMonths >= 24 || inputs.hasPcsOrders ? 'text-green-600' : 'text-red-600'}`}>
                {inputs.residencyMonths >= 24 ? '✅ Met' : 
                 inputs.hasPcsOrders ? '🏅 PCS Extension' : 
                 '❌ Need ' + (24 - inputs.residencyMonths) + 'mo'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-yellow-700">Exclusion Limit:</span>
              <span className="font-semibold text-yellow-800">
                ${(inputs.filingStatus === 'marriedFilingJointly' ? 500000 : 250000).toLocaleString()}
              </span>
            </div>
            {inputs.hasPcsOrders && (
              <div className="flex items-center justify-between">
                <span className="text-yellow-700">PCS Extensions Available:</span>
                <span className="font-semibold text-blue-600">
                  {inputs.maxPcsExtensions - inputs.pcsExtensions} remaining
                </span>
              </div>
            )}
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
          📊 Capital Gains Exclusion Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="text-lg font-semibold text-blue-600 mb-2">Current Position</div>
            <div className="text-2xl font-bold text-gray-800 mb-1">
              {Math.round((analysis.excludedGain / Math.max(analysis.totalGain, 1)) * 100)}%
            </div>
            <div className="text-sm text-gray-600">
              Gain eligible for exclusion
            </div>
          </div>
          <div>
            <div className="text-lg font-semibold text-purple-600 mb-2">PCS Advantage</div>
            <div className="text-2xl font-bold text-gray-800 mb-1">
              {inputs.hasPcsOrders ? 'Active' : 'N/A'}
            </div>
            <div className="text-sm text-gray-600">
              {inputs.hasPcsOrders ? 'Extended use test eligibility' : 'No PCS orders'}
            </div>
          </div>
          <div>
            <div className="text-lg font-semibold text-green-600 mb-2">Tax Impact</div>
            <div className="text-2xl font-bold text-gray-800 mb-1">
              ${Math.round(analysis.potentialTaxSavings).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">
              Estimated tax savings from exclusion
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CapitalGainsExclusionCalculator;