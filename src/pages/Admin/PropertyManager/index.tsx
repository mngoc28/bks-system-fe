import EmptyPage from "@/components/EmptyPage";
import Pagination from "@/components/Pagination";
import { DEFAULT_CARD_LIMIT, DEFAULT_PAGE, ROUTERS, SEARCH_DEBOUNCE_DELAY_MS } from "@/constant";
import { Property, SearchPropertyRequest } from "@/dataHelper/property.dataHelper";
import { usePropertiesQuery, useDeletePropertyMutation } from "@/hooks/usePropertyQuery";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PropertyHeader, PropertySearchSection, PropertyCard, DeleteConfirmDialog, PropertyTable } from "./components";
import { usePropertySort } from "./hooks";
import { Spinner } from "@/components/ui/spinner";
import { ViewMode } from "@/components/LayoutToggle";
import ContextFilterChips from "@/components/admin/ContextFilterChips";
import { clearAdminContext, parseAdminContext } from "@/utils/adminNavigation";

/**
 * Properties Management Page
 * Handles the display, search, filtering, and deletion of properties in the system.
 */
const Properties: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [urlSearchParams, setUrlSearchParams] = useSearchParams();
  const context = parseAdminContext(urlSearchParams.toString());
  const partnerIdContext = Number(urlSearchParams.get("partner_id") || "") || undefined;

  // Sort logic
  const { sort, clearSort, toggleSort, getSortDirection } = usePropertySort();

  // View mode state with localStorage persistence
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const savedMode = localStorage.getItem("propertyManager_viewMode");
    return (savedMode as ViewMode) || "table"; // Default to table
  });

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem("propertyManager_viewMode", mode);
  };

  // Search params
  const [searchParams, setSearchParams] = useState<SearchPropertyRequest>({
    page: DEFAULT_PAGE,
    per_page: DEFAULT_CARD_LIMIT,
    name: "",
    area_max: undefined,
    area_min: undefined,
    province_name: "",
    ward_name: "",
    year_built: "",
    property_type_id: undefined,
    partner_id: partnerIdContext,
    sort: null,
  });

  // Fetch api data
  const { data: dataProperty, isLoading: isLoadingProperty, error: errorProperty } = usePropertiesQuery(searchParams);

  // Extract data
  const properties = dataProperty?.data?.data ?? [];
  const page = dataProperty?.data?.current_page ?? searchParams.page ?? DEFAULT_PAGE;
  const perPage = dataProperty?.data?.per_page ?? DEFAULT_CARD_LIMIT;
  const totalPages = dataProperty?.data?.last_page ?? 1;
  const totalItems = dataProperty?.data?.total ?? 0;

  // Search params
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState<SearchPropertyRequest>({
    page: DEFAULT_PAGE,
    per_page: DEFAULT_CARD_LIMIT,
    name: "",
    area_max: undefined,
    area_min: undefined,
    province_name: "",
    ward_name: "",
    year_built: "",
    property_type_id: undefined,
    partner_id: partnerIdContext,
  });

  const handleResetFilters = () => {
    const resetFilters = {
      page: DEFAULT_PAGE,
      per_page: DEFAULT_CARD_LIMIT,
      name: "",
      area_max: undefined,
      area_min: undefined,
      province_name: "",
      ward_name: "",
      year_built: "",
      property_type_id: undefined,
      partner_id: partnerIdContext,
      sort: null,
    };
    setFilters(resetFilters);
    setSearchParams(resetFilters);
    clearSort();
  };

  // Realtime search với debounce cho filters
  useEffect(() => {
    const partnerId = Number(urlSearchParams.get("partner_id") || "") || undefined;
    setFilters((prev) => ({ ...prev, partner_id: partnerId }));
    setSearchParams((prev) => ({ ...prev, partner_id: partnerId }));
  }, [urlSearchParams]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchParams((prev) => ({
        ...filters,
        page: DEFAULT_PAGE,
        sort: prev.sort,
      }));
    }, SEARCH_DEBOUNCE_DELAY_MS);

    return () => clearTimeout(timer);
  }, [filters]);

  // Update sort immediately when sort changes (without debounce)
  useEffect(() => {
    setSearchParams((prev) => ({
      ...prev,
      sort: sort.length > 0
        ? sort.map((s) => ({ field: s.key as string, order: s.direction as string }))
        : null,
    }));
  }, [sort]);

  // Delete property
  const [deleteTarget, setDeleteTarget] = useState<Property | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const deleteMutation = useDeletePropertyMutation();
  const deleteLoading = deleteMutation.isPending;

  const askDelete = (id: number) => {
    const target = dataProperty?.data?.data?.find((x: Property) => x.id === id) || null;
    setDeleteTarget(target);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync(Number(deleteTarget.id));
    setDeleteOpen(false);
    setDeleteTarget(null);
  };

  const handleCreateProperty = () => {
    navigate(ROUTERS.PROPERTIES_ADD);
  };

  return (
    <div className="flex w-full flex-col gap-6 p-[12px_24px]">
      <PropertyHeader 
        onCreateProperty={handleCreateProperty} 
        onOpenFilter={() => setOpen(true)} 
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
      />
      <PropertySearchSection
        open={open}
        filters={filters}
        setFilters={setFilters}
        onReset={handleResetFilters}
        onClose={() => setOpen(false)}
      />
      <ContextFilterChips
        context={context}
        onClear={() => {
          const nextQuery = clearAdminContext(urlSearchParams.toString());
          setUrlSearchParams(nextQuery);
          setFilters((prev) => ({ ...prev, partner_id: undefined }));
          setSearchParams((prev) => ({ ...prev, partner_id: undefined }));
        }}
      />
      <DeleteConfirmDialog
        property={deleteTarget}
        isOpen={deleteOpen}
        isLoading={deleteLoading}
        onClose={() => setDeleteOpen(false)}
        onConfirm={confirmDelete}
      />
      {isLoadingProperty ? (
        <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-slate-100 bg-white/50">
          <Spinner size="lg" showText text={t("common.loading_data")} />
        </div>
      ) : errorProperty ? (
        <div className="rounded-lg border bg-white p-6 text-sm text-slate-500">{t("common.error")}</div>
      ) : totalItems === 0 ? (
        <EmptyPage />
      ) : (
        <div className="flex flex-col gap-8">
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {properties.map((property: Property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  highlightTerms={{
                    name: filters.name || "",
                    province_name: filters.province_name || "",
                    ward_name: filters.ward_name || "",
                  }}
                  onView={(b: Property) => navigate(`${ROUTERS.PROPERTIES_DETAIL}/${b.id}`)}
                  onEdit={(b: Property) => navigate(`${ROUTERS.PROPERTIES_EDIT}/edit-property/${b.id}`)}
                  onDelete={(b: Property) => askDelete(Number(b.id))}
                  isDeleting={deleteLoading && deleteTarget?.id === property.id}
                />
              ))}
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <PropertyTable
                    properties={properties}
                    sort={sort}
                    onToggleSort={toggleSort}
                    getSortDirection={getSortDirection}
                    onClearSort={clearSort}
                    onDelete={askDelete}
                    highlightTerms={{
                      name: filters.name || "",
                      province_name: filters.province_name || "",
                      ward_name: filters.ward_name || "",
                    }}
                />
            </div>
          )}
          {totalItems > 0 && (
            <div className="p-4">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={(page) => setSearchParams((prev) => ({ ...prev, page }))}
                perPage={perPage}
                onPerPageChange={(perPage) => setSearchParams((prev) => ({ ...prev, per_page: perPage }))}
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

export default Properties;

