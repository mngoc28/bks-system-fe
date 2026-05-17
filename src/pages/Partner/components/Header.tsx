import { Search, Globe, User, LogOut, UserCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '@/store/useUserStore';
import { ROUTERS } from '@/constant';
import NotificationBell from '@/components/layout/NotificationBell';
import { usePartnerProfileQuery } from '@/hooks/usePartnerQuery';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const userEmail = useUserStore((state) => state.userEmail);
  const logout = useUserStore((state) => state.logout);

  const { data: partnerResponse } = usePartnerProfileQuery();
  const companyName = partnerResponse?.data?.company_name;

  const handleLogout = () => {
    logout();
    navigate(ROUTERS.PARTNER_LOGIN);
  };

  return (
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
              {companyName || "Đối tác BKS"}
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="group relative flex items-center focus:outline-none">
                <div className="rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-0.5 shadow-lg shadow-blue-500/20 transition-transform group-hover:scale-105 group-active:scale-95">
                  <div className="flex size-10 items-center justify-center rounded-[10px] bg-white text-blue-600">
                    <User size={20} className="stroke-[2.5px]" />
                  </div>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-2xl border-slate-100 p-2 shadow-2xl">
              <div className="px-3 py-2">
                <p className="text-xs font-medium text-slate-400">Tài khoản</p>
                <p className="truncate text-sm font-bold text-slate-900">{userEmail}</p>
                {companyName && (
                  <p className="mt-0.5 truncate text-[10px] font-bold text-blue-600 uppercase tracking-tight">{companyName}</p>
                )}
              </div>
              <DropdownMenuSeparator className="bg-slate-50" />
              <DropdownMenuItem 
                onClick={() => navigate(ROUTERS.PARTNER_PROFILE)}
                className="flex cursor-pointer items-center gap-3 rounded-xl py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-blue-50 hover:text-blue-600 focus:bg-blue-50 focus:text-blue-600"
              >
                <UserCircle size={18} />
                <span>Thông tin cá nhân</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-50" />
              <DropdownMenuItem 
                onClick={handleLogout}
                className="flex cursor-pointer items-center gap-3 rounded-xl py-2.5 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50 focus:bg-rose-50"
              >
                <LogOut size={18} />
                <span>Đăng xuất</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
