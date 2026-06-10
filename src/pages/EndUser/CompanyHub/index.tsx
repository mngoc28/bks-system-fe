import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PublicHeader, PublicFooter } from "@/components/layout/Public";
import { ROUTERS } from "@/constant";
import { useGetAllProvincesTypes } from "@/hooks/useProvinceQuery";
import type { ProvinceTypes } from "@/dataHelper/province.dataHelper";
import Breadcrumb from "@/components/common/Breadcrumb";
import ContactCard from "@/components/common/ContactCard";
import { Spinner } from "@/components/ui/spinner";
import { Building2, MapPin, ArrowRight } from "lucide-react";

/**
 * Company Hub Page
 * Serves as the landing page for selecting a province to view associated partners.
 */
const CompanyHub = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: provincesResponse, isLoading } = useGetAllProvincesTypes();

  const provinces = useMemo(() => (provincesResponse?.data ?? []) as ProvinceTypes[], [provincesResponse]);

  // Handle province selection and navigate to public partner list
  const handleProvinceSelect = (provinceSlug?: string) => {
    if (provinceSlug) {
      navigate(ROUTERS.PARTNERS.replace(":provinceNameEn", provinceSlug));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <PublicHeader />

      <main className="flex flex-col">
        {/* Hero Section - Premium 2-column layout */}
        <section className="relative isolate w-full overflow-hidden bg-slate-950 py-12 text-white">
          {/* Background image */}
          <img
            src="/assets/images/banner.webp"
            alt={t("public.company.banner.alt")}
            className="absolute inset-0 size-full object-cover opacity-30"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-sky-950/80" />
          {/* Ambient glows */}
          <div className="absolute -left-40 top-0 h-96 w-96 rounded-full bg-sky-600/10 blur-3xl" />
          <div className="absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
          {/* Coordinate grid */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(148,163,184,1) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,1) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />

          <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-5">

              {/* LEFT — 3/5 */}
              <div className="lg:col-span-3">
                {/* Badge */}
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-500/10 px-4 py-1.5 text-sm font-semibold text-sky-300">
                  <Building2 className="size-4" />
                  {t("public.company.banner.badge")}
                </div>

                {/* Title */}
                <h1 className="mb-4 text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                  {t("public.company.banner.title")}
                </h1>

                {/* Subtitle */}
                <p className="mb-8 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
                  {t("public.company.banner.subtitle")}
                </p>

                {/* Stat cards */}
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
                    <MapPin className="size-5 text-sky-400" />
                    <div>
                      <div className="text-lg font-bold text-white">
                        {isLoading ? "—" : `${provinces.length}`}
                      </div>
                      <div className="text-xs text-slate-400">Tỉnh/thành</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
                    <Building2 className="size-5 text-emerald-400" />
                    <div>
                      <div className="text-lg font-bold text-white">100+</div>
                      <div className="text-xs text-slate-400">Đối tác lưu trú</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT — 2/5 */}
              <div className="lg:col-span-2">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
                  <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-sky-300">
                    Khám phá đối tác
                  </h2>
                  <p className="mb-5 text-sm leading-relaxed text-slate-300">
                    Chọn tỉnh/thành phố bên dưới để khám phá các đơn vị lưu trú uy tín đang hoạt động tại khu vực đó.
                  </p>
                  <div className="flex items-center gap-2 text-sm font-semibold text-sky-300">
                    <ArrowRight className="size-4" />
                    <span>Cuộn xuống để chọn tỉnh/thành</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        <div className="px-6 py-4 sm:px-8">
          <div className="mx-auto w-full max-w-5xl">
            <Breadcrumb
              items={[
                { label: t("public.company.list.breadcrumb.home"), href: ROUTERS.HOME },
                { label: t("public.company.list.breadcrumb.current") },
              ]}
            />
          </div>
        </div>

        <section className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6">
          <header className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900">{t("public.company.list.heading")}</h2>
            <p className="mt-1 text-sm text-slate-600">{t("public.company.list.description")}</p>
          </header>

          <div className="rounded-3xl bg-white/90 p-6 shadow-sm">
            {isLoading ? (
              <div className="flex min-h-[200px] items-center justify-center">
                <Spinner size="lg" showText text={t("common.loading_data")} />
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                {provinces.map((province) => (
                  <button
                    key={province.id}
                    type="button"
                    onClick={() => handleProvinceSelect(province.name_en)}
                    className="inline-flex min-w-[140px] flex-1 items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 sm:flex-none sm:text-base"
                  >
                    {province.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="mt-12">
            <ContactCard className="p-0" />
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
};

export default CompanyHub;

