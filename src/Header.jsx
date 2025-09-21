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
                <span className="text-blue-900 font-bold text-lg">V</span>
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold">VetMover</h1>
              <p className="text-blue-200 text-xs">Military Real Estate Calculators</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#calculators" className="text-blue-100 hover:text-white transition-colors duration-200">
              Calculators
            </a>
            <a href="#resources" className="text-blue-100 hover:text-white transition-colors duration-200">
              Resources
            </a>
            <a href="#about" className="text-blue-100 hover:text-white transition-colors duration-200">
              About
            </a>
            <a 
              href="https://militarygrad.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors duration-200"
            >
              MilitaryGrad
            </a>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="text-blue-100 hover:text-white">
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
              <span>🇺🇸</span>
              <span>Proudly Supporting Our Military Community</span>
            </span>
            <span className="hidden sm:block">|</span>
            <span className="hidden sm:flex items-center space-x-1">
              <span>🏠</span>
              <span>PCS • BAH • VA Loans • Real Estate</span>
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;