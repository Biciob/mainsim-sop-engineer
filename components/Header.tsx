import React from 'react';
import { Bot, Menu } from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 no-print">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={onMenuClick}
              className="p-2 -ml-2 mr-2 md:hidden text-[#3f4142] hover:bg-[#f7f7f7] rounded-md focus:outline-none"
            >
              <Menu size={24} />
            </button>
            <div className="flex-shrink-0 flex items-center">
              <div className="bg-[#3f4142] p-2 rounded-lg mr-3">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#3f4142] leading-none">SOP Engineer</h1>
                <p className="text-xs text-gray-500 mt-1">AI-Powered Procedure generator by mainsim</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
             <a href="https://mainsim.com" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-[#3f4142] hover:text-blue-600 transition-colors">
                visita: mainsim.com
             </a>
          </div>
        </div>
      </div>
    </header>
  );
};