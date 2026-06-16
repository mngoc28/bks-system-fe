import { Link } from "react-router-dom";
import { MapPin, Phone } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ROUTERS } from "@/constant";
import { PublicFooterProps } from "@/components/type";

const PublicFooter = ({ className }: PublicFooterProps) => {
  const { t } = useTranslation();

  return (
    <footer className={className ? className : "border-t border-slate-800 bg-slate-900"}>
      <div className="mx-auto grid max-w-7xl lg:max-w-[1360px] gap-8 px-4 py-12 text-sm text-slate-600 sm:px-6 md:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))]">
        <div className="space-y-4">
          <Link to={ROUTERS.HOME} className="inline-flex items-center gap-3">
            <img src="/app/images/front/bks-icon.svg" alt="BKS Logo" className="size-11" />
            <div className="leading-tight">
              <p className="text-xl font-bold tracking-tight text-white">{t("public.header.brand.title")}</p>
            </div>
          </Link>
          <p className="text-sm leading-6 text-slate-500">{t("public.footer.brand.description")}</p>
          <div className="flex items-center gap-3 text-slate-500">
            <Phone className="size-4 text-primary" />
            <span>
              {t("public.footer.contact.hotlineLabel")}: {t("public.footer.contact.hotlineValue")}
            </span>
          </div>
          <div className="flex items-center gap-3 text-slate-500">
            <MapPin className="size-4 text-primary" />
            <span>{t("public.footer.contact.addressValue")}</span>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.3em] text-white">{t("public.footer.sections.explore.title")}</h4>
          <ul className="mt-4 space-y-3 text-sm text-slate-400">
            <li>
              <Link to={ROUTERS.SEARCH_ROOMS} className="transition hover:text-primary">
                {t("public.footer.sections.explore.rooms")}
              </Link>
            </li>
            <li>
              <Link to={ROUTERS.PUBLIC_NEWS_LIST} className="transition hover:text-primary">
                {t("public.footer.sections.explore.news")}
              </Link>
            </li>
            <li>
              <Link to={ROUTERS.COMPANY_HUB} className="transition hover:text-primary">
                {t("public.footer.sections.explore.partners")}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.3em] text-white">Đối tác liên kết</h4>
          <ul className="mt-4 space-y-3 text-sm text-slate-400">
            <li>
              <Link to={ROUTERS.BECOME_PARTNER} className="transition hover:text-blue-400 font-bold text-blue-500/90">
                Đăng ký đối tác mới
              </Link>
            </li>
            <li>
              <Link to={ROUTERS.PARTNER_LOGIN} className="transition hover:text-primary">
                Cổng thông tin đối tác
              </Link>
            </li>
            <li>
              <Link to={ROUTERS.BECOME_PARTNER} className="transition hover:text-primary">
                Chính sách đối tác
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.3em] text-white">{t("public.footer.sections.support.title")}</h4>
          <ul className="mt-4 space-y-3 text-sm text-slate-400">

            <li>
              <Link to={ROUTERS.PUBLIC_FAQ} className="transition hover:text-primary">
                {t("public.footer.sections.support.faqs")}
              </Link>
            </li>
            <li>
              <Link to={ROUTERS.PUBLIC_FAQ + "?category=Tài%20khoản%20%26%20Bảo%20mật"} className="transition hover:text-primary">
                {t("public.footer.sections.support.privacy")}
              </Link>
            </li>
            <li>
              <Link to={ROUTERS.PUBLIC_FAQ + "?category=Tài%20khoản%20%26%20Bảo%20mật"} className="transition hover:text-primary">
                {t("public.footer.sections.support.terms")}
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-800 bg-slate-950/50 py-4">
        <div className="mx-auto flex max-w-7xl lg:max-w-[1360px] flex-col items-center justify-between gap-3 px-4 text-xs text-slate-400 sm:flex-row sm:px-6">
          <span className="text-center sm:text-left">{t("public.footer.bottom.note", { year: new Date().getFullYear() })}</span>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
            <a href="/" className="transition hover:text-sky-600">{t("public.footer.bottom.sitemap")}</a>
            <a href="/" className="transition hover:text-sky-600">{t("public.footer.bottom.cookies")}</a>
            <a href="/" className="transition hover:text-sky-600">{t("public.footer.bottom.investor")}</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;
