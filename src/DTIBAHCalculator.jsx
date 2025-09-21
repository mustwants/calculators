import React, { useState, useEffect } from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';
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
import { nationalAverages } from './data/nationalAverages.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

function DTIBAHCalculator() {
  const dtiDefaults = nationalAverages.phase2Data?.dtiCalculation || {};
  const bahDefaults = nationalAverages.bah?.nationalAverages || {};
  
  const [inputs, setInputs] = useState({
    basePay: 4500,
    bah: 1800,
    bas: 400,
    specialPay: 200,
    otherIncome: 0,
    housingPayment: 1650,
    carPayment1: 450,
    carPayment2: 0,
    creditCards: 250,
    studentLoans: 300,
    personalLoans: 0,
    otherDebts: 0,
    rank: 'E-5',
    location: 'Average',
    dependents: 'Without',
    housingType: 'Off-Base'
  });

  const [analysis, setAnalysis] = useState({
    totalIncome: 0,
    totalDebts: 0,
    frontEndDTI: 0,
    backEndDTI: 0,
    qualificationStatus: '',
    maxHousingPayment: 0,
    additionalDebtCapacity: 0,
    recommendations: []
  });

  const calculateDTI = () => {
    // Calculate total monthly income
    const totalIncome = inputs.basePay + inputs.bah + inputs.bas + 
                       inputs.specialPay + inputs.otherIncome;
    
    // Calculate total monthly debts
    const totalDebts = inputs.housingPayment + inputs.carPayment1 + 
                      inputs.carPayment2 + inputs.creditCards + 
                      inputs.studentLoans + inputs.personalLoans + inputs.otherDebts;
    
    // Calculate DTI ratios
    const frontEndDTI = (inputs.housingPayment / totalIncome) * 100;
    const backEndDTI = (totalDebts / totalIncome) * 100;
    
    // Calculate qualification limits (VA loan typically 41% back-end DTI)
    const maxBackEndRatio = 41;
    const maxFrontEndRatio = 28;
    
    const maxTotalDebt = totalIncome * (maxBackEndRatio / 100);
    const maxHousingPayment = totalIncome * (maxFrontEndRatio / 100);
    
    const additionalDebtCapacity = maxTotalDebt - totalDebts;
    
    // Determine qualification status
    let qualificationStatus = 'Excellent';
    if (backEndDTI > 41) qualificationStatus = 'May Need Review';
    else if (backEndDTI > 36) qualificationStatus = 'Good';
    else if (backEndDTI > 28) qualificationStatus = 'Very Good';
    
    // Generate recommendations
    const recommendations = [];
    if (frontEndDTI > 28) {
      recommendations.push('Consider reducing housing costs - front-end DTI is high');
    }
    if (backEndDTI > 36) {
      recommendations.push('Pay down existing debts before taking on new loans');
    }
    if (inputs.creditCards > totalIncome * 0.05) {
      recommendations.push('Focus on paying down credit card debt first');
    }
    if (additionalDebtCapacity > 500) {
      recommendations.push(`You have $${Math.round(additionalDebtCapacity)} additional debt capacity`);
    }
    if (inputs.bah > inputs.housingPayment && inputs.housingType === 'Off-Base') {
      recommendations.push(`You're saving $${inputs.bah - inputs.housingPayment} monthly with current housing`);
    }

    setAnalysis({
      totalIncome,
      totalDebts,
      frontEndDTI,
      backEndDTI,
      qualificationStatus,
      maxHousingPayment,
      additionalDebtCapacity,
      recommendations
    });
  };

  useEffect(() => {
    calculateDTI();
  }, [inputs]);

  // Pie chart for income breakdown
  const incomeBreakdownData = {
    labels: ['Base Pay', 'BAH', 'BAS', 'Special Pay', 'Other Income'],
    datasets: [{
      data: [
        inputs.basePay,
        inputs.bah,
        inputs.bas,
        inputs.specialPay,
        inputs.otherIncome
      ].filter(val => val > 0),
      backgroundColor: [
        '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'
      ],
      borderWidth: 2,
      borderColor: '#ffffff'
    }]
  };

  // Pie chart for debt breakdown
  const debtBreakdownData = {
    labels: ['Housing', 'Car Payment 1', 'Car Payment 2', 'Credit Cards', 'Student Loans', 'Personal Loans', 'Other Debts']
      .filter((_, index) => [inputs.housingPayment, inputs.carPayment1, inputs.carPayment2, 
                            inputs.creditCards, inputs.studentLoans, inputs.personalLoans, inputs.otherDebts][index] > 0),
    datasets: [{
      data: [inputs.housingPayment, inputs.carPayment1, inputs.carPayment2, 
             inputs.creditCards, inputs.studentLoans, inputs.personalLoans, inputs.otherDebts]
             .filter(val => val > 0),
      backgroundColor: [
        '#ef4444', '#f97316', '#eab308', '#84cc16', '#06b6d4', '#8b5cf6', '#ec4899'
      ],
      borderWidth: 2,
      borderColor: '#ffffff'
    }]
  };

  // Bar chart for DTI comparison
  const dtiComparisonData = {
    labels: ['Front-End DTI', 'Back-End DTI', 'VA Loan Limit'],
    datasets: [{
      label: 'DTI Percentage',
      data: [analysis.frontEndDTI, analysis.backEndDTI, 41],
      backgroundColor: [
        analysis.frontEndDTI > 28 ? '#ef4444' : '#10b981',
        analysis.backEndDTI > 41 ? '#ef4444' : analysis.backEndDTI > 36 ? '#f59e0b' : '#10b981',
        '#6b7280'
      ],
      borderColor: [
        analysis.frontEndDTI > 28 ? '#dc2626' : '#059669',
        analysis.backEndDTI > 41 ? '#dc2626' : analysis.backEndDTI > 36 ? '#d97706' : '#059669',
        '#4b5563'
      ],
      borderWidth: 2
    }]
  };

  const getQualificationColor = (status) => {
    switch(status) {
      case 'Excellent': return 'text-green-600 bg-green-50 border-green-200';
      case 'Very Good': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'Good': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'May Need Review': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 bg-white">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          💰📊 DTI + BAH Calculator
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Analyze your debt-to-income ratio with military pay and BAH optimization. 
          Perfect for loan qualification and budget planning.
        </p>
      </div>

      {/* Input Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 p-6 bg-gray-50 rounded-lg">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Base Pay (Monthly)
          </label>
          <input
            type="range"
            min="2000"
            max="8000"
            step="100"
            value={inputs.basePay}
            onChange={(e) => setInputs({...inputs, basePay: parseInt(e.target.value)})}
            className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>$2K</span>
            <span className="font-medium">${inputs.basePay.toLocaleString()}</span>
            <span>$8K</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            BAH (Monthly)
          </label>
          <input
            type="range"
            min="800"
            max="4000"
            step="50"
            value={inputs.bah}
            onChange={(e) => setInputs({...inputs, bah: parseInt(e.target.value)})}
            className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>$800</span>
            <span className="font-medium">${inputs.bah.toLocaleString()}</span>
            <span>$4K</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            BAS (Monthly)
          </label>
          <input
            type="number"
            min="300"
            max="500"
            value={inputs.bas}
            onChange={(e) => setInputs({...inputs, bas: parseInt(e.target.value)})}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Special Pay (Monthly)
          </label>
          <input
            type="number"
            min="0"
            max="1000"
            value={inputs.specialPay}
            onChange={(e) => setInputs({...inputs, specialPay: parseInt(e.target.value)})}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Housing Payment
          </label>
          <input
            type="range"
            min="800"
            max="3500"
            step="50"
            value={inputs.housingPayment}
            onChange={(e) => setInputs({...inputs, housingPayment: parseInt(e.target.value)})}
            className="w-full h-2 bg-red-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>$800</span>
            <span className="font-medium">${inputs.housingPayment.toLocaleString()}</span>
            <span>$3.5K</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Car Payment 1
          </label>
          <input
            type="range"
            min="0"
            max="800"
            step="25"
            value={inputs.carPayment1}
            onChange={(e) => setInputs({...inputs, carPayment1: parseInt(e.target.value)})}
            className="w-full h-2 bg-orange-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>$0</span>
            <span className="font-medium">${inputs.carPayment1.toLocaleString()}</span>
            <span>$800</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Car Payment 2
          </label>
          <input
            type="range"
            min="0"
            max="800"
            step="25"
            value={inputs.carPayment2}
            onChange={(e) => setInputs({...inputs, carPayment2: parseInt(e.target.value)})}
            className="w-full h-2 bg-yellow-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>$0</span>
            <span className="font-medium">${inputs.carPayment2.toLocaleString()}</span>
            <span>$800</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Credit Card Payments
          </label>
          <input
            type="range"
            min="0"
            max="500"
            step="25"
            value={inputs.creditCards}
            onChange={(e) => setInputs({...inputs, creditCards: parseInt(e.target.value)})}
            className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>$0</span>
            <span className="font-medium">${inputs.creditCards.toLocaleString()}</span>
            <span>$500</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Student Loans
          </label>
          <input
            type="number"
            min="0"
            max="1000"
            value={inputs.studentLoans}
            onChange={(e) => setInputs({...inputs, studentLoans: parseInt(e.target.value)})}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Personal/Other Loans
          </label>
          <input
            type="number"
            min="0"
            max="1000"
            value={inputs.personalLoans}
            onChange={(e) => setInputs({...inputs, personalLoans: parseInt(e.target.value)})}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Housing Type
          </label>
          <select
            value={inputs.housingType}
            onChange={(e) => setInputs({...inputs, housingType: e.target.value})}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="On-Base">On-Base Housing</option>
            <option value="Off-Base">Off-Base Housing</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Other Income
          </label>
          <input
            type="number"
            min="0"
            max="2000"
            value={inputs.otherIncome}
            onChange={(e) => setInputs({...inputs, otherIncome: parseInt(e.target.value)})}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              ${analysis.totalIncome.toLocaleString()}
            </div>
            <div className="text-sm text-blue-700">Total Monthly Income</div>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600 mb-1">
              ${analysis.totalDebts.toLocaleString()}
            </div>
            <div className="text-sm text-red-700">Total Monthly Debts</div>
          </div>
        </div>

        <div className={`border rounded-lg p-4 ${getQualificationColor(analysis.qualificationStatus)}`}>
          <div className="text-center">
            <div className="text-2xl font-bold mb-1">
              {analysis.backEndDTI.toFixed(1)}%
            </div>
            <div className="text-sm">Back-End DTI</div>
          </div>
        </div>

        <div className={`border rounded-lg p-4 ${getQualificationColor(analysis.qualificationStatus)}`}>
          <div className="text-center">
            <div className="text-lg font-bold mb-1">
              {analysis.qualificationStatus}
            </div>
            <div className="text-sm">Loan Qualification</div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Income Breakdown */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
            Income Breakdown
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
                      return `${label}: $${value.toLocaleString()} (${percentage}%)`;
                    }
                  }
                }
              }
            }} />
          </div>
        </div>

        {/* Debt Breakdown */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
            Debt Breakdown
          </h3>
          <div className="h-80">
            <Doughnut data={debtBreakdownData} options={{
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
                      return `${label}: $${value.toLocaleString()} (${percentage}%)`;
                    }
                  }
                }
              }
            }} />
          </div>
        </div>

        {/* DTI Comparison */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
            DTI Analysis
          </h3>
          <div className="h-80">
            <Bar data={dtiComparisonData} options={{
              responsive: true,
              plugins: {
                legend: {
                  display: false,
                },
                tooltip: {
                  callbacks: {
                    label: function(context) {
                      return context.label + ': ' + context.parsed.y.toFixed(1) + '%';
                    }
                  }
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  max: 50,
                  ticks: {
                    callback: function(value) {
                      return value + '%';
                    }
                  }
                }
              }
            }} />
          </div>
        </div>
      </div>

      {/* DTI Breakdown Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Front-End DTI */}
        <div className="bg-green-50 rounded-xl p-6 border border-green-200">
          <h3 className="text-xl font-bold text-green-800 mb-4">🏠 Front-End DTI (Housing Only)</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-green-700">Housing Payment:</span>
              <span className="font-semibold text-green-800">
                ${inputs.housingPayment.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-700">Total Income:</span>
              <span className="font-semibold text-green-800">
                ${analysis.totalIncome.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between border-t pt-2 font-bold">
              <span className="text-green-700">Front-End DTI:</span>
              <span className={`${analysis.frontEndDTI > 28 ? 'text-red-600' : 'text-green-800'}`}>
                {analysis.frontEndDTI.toFixed(1)}%
              </span>
            </div>
            <div className="text-sm text-green-600 mt-2">
              Target: ≤ 28% • VA Loans: More flexible
            </div>
          </div>
        </div>

        {/* Back-End DTI */}
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <h3 className="text-xl font-bold text-blue-800 mb-4">📊 Back-End DTI (All Debts)</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-blue-700">Total Debts:</span>
              <span className="font-semibold text-blue-800">
                ${analysis.totalDebts.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Total Income:</span>
              <span className="font-semibold text-blue-800">
                ${analysis.totalIncome.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between border-t pt-2 font-bold">
              <span className="text-blue-700">Back-End DTI:</span>
              <span className={`${analysis.backEndDTI > 41 ? 'text-red-600' : analysis.backEndDTI > 36 ? 'text-yellow-600' : 'text-blue-800'}`}>
                {analysis.backEndDTI.toFixed(1)}%
              </span>
            </div>
            <div className="text-sm text-blue-600 mt-2">
              VA Loan Limit: ≤ 41% • Conventional: ≤ 43%
            </div>
          </div>
        </div>
      </div>

      {/* BAH Optimization */}
      <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200 mb-8">
        <h3 className="text-xl font-bold text-yellow-800 mb-4">💰 BAH Optimization Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600 mb-2">
              ${inputs.bah.toLocaleString()}
            </div>
            <div className="text-sm text-yellow-700 font-medium mb-1">Monthly BAH</div>
            <div className="text-xs text-yellow-600">
              Current entitlement amount
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600 mb-2">
              ${inputs.bah - inputs.housingPayment >= 0 ? '+' : ''}${(inputs.bah - inputs.housingPayment).toLocaleString()}
            </div>
            <div className="text-sm text-yellow-700 font-medium mb-1">BAH Difference</div>
            <div className="text-xs text-yellow-600">
              {inputs.bah > inputs.housingPayment ? 'Money saved monthly' : 'Over BAH spending'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600 mb-2">
              ${Math.round(analysis.maxHousingPayment).toLocaleString()}
            </div>
            <div className="text-sm text-yellow-700 font-medium mb-1">Max Housing (28%)</div>
            <div className="text-xs text-yellow-600">
              Maximum recommended payment
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {analysis.recommendations.length > 0 && (
        <div className="bg-purple-50 rounded-xl p-6 border border-purple-200 mb-8">
          <h3 className="text-xl font-bold text-purple-800 mb-4">💡 Personalized Recommendations</h3>
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
          📈 Military Finance Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="text-lg font-semibold text-blue-600 mb-2">Additional Debt Capacity</div>
            <div className="text-2xl font-bold text-gray-800 mb-1">
              ${Math.round(Math.max(0, analysis.additionalDebtCapacity)).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">
              {analysis.additionalDebtCapacity > 0 ? 'Available for new loans' : 'At debt capacity limit'}
            </div>
          </div>
          <div>
            <div className="text-lg font-semibold text-purple-600 mb-2">Qualification Status</div>
            <div className="text-2xl font-bold text-gray-800 mb-1">
              {analysis.qualificationStatus}
            </div>
            <div className="text-sm text-gray-600">
              For VA/conventional loans
            </div>
          </div>
          <div>
            <div className="text-lg font-semibold text-green-600 mb-2">BAH Efficiency</div>
            <div className="text-2xl font-bold text-gray-800 mb-1">
              {((inputs.housingPayment / inputs.bah) * 100).toFixed(0)}%
            </div>
            <div className="text-sm text-gray-600">
              {inputs.housingPayment <= inputs.bah ? 'Within BAH limit' : 'Exceeds BAH'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DTIBAHCalculator;