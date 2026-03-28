import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ROUTERS } from "@/constant";
import ProfileDialog from "@/pages/Profile";
import useLanguage from "@/store/useLanguage";
import { useUserStore } from "@/store/useUserStore";
import { LogOut, User } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";


type HeaderProps = {
  pageTitle?: string;
};

const Header = ({ pageTitle = "" }: HeaderProps) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { setLanguage } = useLanguage();

  const handleChangeLangue = (lang: string) => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
  };

  const getLanguageDisplay = (lang: string) => {
    switch (lang) {
      case "en":
        return "EN";
      case "vi":
        return "VI";
      case "ja":
        return "JP";
      default:
        return "VI";
    }
  };

  const handleLogout = () => {
    // Bypass logout API call for demo
    useUserStore.getState().logout();
    navigate(ROUTERS.LOGIN);
  };

  const userEmail = useUserStore((state) => state.userEmail);
  const [openProfile, setOpenProfile] = useState(false);
  const handleGoProfile = () => {
    setOpenProfile(true);
  };

  return (
    <header className="flex sticky top-0 z-50 bg-white w-full items-center justify-between p-6 border-b border-slate-300">
      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-bold text-slate-700">{pageTitle}</h1>
      </div>
      <div className="flex items-center gap-1.5">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1 border border-dark-100 bg-white px-2 py-2 hover:bg-neutral-100 focus:outline-none rounded-md">
              <img src={`/app/images/front/flag-${i18n.language === "ja" ? "jp" : i18n.language}.svg`} alt={i18n.language.toUpperCase()} className="size-5" />
              <span className="text-sm font-medium">{getLanguageDisplay(i18n.language)}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleChangeLangue("en")} className="flex items-center gap-2 cursor-pointer">
              <img src="/app/images/front/flag-en.svg" alt="EN" className="size-5 flex-shrink-0" />
              <span>English</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleChangeLangue("vi")} className="flex items-center gap-2 cursor-pointer">
              <img src="/app/images/front/flag-vi.svg" alt="VI" className="size-5 flex-shrink-0" />
              <span>Tiếng Việt</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleChangeLangue("ja")} className="flex items-center gap-2 cursor-pointer">
              <img src="/app/images/front/flag-jp.svg" alt="JP" className="size-5 flex-shrink-0" />
              <span>日本語</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex size-12 items-center justify-center rounded-full bg-slate-100 transition-colors hover:bg-slate-200" aria-label="Tài khoản người dùng">
              <User className="text-slate-700" size={24} strokeWidth={2} />
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
            <DropdownMenuItem onClick={handleGoProfile} className="cursor-pointer gap-2 hover:bg-slate-100">
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
    </header>
  );
};

export default Header;
