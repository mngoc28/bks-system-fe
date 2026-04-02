import Pagination from "@/components/Pagination";
import { DEFAULT_CARD_LIMIT, DEFAULT_PAGE, ROUTERS } from "@/constant";
import type { ProvinceFilter, Provinces } from "@/dataHelper/province.dataHelper";
import { useGetAllProvinces } from "@/hooks/useProvinceQuery";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import ProvinceCard from "./components/ProvinceCard";
import EmptyPage from "@/components/EmptyPage";
import { Spinner } from "@/components/ui/spinner";
import PageBar from "@/components/PageBar";

const ProvinceManage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const useDebouncedFilter = (initialFilter: ProvinceFilter, delay = 300) => {
    const [filter, setFilter] = useState<ProvinceFilter>(initialFilter);
    const [debouncedFilter, setDebouncedFilter] = useState<ProvinceFilter>(initialFilter);

    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedFilter(filter);
      }, delay);
      return () => clearTimeout(handler);
    }, [filter, delay]);

    return { filter, setFilter, debouncedFilter };
  };

  const { filter: filters, setFilter: setFilters, debouncedFilter: debouncedFilters } = useDebouncedFilter({
    name: "",
    page: DEFAULT_PAGE,
    per_page: DEFAULT_CARD_LIMIT,
  });

  const { data: apiData, isLoading } = useGetAllProvinces(debouncedFilters);

  const page = filters.page ?? DEFAULT_PAGE;
  const perPage = filters.per_page ?? DEFAULT_CARD_LIMIT;

  const serverRows: Provinces[] = useMemo(() => {
    const list: any[] = (apiData as any)?.data?.data?.data || [];
    return list.map((item: any) => ({
      id: item.id ?? 0,
      name: item.name ?? "",
      name_en: item.name_en ?? "",
      ward_count: item.ward_count ?? 0,
      room_count: item.room_count ?? 0,
    }));
  }, [apiData]);

  useEffect(() => {
    setFilters((prev) => {
      if (prev.page === DEFAULT_PAGE) return prev;
      return { ...prev, page: DEFAULT_PAGE };
    });
  }, [filters.name]);

  const paginationData = (apiData as any)?.data?.data;
  const totalItems = paginationData?.total ?? 0;
  const totalPages = paginationData?.last_page ?? Math.max(1, Math.ceil(totalItems / perPage));

  return (
    <div className="flex w-full flex-col gap-8 p-[24px_32px]">
      <PageBar
        subtitle={t("province.subtitle") || "Quản lý danh sách các tỉnh thành đang hoạt động."}
        actions={
          <div className="relative flex-1 min-w-[280px]">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none"
              value={filters.name}
              onChange={(e) => setFilters((s) => ({ ...s, name: e.target.value }))}
              placeholder={t("province.search_placeholder")}
            />
          </div>
        }
      />

      {isLoading ? (
        <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-slate-100 bg-white/50">
          <Spinner size="lg" showText text={t("common.loading_data")} />
        </div>
      ) : totalItems === 0 ? (
        <EmptyPage />
      ) : (
        <div className="flex flex-col gap-8">
           <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 px-4">
              {serverRows.map((province) => (
                <ProvinceCard
                  key={province.id}
                  province={province}
                  onView={(id) => navigate(`${ROUTERS.PROVINCE_DETAIL}/${id}`)}
                />
              ))}
           </div>
           {totalItems > 0 && (
             <div className="p-4">
               <Pagination
                 currentPage={page}
                 totalPages={totalPages}
                 onPageChange={(p) => setFilters((prev) => ({ ...prev, page: p }))}
                 perPage={perPage}
                 onPerPageChange={(pp) =>
                   setFilters((prev) => ({ ...prev, per_page: pp, page: DEFAULT_PAGE }))
                 }
                 totalItems={totalItems}
                 perPageOptions={[12, 24, 48]}
               />
             </div>
           )}
        </div>
      )}
    </div>
  );
};

export default ProvinceManage;