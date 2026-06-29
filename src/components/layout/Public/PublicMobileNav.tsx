import { useState } from "react";
import { Link } from "react-router-dom";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { CalendarDays, Menu, Phone, Star, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ROUTERS } from "@/constant";
import { useUserStore } from "@/store/useUserStore";
import LanguageSwitcher from "./LanguageSwitcher";
import { Dialog, DialogPortal, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface PublicMobileNavProps {
  favoritesHref?: string;
  onContactClick: (e: React.MouseEvent) => void;
}

const PublicMobileNav = ({
  favoritesHref = ROUTERS.MY_BOOKINGS,
  onContactClick,
}: PublicMobileNavProps) => {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();
  const { userEmail, userName, isAuthenticated } = useUserStore();

  const isRouteHref = (href: string) => href.startsWith("/");

  const closeMenu = () => setOpen(false);

  const handleContact = (e: React.MouseEvent) => {
    onContactClick(e);
    closeMenu();
  };

  const navLinkClass =
    "flex min-h-11 w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="relative z-[90] ml-auto inline-flex size-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 md:hidden"
        aria-label={open ? t("common.close") : t("public.header.nav.menu")}
        aria-expanded={open}
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogPortal>
          <DialogPrimitive.Overlay
            className={cn(
              "fixed inset-0 z-[100] bg-black/40",
              "data-[state=open]:animate-in data-[state=closed]:animate-out",
              "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            )}
          />
          <DialogPrimitive.Content
            className={cn(
              "fixed inset-y-0 right-0 z-[101] flex w-[min(100vw,20rem)] flex-col border-l border-slate-200 bg-white shadow-2xl outline-none",
              "data-[state=open]:animate-in data-[state=closed]:animate-out",
              "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
              "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right",
              "duration-200",
            )}
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <DialogTitle className="text-base font-bold text-slate-900">
                {t("public.header.brand.title")}
              </DialogTitle>
              <button
                type="button"
                onClick={closeMenu}
                className="inline-flex size-11 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
                aria-label={t("common.close")}
              >
                <X className="size-5" />
              </button>
            </div>

            <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-4">
              <a href="#contact" onClick={handleContact} className={navLinkClass}>
                <Phone className="size-4 text-primary" />
                {t("public.header.nav.contact")}
              </a>

              <div className="rounded-2xl border border-amber-100 bg-amber-50/40 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Star className="size-4 text-amber-500 fill-amber-500/20" />
                  <span className="text-sm font-semibold text-slate-900">
                    {t("public.header.nav.points")}
                  </span>
                </div>
                {isAuthenticated ? (
                  <div className="space-y-3">
                    <p className="text-xs text-slate-600">
                      Xin chào, <span className="font-semibold text-slate-900">{userName || userEmail}</span>
                    </p>
                    <Link
                      to="/bks-stay/dashboard"
                      onClick={closeMenu}
                      className="flex w-full items-center justify-center rounded-full bg-primary py-2.5 text-xs font-semibold text-white"
                    >
                      Đến Trang Cá Nhân
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs leading-relaxed text-slate-600">
                      Đăng nhập BKS Stay để tích lũy điểm thưởng khi đặt phòng.
                    </p>
                    <Link
                      to="/bks-stay/login"
                      onClick={closeMenu}
                      className="flex w-full items-center justify-center rounded-full bg-primary py-2.5 text-xs font-semibold text-white"
                    >
                      Đăng nhập BKS Stay
                    </Link>
                  </div>
                )}
              </div>

              {isRouteHref(favoritesHref) ? (
                <Link to={favoritesHref} onClick={closeMenu} className={navLinkClass}>
                  <CalendarDays className="size-4 text-primary" />
                  {t("public.header.nav.bookings")}
                </Link>
              ) : (
                <a href={favoritesHref} onClick={closeMenu} className={navLinkClass}>
                  <CalendarDays className="size-4 text-primary" />
                  {t("public.header.nav.bookings")}
                </a>
              )}

              <div className="mt-2 border-t border-slate-100 pt-4">
                <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {t("language.label", "Ngôn ngữ")}
                </p>
                <LanguageSwitcher className="w-full" />
              </div>
            </nav>
          </DialogPrimitive.Content>
        </DialogPortal>
      </Dialog>
    </>
  );
};

export default PublicMobileNav;
