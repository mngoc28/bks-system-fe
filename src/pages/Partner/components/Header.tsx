import React from 'react';
import { Bell, Search, Globe, User } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="h-20 bg-white border-b border-gray-200 px-8 flex items-center justify-between shadow-sm sticky top-0 z-10">
      {/* Search Bar */}
      <div className="flex items-center bg-gray-100 px-4 py-2 rounded-full w-96">
        <Search className="text-gray-400 mr-2" size={20} />
        <input 
          type="text" 
          placeholder="Tìm kiếm phòng, giao dịch, người thuê..." 
          className="bg-transparent border-none outline-none text-sm w-full"
        />
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-6">
        <button className="text-gray-600 hover:text-blue-600 transition-colors">
          <Globe size={22} />
        </button>
        
        <button className="text-gray-600 hover:text-blue-600 transition-colors relative">
          <Bell size={22} />
          <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        
        <div className="flex items-center gap-3 border-l pl-6 border-gray-300">
          <div className="text-right hidden md:block">
            <p className="text-sm font-semibold text-gray-800">Nguyễn Trần Host</p>
            <p className="text-xs text-gray-500">Partner / Chủ nhà</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 border border-blue-200 cursor-pointer">
            <User size={20} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
