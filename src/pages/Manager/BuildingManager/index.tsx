import EmptyPage from "@/components/EmptyPage";
import Pagination from "@/components/Pagination";
import { DEFAULT_CARD_LIMIT, DEFAULT_PAGE, ROUTERS, SEARCH_DEBOUNCE_DELAY_MS } from "@/constant";
import { Building, SearchBuildingRequest } from "@/dataHelper/building.dataHelper";
import { useBuildingsQuery, useDeleteBuildingMutation } from "@/hooks/useBuildingQuery";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { BuildingHeader, BuildingSearchSection, BuildingCard, DeleteConfirmDialog } from "./components";
import { useBuildingSort } from "./hooks";
import { Spinner } from "@/components/ui/spinner";

const Buildings: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Sort logic
  const { sort, clearSort } = useBuildingSort();

  // Search params
  const [searchParams, setSearchParams] = useState<SearchBuildingRequest>({
    page: DEFAULT_PAGE,
    per_page: DEFAULT_CARD_LIMIT,
    name: "",
    area_max: undefined,
    area_min: undefined,
    province_name: "",
    ward_name: "",
    year_built: "",
    property_type_id: undefined,
    sort: null,
  });

  // Fetch api data
  const { data: dataBuilding, isLoading: isLoadingBuilding, error: errorBuilding } = useBuildingsQuery(searchParams);

  // Extract data
  const buildings = dataBuilding?.data?.data ?? [];
  const page = dataBuilding?.data?.current_page ?? searchParams.page ?? DEFAULT_PAGE;
  const perPage = dataBuilding?.data?.per_page ?? DEFAULT_CARD_LIMIT;
  const totalPages = dataBuilding?.data?.last_page ?? 1;
  const totalItems = dataBuilding?.data?.total ?? 0;

  // Search params
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState<SearchBuildingRequest>({
    page: DEFAULT_PAGE,
    per_page: DEFAULT_CARD_LIMIT,
    name: "",
    area_max: undefined,
    area_min: undefined,
    province_name: "",
    ward_name: "",
    year_built: "",
    property_type_id: undefined,
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
      sort: null,
    };
    setFilters(resetFilters);
    setSearchParams(resetFilters);
    clearSort();
  };

  // Realtime search với debounce cho filters
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

  // Delete building
  const [deleteTarget, setDeleteTarget] = useState<Building | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const deleteMutation = useDeleteBuildingMutation();
  const deleteLoading = deleteMutation.isPending;

  const askDelete = (id: number) => {
    const target = dataBuilding?.data?.data?.find((x: Building) => x.id === id) || null;
    setDeleteTarget(target);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync(Number(deleteTarget.id));
    setDeleteOpen(false);
    setDeleteTarget(null);
  };

  const handleCreateBuilding = () => {
    navigate(ROUTERS.BUILDINGS_ADD);
  };

  return (
    <div className="flex w-full flex-col gap-6 p-[12px_24px]">
      <BuildingHeader onCreateBuilding={handleCreateBuilding} onOpenFilter={() => setOpen(true)} />
      <BuildingSearchSection
        open={open}
        filters={filters}
        setFilters={setFilters}
        onReset={handleResetFilters}
        onClose={() => setOpen(false)}
      />
      <DeleteConfirmDialog
        building={deleteTarget}
        isOpen={deleteOpen}
        isLoading={deleteLoading}
        onClose={() => setDeleteOpen(false)}
        onConfirm={confirmDelete}
      />
      {isLoadingBuilding ? (
        <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-slate-100 bg-white/50">
          <Spinner size="lg" showText text={t("common.loading_data")} />
        </div>
      ) : errorBuilding ? (
        <div className="rounded-lg border bg-white p-6 text-sm text-slate-500">{t("common.error")}</div>
      ) : totalItems === 0 ? (
        <EmptyPage />
      ) : (
        <div className="flex flex-col gap-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {buildings.map((building: Building) => (
              <BuildingCard
                key={building.id}
                building={building}
                onView={(b: Building) => navigate(`${ROUTERS.BUILDINGS_DETAIL}/${b.user_id}/${b.id}`)}
                onEdit={(b: Building) => navigate(`${ROUTERS.BUILDINGS_EDIT}/edit-building/${b.user_id}/${b.id}`)}
                onDelete={(b: Building) => askDelete(Number(b.id))}
                isDeleting={deleteLoading && deleteTarget?.id === building.id}
              />
            ))}
          </div>
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

export default Buildings;
