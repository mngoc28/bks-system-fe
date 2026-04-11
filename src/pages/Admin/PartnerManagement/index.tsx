import { PartnerFilter, PartnerInfor } from "@/dataHelper/partner.dataHelper";
import { useListPartnerQuery } from "@/hooks/usePartnerQuery";
import { useEffect, useMemo, useState } from "react";
import EmptyPage from "@/components/EmptyPage";
import { DEFAULT_PAGE, DEFAULT_CARD_LIMIT, ROUTERS, SEARCH_DEBOUNCE_DELAY_MS } from "@/constant";
import Pagination from "@/components/Pagination";
import { PartnerCard, PartnerHeader, PartnerSearchSection } from "./components";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Spinner } from "@/components/ui/spinner";
import { PartnerTable } from "./components";
import { ViewMode } from "@/components/LayoutToggle";

/**
 * Partner Management Page
 * Handles the listing, searching, and navigation to partner details or edit forms.
 */
const Partners: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    // Filters state
    const [open, setOpen] = useState(false);
    const [filters, setFilters] = useState<PartnerFilter>({
        user_name: "",
        company_name: "",
        province_name: "",
        ward_name: "",
        phone: "",
        website: "",
        address: "",
        page: DEFAULT_PAGE,
        per_page: DEFAULT_CARD_LIMIT,
    });

    // View mode state with localStorage persistence
    const [viewMode, setViewMode] = useState<ViewMode>(() => {
        const savedMode = localStorage.getItem("partnerManagement_viewMode");
        return (savedMode as ViewMode) || "table"; // Default to table
    });

    const handleViewModeChange = (mode: ViewMode) => {
        setViewMode(mode);
        localStorage.setItem("partnerManagement_viewMode", mode);
    };

    // Debounced filters for API call
    const [debouncedFilters, setDebouncedFilters] = useState<PartnerFilter>(filters);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedFilters(filters);
        }, SEARCH_DEBOUNCE_DELAY_MS);

        return () => clearTimeout(handler);
    }, [filters]);

    // Fetch API data
    const { data: dataPartner, isLoading } = useListPartnerQuery(debouncedFilters);

    // Map API data to list data
    const serverRows: PartnerInfor[] = useMemo(() => {
        const list: any[] = (dataPartner as any)?.data?.data || [];

        return list.map((item: any) => ({
            id: item.id,
            user_name: item.user_name,
            company_name: item.company_name,
            website: item.website,
            province_name: item.province_name,
            ward_name: item.ward_name,
            address: item.address ?? "",
            phone: item.phone ?? "",
            image_1: item.image_1 ?? "",
        })) as PartnerInfor[];
    }, [dataPartner]);

    // Reset filter
    const handleResetFilters = () => {
        setFilters({
            user_name: "",
            province_name: "",
            ward_name: "",
            phone: "",
            address: "",
            page: DEFAULT_PAGE,
            per_page: DEFAULT_CARD_LIMIT,
        });
    };

    const paginationData = (dataPartner as any)?.data;
    const totalItems = paginationData?.total ?? 0;
    const totalPages = paginationData?.last_page ?? Math.max(1, Math.ceil(totalItems / (filters.per_page ?? DEFAULT_CARD_LIMIT)));

    return (
        <div className="flex w-full flex-col gap-8 p-[24px_32px]">
            <PartnerHeader 
                onOpenFilter={() => setOpen(true)} 
                viewMode={viewMode}
                onViewModeChange={handleViewModeChange}
            />
            
            <PartnerSearchSection
                open={open}
                value={filters}
                onChange={(val) => setFilters(prev => ({
                    ...prev,
                    ...val,
                    page: DEFAULT_PAGE // Reset page when searching
                }))}
                onReset={handleResetFilters}
                onClose={() => setOpen(false)}
            />

            {isLoading ? (
                <div className="flex min-h-[400px] items-center justify-center rounded-3xl border border-slate-100 bg-white/50 backdrop-blur-sm">
                    <Spinner size="lg" showText text={t("common.loading_data")} />
                </div>
            ) : totalItems === 0 ? (
                <EmptyPage />
            ) : (
                <div className="flex flex-col gap-10">
                    {viewMode === "grid" ? (
                        <>
                            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {serverRows.map((partner: PartnerInfor) => (
                                    <PartnerCard
                                        key={partner.id}
                                        partner={partner as any}
                                        onView={(id) => navigate(`${ROUTERS.PARTNER_MANAGEMENT}/detail/${id}`)}
                                        onEdit={(id) => navigate(`${ROUTERS.PARTNER_MANAGEMENT}/edit/${id}`)}
                                    />
                                ))}
                            </div>
                            {totalItems > 0 && (
                                <div className="flex justify-center border-t border-slate-100 pt-8 mt-4">
                                    <Pagination
                                        currentPage={filters.page ?? DEFAULT_PAGE}
                                        totalPages={totalPages}
                                        onPageChange={(p) => setFilters((prev) => ({ ...prev, page: p }))}
                                        perPage={filters.per_page ?? DEFAULT_CARD_LIMIT}
                                        onPerPageChange={(pp) => setFilters(prev => ({ ...prev, per_page: pp, page: DEFAULT_PAGE }))}
                                        totalItems={totalItems}
                                        perPageOptions={[12, 24, 48]}
                                    />
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm p-4">
                            <PartnerTable
                                filtered={serverRows}
                                onSort={(key: string) => {
                                    setFilters(prev => ({
                                        ...prev,
                                        sort_field: key,
                                        sort_direction: prev.sort_field === key && prev.sort_direction === 'asc' ? 'desc' : 'asc'
                                    }))
                                }}
                                filters={filters}
                            />
                            {totalItems > 0 && (
                                <div className="flex justify-center border-t border-slate-100 pt-8 mt-4">
                                    <Pagination
                                        currentPage={filters.page ?? DEFAULT_PAGE}
                                        totalPages={totalPages}
                                        onPageChange={(p) => setFilters((prev) => ({ ...prev, page: p }))}
                                        perPage={filters.per_page ?? DEFAULT_CARD_LIMIT}
                                        onPerPageChange={(pp) => setFilters(prev => ({ ...prev, per_page: pp, page: DEFAULT_PAGE }))}
                                        totalItems={totalItems}
                                        perPageOptions={[12, 24, 48]}
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Partners;