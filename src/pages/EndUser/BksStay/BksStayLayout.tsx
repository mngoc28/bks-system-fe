import { Suspense, useEffect, useState } from "react";
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
  FileText,
  BookOpen
} from "lucide-react";
import { ROUTERS } from "@/constant";
import { Button } from "@/components/ui/button";
import { Toaster } from "sonner";
import { readPersistedUserProfile, useUserStore } from "@/store/useUserStore";
import { getAccessToken } from "@/utils/storage";
import stayService from "@/services/stayService";
import { useStayLogoutMutation } from "@/hooks/useAuthQuery";
import { useNavigate } from "react-router-dom";
import NotificationBell from "@/components/layout/NotificationBell";

const BksStayLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  /** Snapshot sync từ localStorage — tránh sidebar "Guest" trước khi zustand/persist rehydrate. */
  const [persistSnapshot] = useState(() => readPersistedUserProfile());
  const location = useLocation();
  const navigate = useNavigate();
  const userEmail = useUserStore((state) => state.userEmail);
  const user = useUserStore((state) => state.userName);
  const logoutMutate = useStayLogoutMutation();

  const displayEmail = userEmail || persistSnapshot.userEmail;
  const displayName = user || persistSnapshot.userName;

  useEffect(() => {
    let cancelled = false;

    const repairIdentityFromStayApi = () => {
      const token = getAccessToken();
      if (!token || useUserStore.getState().userEmail) {
        return;
      }

      stayService
        .getDashboard()
        .then((res: { data?: { user?: { email?: string; name?: string } } }) => {
          if (cancelled) {
            return;
          }
          const u = res?.data?.user;
          if (!u?.email) {
            return;
          }
          const role = useUserStore.getState().userRole || "user";
          useUserStore.getState().login(token, u.email, role, u.name || "");
        })
        .catch(() => {});
    };

    if (useUserStore.persist.hasHydrated()) {
      repairIdentityFromStayApi();
      return () => {
        cancelled = true;
      };
    }

    const unsub = useUserStore.persist.onFinishHydration(() => {
      repairIdentityFromStayApi();
    });
    return () => {
      cancelled = true;
      unsub();
    };
  }, []);

  const handleLogout = () => {
    logoutMutate.mutate(undefined, {
      onSuccess: () => {
        useUserStore.getState().logout();
        navigate("/bks-stay/login");
      }
    });
  };

  const menuItems = [
    { id: "dashboard", label: "Tổng quan", path: ROUTERS.BKS_STAY_DASHBOARD, icon: <House className="size-5" /> },
    { id: "history", label: "Lịch sử đặt phòng", path: ROUTERS.BKS_STAY_HISTORY, icon: <History className="size-5" /> },
    { id: "account", label: "Tài khoản của tôi", path: ROUTERS.BKS_STAY_ACCOUNT, icon: <User className="size-5" /> },
    { id: "services", label: "Dịch vụ phòng", path: ROUTERS.BKS_STAY_SERVICES, icon: <ConciergeBell className="size-5" /> },
    { id: "contracts", label: "Hồ sơ lưu trú & Hợp đồng", path: ROUTERS.BKS_STAY_CONTRACTS, icon: <FileText className="size-5" /> },
    { id: "guide", label: "Hướng dẫn lưu trú", path: ROUTERS.BKS_STAY_GUIDE, icon: <BookOpen className="size-5" /> },
    { id: "support", label: "Hỗ trợ", path: ROUTERS.BKS_STAY_SUPPORT, icon: <HelpCircle className="size-5" /> },
  ];

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900 md:flex-row">
      {/* Mobile Header */}
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 md:hidden">
        <Link to={ROUTERS.HOME} className="flex items-center gap-2">
          <img src="/app/images/front/bks-icon.svg" alt="BKS Icon" className="size-8" />
          <span className="text-lg font-black tracking-tight">Stay <span className="text-sky-600">Portal</span></span>
        </Link>
        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
          {isSidebarOpen ? <X /> : <Menu />}
        </Button>
      </header>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-0 z-40 w-full bg-slate-900
        text-slate-300 transition-transform duration-300 ease-in-out
        md:relative md:z-auto md:w-72
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        <div className="flex h-full flex-col">
          {/* Sidebar Header */}
          <div className="flex h-20 items-center border-b border-white/5 px-8">
            <Link to={ROUTERS.HOME} className="flex items-center gap-3">
              <img src="/app/images/front/bks-icon.svg" alt="BKS Icon" className="size-10 drop-shadow-[0_0_8px_rgba(15,23,42,0.5)]" />
              <span className="text-xl font-black uppercase italic tracking-tight text-white">Stay <span className="not-italic text-sky-500">Portal</span></span>
            </Link>
          </div>

          {/* User Profile Summary */}
          <div className="p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-sky-500/20 bg-sky-500/20 font-bold text-sky-400">
                {displayName ? (
                   <img src={`https://ui-avatars.com/api/?name=${displayName}&background=random`} alt={displayName} className="size-full object-cover" />
                ) : (
                  "U"
                )}
              </div>
              <div>
                <p className="max-w-[150px] truncate text-sm font-bold leading-tight text-white underline decoration-sky-500/50 underline-offset-4">{displayName || "Người dùng"}</p>
                <p className="mt-0.5 truncate text-xs text-slate-400">{displayEmail || "Guest"}</p>
              </div>
            </div>
            
            <nav className="space-y-1">
              {menuItems.map((item) => (
                <Link
                  key={item.id}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200
                    ${location.pathname === item.path 
                      ? "bg-sky-600 font-bold text-white shadow-lg shadow-sky-600/20" 
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
          <div className="mt-auto space-y-4 border-t border-white/5 p-6">
            <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
                <p className="mb-2 text-[10px] font-black uppercase text-slate-500">Trợ giúp nhanh</p>
                <p className="mb-3 text-xs leading-relaxed text-slate-400">Bạn gặp khó khăn khi sử dụng dịch vụ? Nhắn cho trợ lý ảo của chúng tôi.</p>
                <Button variant="outline" className="h-10 w-full justify-start gap-2 rounded-xl border-none border-white/10 bg-white/5 px-3 text-xs text-white hover:bg-white/10">
                  <Bell className="size-3 text-sky-400" />
                  Hỗ trợ trực tuyến 24/7
                </Button>
            </div>
            
            <Button variant="ghost" className="h-12 w-full justify-start gap-3 rounded-xl px-4 text-slate-400 transition-colors hover:text-rose-400" onClick={handleLogout}>
              <LogOut className="size-5" />
              <span className="text-sm font-medium">Đăng xuất</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex h-screen flex-1 flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 hidden h-20 items-center justify-between border-b border-slate-200 bg-white px-8 md:flex">
          <div>
             <h2 className="text-lg font-bold text-slate-900">
               {menuItems.find(i => i.path === location.pathname)?.label || "Portal Hub"}
             </h2>
          </div>
           <div className="flex items-center gap-4">
            <NotificationBell />
            <div className="h-8 w-px bg-slate-100" />
            <div className="flex items-center gap-3">
               <div className="text-right">
                  <p className="text-sm font-bold leading-none text-slate-900">VN - Tiếng Việt</p>
                  <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-slate-400">Đà Nẵng, Việt Nam</p>
               </div>
               <div className="flex size-10 items-center justify-center rounded-xl bg-slate-100 font-bold text-slate-600">VN</div>
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
          
          <footer className="mt-20 border-t border-slate-200 py-8 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
            © 2026 BKS Systems — STAY PORTAL EXPERIENCE. ALL RIGHTS RESERVED.
          </footer>
        </main>
      </div>

      <Toaster richColors position="bottom-right" />
    </div>
  );
};

export default BksStayLayout;
