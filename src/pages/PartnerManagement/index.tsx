import { Button } from "@/components/ui/button";
import { PartnerFilter, PartnerInfor } from "@/dataHelper/partner.dataHelper"
import { useListPartnerQuery } from "@/hooks/usePartnerQuery"
import { Filter } from "lucide-react";
import { useEffect, useMemo, useState } from "react"
import PartnerSearchSection from "./components/PartnerSearchSection";
import { DEFAULT_PAGE, DEFAULT_PAGINATION } from "@/constant";
import Pagination from "@/components/Pagination";
import { PartnerTable } from "./components";
import { useTranslation } from "react-i18next";

const Partners: React.FC = () => {
    const { t } = useTranslation();
    //sort
    type SortKey = "id" | "user_name" | "province_name" | "ward_name" | "created_at" | "updated_at";

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
    }
    //filters
    const [open, setOpen] = useState(false);
    const useDebouncedFilter = (initialFilter: PartnerFilter, delay = 500) => {
        const [filter, setFilter] = useState<PartnerFilter>(initialFilter);
        const [debouncedFilter, setDebouncedFilter] = useState<PartnerFilter>(initialFilter);

        useEffect(() => {
            const handler = setTimeout(() => {
                setDebouncedFilter(filter);
            }, delay);

            return () => clearTimeout(handler);
        }, [filter, delay]);

        return { filter, setFilter, debouncedFilter };
    };

    const { filter: filters, setFilter: setFilters, debouncedFilter: debouncedFilters } = useDebouncedFilter({
        user_name: "",
        province_name: "",
        ward_name: "",
        phone: "",
        address: "",
        page: DEFAULT_PAGE,
        per_page: DEFAULT_PAGINATION,
    });

    const page = filters.page ?? DEFAULT_PAGE;
    const perPage = filters.per_page ?? DEFAULT_PAGINATION;
    //reset filter
    const handleResetFilters = () => {
        const resetFilters = {
            user_name: "",
            province_name: "",
            ward_name: "",
            phone: "",
            address: "",
            page: DEFAULT_PAGE,
            per_page: DEFAULT_PAGINATION,
        }
        setFilters(resetFilters);
    }
    //fetch api data
    const { data: dataPartner, isLoading } = useListPartnerQuery(debouncedFilters);

    // map API data to list data
    const serverRows: PartnerInfor[] = useMemo(() => {
        const list: any[] = (dataPartner as any)?.data?.data || [];

        return list.map((item: any) => ({
            id: item.id,
            user_name: item.user_name,
            province_name: item.province_name,
            ward_name: item.ward_name,
            address: item.address ?? "",
            phone: item.phone ?? "",
            image_1: item.image_1 ?? "",
        })) as PartnerInfor[]
    }, [dataPartner]);

    const filtered = useMemo(() => {
        return serverRows.map(item => ({
            id: item.id,
            user_name: item.user_name,
            province_name: item.province_name,
            ward_name: item.ward_name,
            address: item.address ?? "",
            phone: item.phone ?? "",
            image_1: item.image_1 ?? "",
        }));
    }, [serverRows]);

    useEffect(() => {
        setFilters((prev) => {
            if (prev.page === DEFAULT_PAGE) return prev;
            return { ...prev, page: DEFAULT_PAGE };
        });
    }, [filters.user_name, filters.province_name, filters.ward_name, filters.address, filters.phone]);

    const paginationData = (dataPartner as any)?.data;
    const totalItems = paginationData?.total ?? 0;
    const totalPages = paginationData?.last_page ?? Math.max(1, Math.ceil(totalItems / perPage));
    return (
        <div className="flex w-full flex-col gap-6 p-[12px_24px]">
            <div className="flex items-center justify-between">
                <h1 className="flex-1 text-xl font-bold text-slate-800">{t("partner.partner_list")}</h1>
                <div className="flex flex-wrap items-center justify-end gap-2 px-4 p-4">
                    <Button variant="default" size="sm" className="flex items_center gap-2 bg-blue-600 px-4 py-2 hover:bg-bluer-700" onClick={() => setOpen(true)}>
                        <Filter className="size-4" />
                        {t("common.filter")}
                    </Button>
                </div>
            </div>
            {open && (
                <PartnerSearchSection
                    open={open}
                    value={filters}
                    onChange={(val) => setFilters(prev => ({
                        ...prev,
                        user_name: val.user_name,
                        province_name: val.province_name,
                        ward_name: val.ward_name,
                        phone: val.phone,
                        address: val.address,
                    }))}
                    onReset={handleResetFilters}
                    onClose={() => setOpen(false)}
                />
            )}
            {isLoading ? (
                <div className="rounded-lg border bg-white p-6 text-sm text-slate-500">{t("common.loading")}</div>
            ) : (
                <div className="w-full rounded-lg border border-blue-100 bg-white">
                    <PartnerTable
                        filtered={filtered}
                        onSort={toggleSort}
                        filters={filters}
                    />
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

export default Partners;