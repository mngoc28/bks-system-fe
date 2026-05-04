import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Building2, ShoppingBag, Wrench, Newspaper, Zap, AirVent, Wallet, FileText, Calendar, MessageSquare, BarChart3, Bell } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ROUTERS } from '@/constant';

const Sidebar: React.FC = () => {
  const { t } = useTranslation();
  
  const menuItems = [
    { name: t('menu.header_general'), isHeader: true },
    { name: t('menu.dashboard'), path: '/partner/dashboard', icon: LayoutDashboard },
    { name: t('menu.notifications'), path: ROUTERS.PARTNER_NOTIFICATIONS, icon: Bell },
    { name: t('menu.news'), path: '/partner/news', icon: Newspaper },
    
    { name: t('menu.header_property'), isHeader: true },
    { name: t('menu.properties'), path: '/partner/properties', icon: Building2 },
    { name: 'Lịch khả dụng', path: '/partner/calendar', icon: Calendar },
    { name: t('menu.bookings'), path: '/partner/bookings', icon: ShoppingBag },
    { name: 'Yêu cầu dịch vụ', path: '/partner/stay-services', icon: Zap },
    { name: 'Tin nhắn', path: '/partner/chat', icon: MessageSquare },
    { name: 'Hợp đồng', path: '/partner/contracts', icon: FileText },
    
    { name: t('menu.header_services'), isHeader: true },
    { name: t('menu.service'), path: '/partner/services', icon: Zap },
    { name: t('menu.amenities'), path: '/partner/amenities', icon: AirVent },

    
    { name: t('menu.header_system'), isHeader: true },
    { name: 'Tài chính', path: '/partner/finance', icon: Wallet },
    { name: 'Báo cáo & Phân tích', path: '/partner/reports', icon: BarChart3 },
    { name: t('menu.maintenances'), path: '/partner/maintenances', icon: Wrench },
  ];

  return (
    <div className="z-20 flex h-full w-72 flex-col border-r border-slate-800 bg-[#0f172a] text-slate-100 shadow-2xl">
      <div className="flex items-center gap-4 border-b border-white/[0.03] bg-slate-900/40 p-7 backdrop-blur-xl">
        <div className="group relative">
          <div className="absolute -inset-1 rounded-2xl bg-blue-500/20 opacity-0 blur transition duration-500 group-hover:opacity-100"></div>
          <div className="relative flex size-11 items-center justify-center transition-transform duration-500 group-hover:scale-105">
            <img 
              src="/app/images/front/bks-icon.svg" 
              alt="BKS" 
              className="size-11 object-contain drop-shadow-[0_0_8px_rgba(59,130,246,0.3)]" 
            />
          </div>
        </div>
        <div className="flex flex-col">
          <h1 className="mb-0.5 text-[11px] font-bold uppercase tracking-[0.25em] text-blue-400">
            PARTNER
          </h1>
          <h1 className="text-sm font-black uppercase tracking-tight text-white/90">
            PORTAL
          </h1>
          <div className="mt-1 h-0.5 w-6 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
        </div>
      </div>

      <nav className="scrollbar-hide flex-1 overflow-y-auto p-4">
        <ul className="space-y-1">
          {menuItems.map((item, index) => {
            if (item.isHeader) {
              return (
                <li key={`header-${index}`} className="px-4 pb-2 pt-6 first:pt-0">
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
                  
                  <div className="absolute inset-y-0 right-0 w-1 translate-x-full bg-blue-500 transition-transform duration-300 group-active:translate-x-0" />
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
