import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Building2, ShoppingBag, Wrench, Newspaper, Zap, Wallet, FileText, Calendar, MessageSquare, BarChart3, Bell, ClipboardList, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ROUTERS } from '@/constant';

const Sidebar: React.FC = () => {
  const { t } = useTranslation();
  const [isCollapsed, setIsCollapsed] = React.useState(() => {
    return localStorage.getItem('partner-sidebar-collapsed') === 'true';
  });

  const handleToggleCollapse = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('partner-sidebar-collapsed', String(next));
      return next;
    });
  };

  const menuItems = [
    { name: 'VẬN HÀNH', isHeader: true },
    { name: t('menu.dashboard'), path: '/partner/dashboard', icon: LayoutDashboard },
    { name: 'Lịch khả dụng', path: '/partner/calendar', icon: Calendar },
    { name: t('menu.bookings'), path: '/partner/bookings', icon: ShoppingBag },
    { name: 'Yêu cầu hủy đặt phòng', path: ROUTERS.PARTNER_CANCELLATION_REQUESTS, icon: ClipboardList },

    { name: 'TÀI SẢN', isHeader: true },
    { name: t('menu.properties'), path: '/partner/properties', icon: Building2 },
    { name: 'Dịch vụ & Tiện ích', path: '/partner/services', icon: Zap },
    { name: 'Hợp đồng', path: '/partner/contracts', icon: FileText },

    { name: 'KHÁCH HÀNG', isHeader: true },
    { name: 'Tin nhắn', path: '/partner/chat', icon: MessageSquare },
    { name: 'Yêu cầu dịch vụ', path: '/partner/stay-services', icon: Zap },
    { name: t('menu.notifications'), path: ROUTERS.PARTNER_NOTIFICATIONS, icon: Bell },

    { name: 'HỆ THỐNG', isHeader: true },
    { name: 'Tài chính', path: '/partner/finance', icon: Wallet },
    { name: 'Báo cáo & Phân tích', path: '/partner/reports', icon: BarChart3 },
    { name: t('menu.news'), path: '/partner/news', icon: Newspaper },
    { name: t('menu.maintenances'), path: '/partner/maintenances', icon: Wrench },
  ];

  return (
    <div className={`z-20 flex h-full flex-col border-r border-slate-800 bg-[#0f172a] text-slate-100 shadow-2xl transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div className={`flex border-b border-white/[0.03] bg-slate-900/40 p-5 backdrop-blur-xl transition-all duration-300 ${isCollapsed ? 'flex-col items-center gap-4' : 'items-center justify-between'}`}>
        <div className="group relative shrink-0">
          <div className="absolute -inset-1 rounded-2xl bg-blue-500/20 opacity-0 blur transition duration-500 group-hover:opacity-100"></div>
          <div className="relative flex size-10 items-center justify-center transition-transform duration-500 group-hover:scale-105">
            <img
              src="/app/images/front/bks-icon.svg"
              alt="BKS"
              className="size-10 object-contain drop-shadow-[0_0_8px_rgba(59,130,246,0.3)]"
            />
          </div>
        </div>

        {!isCollapsed && (
          <div className="flex flex-1 flex-col pl-3 animate-in fade-in duration-300 overflow-hidden">
            <h1 className="mb-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-blue-400">
              PARTNER
            </h1>
            <h1 className="text-xs font-black uppercase tracking-tight text-white/90">
              PORTAL
            </h1>
          </div>
        )}

        {/* Toggle Button - Now integrated inside Sidebar */}
        <button
          onClick={handleToggleCollapse}
          className={`flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 bg-white/5 text-slate-400 transition-all hover:bg-white/10 hover:text-white ${isCollapsed ? '' : 'ml-2'}`}
          title={isCollapsed ? "Mở rộng" : "Thu gọn"}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <nav className={`flex-1 p-4 ${isCollapsed ? 'overflow-visible' : 'scrollbar-hide overflow-y-auto'}`}>
        <ul className="space-y-1">
          {menuItems.map((item, index) => {
            if (item.isHeader) {
              return (
                <li key={`header-${index}`} className={`px-4 pb-2 pt-6 first:pt-0 ${isCollapsed ? 'hidden' : ''}`}>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 opacity-70">
                    {item.name}
                  </span>
                </li>
              );
            }

            const Icon = item.icon!;
            return (
              <li key={item.path} className="relative group/sidebar-item">
                <NavLink
                  to={item.path!}
                  className={({ isActive }) =>
                    `group flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 relative overflow-hidden ${isActive
                      ? 'text-white font-bold bg-gradient-to-r from-blue-600/20 to-transparent border-l-4 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                      : 'text-slate-400 hover:text-white hover:bg-white/5 border-l-4 border-transparent'
                    }`
                  }
                >
                  <Icon
                    size={18}
                    className={`transition-colors duration-300 group-hover:scale-110 shrink-0 ${isCollapsed ? 'mx-auto' : ''}`}
                  />
                  {!isCollapsed && <span className="text-[14px] tracking-wide animate-in fade-in duration-500">{item.name}</span>}

                  <div className="absolute inset-y-0 right-0 w-1 translate-x-full bg-blue-500 transition-transform duration-300 group-active:translate-x-0" />
                </NavLink>

                {isCollapsed && (
                  <div className="pointer-events-none absolute left-full top-1/2 ml-3 -translate-y-1/2 scale-90 rounded-lg bg-slate-950 px-3 py-1.5 text-xs font-bold text-white shadow-2xl opacity-0 transition-all duration-200 group-hover/sidebar-item:opacity-100 group-hover/sidebar-item:scale-100 whitespace-nowrap z-[9999] border border-slate-800">
                    {item.name}
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-y-transparent border-l-transparent border-r-slate-950" />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

    </div>
  );
};

export default Sidebar;

