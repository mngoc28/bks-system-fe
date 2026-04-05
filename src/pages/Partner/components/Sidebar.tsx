import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Building2, ShoppingBag, Wrench, Newspaper, Zap, AirVent } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Sidebar: React.FC = () => {
  const { t } = useTranslation();
  
  const menuItems = [
    { name: t('menu.header_general'), isHeader: true },
    { name: t('menu.dashboard'), path: '/partner/dashboard', icon: LayoutDashboard },
    
    { name: t('menu.header_property'), isHeader: true },
    { name: t('menu.properties'), path: '/partner/properties', icon: Building2 },
    { name: t('menu.bookings'), path: '/partner/bookings', icon: ShoppingBag },
    
    { name: t('menu.header_services'), isHeader: true },
    { name: t('menu.service'), path: '/partner/services', icon: Zap },
    { name: t('menu.amenities'), path: '/partner/amenities', icon: AirVent },
    { name: t('menu.news'), path: '/partner/news', icon: Newspaper },
    { name: t('menu.maintenances'), path: '/partner/maintenances', icon: Wrench },
  ];

  return (
    <div className="w-72 h-full bg-[#0f172a] text-slate-100 flex flex-col shadow-2xl z-20 border-r border-slate-800">
      <div className="p-7 flex items-center gap-4 bg-slate-900/40 backdrop-blur-xl border-b border-white/[0.03]">
        <div className="relative group">
          <div className="absolute -inset-1 rounded-2xl bg-blue-500/20 blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
          <div className="relative w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-2xl backdrop-blur-md transition-transform duration-500 group-hover:scale-105">
            <img 
              src="/app/images/front/bks-icon.svg" 
              alt="BKS" 
              className="w-7 h-7 object-contain drop-shadow-[0_0_8px_rgba(59,130,246,0.3)]" 
            />
          </div>
        </div>
        <div className="flex flex-col">
          <h1 className="text-[11px] font-bold tracking-[0.25em] text-blue-400 mb-0.5 uppercase">
            PARTNER
          </h1>
          <h1 className="text-sm font-black tracking-tight text-white/90 uppercase">
            PORTAL
          </h1>
          <div className="h-0.5 w-6 bg-gradient-to-r from-blue-500 to-blue-600 mt-1 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
        </div>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto px-4 scrollbar-hide">
        <ul className="space-y-1">
          {menuItems.map((item, index) => {
            if (item.isHeader) {
              return (
                <li key={`header-${index}`} className="px-4 pt-6 pb-2 first:pt-0">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 opacity-70">
                    {item.name}
                  </span>
                </li>
              );
            }

            const Icon = item.icon!;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path!}
                  className={({ isActive }) =>
                    `group flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 relative overflow-hidden ${
                      isActive 
                        ? 'text-white font-bold bg-gradient-to-r from-blue-600/20 to-transparent border-l-4 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.1)]' 
                        : 'text-slate-400 hover:text-white hover:bg-white/5 border-l-4 border-transparent'
                    }`
                  }
                >
                  <Icon 
                    size={18} 
                    className={`transition-colors duration-300 group-hover:scale-110`} 
                  />
                  <span className="text-[14px] tracking-wide">{item.name}</span>
                  
                  <div className="absolute inset-y-0 right-0 w-1 bg-blue-500 transform translate-x-full transition-transform duration-300 group-active:translate-x-0" />
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

    </div>
  );
};

export default Sidebar;
