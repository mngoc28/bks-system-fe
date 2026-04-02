import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Building2, ShoppingBag, Wrench, Newspaper, Zap, AirVent } from 'lucide-react';

const Sidebar: React.FC = () => {
  const menuItems = [
    { name: 'Tổng quan', path: '/partner/dashboard', icon: LayoutDashboard },
    { name: 'Quản lý Tài sản', path: '/partner/properties', icon: Building2 },
    { name: 'Quản lý Đặt phòng', path: '/partner/bookings', icon: ShoppingBag },
    { name: 'Quản lý Dịch vụ', path: '/partner/services', icon: Zap },
    { name: 'Quản lý Tiện ích', path: '/partner/amenities', icon: AirVent },
    { name: 'Quản lý Tin tức', path: '/partner/news', icon: Newspaper },
    { name: 'Quản lý Bảo trì', path: '/partner/maintenances', icon: Wrench },
  ];

  return (
    <div className="w-72 h-full bg-[#0f172a] text-slate-100 flex flex-col shadow-2xl z-20 border-r border-slate-800">
      <div className="p-8 flex items-center gap-4 bg-gradient-to-r from-slate-900 to-slate-900/50">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 p-2 border border-white/10">
          <img 
            src="/app/images/front/bks-icon.svg" 
            alt="BKS" 
            className="w-full h-full object-contain" 
          />
        </div>
        <div>
          <h1 className="text-sm font-bold tracking-[0.15em] text-white leading-tight uppercase opacity-90">
            PARTNER PORTAL
          </h1>
          <div className="h-0.5 w-8 bg-blue-500 mt-1.5 rounded-full opacity-60"></div>
        </div>
      </div>

      <nav className="flex-1 py-8 overflow-y-auto px-4 custom-scrollbar">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `group flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 relative overflow-hidden ${
                      isActive 
                        ? 'text-white font-bold bg-gradient-to-r from-blue-600/20 to-transparent border-l-4 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.1)]' 
                        : 'text-slate-400 hover:text-white hover:bg-white/5 border-l-4 border-transparent'
                    }`
                  }
                >
                  <Icon 
                    size={20} 
                    className={`transition-colors duration-300 group-hover:scale-110`} 
                  />
                  <span className="text-[15px] tracking-wide">{item.name}</span>
                  
                  <div className="absolute inset-y-0 right-0 w-1 bg-blue-500 transform translate-x-full transition-transform duration-300 group-active:translate-x-0" />
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-6 mt-auto">
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden">
            <div className="w-full h-full bg-gradient-to-tr from-blue-600 to-violet-600 opacity-80" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">BKS Platform</p>
            <p className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-tighter">Powered by DeepMind</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
