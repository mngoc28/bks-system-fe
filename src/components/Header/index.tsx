import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ROUTERS } from "@/constant";
import ProfileDialog from "@/pages/Manager/Profile";
import useLanguage from "@/store/useLanguage";
import { useUserStore } from "@/store/useUserStore";
import { ChevronRight, Home, LogOut, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";


type HeaderProps = {
  pageTitle?: string;
};

const Header = ({ pageTitle = "" }: HeaderProps) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { setLanguage } = useLanguage();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const formatDateTime = (date: Date) => {
    return date.toLocaleDateString(i18n.language === "vi" ? "vi-VN" : "en-US", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleChangeLangue = (lang: string) => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
  };

  const getLanguageDisplay = (lang: string) => {
    switch (lang) {
      case "en": return "EN";
      case "vi": return "VI";
      default: return "VI";
    }
  };

  const handleLogout = () => {
    useUserStore.getState().logout();
    navigate(ROUTERS.LOGIN);
  };

  const userEmail = useUserStore((state) => state.userEmail);
  const [openProfile, setOpenProfile] = useState(false);

  return (
    <header className="sticky top-0 z-50 flex w-full flex-col border-b border-slate-200 bg-white shadow-sm">
      {/* Breadcrumb bar */}
      <div className="flex items-center gap-1.5 border-b border-slate-100 px-6 py-1.5 text-xs text-slate-400">
        <Link to={ROUTERS.CONTROL} className="flex items-center gap-1 hover:text-primary transition-colors">
          <Home size={11} />
          <span>{t("menu.dashboard")}</span>
        </Link>
        {pageTitle && pageTitle !== t("dashboard.title") && (
          <>
            <ChevronRight size={11} />
            <span className="font-medium text-primary">{pageTitle}</span>
          </>
        )}
        <span className="ml-auto font-medium text-slate-400">{formatDateTime(now)}</span>
      </div>

      {/* Main header row */}
      <div className="flex w-full items-center justify-between px-6 py-3">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-slate-800 leading-tight">{pageTitle}</h1>
        </div>
        <div className="flex items-center gap-1.5">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1 border border-slate-200 bg-white px-2 py-2 hover:bg-neutral-100 focus:outline-none rounded-md">
                <img src={`/app/images/front/flag-${i18n.language}.svg`} alt={i18n.language.toUpperCase()} className="size-5" />
                <span className="text-sm font-medium">{getLanguageDisplay(i18n.language)}</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleChangeLangue("vi")} className="flex items-center gap-2 cursor-pointer">
                <img src="/app/images/front/flag-vi.svg" alt="VI" className="size-5 flex-shrink-0" />
                <span>Tiếng Việt</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleChangeLangue("en")} className="flex items-center gap-2 cursor-pointer">
                <img src="/app/images/front/flag-en.svg" alt="EN" className="size-5 flex-shrink-0" />
                <span>English</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex size-10 items-center justify-center rounded-full bg-slate-100 transition-colors hover:bg-slate-200" aria-label="Tài khoản người dùng">
                <User className="text-slate-700" size={20} strokeWidth={2} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[220px]">
              {userEmail && (
                <div className="mb-1 border-b border-slate-200 px-4 py-3">
                  <div className="truncate text-xs font-normal text-slate-500" title={userEmail}>
                    {userEmail}
                  </div>
                </div>
              )}
              <DropdownMenuItem onClick={() => setOpenProfile(true)} className="cursor-pointer gap-2 hover:bg-slate-100">
                <User size={16} />
                <span>{t("header.profile")}</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="mt-1 cursor-pointer gap-2 text-red-500 hover:bg-red-50 focus:text-red-500">
                <LogOut size={16} />
                <span>{t("header.logout")}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <ProfileDialog open={openProfile} onClose={() => setOpenProfile(false)} />
        </div>
      </div>
    </header>
  );
};

export default Header;
