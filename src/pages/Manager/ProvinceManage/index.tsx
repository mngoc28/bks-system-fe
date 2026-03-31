import Pagination from "@/components/Pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DEFAULT_LIMIT, DEFAULT_PAGE, ROUTERS } from "@/constant";
import type { ProvinceFilter, Provinces } from "@/dataHelper/province.dataHelper";
import { useGetAllProvinces } from "@/hooks/useProvinceQuery";
import { ChevronDown, ChevronsUpDown, ChevronUp, Eye } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const ProvinceManage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  type SortKey = "id" | "name";

  const toggleSort = (key: SortKey) => {
    setFilters(prev => {
      let newDirection: "asc" | "desc" = "asc";

      if (prev.sort_field === key && prev.sort_direction === "asc") {
        newDirection = "desc";
      }

      return {
        ...prev,
        sort_field: key,
        sort_direction: newDirection,
      };
    });
  };
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
    per_page: DEFAULT_LIMIT,
  });

  const { data: apiData, isLoading } = useGetAllProvinces(debouncedFilters);

  const page = filters.page ?? DEFAULT_PAGE;
  const perPage = filters.per_page ?? DEFAULT_LIMIT;

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
    <div className="flex w-full flex-col gap-6 p-[12px_24px]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-bold text-slate-800">{t("province.title_manage")}</h1>

        <div className="flex justify-between gap-2 w-full">
          <input
            className="border rounded px-3 py-2 text-sm w-full"
            value={filters.name}
            onChange={(e) => setFilters((s) => ({ ...s, name: e.target.value }))}
            placeholder={t("province.search_placeholder")}

          />
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-lg border bg-white p-6 text-sm text-slate-500">
          {t("common.loading")}
        </div>
      ) : totalItems === 0 ? (
        <div className="rounded-lg border bg-white p-6 text-sm text-slate-500">
          {t("province.no_provinces_found")}
        </div>
      ) : (
        <div className="w-full  rounded-lg border border-blue-100 bg-white">
          <Table className="w-full text-sm text-slate-700">
            <TableHeader>
              <tr className="bg-slate-100">
                <TableHead
                  className="cursor-pointer select-none whitespace-nowrap px-4 py-3 text-center text-slate-700"
                  onClick={() => toggleSort("id")}
                >
                  <span className="inline-flex items-center gap-1">
                    {t("province.id")}
                    {filters.sort_field === "id" ? (
                      filters.sort_direction === "asc" ? (
                        <ChevronUp className="size-4 text-slate-700" />
                      ) : (
                        <ChevronDown className="size-4 text-slate-700" />
                      )
                    ) : (
                      <ChevronsUpDown className="size-4 text-slate-500" />
                    )}
                  </span>
                </TableHead>

                <TableHead
                  className="cursor-pointer select-none whitespace-nowrap px-4 py-3 text-slate-700"
                  onClick={() => toggleSort("name")}
                >
                  <span className="inline-flex items-center gap-1">
                    {t("province.name")}
                    {filters.sort_field === "name" ? (
                      filters.sort_direction === "asc" ? (
                        <ChevronUp className="size-4 text-slate-700" />
                      ) : (
                        <ChevronDown className="size-4 text-slate-700" />
                      )
                    ) : (
                      <ChevronsUpDown className="size-4 text-slate-500" />
                    )}
                  </span>
                </TableHead>

                <TableHead className="px-4 py-3 text-slate-700">{t("province.name_en")}</TableHead>
                <TableHead className="px-4 py-3 text-slate-700">{t("province.ward")}</TableHead>
                <TableHead className="px-4 py-3 text-slate-700">{t("province.room")}</TableHead>
                <TableHead className="px-4 py-3 text-slate-700">{t("common.detail")}</TableHead>
              </tr>
            </TableHeader>

            <TableBody>
              {serverRows.map((province) => (
                <TableRow key={province.id} className="hover:bg-muted/50">
                  <TableCell className="px-4 py-3 text-center align-middle">{province.id}</TableCell>
                  <TableCell className="px-4 py-3 align-middle">{province.name}</TableCell>
                  <TableCell className="px-4 py-3 align-middle">{province.name_en}</TableCell>
                  <TableCell className="px-4 py-3 align-middle">{province.ward_count}</TableCell>
                  <TableCell className="px-4 py-3 align-middle">{province.room_count}</TableCell>
                  <TableCell className="px-4 py-3 align-middle">
                    <button onClick={() => navigate(`${ROUTERS.PROVINCE_DETAIL}/${province.id}`)} className=" hover:scale-110">
                      <Eye className="size-5" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {totalItems > 0 && (
            <div className="p-4">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={(p) => setFilters((prev) => ({ ...prev, page: p }))}
                perPage={perPage}
                onPerPageChange={(pp) =>
                  setFilters((prev) => ({
                    ...prev,
                    per_page: pp,
                    page: DEFAULT_PAGE,
                  }))
                }
                totalItems={totalItems}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProvinceManage;