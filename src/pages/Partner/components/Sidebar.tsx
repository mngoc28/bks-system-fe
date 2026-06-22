import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  DoorOpen,
  ShoppingBag,
  Wrench,
  Newspaper,
  Zap,
  Wallet,
  FileText,
  Calendar,
  MessageSquare,
  BarChart3,
  Bell,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ROUTERS } from '@/constant';
import { isPartnerSidebarItemEnabled } from '@/lib/featureFlags';

type SidebarMenuItem =
  | { name: string; isHeader: true }
  | { name: string; path: string; icon: LucideIcon };

const isSidebarHeader = (item: SidebarMenuItem): item is { name: string; isHeader: true } =>
  'isHeader' in item && item.isHeader === true;

const pruneSidebarMenuItems = (items: SidebarMenuItem[]): SidebarMenuItem[] => {
  const withoutDisabled = items.filter(
    (item) => isSidebarHeader(item) || isPartnerSidebarItemEnabled(item.path),
  );

  const pruned: SidebarMenuItem[] = [];
  for (let i = 0; i < withoutDisabled.length; i += 1) {
    const item = withoutDisabled[i];
    if (!isSidebarHeader(item)) {
      pruned.push(item);
      continue;
    }
    const hasVisibleChild = withoutDisabled.slice(i + 1).some((next) => !isSidebarHeader(next));
    if (hasVisibleChild) {
      pruned.push(item);
    }
  }
  return pruned;
};

type SidebarProps = {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
};

const Sidebar: React.FC<SidebarProps> = ({ mobileOpen = false, onCloseMobile }) => {
  const { t } = useTranslation();
  const [isCollapsed, setIsCollapsed] = React.useState(() => {
    return localStorage.getItem('partner-sidebar-collapsed') === 'true';
  });

  React.useEffect(() => {
    if (!mobileOpen) {
      return;
    }
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const handleToggleCollapse = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('partner-sidebar-collapsed', String(next));
      return next;
    });
  };

  // Nhóm menu theo luồng release: vận hành hàng ngày → tài sản → tài chính.
  // Mục disabled vẫn khai báo ở cuối từng nhóm để bật lại qua featureFlags.
  const menuItems = pruneSidebarMenuItems([
    { name: 'VẬN HÀNH', isHeader: true },
    { name: t('menu.dashboard'), path: '/partner/dashboard', icon: LayoutDashboard },
    { name: t('menu.bookings'), path: '/partner/bookings', icon: ShoppingBag },
    { name: 'Lịch khả dụng', path: '/partner/calendar', icon: Calendar },
    { name: 'Yêu cầu hủy', path: ROUTERS.PARTNER_CANCELLATION_REQUESTS, icon: ClipboardList },
    { name: t('menu.notifications'), path: ROUTERS.PARTNER_NOTIFICATIONS, icon: Bell },
    { name: 'Tin nhắn', path: '/partner/chat', icon: MessageSquare },
    { name: 'Yêu cầu dịch vụ', path: '/partner/stay-services', icon: Zap },

    { name: 'TÀI SẢN', isHeader: true },
    { name: 'Phòng & Đơn vị', path: '/partner/units', icon: DoorOpen },
    { name: t('menu.properties'), path: '/partner/properties', icon: Building2 },
    { name: 'Dịch vụ & Tiện ích', path: ROUTERS.PARTNER_CATALOG, icon: Zap },
    { name: 'Hợp đồng', path: '/partner/contracts', icon: FileText },
    { name: t('menu.maintenances'), path: '/partner/maintenances', icon: Wrench },

    { name: 'TÀI CHÍNH', isHeader: true },
    { name: 'Tài chính', path: '/partner/finance', icon: Wallet },
    { name: 'Báo cáo & Phân tích', path: '/partner/reports', icon: BarChart3 },
    { name: t('menu.news'), path: '/partner/news', icon: Newspaper },
  ]);

  const renderMenuContent = (collapsed: boolean, onNavigate?: () => void) => (
    <>
      <div className={`flex border-b border-white/[0.03] bg-slate-900/40 p-5 backdrop-blur-xl transition-all duration-300 ${collapsed ? 'flex-col items-center gap-4' : 'items-center justify-between'}`}>
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

        {!collapsed && (
          <div className="flex flex-1 flex-col overflow-hidden pl-3 animate-in fade-in duration-300">
            <h1 className="mb-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-blue-400">
              PARTNER
            </h1>
            <h1 className="text-xs font-black uppercase tracking-tight text-white/90">
              PORTAL
            </h1>
          </div>
        )}

        {onNavigate ? (
          <button
            onClick={onNavigate}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 bg-white/5 text-slate-300 transition-all hover:bg-white/10 hover:text-white md:hidden"
            title="Đóng menu"
            aria-label="Đóng menu"
          >
            <X size={16} />
          </button>
        ) : (
          <button
            onClick={handleToggleCollapse}
            className={`flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 bg-white/5 text-slate-400 transition-all hover:bg-white/10 hover:text-white ${collapsed ? '' : 'ml-2'}`}
            title={collapsed ? "Mở rộng" : "Thu gọn"}
            aria-label={collapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        )}
      </div>

      <nav className={`flex-1 p-4 ${collapsed ? 'overflow-visible' : 'scrollbar-hide overflow-y-auto'}`}>
        <ul className="space-y-1">
          {menuItems.map((item, index) => {
            if (isSidebarHeader(item)) {
              return (
                <li key={`header-${index}`} className={`px-4 pb-2 pt-6 first:pt-0 ${collapsed ? 'hidden' : ''}`}>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 opacity-70">
                    {item.name}
                  </span>
                </li>
              );
            }

            const Icon = item.icon;
            return (
              <li key={item.path} className="relative group/sidebar-item">
                <NavLink
                  to={item.path}
                  onClick={onNavigate}
                  end={item.path === ROUTERS.PARTNER_CATALOG ? false : true}
                  className={({ isActive }) =>
                    `group relative flex items-center gap-4 overflow-hidden rounded-xl px-4 py-3 transition-all duration-300 ${isActive
                      ? 'border-l-4 border-blue-500 bg-gradient-to-r from-blue-600/20 to-transparent font-bold text-white shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                      : 'border-l-4 border-transparent text-slate-400 hover:bg-white/5 hover:text-white'
                    }`
                  }
                >
                  <Icon
                    size={18}
                    className={`shrink-0 transition-colors duration-300 group-hover:scale-110 ${collapsed ? 'mx-auto' : ''}`}
                  />
                  {!collapsed && <span className="text-[14px] tracking-wide animate-in fade-in duration-500">{item.name}</span>}

                  <div className="absolute inset-y-0 right-0 w-1 translate-x-full bg-blue-500 transition-transform duration-300 group-active:translate-x-0" />
                </NavLink>

                {collapsed && (
                  <div className="pointer-events-none absolute left-full top-1/2 z-[9999] ml-3 -translate-y-1/2 scale-90 whitespace-nowrap rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs font-bold text-white opacity-0 shadow-2xl transition-all duration-200 group-hover/sidebar-item:scale-100 group-hover/sidebar-item:opacity-100">
                    {item.name}
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-y-transparent border-l-transparent border-r-slate-950" />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );

  return (
    <>
      <div
        className={`z-20 hidden h-screen shrink-0 flex-col border-r border-slate-800 bg-[#0f172a] text-slate-100 shadow-2xl transition-all duration-300 md:flex ${isCollapsed ? 'w-20' : 'w-64'}`}
      >
        {renderMenuContent(isCollapsed)}
      </div>

      <div
        className={`fixed inset-0 z-40 md:hidden ${mobileOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
        aria-hidden={!mobileOpen}
      >
        <div
          className={`absolute inset-0 bg-slate-900/55 transition-opacity ${mobileOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={onCloseMobile}
        />
        <aside
          className={`absolute inset-y-0 left-0 flex w-[86vw] max-w-[320px] flex-col border-r border-slate-800 bg-[#0f172a] text-slate-100 shadow-2xl transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          {renderMenuContent(false, onCloseMobile)}
        </aside>
      </div>
    </>
  );
};

export default Sidebar;

