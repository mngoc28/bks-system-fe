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
        <section className="relative isolate w-full bg-slate-950 text-white">
          <img src="/assets/images/banner.webp" alt={t("public.company.banner.alt")} className="absolute inset-0 size-full object-cover" />
          <div className="absolute inset-0 bg-slate-950/70" />
          <div className="relative mx-auto flex h-[320px] w-full max-w-5xl flex-col items-center justify-center px-6 text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.4em] text-sky-200">{t("public.company.banner.badge")}</span>
            <h1 className="mt-6 text-[2.25rem] font-bold leading-tight sm:text-[2.75rem]">{t("public.company.banner.title")}</h1>
            <p className="mt-4 max-w-2xl text-sm text-sky-100/80">{t("public.company.banner.subtitle")}</p>
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

        <section className="mx-auto w-full max-w-5xl px-6 py-16">
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
