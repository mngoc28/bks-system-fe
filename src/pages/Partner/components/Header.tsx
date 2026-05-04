import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Search, Globe, User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '@/store/useUserStore';
import { ROUTERS } from '@/constant';
import { Button } from '@/components/ui/button';
import NotificationBell from '@/components/layout/NotificationBell';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const userEmail = useUserStore((state) => state.userEmail);
  const logout = useUserStore((state) => state.logout);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate(ROUTERS.PARTNER_LOGIN);
  };

  return (
    <>
      <header className="sticky top-0 z-10 flex h-20 items-center justify-between border-b border-slate-200 bg-white/80 px-8 shadow-sm backdrop-blur-md">
        {/* Search Bar - More premium look */}
        <div className="flex w-96 items-center rounded-xl border border-slate-200 bg-slate-100/80 px-4 py-2.5 transition-all focus-within:border-blue-500/50 focus-within:ring-2 focus-within:ring-blue-500/20">
          <Search className="mr-2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Tìm tìm kiếm mọi thứ..." 
            className="w-full border-none bg-transparent text-sm text-slate-600 outline-none placeholder:text-slate-400"
          />
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <button className="flex size-10 items-center justify-center rounded-xl text-slate-500 transition-all duration-300 hover:bg-blue-50 hover:text-blue-600">
              <Globe size={20} />
            </button>
            
            <NotificationBell portalType="partner" />
          </div>
          
          <div className="flex items-center gap-4 border-l border-slate-200 pl-6">
            <div className="hidden text-right md:block">
              <p className="text-sm font-bold leading-none text-slate-900">{userEmail.split('@')[0] || "Partner"}</p>
              <div className="mt-1 inline-flex items-center rounded-md border border-blue-100 bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-700">
                Đối tác BKS
              </div>
            </div>
            
            <div className="rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-0.5 shadow-lg shadow-blue-500/20">
              <div className="flex size-10 items-center justify-center rounded-[10px] bg-white text-blue-600">
                <User size={20} className="stroke-[2.5px]" />
              </div>
            </div>
            
            <button 
              onClick={() => setIsLogoutDialogOpen(true)}
              title="Đăng xuất"
              className="flex size-11 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-400 shadow-sm transition-all duration-300 hover:border-rose-100 hover:bg-rose-50 hover:text-rose-600"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {isLogoutDialogOpen ? createPortal(
        <div className="fixed inset-0 z-40 flex items-start justify-end bg-slate-900/20 p-6">
          <div className="mt-20 w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">Đăng xuất tài khoản?</h3>
            <p className="mt-1 text-sm text-slate-500">
              Bạn có chắc chắn muốn kết thúc phiên làm việc của mình trên cổng đối tác BKS?
            </p>
            <div className="mt-4 flex items-center justify-end gap-2">
              <Button variant="outline" onClick={() => setIsLogoutDialogOpen(false)}>Hủy</Button>
              <Button variant="destructive" onClick={handleLogout}>Đăng xuất</Button>
            </div>
          </div>
        </div>,
        document.body,
      ) : null}
    </>
  );
};

export default Header;
