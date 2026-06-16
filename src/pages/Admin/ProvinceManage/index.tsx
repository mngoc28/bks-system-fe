import Pagination from "@/components/Pagination";
import { DEFAULT_CARD_LIMIT, DEFAULT_PAGE, ROUTERS } from "@/constant";
import type { ProvinceFilter, Provinces } from "@/dataHelper/province.dataHelper";
import { useGetAllProvinces } from "@/hooks/useProvinceQuery";
import { Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import ProvinceCard from "./components/ProvinceCard";
import EmptyPage from "@/components/EmptyPage";
import AdminListLoading from "@/components/admin/AdminListLoading";
import AdminPageShell from "@/components/admin/AdminPageShell";
import PageBar from "@/components/PageBar";
import { ViewMode } from "@/components/LayoutToggle";
import ProvinceTable from "./components/ProvinceTable";

/**
 * Province Management Page
 * Provides a searchable list of provinces, displaying counts for associated wards and rooms.
 * All filter/pagination state is synced to URL search params so that navigating to a province
 * detail page and pressing "Quay lại" restores the exact previous state.
 */
const ProvinceManage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // ── Read initial state from URL params ──────────────────────────────────
  const getParam = <T extends string>(key: string, fallback: T): T =>
    (searchParams.get(key) as T) ?? fallback;

  const [nameInput, setNameInput] = useState<string>(getParam("name", ""));
  const [viewMode, setViewMode] = useState<ViewMode>(
    getParam<ViewMode>("view", "table"),
  );

  // Derived filter object from URL search params
  const filters: ProvinceFilter = useMemo(
    () => ({
      name: searchParams.get("name") ?? "",
      page: parseInt(searchParams.get("page") ?? String(DEFAULT_PAGE), 10),
      per_page: parseInt(
        searchParams.get("per_page") ?? String(DEFAULT_CARD_LIMIT),
        10,
      ),
      sort_field:
        (searchParams.get("sort_field") as ProvinceFilter["sort_field"]) ??
        undefined,
      sort_direction:
        (searchParams.get("sort_direction") as ProvinceFilter["sort_direction"]) ??
        undefined,
    }),
    [searchParams],
  );

  // ── Helpers to update URL params ─────────────────────────────────────────
  const updateParams = useCallback(
    (updates: Record<string, string | number | undefined>) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          Object.entries(updates).forEach(([key, val]) => {
            if (val === undefined || val === "" || val === null) {
              next.delete(key);
            } else {
              next.set(key, String(val));
            }
          });
          return next;
        },
        { replace: true }, // replace so back button skips intermediate filter changes
      );
    },
    [setSearchParams],
  );

  // ── Debounce name search → URL ────────────────────────────────────────────
  useEffect(() => {
    const handler = setTimeout(() => {
      updateParams({ name: nameInput || undefined, page: DEFAULT_PAGE });
    }, 300);
    return () => clearTimeout(handler);
  }, [nameInput, updateParams]);

  // Keep nameInput in sync when URL changes externally (e.g. back button)
  const urlName = searchParams.get("name") ?? "";
  useEffect(() => {
    setNameInput((prev) => (prev !== urlName ? urlName : prev));
  }, [urlName]);

  // ── View mode ─────────────────────────────────────────────────────────────
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    updateParams({ view: mode });
  };

  // ── Data fetching ─────────────────────────────────────────────────────────
  const { data: apiData, isLoading } = useGetAllProvinces(filters);

  const page = filters.page ?? DEFAULT_PAGE;
  const perPage = filters.per_page ?? DEFAULT_CARD_LIMIT;

  const serverRows: Provinces[] = useMemo(() => {
    const list: any[] = (apiData as any)?.data?.data?.data || [];
    return list.map((item: any) => ({
      id: item.id ?? 0,
      name: item.name ?? "",
      name_en: item.name_en ?? "",
      image: item.image ?? null,
      ward_count: item.ward_count ?? 0,
      room_count: item.room_count ?? 0,
    }));
  }, [apiData]);

  const paginationData = (apiData as any)?.data?.data;
  const totalItems = paginationData?.total ?? 0;
  const totalPages =
    paginationData?.last_page ?? Math.max(1, Math.ceil(totalItems / perPage));

  return (
    <AdminPageShell>
      <PageBar
        subtitle={t("province.subtitle")}
        showLayoutToggle={true}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        actions={
          <div className="relative min-w-[280px] flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder={t("province.search_placeholder")}
            />
          </div>
        }
      />

      {isLoading ? (
        <AdminListLoading mode={viewMode} />
      ) : totalItems === 0 ? (
        <EmptyPage />
      ) : (
        <div className="flex flex-col gap-5">
          {viewMode === "grid" ? (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {serverRows.map((province) => (
                  <ProvinceCard
                    key={province.id}
                    province={province}
                    onView={(id) =>
                      navigate(`${ROUTERS.PROVINCE_DETAIL}/${id}`)
                    }
                  />
                ))}
              </div>
              {totalItems > 0 && (
                <div className="p-4">
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={(p) => updateParams({ page: p })}
                    perPage={perPage}
                    onPerPageChange={(pp) =>
                      updateParams({ per_page: pp, page: DEFAULT_PAGE })
                    }
                    totalItems={totalItems}
                    perPageOptions={[12, 24, 48]}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <ProvinceTable
                filtered={serverRows}
                onView={(id) => navigate(`${ROUTERS.PROVINCE_DETAIL}/${id}`)}
                onSort={(field) => {
                  const isAsc =
                    filters.sort_field === field &&
                    filters.sort_direction === "asc";
                  updateParams({
                    sort_field: field,
                    sort_direction: isAsc ? "desc" : "asc",
                    page: DEFAULT_PAGE,
                  });
                }}
                filters={filters}
              />
              {totalItems > 0 && (
                <div className="border-t border-slate-100 p-4">
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={(p) => updateParams({ page: p })}
                    perPage={perPage}
                    onPerPageChange={(pp) =>
                      updateParams({ per_page: pp, page: DEFAULT_PAGE })
                    }
                    totalItems={totalItems}
                    perPageOptions={[12, 24, 48]}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </AdminPageShell>
  );
};

export default ProvinceManage;