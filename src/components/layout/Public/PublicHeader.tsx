import { Link } from "react-router-dom";
import { CalendarDays, Phone, Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ROUTERS } from "@/constant";
import LanguageSwitcher from "./LanguageSwitcher";
import PublicMobileNav from "./PublicMobileNav";
import { PublicHeaderProps } from "@/components/type";
import { useUserStore } from "@/store/useUserStore";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useEffect, useState } from "react";
import stayService from "@/services/stayService";

// Rewards & Loyalty Program Explainer Popover
const RewardsPopover = () => {
  const { userEmail, userName, isAuthenticated } = useUserStore();
  const { t } = useTranslation();
  const [points, setPoints] = useState<number>(0);
  const [level, setLevel] = useState<string>("Bronze");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      setLoading(true);
      stayService.getDashboard()
        .then(res => {
          if (res?.data?.user) {
            setPoints(res.data.user.reward_points ?? 0);
            setLevel(res.data.user.membership_level || "Bronze");
          }
        })
        .catch(err => {
          console.error("Failed to fetch loyalty stats", err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isAuthenticated]);

  const formatLevel = (lvl: string) => {
    const normalized = lvl.toUpperCase();
    if (normalized.includes("GOLD") || normalized.includes("VÀNG")) {
      return "Hạng Vàng (Gold Member)";
    }
    if (normalized.includes("DIAMOND") || normalized.includes("KIM CƯƠNG")) {
      return "Hạng Kim Cương (Diamond Member)";
    }
    return "Hạng Đồng (Bronze Member)";
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full border border-transparent px-4 py-2 transition hover:border-slate-200 hover:bg-slate-50 hover:text-primary focus:outline-none cursor-pointer text-sm font-medium text-slate-600"
        >
          <Star className="size-4 text-amber-500 fill-amber-500/20" />
          {t("public.header.nav.points")}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-5 rounded-2xl border border-slate-200 bg-white/95 shadow-2xl backdrop-blur z-[100] text-slate-900">
        <div className="space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <div className="rounded-xl bg-amber-50 p-2 text-amber-600">
              <Star className="size-5 fill-amber-500/30" />
            </div>
            <div className="text-left">
              <h4 className="font-bold text-slate-900 text-sm">BKS Loyalty Club</h4>
              <p className="text-[11px] text-slate-500">Tích lũy điểm thưởng, đổi ngàn ưu đãi</p>
            </div>
          </div>

          {isAuthenticated ? (
            <div className="space-y-3 text-left">
              <div className="rounded-xl bg-slate-50 p-3 text-sm">
                <p className="text-slate-600 text-xs">Xin chào,</p>
                <p className="font-semibold text-slate-900">{userName || userEmail}</p>
                <div className="mt-3 flex items-baseline gap-1 text-slate-900">
                  <span className="text-2xl font-black text-primary">{loading ? "..." : points}</span>
                  <span className="text-xs font-medium text-slate-500">điểm tích lũy</span>
                </div>
                <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                  {loading ? "..." : formatLevel(level)}
                </span>
              </div>
              <Link
                to="/bks-stay/dashboard"
                className="flex w-full items-center justify-center rounded-full bg-primary py-2.5 text-xs font-semibold text-white shadow-md shadow-primary/10 transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-lg hover:shadow-primary/20 active:scale-95"
              >
                Đến Trang Cá Nhân
              </Link>
            </div>
          ) : (
            <div className="space-y-3 text-left">
              <p className="text-xs text-slate-600 leading-relaxed">
                Đăng nhập tài khoản BKS Stay để bắt đầu tích lũy 1 điểm thưởng cho mỗi 100,000₫ thanh toán đặt phòng!
              </p>
              <div className="rounded-xl bg-amber-50/50 p-3 text-[11px] text-amber-800 space-y-1.5 border border-amber-100/50">
                <p className="font-bold">• Hạng Vàng (50+ điểm): Giảm ngay 10%</p>
                <p className="font-bold">• Hạng Kim Cương (150+ điểm): Giảm ngay 15%</p>
              </div>
              <Link
                to="/bks-stay/login"
                className="flex w-full items-center justify-center rounded-full bg-primary py-2.5 text-xs font-semibold text-white shadow-md shadow-primary/10 transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-lg hover:shadow-primary/20 active:scale-95"
              >
                Đăng nhập BKS Stay
              </Link>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

// Props for PublicHeader component
const PublicHeader = ({
  favoritesHref = ROUTERS.MY_BOOKINGS,
}: PublicHeaderProps) => {
  const { t } = useTranslation();

  const handleContactClick = (e: React.MouseEvent) => {
    const isHomePage = window.location.pathname === ROUTERS.HOME || window.location.pathname === "/";
    const contactElement = document.getElementById("contact");
    
    if (isHomePage && contactElement) {
      e.preventDefault();
      contactElement.scrollIntoView({ behavior: "smooth" });
    } else {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent("open-public-chatbot"));
    }
  };

  const isRouteHref = (href: string) => href.startsWith("/");

  return (
    <header className="relative z-[80] border-b border-slate-200/70 bg-white/90 shadow-sm shadow-slate-200/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl lg:max-w-[1360px] items-center gap-4 px-4 py-4 sm:gap-6 sm:px-6">
        <Link to={ROUTERS.HOME} className="flex min-w-0 items-center gap-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 sm:gap-3">
          <img src="/app/images/front/bks-icon.svg" alt="BKS Logo" className="size-10 shrink-0 sm:size-11" />
          <div className="min-w-0 leading-tight">
            <p className="truncate text-lg font-bold tracking-tight text-slate-900 sm:text-xl">{t("public.header.brand.title")}</p>
          </div>
        </Link>
        <PublicMobileNav favoritesHref={favoritesHref} onContactClick={handleContactClick} />
        <div className="hidden items-center gap-6 md:flex md:ml-auto">
          <nav className="flex items-center gap-6 text-sm font-medium text-slate-600">
            <a
              href="#contact"
              onClick={handleContactClick}
              className="inline-flex items-center gap-2 rounded-full border border-transparent px-4 py-2 transition hover:border-slate-200 hover:bg-slate-50 hover:text-primary cursor-pointer"
            >
              <Phone className="size-4" />
              {t("public.header.nav.contact")}
            </a>

            <RewardsPopover />

            {isRouteHref(favoritesHref) ? (
              <Link
                to={favoritesHref}
                className="inline-flex items-center gap-2 rounded-full border border-transparent px-4 py-2 transition hover:border-slate-200 hover:bg-slate-50 hover:text-primary"
              >
                <CalendarDays className="size-4" />
                {t("public.header.nav.bookings")}
              </Link>
            ) : (
              <a
                href={favoritesHref}
                className="inline-flex items-center gap-2 rounded-full border border-transparent px-4 py-2 transition hover:border-slate-200 hover:bg-slate-50 hover:text-primary"
              >
                <CalendarDays className="size-4" />
                {t("public.header.nav.bookings")}
              </a>
            )}
          </nav>

          <LanguageSwitcher className="inline-flex" />
        </div>
      </div>
    </header>
  );
};

export default PublicHeader;
