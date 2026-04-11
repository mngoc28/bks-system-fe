import { Suspense, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { 
  House, 
  History, 
  User, 
  Menu, 
  X, 
  LogOut, 
  Bell,
  HelpCircle,
  ConciergeBell,
  FileText
} from "lucide-react";
import { ROUTERS } from "@/constant";
import { Button } from "@/components/ui/button";
import { Toaster } from "sonner";
import { useUserStore } from "@/store/useUserStore";
import { useLogoutMutation } from "@/hooks/useAuthQuery";
import { useNavigate } from "react-router-dom";
import NotificationBell from "@/components/layout/NotificationBell";

const BksStayLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const userEmail = useUserStore((state) => state.userEmail);
  const user = useUserStore((state) => state.userName);
  const logoutMutate = useLogoutMutation();

  const handleLogout = () => {
    logoutMutate.mutate(undefined, {
      onSuccess: () => {
        useUserStore.getState().logout();
        navigate("/bks-stay/login");
      }
    });
  };

  const menuItems = [
    { id: "dashboard", label: "Tổng quan", path: ROUTERS.BKS_STAY_DASHBOARD, icon: <House className="h-5 w-5" /> },
    { id: "history", label: "Lịch sử đặt phòng", path: ROUTERS.BKS_STAY_HISTORY, icon: <History className="h-5 w-5" /> },
    { id: "account", label: "Tài khoản của tôi", path: ROUTERS.BKS_STAY_ACCOUNT, icon: <User className="h-5 w-5" /> },
    { id: "services", label: "Dịch vụ phòng", path: ROUTERS.BKS_STAY_SERVICES, icon: <ConciergeBell className="h-5 w-5" /> },
    { id: "contracts", label: "Hợp đồng", path: ROUTERS.BKS_STAY_CONTRACTS, icon: <FileText className="h-5 w-5" /> },
    { id: "support", label: "Hỗ trợ", path: ROUTERS.BKS_STAY_SUPPORT, icon: <HelpCircle className="h-5 w-5" /> },
  ];

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-900">
      {/* Mobile Header */}
      <header className="md:hidden bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 sticky top-0 z-50">
        <Link to={ROUTERS.HOME} className="flex items-center gap-2">
          <img src="/app/images/front/bks-icon.svg" alt="BKS Icon" className="h-8 w-8" />
          <span className="font-black text-lg tracking-tight">Stay <span className="text-sky-600">Portal</span></span>
        </Link>
        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
          {isSidebarOpen ? <X /> : <Menu />}
        </Button>
      </header>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-0 z-40 md:relative md:z-auto
        w-full md:w-72 bg-slate-900 text-slate-300
        transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        <div className="h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="h-20 flex items-center px-8 border-b border-white/5">
            <Link to={ROUTERS.HOME} className="flex items-center gap-3">
              <img src="/app/images/front/bks-icon.svg" alt="BKS Icon" className="h-10 w-10 drop-shadow-[0_0_8px_rgba(15,23,42,0.5)]" />
              <span className="text-xl font-black tracking-tight text-white uppercase italic">Stay <span className="text-sky-500 not-italic">Portal</span></span>
            </Link>
          </div>

          {/* User Profile Summary */}
          <div className="px-8 py-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-full bg-sky-500/20 flex items-center justify-center text-sky-400 font-bold border border-sky-500/20 overflow-hidden">
                {user ? (
                   <img src={`https://ui-avatars.com/api/?name=${user}&background=random`} alt={user} className="h-full w-full object-cover" />
                ) : (
                  "U"
                )}
              </div>
              <div>
                <p className="text-sm font-bold text-white leading-tight underline underline-offset-4 decoration-sky-500/50 truncate max-w-[150px]">{user || "Người dùng"}</p>
                <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest mt-0.5 truncate">{userEmail || "GUEST"}</p>
              </div>
            </div>
            
            <nav className="space-y-1">
              {menuItems.map((item) => (
                <Link
                  key={item.id}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                    ${location.pathname === item.path 
                      ? "bg-sky-600 text-white shadow-lg shadow-sky-600/20 font-bold" 
                      : "hover:bg-white/5 hover:text-white"}
                  `}
                >
                  {item.icon}
                  <span className="text-sm">{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>

          {/* Bottom Sidebar */}
          <div className="mt-auto p-6 border-t border-white/5 space-y-4">
            <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                <p className="text-[10px] font-black uppercase text-slate-500 mb-2">Trợ giúp nhanh</p>
                <p className="text-xs text-slate-400 leading-relaxed mb-3">Bạn gặp khó khăn khi sử dụng dịch vụ? Nhắn cho trợ lý ảo của chúng tôi.</p>
                <Button variant="outline" className="w-full h-10 rounded-xl bg-white/5 border-white/10 text-white hover:bg-white/10 border-none justify-start px-3 gap-2 text-xs">
                  <Bell className="h-3 w-3 text-sky-400" />
                  Hỗ trợ trực tuyến 24/7
                </Button>
            </div>
            
            <Button variant="ghost" className="w-full justify-start gap-3 text-slate-400 hover:text-rose-400 transition-colors px-4 h-12 rounded-xl" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
              <span className="text-sm font-medium">Đăng xuất</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Navbar */}
        <header className="hidden md:flex h-20 items-center justify-between px-8 bg-white border-b border-slate-200 sticky top-0 z-30">
          <div>
             <h2 className="text-lg font-bold text-slate-900">
               {menuItems.find(i => i.path === location.pathname)?.label || "Portal Hub"}
             </h2>
          </div>
           <div className="flex items-center gap-4">
            <NotificationBell />
            <div className="h-8 w-[1px] bg-slate-100" />
            <div className="flex items-center gap-3">
               <div className="text-right">
                  <p className="text-sm font-bold text-slate-900 leading-none">VN - Tiếng Việt</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Đà Nẵng, Việt Nam</p>
               </div>
               <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-600">VN</div>
            </div>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="mx-auto max-w-6xl">
            <Suspense fallback={<div className="flex h-64 items-center justify-center">Đang tải nội dung...</div>}>
              <Outlet />
            </Suspense>
          </div>
          
          <footer className="mt-20 py-8 border-t border-slate-200 text-center text-slate-400 text-[10px] uppercase font-bold tracking-widest">
            © 2026 BKS Systems — STAY PORTAL EXPERIENCE. ALL RIGHTS RESERVED.
          </footer>
        </main>
      </div>

      <Toaster richColors position="bottom-right" />
    </div>
  );
};

export default BksStayLayout;
