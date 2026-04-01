import EmptyPage from "@/components/EmptyPage";
import Pagination from "@/components/Pagination";
import { Button } from "@/components/ui/button";
import { DEFAULT_LIMIT, DEFAULT_PAGE } from "@/constant";
import { CreateServiceRequest, Service, ServiceFilters } from "@/dataHelper/service.dataHelper";
import { useAllServicesQuery, useCreateServiceMutation, useDeleteServicesMutation, useGetServicesMutation, useUpdateServiceMutation } from "@/hooks/useServiceQuery";
import { Filter, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { AddServiceDialog, DeleteConfirmDialog, DetailServiceDialog, EditServiceDialog, ServiceSearchSection, ServiceTable } from "./components";

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

    type SortKey = "id" | "name" | "created_at" | "updated_at";

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
        per_page: DEFAULT_LIMIT,
    });

    const { data: apiData, isLoading } = useGetServicesMutation(debouncedFilters);
    const { data: allData } = useAllServicesQuery();
    const names = allData?.map(item => item.name) || [];

    const page = filters.page ?? DEFAULT_PAGE;
    const perPage = filters.per_page ?? DEFAULT_LIMIT;



    // hook to clear edit server error when edit dialog is closed
    useEffect(() => {
        if (!editServiceOpen) {
            setEditServerError(null);
        }
    }, [editServiceOpen]);
    // hook to clear delete server error when delete dialog is closed
    useEffect(() => {
        if (!addServiceOpen) {
            setServerError(null);
        }
    }, [addServiceOpen]);
    //hook to clear delete server error when delete dialog is closed
    useEffect(() => {
        if (!deleteOpen) {
            setServerError(null);
        }
    }, [deleteOpen]);

    // map API data to list data
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

    const filtered = useMemo(() => {
        return serverRows;
    }, [serverRows]);

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
    const deleteLoading = deleteMutation.isPending;

    const createServiceMutation = useCreateServiceMutation();
    const createServiceLoading = createServiceMutation.isPending;

    const updateServiceMutation = useUpdateServiceMutation();
    const updateServiceLoading = updateServiceMutation.isPending;


    const handleReset = () => {
        setName("");
        setPriceMin("");
        setPriceMax("");
        setFilters((prev) => ({
            ...prev,
            page: DEFAULT_PAGE,
        }));
    };

    const handleAddService = async (data: CreateServiceRequest) => {
        setServerError(null);
        try {
            await createServiceMutation.mutateAsync(data);
            setAddServiceOpen(false);
        } catch (error: any) {
            if (error?.response?.data?.message) {
                setServerError(error.response.data.message);
            }
        }
    };

    const askViewService = (id: number) => {
        const target = serverRows.find(item => item.id === id) || null;
        setViewTarget(target);
        setViewServiceOpen(true);
    };

    const askEditService = (id: number) => {
        const target = serverRows.find(item => item.id === id) || null;
        setEditTarget(target);
        setEditServiceOpen(true);
    };

    const handleEditService = async (data: CreateServiceRequest) => {
        if (!editTarget) return;
        setEditServerError(null);
        try {
            await updateServiceMutation.mutateAsync({
                id: editTarget.id,
                data: data,
            })
            setEditServiceOpen(false);
            setEditTarget(null);
        } catch (error: any) {
            if (error?.response?.data?.message) {
                setEditServerError(error.response.data.message);
            }
        }
    };

    const askDeleteService = (id: number) => {
        const target = filtered.find(item => item.id === id) || null;
        setDeleteTarget(target);
        setDeleteOpen(true);
    };

    const handleDeleteService = async () => {
        if (!deleteTarget) return;
        await deleteMutation.mutateAsync(deleteTarget.id);
        setDeleteOpen(false);
        setDeleteTarget(null);
    };

    return (
        <div className="flex w-full flex-col gap-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{t('serviceManagement.title')}</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="flex items-center gap-2 px-4 py-2 border-primary text-primary hover:bg-primary/5" onClick={() => setOpen(true)}>
                        <Filter className="size-4" />
                        {t('serviceManagement.filter_search')}
                    </Button>
                    <Button variant="default" size="sm" className="flex items-center gap-2 px-4 py-2" onClick={() => setAddServiceOpen(true)}>
                        <Plus className="size-4" />
                        {t('serviceManagement.addService')}
                    </Button>
                </div>
            </div>
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
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="p-12 text-center text-sm text-slate-500">{t("common.loading")}</div>
                ) : totalItems === 0 ? (
                    <div className="p-12">
                        <EmptyPage />
                    </div>
                ) : (
                    <>
                        <ServiceTable
                            filtered={filtered}
                            onSort={toggleSort}
                            onEdit={askEditService}
                            onView={askViewService}
                            onDelete={askDeleteService}
                            filters={filters}
                        />
                        {totalItems > 0 && (
                            <div className="p-4 border-t border-slate-100">
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
                    </>
                )}
            </div>

            <DeleteConfirmDialog service={deleteTarget} isOpen={deleteOpen} isLoading={deleteLoading} onClose={() => setDeleteOpen(false)} onConfirm={handleDeleteService} />
            <AddServiceDialog isOpen={addServiceOpen} isLoading={createServiceLoading} serverError={serverError} existingServices={names} onClose={() => setAddServiceOpen(false)} onSubmit={handleAddService} />
            <EditServiceDialog service={editTarget} isOpen={editServiceOpen} isLoading={updateServiceLoading} editServerError={editServerError} onClose={() => setEditServiceOpen(false)} onSubmit={handleEditService} />
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