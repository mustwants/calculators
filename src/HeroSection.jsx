import React from 'react';

const HeroSection = ({ onCalculatorSelect, selectedCalculator }) => {
  const calculators = [
    { 
      id: 'mortgage', 
      name: 'VA Mortgage', 
      icon: '🏠', 
      description: 'Calculate mortgage payments with VA loan benefits',
      benefits: ['No down payment', 'No PMI', 'Competitive rates']
    },
    { 
      id: 'rent', 
      name: 'Rent Analysis', 
      icon: '🏢', 
      description: 'Analyze rental costs over time with inflation',
      benefits: ['PCS flexibility', 'No maintenance', 'Quick moves']
    },
    { 
      id: 'buyvsrent', 
      name: 'Buy vs Rent', 
      icon: '⚖️', 
      description: 'Compare buying vs renting for your situation',
      benefits: ['PCS considerations', 'Market analysis', 'Financial comparison']
    },
    { 
      id: 'bah', 
      name: 'BAH Calculator', 
      icon: '🎖️', 
      description: 'Optimize your housing allowance decisions',
      benefits: ['Duty station rates', 'With/without dependent', 'Cost analysis']
    },
    { 
      id: 'property-tax', 
      name: 'Property Tax', 
      icon: '📊', 
      description: 'Estimate property taxes by location',
      benefits: ['State comparisons', 'Military exemptions', 'Cost planning']
    },
  ];

  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Content */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Military Real Estate
            <span className="text-blue-600 block">Financial Calculators</span>
          </h1>
          <p className="text-xl text-gray-600 mb-6 max-w-3xl mx-auto">
            Make informed housing decisions during PCS moves, deployments, and military life transitions. 
            Built specifically for service members, veterans, and military families.
          </p>
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
            <span className="flex items-center space-x-1">
              <span>✅</span>
              <span>VA Loan Optimized</span>
            </span>
            <span>•</span>
            <span className="flex items-center space-x-1">
              <span>✅</span>
              <span>BAH Integrated</span>
            </span>
            <span>•</span>
            <span className="flex items-center space-x-1">
              <span>✅</span>
              <span>PCS Ready</span>
            </span>
          </div>
        </div>

        {/* Calculator Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {calculators.map((calc, index) => (
            <div
              key={calc.id}
              onClick={() => onCalculatorSelect(index)}
              className={`cursor-pointer group relative overflow-hidden rounded-xl p-6 transition-all duration-300 ${
                selectedCalculator === index
                  ? 'bg-blue-600 text-white shadow-xl scale-105'
                  : 'bg-white hover:bg-blue-50 hover:shadow-lg hover:scale-102 text-gray-900'
              }`}
            >
              {/* Calculator Icon */}
              <div className="text-center mb-4">
                <div className={`text-4xl mb-2 ${selectedCalculator === index ? 'text-white' : 'text-blue-600'}`}>
                  {calc.icon}
                </div>
                <h3 className="font-semibold text-lg mb-2">{calc.name}</h3>
                <p className={`text-sm ${selectedCalculator === index ? 'text-blue-100' : 'text-gray-600'}`}>
                  {calc.description}
                </p>
              </div>

              {/* Benefits */}
              <div className="space-y-1">
                {calc.benefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-center space-x-2 text-xs">
                    <span className={selectedCalculator === index ? 'text-blue-200' : 'text-green-600'}>✓</span>
                    <span className={selectedCalculator === index ? 'text-blue-100' : 'text-gray-500'}>
                      {benefit}
                    </span>
                  </div>
                ))}
              </div>

              {/* Active Indicator */}
              {selectedCalculator === index && (
                <div className="absolute top-2 right-2">
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">50</div>
            <div className="text-sm text-gray-600">States Supported</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">100%</div>
            <div className="text-sm text-gray-600">Military Focused</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">Free</div>
            <div className="text-sm text-gray-600">Always Free</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">24/7</div>
            <div className="text-sm text-gray-600">Available</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;