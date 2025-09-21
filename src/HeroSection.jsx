import React from 'react';

const HeroSection = ({ onCalculatorSelect, selectedCalculator }) => {
  const calculators = [
    { 
      id: 'pcs-deduction', 
      name: 'PCS Deduction', 
      icon: '🎖️', 
      description: 'Tax deduction analysis for PCS moves and military relocations'
    },
    { 
      id: 'mortgage', 
      name: 'VA Mortgage', 
      icon: '🏠', 
      description: 'Calculate VA loan payments with zero down payment benefits'
    },
    { 
      id: 'rent', 
      name: 'Rent Analysis', 
      icon: '🏢', 
      description: 'Military rental cost analysis with BAH optimization'
    },
    { 
      id: 'buyvsrent', 
      name: 'Buy vs Rent', 
      icon: '⚖️', 
      description: 'PCS move decisions: Buy vs rent financial calculator'
    },
    { 
      id: 'bah', 
      name: 'BAH Calculator', 
      icon: '💰', 
      description: 'Basic Allowance for Housing optimization tool'
    },
    { 
      id: 'property-tax', 
      name: 'Property Tax', 
      icon: '📊', 
      description: 'Military property tax calculator with exemptions'
    },
  ];

  return (
    <section className="bg-gradient-to-br from-gray-50 to-blue-50 py-8" role="main">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Compact Hero Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Military Financial Calculators
            <span className="text-blue-600 block text-lg font-normal mt-1">
              by MustWants & MilitaryGrad
            </span>
          </h1>
          <p className="text-lg text-gray-600 mb-4 max-w-2xl mx-auto">
            SDVOSB certified tools for PCS moves, VA loans, and military housing decisions.
          </p>
        </div>

        {/* Calculator Selection - Above the Fold */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-center text-gray-800 mb-4">
            Choose Your Calculator:
          </h2>
        </div>

        {/* Calculator Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4" role="tablist">
          {calculators.map((calc, index) => (
            <div
              key={calc.id}
              onClick={() => onCalculatorSelect(index)}
              className={`cursor-pointer group relative overflow-hidden rounded-lg p-4 transition-all duration-300 ${
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
              <div className="text-center">
                <div className={`text-3xl mb-2 ${selectedCalculator === index ? 'text-white' : 'text-blue-600'}`}>
                  {calc.icon}
                </div>
                <h3 className="font-semibold text-sm mb-1">{calc.name}</h3>
                <p className={`text-xs ${selectedCalculator === index ? 'text-blue-100' : 'text-gray-600'}`}>
                  {calc.description}
                </p>
              </div>

              {/* Active Indicator */}
              {selectedCalculator === index && (
                <div className="absolute top-2 right-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" aria-label="Active calculator"></div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Trust Indicators - Compact */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs">
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