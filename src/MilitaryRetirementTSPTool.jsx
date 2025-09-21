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
import { nationalAverages } from './data/nationalAverages.js';

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

function MilitaryRetirementTSPTool() {
  const tspDefaults = nationalAverages.phase3Data?.tsp || {};
  const retirementDefaults = nationalAverages.phase3Data?.militaryRetirement || {};
  const contributionLimits = tspDefaults.contributionLimits2025 || {};
  const historicalReturns = tspDefaults.historicalReturns || {};
  
  const [inputs, setInputs] = useState({
    currentAge: 28,
    retirementAge: 42,
    currentTspBalance: 35000,
    monthlyContribution: 750,
    employerMatch: 5,
    retirementSystem: 'brs',
    expectedReturn: 8.5,
    currentBasePay: 4200,
    projectedBasePay: 6800,
    yearsOfService: 8,
    targetYearsService: 20,
    inflationRate: 2.8,
    postRetirementYears: 25,
    includeRothTsp: true,
    rothPercentage: 50
  });

  const [analysis, setAnalysis] = useState({
    tspProjections: {},
    retirementBenefits: {},
    totalRetirementWealth: 0,
    monthlyRetirementIncome: 0,
    recommendations: [],
    contributionAnalysis: {},
    scenarioComparison: {}
  });

  const calculateRetirementProjections = () => {
    const yearsToRetirement = inputs.retirementAge - inputs.currentAge;
    const monthsToRetirement = yearsToRetirement * 12;
    
    // TSP Growth Calculations
    const monthlyReturn = inputs.expectedReturn / 100 / 12;
    const annualContributionLimit = contributionLimits.employee || 23500;
    const catchUpLimit = contributionLimits.catchUp || 7500;
    
    // Calculate TSP growth with contributions
    const tspProjections = {};
    let currentBalance = inputs.currentTspBalance;
    let totalContributions = inputs.currentTspBalance;
    
    for (let year = 0; year <= yearsToRetirement + inputs.postRetirementYears; year++) {
      const isRetired = year > yearsToRetirement;
      const age = inputs.currentAge + year;
      const canCatchUp = age >= 50;
      
      if (!isRetired) {
        // Active duty - contributing
        const annualContribution = Math.min(
          inputs.monthlyContribution * 12,
          canCatchUp ? annualContributionLimit + catchUpLimit : annualContributionLimit
        );
        
        // Apply monthly compounding
        for (let month = 0; month < 12; month++) {
          currentBalance = currentBalance * (1 + monthlyReturn);
          if (month < 12) {
            currentBalance += annualContribution / 12;
            totalContributions += annualContribution / 12;
          }
        }
      } else {
        // Retired - no contributions, but growth continues
        currentBalance = currentBalance * (1 + inputs.expectedReturn / 100);
      }
      
      tspProjections[year] = {
        balance: currentBalance,
        contributions: totalContributions,
        growth: currentBalance - totalContributions,
        age: age
      };
    }
    
    // Military Retirement Benefits
    const retirementMultiplier = inputs.retirementSystem === 'legacy' ? 0.025 : 0.02;
    const yearsAtRetirement = inputs.targetYearsService;
    const retirementPercentage = retirementMultiplier * yearsAtRetirement;
    const monthlyRetirementPay = inputs.projectedBasePay * retirementPercentage;
    
    // Calculate total retirement wealth
    const tspAtRetirement = tspProjections[yearsToRetirement]?.balance || 0;
    const totalRetirementWealth = tspAtRetirement;
    
    // Safe withdrawal rate calculation (4% rule)
    const safeWithdrawalRate = 0.04;
    const monthlyTspIncome = (tspAtRetirement * safeWithdrawalRate) / 12;
    const totalMonthlyIncome = monthlyTspIncome + monthlyRetirementPay;
    
    // Contribution Analysis - different scenarios
    const contributionAnalysis = {};
    const scenarios = [
      { name: 'Minimum (5%)', contribution: inputs.currentBasePay * 0.05 / 12 },
      { name: 'Recommended (15%)', contribution: inputs.currentBasePay * 0.15 / 12 },
      { name: 'Maximum', contribution: annualContributionLimit / 12 },
      { name: 'Current', contribution: inputs.monthlyContribution }
    ];
    
    scenarios.forEach(scenario => {
      let scenarioBalance = inputs.currentTspBalance;
      let scenarioContributions = inputs.currentTspBalance;
      
      for (let year = 0; year <= yearsToRetirement; year++) {
        if (year > 0) {
          const annualContrib = scenario.contribution * 12;
          for (let month = 0; month < 12; month++) {
            scenarioBalance = scenarioBalance * (1 + monthlyReturn);
            scenarioBalance += scenario.contribution;
            scenarioContributions += scenario.contribution;
          }
        }
      }
      
      contributionAnalysis[scenario.name] = {
        finalBalance: scenarioBalance,
        totalContributions: scenarioContributions,
        monthlyIncome: (scenarioBalance * safeWithdrawalRate) / 12
      };
    });
    
    // Fund allocation scenarios
    const scenarioComparison = {};
    const fundScenarios = [
      { name: 'Conservative', return: 5.5, allocation: 'G Fund heavy' },
      { name: 'Moderate', return: 7.2, allocation: 'Lifecycle funds' },
      { name: 'Aggressive', return: 9.8, allocation: 'C/S Fund heavy' },
      { name: 'Current', return: inputs.expectedReturn, allocation: 'Your selection' }
    ];
    
    fundScenarios.forEach(scenario => {
      const scenarioMonthlyReturn = scenario.return / 100 / 12;
      let scenarioBalance = inputs.currentTspBalance;
      
      for (let year = 0; year <= yearsToRetirement; year++) {
        if (year > 0) {
          for (let month = 0; month < 12; month++) {
            scenarioBalance = scenarioBalance * (1 + scenarioMonthlyReturn);
            scenarioBalance += inputs.monthlyContribution;
          }
        }
      }
      
      scenarioComparison[scenario.name] = {
        finalBalance: scenarioBalance,
        monthlyIncome: (scenarioBalance * safeWithdrawalRate) / 12,
        allocation: scenario.allocation
      };
    });
    
    // Generate recommendations
    const recommendations = [];
    
    const currentContributionPercent = (inputs.monthlyContribution * 12) / (inputs.currentBasePay * 12) * 100;
    if (currentContributionPercent < 15) {
      recommendations.push(`Increase contributions to 15% of base pay for optimal retirement savings`);
    }
    
    if (inputs.monthlyContribution * 12 > annualContributionLimit) {
      recommendations.push(`You're contributing more than the annual limit of $${annualContributionLimit.toLocaleString()}`);
    }
    
    if (inputs.retirementSystem === 'brs' && currentContributionPercent < 5) {
      recommendations.push('Contribute at least 5% to get full BRS matching contributions');
    }
    
    if (inputs.currentAge < 30 && inputs.expectedReturn < 8) {
      recommendations.push('Consider more aggressive allocation (C/S Funds) for long-term growth');
    }
    
    if (inputs.currentAge > 45 && inputs.expectedReturn > 8) {
      recommendations.push('Consider more conservative allocation as you approach retirement');
    }
    
    if (!inputs.includeRothTsp) {
      recommendations.push('Consider Roth TSP contributions for tax-free retirement withdrawals');
    }
    
    const replacementRatio = (totalMonthlyIncome / inputs.currentBasePay) * 100;
    if (replacementRatio < 70) {
      recommendations.push(`Your retirement income replaces ${replacementRatio.toFixed(0)}% of current pay - consider increasing savings`);
    }

    setAnalysis({
      tspProjections,
      retirementBenefits: {
        monthlyPay: monthlyRetirementPay,
        percentage: retirementPercentage * 100,
        system: inputs.retirementSystem
      },
      totalRetirementWealth,
      monthlyRetirementIncome: totalMonthlyIncome,
      recommendations,
      contributionAnalysis,
      scenarioComparison
    });
  };

  useEffect(() => {
    calculateRetirementProjections();
  }, [inputs]);

  // TSP Growth Chart
  const tspGrowthData = {
    labels: Object.keys(analysis.tspProjections || {}).map(year => 
      parseInt(year) <= (inputs.retirementAge - inputs.currentAge) 
        ? `${inputs.currentAge + parseInt(year)}` 
        : `${inputs.currentAge + parseInt(year)} (Ret)`
    ).slice(0, 31), // Show 30 years max
    datasets: [
      {
        label: 'TSP Balance',
        data: Object.values(analysis.tspProjections || {}).map(item => item.balance).slice(0, 31),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderWidth: 3,
        fill: true
      },
      {
        label: 'Total Contributions',
        data: Object.values(analysis.tspProjections || {}).map(item => item.contributions).slice(0, 31),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: true
      }
    ]
  };

  // Contribution scenarios comparison
  const contributionComparisonData = {
    labels: Object.keys(analysis.contributionAnalysis || {}),
    datasets: [{
      label: 'Final TSP Balance',
      data: Object.values(analysis.contributionAnalysis || {}).map(item => item.finalBalance),
      backgroundColor: ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6'],
      borderColor: ['#dc2626', '#d97706', '#16a34a', '#2563eb'],
      borderWidth: 2
    }]
  };

  // Investment strategy comparison
  const strategyComparisonData = {
    labels: Object.keys(analysis.scenarioComparison || {}),
    datasets: [{
      label: 'TSP Balance at Retirement',
      data: Object.values(analysis.scenarioComparison || {}).map(item => item.finalBalance),
      backgroundColor: ['#8b5cf6', '#06b6d4', '#10b981', '#3b82f6'],
      borderColor: ['#7c3aed', '#0891b2', '#059669', '#2563eb'],
      borderWidth: 2
    }]
  };

  // Retirement income breakdown
  const incomeBreakdownData = {
    labels: ['Military Retirement', 'TSP Income (4% withdrawal)', 'Social Security (future)'],
    datasets: [{
      data: [
        analysis.retirementBenefits.monthlyPay || 0,
        (analysis.totalRetirementWealth * 0.04) / 12,
        1500 // Estimated Social Security
      ],
      backgroundColor: ['#22c55e', '#3b82f6', '#f59e0b'],
      borderWidth: 2,
      borderColor: '#ffffff'
    }]
  };

  return (
    <div className="max-w-7xl mx-auto p-4 bg-white">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          🎖️📈 Military Retirement + TSP Growth Tool
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Project your TSP growth and military retirement benefits. 
          Optimize your path to financial independence over 20+ years of service.
        </p>
      </div>

      {/* Input Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 p-6 bg-gray-50 rounded-lg">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Age
          </label>
          <input
            type="range"
            min="18"
            max="45"
            step="1"
            value={inputs.currentAge}
            onChange={(e) => setInputs({...inputs, currentAge: parseInt(e.target.value)})}
            className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>18</span>
            <span className="font-medium">{inputs.currentAge}</span>
            <span>45</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Years of Service
          </label>
          <input
            type="range"
            min="1"
            max="19"
            step="1"
            value={inputs.yearsOfService}
            onChange={(e) => setInputs({...inputs, yearsOfService: parseInt(e.target.value)})}
            className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>1yr</span>
            <span className="font-medium">{inputs.yearsOfService}yr</span>
            <span>19yr</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current TSP Balance
          </label>
          <input
            type="range"
            min="0"
            max="200000"
            step="5000"
            value={inputs.currentTspBalance}
            onChange={(e) => setInputs({...inputs, currentTspBalance: parseInt(e.target.value)})}
            className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>$0</span>
            <span className="font-medium">${inputs.currentTspBalance.toLocaleString()}</span>
            <span>$200K</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Monthly TSP Contribution
          </label>
          <input
            type="range"
            min="100"
            max="2000"
            step="50"
            value={inputs.monthlyContribution}
            onChange={(e) => setInputs({...inputs, monthlyContribution: parseInt(e.target.value)})}
            className="w-full h-2 bg-yellow-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>$100</span>
            <span className="font-medium">${inputs.monthlyContribution}</span>
            <span>$2K</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Retirement System
          </label>
          <select
            value={inputs.retirementSystem}
            onChange={(e) => setInputs({...inputs, retirementSystem: e.target.value})}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="legacy">Legacy (High-3)</option>
            <option value="brs">BRS (Blended Retirement)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Base Pay
          </label>
          <input
            type="number"
            min="2000"
            max="8000"
            value={inputs.currentBasePay}
            onChange={(e) => setInputs({...inputs, currentBasePay: parseInt(e.target.value)})}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Base Pay at Retirement
          </label>
          <input
            type="number"
            min="4000"
            max="12000"
            value={inputs.projectedBasePay}
            onChange={(e) => setInputs({...inputs, projectedBasePay: parseInt(e.target.value)})}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Expected Annual Return %
          </label>
          <input
            type="range"
            min="5"
            max="12"
            step="0.5"
            value={inputs.expectedReturn}
            onChange={(e) => setInputs({...inputs, expectedReturn: parseFloat(e.target.value)})}
            className="w-full h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>5%</span>
            <span className="font-medium">{inputs.expectedReturn}%</span>
            <span>12%</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Target Retirement Age
          </label>
          <input
            type="range"
            min="38"
            max="65"
            step="1"
            value={inputs.retirementAge}
            onChange={(e) => setInputs({...inputs, retirementAge: parseInt(e.target.value)})}
            className="w-full h-2 bg-pink-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>38</span>
            <span className="font-medium">{inputs.retirementAge}</span>
            <span>65</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="includeRothTsp"
              checked={inputs.includeRothTsp}
              onChange={(e) => setInputs({...inputs, includeRothTsp: e.target.checked})}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="includeRothTsp" className="ml-2 text-sm font-medium text-gray-700">
              Include Roth TSP
            </label>
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              ${Math.round(analysis.totalRetirementWealth).toLocaleString()}
            </div>
            <div className="text-sm text-blue-700">TSP at Retirement</div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              ${Math.round(analysis.retirementBenefits.monthlyPay || 0).toLocaleString()}
            </div>
            <div className="text-sm text-green-700">Monthly Military Retirement</div>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              ${Math.round(analysis.monthlyRetirementIncome).toLocaleString()}
            </div>
            <div className="text-sm text-purple-700">Total Monthly Income</div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600 mb-1">
              {Math.round((analysis.monthlyRetirementIncome / inputs.currentBasePay) * 100)}%
            </div>
            <div className="text-sm text-yellow-700">Income Replacement</div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* TSP Growth Over Time */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
            TSP Growth Timeline (20+ Years)
          </h3>
          <div className="h-80">
            <Line data={tspGrowthData} options={{
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
                    text: 'Age'
                  }
                }
              }
            }} />
          </div>
        </div>

        {/* Retirement Income Breakdown */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
            Retirement Income Sources
          </h3>
          <div className="h-80">
            <Doughnut data={incomeBreakdownData} options={{
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
                      return `${label}: $${Math.round(value).toLocaleString()}/mo (${percentage}%)`;
                    }
                  }
                }
              }
            }} />
          </div>
        </div>
      </div>

      {/* Contribution Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
            Contribution Strategy Comparison
          </h3>
          <div className="h-80">
            <Bar data={contributionComparisonData} options={{
              responsive: true,
              plugins: {
                legend: {
                  display: false,
                },
                tooltip: {
                  callbacks: {
                    label: function(context) {
                      return 'Final Balance: $' + Math.round(context.parsed.y).toLocaleString();
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

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
            Investment Strategy Comparison
          </h3>
          <div className="h-80">
            <Bar data={strategyComparisonData} options={{
              responsive: true,
              plugins: {
                legend: {
                  display: false,
                },
                tooltip: {
                  callbacks: {
                    label: function(context) {
                      return 'Balance: $' + Math.round(context.parsed.y).toLocaleString();
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
        {/* TSP Fund Performance */}
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <h3 className="text-xl font-bold text-blue-800 mb-4">📊 TSP Fund Historical Returns</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-blue-700">C Fund (Stocks):</span>
              <span className="font-semibold text-blue-800">
                {historicalReturns.cFund?.average20Year || 10.2}% (20yr avg)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">S Fund (Small Cap):</span>
              <span className="font-semibold text-blue-800">
                {historicalReturns.sFund?.average20Year || 8.9}% (20yr avg)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">I Fund (International):</span>
              <span className="font-semibold text-blue-800">
                {historicalReturns.iFund?.average20Year || 7.2}% (20yr avg)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">F Fund (Bonds):</span>
              <span className="font-semibold text-blue-800">
                {historicalReturns.fFund?.average20Year || 5.1}% (20yr avg)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">G Fund (Treasury):</span>
              <span className="font-semibold text-blue-800">
                {historicalReturns.gFund?.average20Year || 2.8}% (20yr avg)
              </span>
            </div>
          </div>
        </div>

        {/* Retirement System Details */}
        <div className="bg-green-50 rounded-xl p-6 border border-green-200">
          <h3 className="text-xl font-bold text-green-800 mb-4">🎖️ Military Retirement Details</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-green-700">System:</span>
              <span className="font-semibold text-green-800">
                {inputs.retirementSystem === 'legacy' ? 'Legacy High-3' : 'Blended Retirement (BRS)'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-700">Multiplier:</span>
              <span className="font-semibold text-green-800">
                {inputs.retirementSystem === 'legacy' ? '2.5%' : '2.0%'} per year
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-700">Years to Retirement:</span>
              <span className="font-semibold text-green-800">
                {inputs.targetYearsService} years
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-700">Retirement Percentage:</span>
              <span className="font-semibold text-green-800">
                {Math.round(analysis.retirementBenefits.percentage || 0)}%
              </span>
            </div>
            {inputs.retirementSystem === 'brs' && (
              <div className="flex justify-between">
                <span className="text-green-700">TSP Matching:</span>
                <span className="font-semibold text-green-800">
                  Up to 5% with auto 1%
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {analysis.recommendations.length > 0 && (
        <div className="bg-purple-50 rounded-xl p-6 border border-purple-200 mb-8">
          <h3 className="text-xl font-bold text-purple-800 mb-4">💡 Retirement Planning Recommendations</h3>
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
          📈 Military Retirement Projection Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="text-lg font-semibold text-blue-600 mb-2">Wealth at Retirement</div>
            <div className="text-2xl font-bold text-gray-800 mb-1">
              ${Math.round((analysis.totalRetirementWealth + (analysis.retirementBenefits.monthlyPay * 12 * 20)) / 1000)}K
            </div>
            <div className="text-sm text-gray-600">
              TSP + 20 years of military retirement
            </div>
          </div>
          <div>
            <div className="text-lg font-semibold text-purple-600 mb-2">Financial Independence</div>
            <div className="text-2xl font-bold text-gray-800 mb-1">
              Age {inputs.retirementAge}
            </div>
            <div className="text-sm text-gray-600">
              Ready for second career or full retirement
            </div>
          </div>
          <div>
            <div className="text-lg font-semibold text-green-600 mb-2">Monthly TSP Contribution</div>
            <div className="text-2xl font-bold text-gray-800 mb-1">
              ${inputs.monthlyContribution}
            </div>
            <div className="text-sm text-gray-600">
              {Math.round((inputs.monthlyContribution * 12) / (inputs.currentBasePay * 12) * 100)}% of base pay
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MilitaryRetirementTSPTool;