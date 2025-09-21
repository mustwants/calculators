import React from 'react';

const HeroSection = ({ onCalculatorSelect, selectedCalculator }) => {
  const calculators = [
    { 
      id: 'mortgage', 
      name: 'VA Mortgage', 
      icon: '🏠', 
      description: 'Calculate VA loan payments with zero down payment benefits',
      benefits: ['No down payment', 'No PMI required', 'MustWants certified']
    },
    { 
      id: 'rent', 
      name: 'Rent Analysis', 
      icon: '🏢', 
      description: 'Military rental cost analysis with BAH optimization',
      benefits: ['PCS flexibility', 'BAH comparison', 'Market trends']
    },
    { 
      id: 'buyvsrent', 
      name: 'Buy vs Rent', 
      icon: '⚖️', 
      description: 'PCS move decisions: Buy vs rent financial calculator',
      benefits: ['PCS timeline', 'Market analysis', 'MilitaryGrad data']
    },
    { 
      id: 'bah', 
      name: 'BAH Calculator', 
      icon: '🎖️', 
      description: 'Basic Allowance for Housing optimization tool',
      benefits: ['Duty station rates', 'Dependent status', 'Housing decisions']
    },
    { 
      id: 'property-tax', 
      name: 'Property Tax', 
      icon: '📊', 
      description: 'Military property tax calculator with exemptions',
      benefits: ['State comparisons', 'Veteran exemptions', 'PCS planning']
    },
  ];

  return (
    <section className="bg-gradient-to-br from-gray-50 to-blue-50 py-12" role="main">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Content */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Military Real Estate
            <span className="text-blue-600 block">Financial Calculators</span>
            <span className="text-lg font-normal text-gray-600 block mt-2">
              by MustWants & MilitaryGrad
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-6 max-w-3xl mx-auto">
            Make informed housing decisions during PCS moves, deployments, and military life transitions. 
            SDVOSB certified tools built specifically for active duty, veterans, and military families.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-500 mb-4">
            <span className="flex items-center space-x-1 bg-white px-3 py-1 rounded-full shadow-sm">
              <span role="img" aria-label="checkmark">✅</span>
              <span>VA Loan Optimized</span>
            </span>
            <span className="flex items-center space-x-1 bg-white px-3 py-1 rounded-full shadow-sm">
              <span role="img" aria-label="checkmark">✅</span>
              <span>BAH Integrated</span>
            </span>
            <span className="flex items-center space-x-1 bg-white px-3 py-1 rounded-full shadow-sm">
              <span role="img" aria-label="checkmark">✅</span>
              <span>PCS Ready</span>
            </span>
            <span className="flex items-center space-x-1 bg-white px-3 py-1 rounded-full shadow-sm">
              <span role="img" aria-label="checkmark">✅</span>
              <span>SDVOSB Certified</span>
            </span>
          </div>
          <div className="text-sm text-gray-500">
            Serving military families with trusted financial planning tools since 2025
          </div>
        </div>

        {/* Calculator Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6" role="tablist">
          {calculators.map((calc, index) => (
            <div
              key={calc.id}
              onClick={() => onCalculatorSelect(index)}
              className={`cursor-pointer group relative overflow-hidden rounded-xl p-6 transition-all duration-300 ${
                selectedCalculator === index
                  ? 'bg-blue-600 text-white shadow-xl scale-105'
                  : 'bg-white hover:bg-blue-50 hover:shadow-lg hover:scale-102 text-gray-900'
              }`}
              role="tab"
              aria-selected={selectedCalculator === index}
              tabIndex="0"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onCalculatorSelect(index);
                }
              }}
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
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse" aria-label="Active calculator"></div>
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

        {/* Trust Indicators */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs text-gray-500">
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
            🏆 SDVOSB Certified
          </span>
          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
            🇺🇸 Veteran Owned
          </span>
          <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
            📌 MustWants Partner
          </span>
          <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full">
            🎓 MilitaryGrad Verified
          </span>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;