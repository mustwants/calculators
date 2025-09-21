import React from 'react';

const Header = () => {
  return (
    <header className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <span className="text-blue-900 font-bold text-lg" aria-label="VetMover Logo">V</span>
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold">
                VetMover
                <span className="text-blue-200 text-xs ml-2">by MustWants</span>
              </h1>
              <p className="text-blue-200 text-xs">Military Real Estate & VA Loan Calculators</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-6" role="navigation" aria-label="Main navigation">
            <a href="#calculators" className="text-blue-100 hover:text-white transition-colors duration-200">
              Calculators
            </a>
            <a href="#resources" className="text-blue-100 hover:text-white transition-colors duration-200">
              Resources
            </a>
            <a href="https://mustwants.com/about" target="_blank" rel="noopener noreferrer" className="text-blue-100 hover:text-white transition-colors duration-200">
              About MustWants
            </a>
            <a 
              href="https://militarygrad.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors duration-200"
              aria-label="Visit MilitaryGrad website"
            >
              MilitaryGrad
            </a>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="text-blue-100 hover:text-white" aria-label="Open mobile menu">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Military Service Banner */}
      <div className="bg-blue-950 border-t border-blue-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex items-center justify-center space-x-6 text-sm text-blue-200">
            <span className="flex items-center space-x-1">
              <span role="img" aria-label="US Flag">🇺🇸</span>
              <span>SDVOSB Certified • Veteran Owned • Serving Military Families</span>
            </span>
            <span className="hidden sm:block">|</span>
            <span className="hidden sm:flex items-center space-x-1">
              <span role="img" aria-label="House">🏠</span>
              <span>PCS Moves • BAH Analysis • VA Loans • Military Real Estate</span>
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;