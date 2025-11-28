import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <img 
              src="https://so-semesta.vercel.app/icon.png" 
              alt="SOS Logo" 
              className="h-10 w-10 object-contain"
            />
            <div>
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                SOS Poster Meta Data Extractor
                </h1>
                <p className="text-xs text-gray-500">Powered by Gemini 2.5</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;