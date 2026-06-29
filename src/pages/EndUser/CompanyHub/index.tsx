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
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Sparkles } from "lucide-react";
import { formatProvinceName } from "@/utils/utils";

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
        {/* Breadcrumb */}
        <div className="border-b border-slate-200 bg-slate-50">
          <div className="mx-auto w-full max-w-[1440px] px-4 py-2.5 sm:px-6 lg:px-8">
            <Breadcrumb
              items={[
                { label: t("public.company.list.breadcrumb.home"), href: ROUTERS.HOME },
                { label: t("public.company.list.breadcrumb.current") },
              ]}
              className="text-sm"
            />
          </div>
        </div>

        {/* Title & Description Section on clean white layout */}
        <div className="mx-auto w-full max-w-[1440px] px-4 pt-8 sm:px-6 lg:px-8 space-y-2">
          <Badge className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-sky-700 border border-sky-200 transition-all duration-300">
            <Sparkles className="h-3.5 w-3.5 text-sky-600 animate-pulse" />
            {t("public.company.banner.badge")}
          </Badge>
          
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            {t("public.company.banner.title")}
          </h1>
          
          <p className="text-sm text-slate-500 max-w-4xl leading-relaxed">
            {t("public.company.banner.subtitle")}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs pt-1 text-slate-500">
            <div className="flex items-center gap-1.5">
              <MapPin className="size-3.5 text-sky-500" />
              <span>{isLoading ? "—" : `${provinces.length}`} Tỉnh/thành</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Building2 className="size-3.5 text-emerald-500" />
              <span>100+ Đối tác lưu trú</span>
            </div>
          </div>
        </div>

        <section className="mx-auto w-full max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
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
                    {formatProvinceName(province.name)}
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

