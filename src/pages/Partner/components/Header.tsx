import React, { useState } from 'react';
import { Bell, Search, Globe, User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '@/store/useUserStore';
import { ROUTERS } from '@/constant';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

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
      <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        {/* Search Bar - More premium look */}
        <div className="flex items-center bg-slate-100/80 border border-slate-200 px-4 py-2.5 rounded-xl w-96 transition-all focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500/50">
          <Search className="text-slate-400 mr-2" size={18} />
          <input 
            type="text" 
            placeholder="Tìm tìm kiếm mọi thứ..." 
            className="bg-transparent border-none outline-none text-sm w-full text-slate-600 placeholder:text-slate-400"
          />
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <button className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300">
              <Globe size={20} />
            </button>
            
            <button className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300 relative group">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white ring-4 ring-rose-500/10 group-hover:scale-125 transition-transform"></span>
            </button>
          </div>
          
          <div className="flex items-center gap-4 border-l pl-6 border-slate-200">
            <div className="text-right hidden md:block">
              <p className="text-sm font-bold text-slate-900 leading-none">{userEmail.split('@')[0] || "Partner"}</p>
              <div className="inline-flex items-center mt-1 px-2 py-0.5 rounded-md bg-blue-50 text-[10px] font-bold text-blue-700 uppercase tracking-wider border border-blue-100">
                Đối tác BKS
              </div>
            </div>
            
            <div className="p-0.5 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/20">
              <div className="w-10 h-10 rounded-l-[10px] rounded-r-[10px] bg-white flex items-center justify-center text-blue-600">
                <User size={20} className="stroke-[2.5px]" />
              </div>
            </div>
            
            <button 
              onClick={() => setIsLogoutDialogOpen(true)}
              title="Đăng xuất"
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 text-slate-400 transition-all duration-300 hover:bg-rose-50 hover:text-rose-600 border border-slate-200 hover:border-rose-100 shadow-sm"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Logout Confirmation Dialog - Simplified & Professional */}
      <Dialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
        <DialogContent className="sm:max-w-[400px] border-none shadow-xl overflow-hidden p-0 rounded-2xl animate-in duration-75">
          <div className="p-8 pb-0">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-slate-900 text-left">
                Đăng xuất tài khoản?
              </DialogTitle>
              <DialogDescription className="text-slate-500 text-left pt-2 font-medium">
                Bạn có chắc chắn muốn kết thúc phiên làm việc của mình trên cổng đối tác BKS?
              </DialogDescription>
            </DialogHeader>
          </div>
          
          <DialogFooter className="p-6 pt-8 flex gap-3">
            <Button 
              variant="ghost" 
              onClick={() => setIsLogoutDialogOpen(false)}
              className="flex-1 rounded-xl h-11 text-slate-500 font-bold hover:bg-slate-50"
            >
              Hủy bỏ
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleLogout}
              className="flex-1 rounded-xl h-11 bg-rose-600 hover:bg-rose-700 text-white font-bold border-none transition-colors"
            >
              Đăng xuất
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Header;
