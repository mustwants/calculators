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
  ArcElement
);

function GIBillHousingStipendEstimator() {
  const giBillDefaults = nationalAverages.phase3Data?.giBill || {};
  
  const [inputs, setInputs] = useState({
    location: 'average',
    enrollmentType: 'full-time',
    programType: 'in-person',
    programLength: 36,
    customBAH: 1800,
    benefitLevel: 100,
    dependents: 0,
    yellowRibbonSchool: false,
    yellowRibbonAmount: 5000,
    currentHousingCost: 1600,
    programStartMonth: 'September',
    programStartYear: 2024,
    usingChapter: '33',
    previousService: 0,
    kicker: 0
  });

  const [analysis, setAnalysis] = useState({
    monthlyStipend: 0,
    annualStipend: 0,
    totalBenefit: 0,
    stipendBreakdown: {},
    paymentSchedule: [],
    recommendations: [],
    costComparison: {},
    locationComparison: {}
  });

  const calculateGIBillBenefits = () => {
    const giBillData = giBillDefaults;
    
    // Get BAH rate based on location
    let bahRate = inputs.customBAH;
    if (inputs.location !== 'custom') {
      const locationRates = giBillData.bahRates || {};
      bahRate = locationRates[inputs.location] || 1800;
    }
    
    // Calculate benefit percentage based on service
    let benefitPercentage = inputs.benefitLevel / 100;
    
    // Adjust for enrollment status
    let enrollmentMultiplier = 1.0;
    switch (inputs.enrollmentType) {
      case 'full-time':
        enrollmentMultiplier = 1.0;
        break;
      case 'three-quarter':
        enrollmentMultiplier = 0.8;
        break;
      case 'half-time':
        enrollmentMultiplier = 0.6;
        break;
      case 'quarter-time':
        enrollmentMultiplier = 0.4;
        break;
      case 'online-only':
        enrollmentMultiplier = 0.5; // Online-only rate cap
        break;
    }
    
    // Program type adjustments
    if (inputs.programType === 'online-only') {
      enrollmentMultiplier = Math.min(enrollmentMultiplier, 0.5);
    }
    
    // Calculate monthly housing allowance
    let monthlyHousingAllowance = 0;
    
    if (inputs.usingChapter === '33') {
      // Post 9/11 GI Bill - housing allowance
      monthlyHousingAllowance = bahRate * benefitPercentage * enrollmentMultiplier;
      
      // Online-only programs get different rate
      if (inputs.programType === 'online-only') {
        const onlineRate = giBillData.onlineHousingRate || 916.50;
        monthlyHousingAllowance = Math.min(monthlyHousingAllowance, onlineRate);
      }
    } else if (inputs.usingChapter === '30') {
      // Montgomery GI Bill - fixed monthly benefit
      const mgibRate = giBillData.mgibMonthlyRate || 2122;
      monthlyHousingAllowance = mgibRate * benefitPercentage;
    } else if (inputs.usingChapter === '1606') {
      // Selected Reserve - lower rate
      const reserveRate = giBillData.reserveMonthlyRate || 407;
      monthlyHousingAllowance = reserveRate * benefitPercentage;
    }
    
    // Add kicker if applicable
    monthlyHousingAllowance += inputs.kicker;
    
    // Book stipend (annual)
    const bookStipend = inputs.usingChapter === '33' 
      ? (giBillData.bookStipend || 1000) * benefitPercentage 
      : 0;
    
    // Calculate payment schedule
    const paymentSchedule = [];
    const monthsInYear = inputs.enrollmentType === 'full-time' ? 9 : 12; // Academic year vs year-round
    const totalMonths = Math.min(inputs.programLength, 36); // 36-month benefit limit
    
    // Payment only during school months for most programs
    let monthsWithPayment = 0;
    for (let month = 0; month < totalMonths; month++) {
      const isSchoolMonth = inputs.programType === 'year-round' || (month % 12 < 9); // Sept-May typically
      
      if (isSchoolMonth) {
        monthsWithPayment++;
        paymentSchedule.push({
          month: month + 1,
          payment: monthlyHousingAllowance,
          isBreak: false
        });
      } else {
        paymentSchedule.push({
          month: month + 1,
          payment: 0,
          isBreak: true
        });
      }
    }
    
    // Calculate totals
    const totalHousingBenefit = monthsWithPayment * monthlyHousingAllowance;
    const totalBookBenefit = bookStipend * Math.ceil(totalMonths / 12);
    const totalBenefit = totalHousingBenefit + totalBookBenefit;
    
    // Yellow Ribbon calculation
    let yellowRibbonBenefit = 0;
    if (inputs.yellowRibbonSchool && inputs.usingChapter === '33') {
      // VA matches school contribution up to the amount
      yellowRibbonBenefit = inputs.yellowRibbonAmount * 2; // School + VA match
    }
    
    // Location comparison
    const locationComparison = {};
    const locations = Object.keys(giBillData.bahRates || {});
    locations.forEach(location => {
      const rate = giBillData.bahRates[location];
      const monthlyBenefit = rate * benefitPercentage * enrollmentMultiplier;
      locationComparison[location] = {
        bahRate: rate,
        monthlyBenefit,
        annualBenefit: monthlyBenefit * monthsInYear,
        totalBenefit: monthlyBenefit * monthsWithPayment
      };
    });
    
    // Cost comparison
    const housingCostDifference = monthlyHousingAllowance - inputs.currentHousingCost;
    const coveragePercentage = inputs.currentHousingCost > 0 
      ? (monthlyHousingAllowance / inputs.currentHousingCost) * 100 
      : 100;
    
    // Generate recommendations
    const recommendations = [];
    
    if (inputs.programType === 'online-only' && bahRate > 916.50) {
      recommendations.push('Consider in-person or hybrid programs to maximize housing allowance benefit');
    }
    
    if (inputs.enrollmentType !== 'full-time') {
      recommendations.push('Full-time enrollment maximizes your monthly housing allowance');
    }
    
    if (inputs.benefitLevel < 100 && inputs.previousService < 36) {
      recommendations.push('Complete 36 months of service to qualify for 100% benefit rate');
    }
    
    if (coveragePercentage < 80) {
      recommendations.push('Consider relocating to an area with higher BAH rates to better cover housing costs');
    }
    
    if (coveragePercentage > 120) {
      recommendations.push('Your housing allowance exceeds local costs - consider banking the difference');
    }
    
    if (!inputs.yellowRibbonSchool && inputs.usingChapter === '33') {
      recommendations.push('Look for Yellow Ribbon schools for additional financial support');
    }
    
    if (inputs.programLength > 36) {
      recommendations.push('GI Bill benefits are limited to 36 months - plan funding for remaining time');
    }
    
    if (monthlyHousingAllowance < 1000) {
      recommendations.push('Consider supplementing with education loans or part-time work');
    }
    
    // Summer break considerations
    if (inputs.programType === 'traditional' && monthsInYear === 9) {
      recommendations.push('Budget for 3 months without housing allowance during summer break');
    }

    setAnalysis({
      monthlyStipend: monthlyHousingAllowance,
      annualStipend: monthlyHousingAllowance * monthsInYear,
      totalBenefit: totalBenefit + yellowRibbonBenefit,
      stipendBreakdown: {
        housing: totalHousingBenefit,
        books: totalBookBenefit,
        yellowRibbon: yellowRibbonBenefit,
        kicker: inputs.kicker * monthsWithPayment
      },
      paymentSchedule,
      recommendations,
      costComparison: {
        monthlyCoverage: coveragePercentage,
        monthlyDifference: housingCostDifference,
        annualSavings: housingCostDifference * monthsInYear
      },
      locationComparison
    });
  };

  useEffect(() => {
    calculateGIBillBenefits();
  }, [inputs]);

  // Payment timeline chart
  const paymentTimelineData = {
    labels: analysis.paymentSchedule.slice(0, 24).map((_, index) => `Month ${index + 1}`),
    datasets: [
      {
        label: 'Housing Allowance',
        data: analysis.paymentSchedule.slice(0, 24).map(payment => payment.payment),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderWidth: 3,
        fill: true
      }
    ]
  };

  // Cost comparison chart
  const costComparisonData = {
    labels: ['Housing Allowance', 'Current Housing Cost', 'Difference'],
    datasets: [{
      data: [
        analysis.monthlyStipend,
        inputs.currentHousingCost,
        Math.abs(analysis.costComparison.monthlyDifference || 0)
      ],
      backgroundColor: [
        analysis.costComparison.monthlyDifference >= 0 ? '#22c55e' : '#ef4444',
        '#6b7280',
        analysis.costComparison.monthlyDifference >= 0 ? '#22c55e' : '#ef4444'
      ],
      borderWidth: 2,
      borderColor: '#ffffff'
    }]
  };

  // Location comparison (top 6 cities)
  const topLocations = Object.entries(analysis.locationComparison)
    .sort((a, b) => b[1].monthlyBenefit - a[1].monthlyBenefit)
    .slice(0, 6);

  const locationComparisonData = {
    labels: topLocations.map(([location]) => location.replace('_', ' ').toUpperCase()),
    datasets: [{
      label: 'Monthly Housing Allowance',
      data: topLocations.map(([, data]) => data.monthlyBenefit),
      backgroundColor: 'rgba(59, 130, 246, 0.8)',
      borderColor: 'rgb(59, 130, 246)',
      borderWidth: 2
    }]
  };

  // Benefit breakdown pie chart
  const benefitBreakdownData = {
    labels: ['Housing Allowance', 'Book Stipend', 'Yellow Ribbon', 'Kicker'].filter((_, index) => 
      Object.values(analysis.stipendBreakdown)[index] > 0
    ),
    datasets: [{
      data: Object.values(analysis.stipendBreakdown).filter(val => val > 0),
      backgroundColor: ['#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6'],
      borderWidth: 2,
      borderColor: '#ffffff'
    }]
  };

  const getCoverageColor = () => {
    const coverage = analysis.costComparison.monthlyCoverage;
    if (coverage >= 100) return 'text-green-600 bg-green-50 border-green-200';
    else if (coverage >= 80) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    else return 'text-red-600 bg-red-50 border-red-200';
  };

  return (
    <div className="max-w-7xl mx-auto p-4 bg-white">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          🎓💰 GI Bill Housing Stipend Estimator
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Calculate your GI Bill housing allowance and education benefits. 
          Compare locations and optimize your educational investment.
        </p>
      </div>

      {/* Input Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 p-6 bg-gray-50 rounded-lg">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location/BAH Rate
          </label>
          <select
            value={inputs.location}
            onChange={(e) => setInputs({...inputs, location: e.target.value})}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="san_francisco">San Francisco, CA</option>
            <option value="new_york">New York, NY</option>
            <option value="washington_dc">Washington, DC</option>
            <option value="los_angeles">Los Angeles, CA</option>
            <option value="boston">Boston, MA</option>
            <option value="seattle">Seattle, WA</option>
            <option value="average">National Average</option>
            <option value="atlanta">Atlanta, GA</option>
            <option value="denver">Denver, CO</option>
            <option value="phoenix">Phoenix, AZ</option>
            <option value="custom">Custom Amount</option>
          </select>
        </div>

        {inputs.location === 'custom' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom BAH Rate
            </label>
            <input
              type="range"
              min="800"
              max="4000"
              step="50"
              value={inputs.customBAH}
              onChange={(e) => setInputs({...inputs, customBAH: parseInt(e.target.value)})}
              className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-sm text-gray-500 mt-1">
              <span>$800</span>
              <span className="font-medium">${inputs.customBAH}</span>
              <span>$4K</span>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            GI Bill Chapter
          </label>
          <select
            value={inputs.usingChapter}
            onChange={(e) => setInputs({...inputs, usingChapter: e.target.value})}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="33">Post-9/11 (Chapter 33)</option>
            <option value="30">Montgomery (Chapter 30)</option>
            <option value="1606">Selected Reserve (1606)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enrollment Status
          </label>
          <select
            value={inputs.enrollmentType}
            onChange={(e) => setInputs({...inputs, enrollmentType: e.target.value})}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="full-time">Full-Time (12+ credits)</option>
            <option value="three-quarter">3/4 Time (9-11 credits)</option>
            <option value="half-time">Half-Time (6-8 credits)</option>
            <option value="quarter-time">Less than Half (1-5 credits)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Program Type
          </label>
          <select
            value={inputs.programType}
            onChange={(e) => setInputs({...inputs, programType: e.target.value})}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="in-person">In-Person/Traditional</option>
            <option value="hybrid">Hybrid</option>
            <option value="online-only">Online Only</option>
            <option value="year-round">Year-Round</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Benefit Percentage
          </label>
          <input
            type="range"
            min="40"
            max="100"
            step="10"
            value={inputs.benefitLevel}
            onChange={(e) => setInputs({...inputs, benefitLevel: parseInt(e.target.value)})}
            className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>40%</span>
            <span className="font-medium">{inputs.benefitLevel}%</span>
            <span>100%</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Program Length (Months)
          </label>
          <input
            type="range"
            min="9"
            max="48"
            step="3"
            value={inputs.programLength}
            onChange={(e) => setInputs({...inputs, programLength: parseInt(e.target.value)})}
            className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>9mo</span>
            <span className="font-medium">{inputs.programLength}mo</span>
            <span>48mo</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Housing Cost
          </label>
          <input
            type="range"
            min="800"
            max="3500"
            step="50"
            value={inputs.currentHousingCost}
            onChange={(e) => setInputs({...inputs, currentHousingCost: parseInt(e.target.value)})}
            className="w-full h-2 bg-yellow-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>$800</span>
            <span className="font-medium">${inputs.currentHousingCost}</span>
            <span>$3.5K</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            College Fund Kicker
          </label>
          <input
            type="range"
            min="0"
            max="950"
            step="50"
            value={inputs.kicker}
            onChange={(e) => setInputs({...inputs, kicker: parseInt(e.target.value)})}
            className="w-full h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>$0</span>
            <span className="font-medium">${inputs.kicker}</span>
            <span>$950</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="yellowRibbon"
              checked={inputs.yellowRibbonSchool}
              onChange={(e) => setInputs({...inputs, yellowRibbonSchool: e.target.checked})}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="yellowRibbon" className="ml-2 text-sm font-medium text-gray-700">
              Yellow Ribbon School
            </label>
          </div>
        </div>

        {inputs.yellowRibbonSchool && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Yellow Ribbon Amount
            </label>
            <input
              type="range"
              min="1000"
              max="15000"
              step="500"
              value={inputs.yellowRibbonAmount}
              onChange={(e) => setInputs({...inputs, yellowRibbonAmount: parseInt(e.target.value)})}
              className="w-full h-2 bg-orange-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-sm text-gray-500 mt-1">
              <span>$1K</span>
              <span className="font-medium">${(inputs.yellowRibbonAmount/1000).toFixed(1)}K</span>
              <span>$15K</span>
            </div>
          </div>
        )}
      </div>

      {/* Coverage Status Banner */}
      <div className={`rounded-lg p-6 mb-8 text-center border ${getCoverageColor()}`}>
        <h2 className="text-2xl font-bold mb-2">
          🏠 Housing Coverage: {Math.round(analysis.costComparison.monthlyCoverage)}%
        </h2>
        <p className="text-lg">
          {analysis.costComparison.monthlyCoverage >= 100 
            ? `Your housing allowance covers all costs with $${Math.abs(analysis.costComparison.monthlyDifference).toLocaleString()} extra per month`
            : `You need an additional $${Math.abs(analysis.costComparison.monthlyDifference).toLocaleString()} per month to cover housing costs`}
        </p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              ${Math.round(analysis.monthlyStipend).toLocaleString()}
            </div>
            <div className="text-sm text-green-700">Monthly Housing Allowance</div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              ${Math.round(analysis.annualStipend).toLocaleString()}
            </div>
            <div className="text-sm text-blue-700">Annual Housing Benefit</div>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              ${Math.round(analysis.totalBenefit).toLocaleString()}
            </div>
            <div className="text-sm text-purple-700">Total Education Benefit</div>
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 mb-1">
              {inputs.programLength}mo
            </div>
            <div className="text-sm text-orange-700">Program Duration</div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Payment Timeline */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
            Monthly Payment Timeline
          </h3>
          <div className="h-80">
            <Line data={paymentTimelineData} options={{
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
                      return '$' + (value/1000).toFixed(1) + 'K';
                    }
                  }
                }
              }
            }} />
          </div>
        </div>

        {/* Cost Comparison */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
            Housing Cost vs Allowance
          </h3>
          <div className="h-80">
            <Doughnut data={costComparisonData} options={{
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
                      return `${label}: $${value.toLocaleString()}`;
                    }
                  }
                }
              }
            }} />
          </div>
        </div>
      </div>

      {/* Location and Benefit Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Top Locations */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
            Top Locations by Housing Allowance
          </h3>
          <div className="h-80">
            <Bar data={locationComparisonData} options={{
              responsive: true,
              plugins: {
                legend: {
                  display: false,
                },
                tooltip: {
                  callbacks: {
                    label: function(context) {
                      return 'Monthly: $' + Math.round(context.parsed.y).toLocaleString();
                    }
                  }
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: function(value) {
                      return '$' + (value/1000).toFixed(1) + 'K';
                    }
                  }
                }
              }
            }} />
          </div>
        </div>

        {/* Benefit Breakdown */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
            Total Benefit Breakdown
          </h3>
          <div className="h-80">
            <Doughnut data={benefitBreakdownData} options={{
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
                      return `${label}: $${value.toLocaleString()}`;
                    }
                  }
                }
              }
            }} />
          </div>
        </div>
      </div>

      {/* Benefit Details */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-gray-200 mb-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
          📋 GI Bill Benefit Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-700">Chapter:</span>
              <span className="font-semibold text-gray-800">
                {inputs.usingChapter === '33' ? 'Post-9/11' : inputs.usingChapter === '30' ? 'Montgomery' : 'Selected Reserve'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Benefit Level:</span>
              <span className="font-semibold text-gray-800">{inputs.benefitLevel}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Enrollment Status:</span>
              <span className="font-semibold text-gray-800">
                {inputs.enrollmentType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Monthly Housing:</span>
              <span className="font-semibold text-green-600">
                ${Math.round(analysis.monthlyStipend).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Book Stipend/Year:</span>
              <span className="font-semibold text-blue-600">
                ${Math.round(analysis.stipendBreakdown.books / Math.ceil(inputs.programLength / 12) || 0).toLocaleString()}
              </span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-700">Program Type:</span>
              <span className="font-semibold text-gray-800">
                {inputs.programType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Program Length:</span>
              <span className="font-semibold text-gray-800">{inputs.programLength} months</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Yellow Ribbon:</span>
              <span className="font-semibold text-yellow-600">
                ${Math.round(analysis.stipendBreakdown.yellowRibbon || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Kicker Benefit:</span>
              <span className="font-semibold text-purple-600">
                ${Math.round(analysis.stipendBreakdown.kicker || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between border-t pt-2 font-bold">
              <span className="text-gray-700">Total Benefit:</span>
              <span className="text-gray-800">
                ${Math.round(analysis.totalBenefit).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {analysis.recommendations.length > 0 && (
        <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200 mb-8">
          <h3 className="text-xl font-bold text-yellow-800 mb-4">💡 Optimization Recommendations</h3>
          <div className="space-y-3">
            {analysis.recommendations.map((rec, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="text-yellow-600 text-lg">•</div>
                <div className="text-yellow-700">{rec}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          🎯 GI Bill Housing Benefit Analysis
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="text-lg font-semibold text-green-600 mb-2">Coverage Level</div>
            <div className="text-2xl font-bold text-gray-800 mb-1">
              {Math.round(analysis.costComparison.monthlyCoverage)}%
            </div>
            <div className="text-sm text-gray-600">
              Of housing costs covered
            </div>
          </div>
          <div>
            <div className="text-lg font-semibold text-blue-600 mb-2">Annual Impact</div>
            <div className="text-2xl font-bold text-gray-800 mb-1">
              ${Math.abs(analysis.costComparison.annualSavings || 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">
              {(analysis.costComparison.annualSavings || 0) >= 0 ? 'Annual savings' : 'Additional needed'}
            </div>
          </div>
          <div>
            <div className="text-lg font-semibold text-purple-600 mb-2">Benefit Efficiency</div>
            <div className="text-2xl font-bold text-gray-800 mb-1">
              {inputs.benefitLevel}%
            </div>
            <div className="text-sm text-gray-600">
              Benefit rate earned
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GIBillHousingStipendEstimator;