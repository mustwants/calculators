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
import { nationalAverages } from './data/nationalAverages.js';

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

function SBPVsLifeInsuranceCalculator() {
  const sbpDefaults = nationalAverages.phase3Data?.sbpCosts || {};
  const lifeInsuranceDefaults = nationalAverages.phase3Data?.lifeInsurance || {};
  
  const [inputs, setInputs] = useState({
    rank: 'E-7',
    yearsOfService: 15,
    monthlyBasePay: 4500,
    currentAge: 35,
    spouseAge: 33,
    retirementAge: 42,
    lifeExpectancy: 80,
    spouseLifeExpectancy: 85,
    sbpElection: 55, // percentage of retirement pay
    lifeInsuranceFaceValue: 500000,
    lifeInsurancePremium: 150,
    investmentReturn: 7.0,
    inflationRate: 2.8,
    includeSGLI: true,
    sgliAmount: 400000
  });

  const [comparison, setComparison] = useState({
    sbpAnalysis: {},
    lifeInsuranceAnalysis: {},
    recommendation: '',
    totalCostDifference: 0,
    benefitDifference: 0,
    chartData: {}
  });

  const calculateComparison = () => {
    // Calculate retirement pay (simplified - 2.5% per year for 20+ years)
    const retirementMultiplier = Math.min(inputs.yearsOfService * 2.5, 75) / 100;
    const monthlyRetirementPay = inputs.monthlyBasePay * retirementMultiplier;
    
    // SBP Analysis
    const sbpMonthlyBenefit = monthlyRetirementPay * (inputs.sbpElection / 100);
    const sbpMonthlyCost = sbpMonthlyBenefit * 0.065; // 6.5% of benefit amount
    const sbpMaxMonthlyCost = 360; // 2025 max
    const actualSBPMonthlyCost = Math.min(sbpMonthlyCost, sbpMaxMonthlyCost);
    
    // Years from retirement to spouse life expectancy
    const yearsToPaySBP = inputs.retirementAge - inputs.currentAge;
    const yearsSpouseReceivesBenefit = inputs.spouseLifeExpectancy - (inputs.spouseAge + yearsToPaySBP);
    
    // Total SBP costs and benefits
    const totalSBPCosts = actualSBPMonthlyCost * 12 * yearsToPaySBP;
    const totalSBPBenefits = sbpMonthlyBenefit * 12 * Math.max(0, yearsSpouseReceivesBenefit);
    
    // Life Insurance Analysis
    const yearsToPayPremiums = inputs.lifeExpectancy - inputs.currentAge;
    const totalLifeInsuranceCosts = inputs.lifeInsurancePremium * 12 * yearsToPayPremiums;
    
    // SGLI Analysis
    const sgliMonthlyCost = inputs.sgliAmount <= 400000 ? 
      (inputs.sgliAmount / 50000) * 3.5 : // $3.50 per $50K coverage
      inputs.sgliAmount * 0.07 / 12; // For amounts over $400K
    const totalSGLICosts = inputs.includeSGLI ? sgliMonthlyCost * 12 * yearsToPaySBP : 0;
    
    // Investment analysis - what if life insurance premiums were invested instead
    const monthlyInvestment = inputs.lifeInsurancePremium;
    const monthlyRate = inputs.investmentReturn / 100 / 12;
    const investmentPeriods = yearsToPayPremiums * 12;
    
    // Future value of invested premiums
    const investedValue = monthlyInvestment * 
      (Math.pow(1 + monthlyRate, investmentPeriods) - 1) / monthlyRate;
    
    // Generate timeline data for charts
    const years = Array.from({length: 30}, (_, i) => i + 1);
    const sbpCumulativeCosts = years.map(year => {
      if (year <= yearsToPaySBP) {
        return actualSBPMonthlyCost * 12 * year;
      }
      return totalSBPCosts;
    });
    
    const lifeInsuranceCumulativeCosts = years.map(year => {
      if (year <= yearsToPayPremiums) {
        return (inputs.lifeInsurancePremium * 12 * year) + 
               (inputs.includeSGLI ? sgliMonthlyCost * 12 * Math.min(year, yearsToPaySBP) : 0);
      }
      return totalLifeInsuranceCosts + totalSGLICosts;
    });
    
    const investmentGrowth = years.map(year => {
      if (year <= yearsToPayPremiums) {
        const periods = year * 12;
        return monthlyInvestment * 
          (Math.pow(1 + monthlyRate, periods) - 1) / monthlyRate;
      }
      return investedValue;
    });
    
    // Break-even analysis
    const netSBPBenefit = totalSBPBenefits - totalSBPCosts;
    const netLifeInsuranceBenefit = inputs.lifeInsuranceFaceValue - totalLifeInsuranceCosts;
    const netInvestmentStrategy = investedValue - totalLifeInsuranceCosts;
    
    // Recommendation logic
    let recommendation = '';
    if (netSBPBenefit > netLifeInsuranceBenefit && netSBPBenefit > netInvestmentStrategy) {
      recommendation = 'SBP';
    } else if (netLifeInsuranceBenefit > netInvestmentStrategy) {
      recommendation = 'Life Insurance';
    } else {
      recommendation = 'Invest the Difference';
    }
    
    const sbpAnalysis = {
      monthlyBenefit: sbpMonthlyBenefit,
      monthlyCost: actualSBPMonthlyCost,
      totalCosts: totalSBPCosts,
      totalBenefits: totalSBPBenefits,
      netBenefit: netSBPBenefit,
      yearsToBreakEven: totalSBPCosts / (sbpMonthlyBenefit * 12)
    };
    
    const lifeInsuranceAnalysis = {
      faceValue: inputs.lifeInsuranceFaceValue,
      monthlyPremium: inputs.lifeInsurancePremium,
      totalCosts: totalLifeInsuranceCosts,
      totalSGLICosts,
      netBenefit: netLifeInsuranceBenefit,
      investedValue,
      netInvestmentStrategy
    };
    
    setComparison({
      sbpAnalysis,
      lifeInsuranceAnalysis,
      recommendation,
      totalCostDifference: Math.abs(totalSBPCosts - totalLifeInsuranceCosts),
      benefitDifference: Math.abs(netSBPBenefit - netLifeInsuranceBenefit),
      chartData: {
        years,
        sbpCumulativeCosts,
        lifeInsuranceCumulativeCosts,
        investmentGrowth
      }
    });
  };

  useEffect(() => {
    calculateComparison();
  }, [inputs]);

  // Cost comparison chart
  const costComparisonData = {
    labels: comparison.chartData.years || [],
    datasets: [
      {
        label: 'SBP Cumulative Costs',
        data: comparison.chartData.sbpCumulativeCosts || [],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        fill: false
      },
      {
        label: 'Life Insurance Costs',
        data: comparison.chartData.lifeInsuranceCumulativeCosts || [],
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 3,
        fill: false
      },
      {
        label: 'Investment Growth',
        data: comparison.chartData.investmentGrowth || [],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 3,
        fill: false
      }
    ]
  };

  // Benefits comparison bar chart
  const benefitsComparisonData = {
    labels: ['SBP Net Benefit', 'Life Insurance Net', 'Investment Strategy Net'],
    datasets: [{
      label: 'Net Financial Benefit',
      data: [
        comparison.sbpAnalysis.netBenefit || 0,
        comparison.lifeInsuranceAnalysis.netBenefit || 0,
        comparison.lifeInsuranceAnalysis.netInvestmentStrategy || 0
      ],
      backgroundColor: [
        comparison.recommendation === 'SBP' ? '#22c55e' : '#94a3b8',
        comparison.recommendation === 'Life Insurance' ? '#22c55e' : '#94a3b8',
        comparison.recommendation === 'Invest the Difference' ? '#22c55e' : '#94a3b8'
      ],
      borderColor: ['#16a34a', '#dc2626', '#059669'],
      borderWidth: 2
    }]
  };

  const getRecommendationColor = (rec) => {
    switch(rec) {
      case 'SBP': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'Life Insurance': return 'text-red-600 bg-red-50 border-red-200';
      case 'Invest the Difference': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 bg-white">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          🛡️💰 SBP vs Life Insurance Calculator
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Compare Survivor Benefit Plan (SBP) versus life insurance for military families. 
          Analyze costs, benefits, and optimal protection strategies.
        </p>
      </div>

      {/* Input Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 p-6 bg-gray-50 rounded-lg">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Rank
          </label>
          <select
            value={inputs.rank}
            onChange={(e) => setInputs({...inputs, rank: e.target.value})}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="E-5">E-5</option>
            <option value="E-6">E-6</option>
            <option value="E-7">E-7</option>
            <option value="E-8">E-8</option>
            <option value="E-9">E-9</option>
            <option value="O-1">O-1</option>
            <option value="O-2">O-2</option>
            <option value="O-3">O-3</option>
            <option value="O-4">O-4</option>
            <option value="O-5">O-5</option>
            <option value="O-6">O-6</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Years of Service
          </label>
          <input
            type="range"
            min="8"
            max="30"
            step="1"
            value={inputs.yearsOfService}
            onChange={(e) => setInputs({...inputs, yearsOfService: parseInt(e.target.value)})}
            className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>8 yrs</span>
            <span className="font-medium">{inputs.yearsOfService} years</span>
            <span>30 yrs</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Monthly Base Pay
          </label>
          <input
            type="range"
            min="2500"
            max="8000"
            step="100"
            value={inputs.monthlyBasePay}
            onChange={(e) => setInputs({...inputs, monthlyBasePay: parseInt(e.target.value)})}
            className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>$2.5K</span>
            <span className="font-medium">${inputs.monthlyBasePay.toLocaleString()}</span>
            <span>$8K</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Age
          </label>
          <input
            type="range"
            min="25"
            max="50"
            step="1"
            value={inputs.currentAge}
            onChange={(e) => setInputs({...inputs, currentAge: parseInt(e.target.value)})}
            className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>25</span>
            <span className="font-medium">{inputs.currentAge}</span>
            <span>50</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Spouse Age
          </label>
          <input
            type="range"
            min="20"
            max="50"
            step="1"
            value={inputs.spouseAge}
            onChange={(e) => setInputs({...inputs, spouseAge: parseInt(e.target.value)})}
            className="w-full h-2 bg-pink-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>20</span>
            <span className="font-medium">{inputs.spouseAge}</span>
            <span>50</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            SBP Election %
          </label>
          <input
            type="range"
            min="25"
            max="100"
            step="5"
            value={inputs.sbpElection}
            onChange={(e) => setInputs({...inputs, sbpElection: parseInt(e.target.value)})}
            className="w-full h-2 bg-yellow-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>25%</span>
            <span className="font-medium">{inputs.sbpElection}%</span>
            <span>100%</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Life Insurance Face Value
          </label>
          <input
            type="range"
            min="250000"
            max="1000000"
            step="50000"
            value={inputs.lifeInsuranceFaceValue}
            onChange={(e) => setInputs({...inputs, lifeInsuranceFaceValue: parseInt(e.target.value)})}
            className="w-full h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>$250K</span>
            <span className="font-medium">${(inputs.lifeInsuranceFaceValue/1000).toFixed(0)}K</span>
            <span>$1M</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Monthly Life Insurance Premium
          </label>
          <input
            type="number"
            min="50"
            max="500"
            value={inputs.lifeInsurancePremium}
            onChange={(e) => setInputs({...inputs, lifeInsurancePremium: parseInt(e.target.value)})}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="includeSGLI"
            checked={inputs.includeSGLI}
            onChange={(e) => setInputs({...inputs, includeSGLI: e.target.checked})}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="includeSGLI" className="ml-2 text-sm font-medium text-gray-700">
            Include SGLI ($400K @ $29/month)
          </label>
        </div>
      </div>

      {/* Recommendation Banner */}
      <div className={`rounded-lg p-6 mb-8 text-center border ${getRecommendationColor(comparison.recommendation)}`}>
        <h2 className="text-2xl font-bold mb-2">
          🎯 Recommendation: {comparison.recommendation}
        </h2>
        <p className="text-lg">
          Based on your profile, <strong>{comparison.recommendation.toLowerCase()}</strong> 
          {' '}provides the best long-term financial benefit for your spouse.
        </p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              ${Math.round(comparison.sbpAnalysis.monthlyCost || 0).toLocaleString()}
            </div>
            <div className="text-sm text-blue-700">SBP Monthly Cost</div>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600 mb-1">
              ${Math.round(comparison.lifeInsuranceAnalysis.monthlyPremium || 0).toLocaleString()}
            </div>
            <div className="text-sm text-red-700">Life Insurance Premium</div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              ${Math.round(comparison.sbpAnalysis.monthlyBenefit || 0).toLocaleString()}
            </div>
            <div className="text-sm text-green-700">SBP Monthly Benefit</div>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {(comparison.sbpAnalysis.yearsToBreakEven || 0).toFixed(1)}
            </div>
            <div className="text-sm text-purple-700">Years to Break Even</div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Cost Timeline */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
            Cumulative Costs Over Time
          </h3>
          <div className="h-80">
            <Line data={costComparisonData} options={{
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
                },
                x: {
                  title: {
                    display: true,
                    text: 'Years'
                  }
                }
              }
            }} />
          </div>
        </div>

        {/* Net Benefits Comparison */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
            Net Financial Benefit Comparison
          </h3>
          <div className="h-80">
            <Bar data={benefitsComparisonData} options={{
              responsive: true,
              plugins: {
                legend: {
                  display: false,
                },
                tooltip: {
                  callbacks: {
                    label: function(context) {
                      return '$' + Math.round(context.parsed.y).toLocaleString();
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

      {/* Detailed Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* SBP Analysis */}
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <h3 className="text-xl font-bold text-blue-800 mb-4">🛡️ SBP Analysis</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-blue-700">Monthly Benefit:</span>
              <span className="font-semibold text-blue-800">
                ${Math.round(comparison.sbpAnalysis.monthlyBenefit || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Monthly Cost:</span>
              <span className="font-semibold text-blue-800">
                ${Math.round(comparison.sbpAnalysis.monthlyCost || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Total Lifetime Costs:</span>
              <span className="font-semibold text-blue-800">
                ${Math.round(comparison.sbpAnalysis.totalCosts || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Total Lifetime Benefits:</span>
              <span className="font-semibold text-blue-800">
                ${Math.round(comparison.sbpAnalysis.totalBenefits || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between border-t pt-2 font-bold">
              <span className="text-blue-700">Net Benefit:</span>
              <span className={`${comparison.sbpAnalysis.netBenefit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${Math.round(comparison.sbpAnalysis.netBenefit || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Life Insurance Analysis */}
        <div className="bg-red-50 rounded-xl p-6 border border-red-200">
          <h3 className="text-xl font-bold text-red-800 mb-4">💰 Life Insurance Analysis</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-red-700">Face Value:</span>
              <span className="font-semibold text-red-800">
                ${inputs.lifeInsuranceFaceValue.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-red-700">Monthly Premium:</span>
              <span className="font-semibold text-red-800">
                ${inputs.lifeInsurancePremium.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-red-700">Total Lifetime Premiums:</span>
              <span className="font-semibold text-red-800">
                ${Math.round(comparison.lifeInsuranceAnalysis.totalCosts || 0).toLocaleString()}
              </span>
            </div>
            {inputs.includeSGLI && (
              <div className="flex justify-between">
                <span className="text-red-700">SGLI Costs:</span>
                <span className="font-semibold text-red-800">
                  ${Math.round(comparison.lifeInsuranceAnalysis.totalSGLICosts || 0).toLocaleString()}
                </span>
              </div>
            )}
            <div className="flex justify-between border-t pt-2 font-bold">
              <span className="text-red-700">Net Benefit:</span>
              <span className={`${comparison.lifeInsuranceAnalysis.netBenefit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${Math.round(comparison.lifeInsuranceAnalysis.netBenefit || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Investment Strategy Analysis */}
      <div className="bg-green-50 rounded-xl p-6 border border-green-200 mb-8">
        <h3 className="text-xl font-bold text-green-800 mb-4">📈 "Invest the Difference" Strategy</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-2">
              ${Math.round(comparison.lifeInsuranceAnalysis.investedValue || 0).toLocaleString()}
            </div>
            <div className="text-sm text-green-700 font-medium mb-1">Investment Value at Life Expectancy</div>
            <div className="text-xs text-green-600">
              Investing ${inputs.lifeInsurancePremium}/month at {inputs.investmentReturn}% return
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-2">
              ${Math.round(comparison.lifeInsuranceAnalysis.netInvestmentStrategy || 0).toLocaleString()}
            </div>
            <div className="text-sm text-green-700 font-medium mb-1">Net Investment Strategy</div>
            <div className="text-xs text-green-600">
              Investment value minus total premiums paid
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-2">
              {inputs.investmentReturn}%
            </div>
            <div className="text-sm text-green-700 font-medium mb-1">Assumed Return Rate</div>
            <div className="text-xs text-green-600">
              Annual investment return assumption
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          📊 Military Family Protection Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="text-lg font-semibold text-blue-600 mb-2">Best Strategy</div>
            <div className="text-2xl font-bold text-gray-800 mb-1">
              {comparison.recommendation}
            </div>
            <div className="text-sm text-gray-600">
              Provides optimal financial protection
            </div>
          </div>
          <div>
            <div className="text-lg font-semibold text-purple-600 mb-2">Cost Difference</div>
            <div className="text-2xl font-bold text-gray-800 mb-1">
              ${Math.round(comparison.totalCostDifference).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">
              Between SBP and life insurance
            </div>
          </div>
          <div>
            <div className="text-lg font-semibold text-green-600 mb-2">Break-Even Point</div>
            <div className="text-2xl font-bold text-gray-800 mb-1">
              {(comparison.sbpAnalysis.yearsToBreakEven || 0).toFixed(1)} years
            </div>
            <div className="text-sm text-gray-600">
              For SBP to provide positive return
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SBPVsLifeInsuranceCalculator;