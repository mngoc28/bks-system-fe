import { Link } from "react-router-dom";
import { Heart, Phone, Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ROUTERS } from "@/constant";
import LanguageSwitcher from "./LanguageSwitcher";
import { PublicHeaderProps } from "@/components/type";

// Props for PublicHeader component
const PublicHeader = ({
  contactHref = "#contact",
  rewardsHref = "#rewards",
  favoritesHref = ROUTERS.MY_BOOKINGS,
}: PublicHeaderProps) => {
  const { t } = useTranslation();

  const isRouteHref = (href: string) => href.startsWith("/");

  return (
    <header className="relative z-[80] border-b border-slate-200/70 bg-white/90 shadow-sm shadow-slate-200/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-4">
        <Link to={ROUTERS.HOME} className="flex items-center gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2">
          <img src="/app/images/front/bks-icon.svg" alt="BKS Logo" className="h-11 w-11" />
          <div className="leading-tight">
            <p className="text-xl font-bold tracking-tight text-slate-900">{t("public.header.brand.title")}</p>
          </div>
        </Link>
        <div className="ml-auto hidden items-center gap-6 md:flex">
          <nav className="flex items-center gap-6 text-sm font-medium text-slate-600">
            {isRouteHref(contactHref) ? (
              <Link
                to={contactHref}
                className="inline-flex items-center gap-2 rounded-full border border-transparent px-4 py-2 transition hover:border-slate-200 hover:bg-slate-50 hover:text-primary"
              >
                <Phone className="h-4 w-4" />
                {t("public.header.nav.contact")}
              </Link>
            ) : (
              <a
                href={contactHref}
                className="inline-flex items-center gap-2 rounded-full border border-transparent px-4 py-2 transition hover:border-slate-200 hover:bg-slate-50 hover:text-primary"
              >
                <Phone className="h-4 w-4" />
                {t("public.header.nav.contact")}
              </a>
            )}
            {isRouteHref(rewardsHref) ? (
              <Link
                to={rewardsHref}
                className="inline-flex items-center gap-2 rounded-full border border-transparent px-4 py-2 transition hover:border-slate-200 hover:bg-slate-50 hover:text-primary"
              >
                <Star className="h-4 w-4" />
                {t("public.header.nav.points")}
              </Link>
            ) : (
              <a
                href={rewardsHref}
                className="inline-flex items-center gap-2 rounded-full border border-transparent px-4 py-2 transition hover:border-slate-200 hover:bg-slate-50 hover:text-primary"
              >
                <Star className="h-4 w-4" />
                {t("public.header.nav.points")}
              </a>
            )}
            {isRouteHref(favoritesHref) ? (
              <Link
                to={favoritesHref}
                className="inline-flex items-center gap-2 rounded-full border border-transparent px-4 py-2 transition hover:border-slate-200 hover:bg-slate-50 hover:text-primary"
              >
                <Heart className="h-4 w-4" />
                {t("public.header.nav.favorites")}
              </Link>
            ) : (
              <a
                href={favoritesHref}
                className="inline-flex items-center gap-2 rounded-full border border-transparent px-4 py-2 transition hover:border-slate-200 hover:bg-slate-50 hover:text-primary"
              >
                <Heart className="h-4 w-4" />
                {t("public.header.nav.favorites")}
              </a>
            )}
          </nav>

          <LanguageSwitcher className="hidden lg:inline-flex" />
        </div>
      </div>
    </header>
  );
};

export default PublicHeader;
