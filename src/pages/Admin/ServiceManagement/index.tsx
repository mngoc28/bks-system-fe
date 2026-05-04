import EmptyPage from "@/components/EmptyPage";
import Pagination from "@/components/Pagination";
import { Button } from "@/components/ui/button";
import { DEFAULT_CARD_LIMIT, DEFAULT_PAGE } from "@/constant";
import { CreateServiceRequest, Service, ServiceFilters } from "@/dataHelper/service.dataHelper";
import { useAllServicesQuery, useCreateServiceMutation, useDeleteServicesMutation, useGetServicesMutation, useUpdateServiceMutation } from "@/hooks/useServiceQuery";
import { Filter, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { AddServiceDialog, DeleteConfirmDialog, DetailServiceDialog, EditServiceDialog, ServiceSearchSection, ServiceCard, ServiceTable } from "./components";
import { Spinner } from "@/components/ui/spinner";
import PageBar from "@/components/PageBar";
import { ViewMode } from "@/components/LayoutToggle";

/**
 * Service Management Page
 * A comprehensive interface for property managers to define and maintain add-on services, including descriptions and pricing, which can be attached to room listings.
 */
const ServiceManagement: React.FC = () => {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [addServiceOpen, setAddServiceOpen] = useState(false);
    const [editServiceOpen, setEditServiceOpen] = useState(false);
    const [viewServiceOpen, setViewServiceOpen] = useState(false)
    const [Name, setName] = useState("");
    const [priceMin, setPriceMin] = useState("");
    const [priceMax, setPriceMax] = useState("");
    const [serverError, setServerError] = useState<string | null>(null);
    const [editServerError, setEditServerError] = useState<string | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Service | null>(null);
    const [editTarget, setEditTarget] = useState<Service | null>(null);
    const [viewTarget, setViewTarget] = useState<Service | null>(null);

    // View mode state with localStorage persistence
    const [viewMode, setViewMode] = useState<ViewMode>(() => {
        const savedMode = localStorage.getItem("serviceManagement_viewMode");
        return (savedMode as ViewMode) || "table"; // Default to table
    });

    const handleViewModeChange = (mode: ViewMode) => {
        setViewMode(mode);
        localStorage.setItem("serviceManagement_viewMode", mode);
    };

    const useDebouncedFilter = (initialFilter: ServiceFilters, delay = 500) => {
        const [filter, setFilter] = useState<ServiceFilters>(initialFilter);
        const [debouncedFilter, setDebouncedFilter] = useState<ServiceFilters>(initialFilter);

        useEffect(() => {
            const handler = setTimeout(() => {
                setDebouncedFilter(filter);
            }, delay);

            return () => clearTimeout(handler);
        }, [filter, delay]);

        return { filter, setFilter, debouncedFilter };
    };

    const { filter: filters, setFilter: setFilters, debouncedFilter: debouncedFilters } = useDebouncedFilter({
        name: Name,
        min_price: priceMin,
        max_price: priceMax,
        page: DEFAULT_PAGE,
        per_page: DEFAULT_CARD_LIMIT,
    });

    const { data: apiData, isLoading } = useGetServicesMutation(debouncedFilters);
    const { data: allData } = useAllServicesQuery();
    const names = allData?.map(item => item.name) || [];

    const page = filters.page ?? DEFAULT_PAGE;
    const perPage = filters.per_page ?? DEFAULT_CARD_LIMIT;

    useEffect(() => {
        if (!editServiceOpen) setEditServerError(null);
    }, [editServiceOpen]);
    
    useEffect(() => {
        if (!addServiceOpen) setServerError(null);
    }, [addServiceOpen]);
    
    useEffect(() => {
        if (!deleteOpen) setServerError(null);
    }, [deleteOpen]);

    const serverRows: Service[] = useMemo(() => {
        const list: any[] = (apiData as any)?.data?.data || [];
        return list.map((item: any) => ({
            id: item.id ?? 0,
            name: item.name ?? "",
            description: item.description ?? "",
            price: item.price  ?? "",
            created_at: item.created_at ?? "",
            updated_at: item.updated_at ?? "",
            created_by: item.created_by ?? 0,
            updated_by: item.updated_by ?? 0,
        }))
    }, [apiData]);

    const filtered = useMemo(() => serverRows, [serverRows]);

    useEffect(() => {
        setFilters((prev) => {
            if (prev.page === DEFAULT_PAGE) return prev;
            return { ...prev, page: DEFAULT_PAGE };
        });
    }, [filters.name, filters.min_price, filters.max_price]);

    const paginationData = (apiData as any)?.data;
    const totalItems = paginationData?.total ?? 0;
    const totalPages = paginationData?.last_page ?? Math.max(1, Math.ceil(totalItems / perPage));

    const deleteMutation = useDeleteServicesMutation();
    const createServiceMutation = useCreateServiceMutation();
    const updateServiceMutation = useUpdateServiceMutation();

    const handleReset = () => {
        setName("");
        setPriceMin("");
        setPriceMax("");
        setFilters((prev) => ({ ...prev, page: DEFAULT_PAGE }));
    };

    const handleAddService = async (data: CreateServiceRequest) => {
        setServerError(null);
        try {
            await createServiceMutation.mutateAsync(data);
            setAddServiceOpen(false);
        } catch (error: any) {
            if (error?.response?.data?.message) setServerError(error.response.data.message);
        }
    };

    const askViewService = (id: number) => {
        setViewTarget(serverRows.find(item => item.id === id) || null);
        setViewServiceOpen(true);
    };

    const askEditService = (id: number) => {
        setEditTarget(serverRows.find(item => item.id === id) || null);
        setEditServiceOpen(true);
    };

    const handleEditService = async (data: CreateServiceRequest) => {
        if (!editTarget) return;
        setEditServerError(null);
        try {
            await updateServiceMutation.mutateAsync({ id: editTarget.id, data });
            setEditServiceOpen(false);
            setEditTarget(null);
        } catch (error: any) {
            if (error?.response?.data?.message) setEditServerError(error.response.data.message);
        }
    };

    const askDeleteService = (id: number) => {
        setDeleteTarget(filtered.find(item => item.id === id) || null);
        setDeleteOpen(true);
    };

    const handleDeleteService = async () => {
        if (!deleteTarget) return;
        await deleteMutation.mutateAsync(deleteTarget.id);
        setDeleteOpen(false);
        setDeleteTarget(null);
    };

    return (
        <div className="flex w-full flex-col gap-8 p-[24px_32px]">
            <PageBar
                subtitle={t("serviceManagement.subtitle") || "Quản lý danh sách dịch vụ và tiện ích đi kèm."}
                showLayoutToggle={true}
                viewMode={viewMode}
                onViewModeChange={handleViewModeChange}
                actions={
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2 border-slate-200 bg-white font-semibold text-slate-600 transition-all hover:bg-slate-50 hover:text-indigo-600"
                            onClick={() => setOpen(true)}
                        >
                            <Filter className="size-4" />
                            {t("common.filter")}
                        </Button>
                        <Button
                            variant="default"
                            size="sm"
                            className="flex items-center gap-2 bg-indigo-600 font-semibold text-white shadow-md transition-all hover:bg-indigo-700 hover:shadow-indigo-200"
                            onClick={() => setAddServiceOpen(true)}
                        >
                            <Plus className="size-4" />
                            {t("serviceManagement.addService")}
                        </Button>
                    </div>
                }
            />
            {open && (
                <ServiceSearchSection
                    open={open}
                    value={{ name: filters.name ?? "", priceMin: filters.min_price ?? "", priceMax: filters.max_price ?? ""}}
                    onChange={(val) => setFilters(prev => ({
                        ...prev,
                        name: val.name,
                        min_price: val.priceMin,
                        max_price: val.priceMax,
                    }))}
                    onReset={handleReset}
                    onClose={() => setOpen(false)}
                />
            )}
            
            {isLoading ? (
                <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-slate-100 bg-white/50">
                    <Spinner size="lg" showText text={t("common.loading_data")} />
                </div>
            ) : totalItems === 0 ? (
                <EmptyPage />
            ) : (
                <div className="flex flex-col gap-8">
                    {viewMode === "grid" ? (
                        <div className="grid grid-cols-1 gap-6 px-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {filtered.map((service: Service) => (
                                <ServiceCard
                                    key={service.id}
                                    service={service}
                                    searchTerm={filters.name || ""}
                                    onView={askViewService}
                                    onEdit={askEditService}
                                    onDelete={askDeleteService}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                            <ServiceTable 
                                filtered={filtered}
                                onView={askViewService}
                                onEdit={askEditService}
                                onDelete={askDeleteService}
                                filters={filters}
                                onSort={(field) => {
                                    setFilters(prev => ({
                                        ...prev,
                                        sort_field: field,
                                        sort_direction: prev.sort_field === field && prev.sort_direction === "asc" ? "desc" : "asc"
                                    }));
                                }}
                            />
                        </div>
                    )}
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
                                perPageOptions={[12, 24, 48]}
                            />
                        </div>
                    )}
                </div>
            )}

            <DeleteConfirmDialog service={deleteTarget} isOpen={deleteOpen} isLoading={deleteMutation.isPending} onClose={() => setDeleteOpen(false)} onConfirm={handleDeleteService} />
            <AddServiceDialog isOpen={addServiceOpen} isLoading={createServiceMutation.isPending} serverError={serverError} existingServices={names} onClose={() => setAddServiceOpen(false)} onSubmit={handleAddService} />
            <EditServiceDialog service={editTarget} isOpen={editServiceOpen} isLoading={updateServiceMutation.isPending} editServerError={editServerError} onClose={() => setEditServiceOpen(false)} onSubmit={handleEditService} />
            <DetailServiceDialog
                service={viewTarget}
                isOpen={viewServiceOpen}
                onClose={() => {
                    setViewServiceOpen(false);
                    setViewTarget(null);
                }}
            />
        </div>
    );
}

export default ServiceManagement;