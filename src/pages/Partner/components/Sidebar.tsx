import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Building2, ShoppingBag, Wrench, PieChart } from 'lucide-react';

const Sidebar: React.FC = () => {
  const menuItems = [
    { name: 'Tổng quan', path: '/partner/dashboard', icon: LayoutDashboard },
    { name: 'Quản lý Tài sản', path: '/partner/properties', icon: Building2 },
    { name: 'Quản lý Đặt phòng', path: '/partner/bookings', icon: ShoppingBag },
    { name: 'Quản lý Bảo trì', path: '/partner/maintenances', icon: Wrench },
    { name: 'Quản lý Tài chính', path: '/partner/finance', icon: PieChart },
  ];

  return (
    <div className="w-64 h-full bg-slate-900 text-slate-100 flex flex-col shadow-lg">
      <div className="p-6 text-2xl font-bold border-b border-slate-800 flex items-center gap-2">
        <Building2 className="text-blue-500" />
        <span className="text-white">Partner Portal</span>
      </div>
      <nav className="flex-1 py-4">
        <ul className="space-y-1 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                      isActive ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-300'
                    }`
                  }
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.name}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="p-4 border-t border-slate-800 text-sm text-slate-500 text-center">
        © 2026 BKS Platform
      </div>
    </div>
  );
};

export default Sidebar;
