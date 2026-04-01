import EmptyPage from "@/components/EmptyPage";
import { Button } from "@/components/ui/button";
import { DEFAULT_LIMIT, DEFAULT_PAGE } from "@/constant";
import type { Amenity, AmenityFilters } from "@/dataHelper/amenity.dataHelper";
import { useAmenitiesQuery, useCreateAmenityMutation, useDeleteAmenityMutation, useUpdateAmenityMutation } from "@/hooks/useAmenityQuery";
import { Filter, Plus } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { AddAmenityDialog, AmenitySearchSection, AmenityTable, DeleteConfirmDialog, EditAmenityDialog } from "./components";
import PageBar from "@/components/PageBar";

// Main Amenity Management Component
const AmenityManagement: React.FC = () => {
  const { t } = useTranslation();
  const [highlightedId, setHighlightedId] = useState<number | null>(null);
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [perPage, setPerPage] = useState(DEFAULT_LIMIT);
  const [sortField, setSortField] = useState<string | undefined>(undefined);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | undefined>(undefined);
  const [searchValue, setSearchValue] = useState("");
  const [searchName, setSearchName] = useState("");
  const [open, setOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Amenity | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [addAmenityOpen, setAddAmenityOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [editAmenityOpen, setEditAmenityOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Amenity | null>(null);
  const [editServerError, setEditServerError] = useState<string | null>(null);

  // hook to clear highlighted ID after 5 seconds
  useEffect(() => {
    if (highlightedId) {
      const timer = setTimeout(() => setHighlightedId(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [highlightedId]);

  // hook to debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchName(searchValue);
      setPage(DEFAULT_PAGE);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchValue]);

  // hook to clear edit server error when edit dialog is closed
  useEffect(() => {
    if (!editAmenityOpen) {
      setEditServerError(null);
    }
  }, [editAmenityOpen]);

  // hook to clear add server error when add dialog is closed
  useEffect(() => {
    if (!addAmenityOpen) {
      setServerError(null);
    }
  }, [addAmenityOpen]);

  type SortKey = "id" | "name" | "created_at" | "updated_at";

  // Prepare filters for API query
  const filters: AmenityFilters = {
    name: searchName,
    page,
    per_page: perPage,
    sort_field: sortField,
    sort_direction: sortDirection,
  };

  const { data: apiData, isLoading } = useAmenitiesQuery(filters);

  // Map API data to Amenity type
  const serverRows: Amenity[] = useMemo(() => {
    const list: any[] = apiData?.data ?? [];
    return list.map((item: any) => ({
      id: item.id ?? 0,
      name: item.name ?? "",
      created_by: item.created_by ?? 0,
      updated_by: item.updated_by ?? 0,
      created_at: item.created_at ?? "",
      updated_at: item.updated_at ?? "",
    }));
  }, [apiData]);

  const filtered = useMemo(() => {
    return serverRows;
  }, [serverRows]);

  const totalItems = apiData?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));

  const deleteMutation = useDeleteAmenityMutation();
  const deleteLoading = deleteMutation.isPending;

  const createAmenityMutation = useCreateAmenityMutation();
  const createAmenityLoading = createAmenityMutation.isPending;

  const updateAmenityMutation = useUpdateAmenityMutation();
  const updateAmenityLoading = updateAmenityMutation.isPending;

  // Toggle sorting logic
  const toggleSort = (key: SortKey) => {
    if (sortField === key) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else {
        setSortField(undefined);
        setSortDirection(undefined);
      }
    } else {
      setSortField(key);
      setSortDirection("asc");
    }
  };

  const handleReset = () => {
    setSearchValue("");
    setSearchName("");
    setPage(DEFAULT_PAGE);
    setPerPage(DEFAULT_LIMIT);
    setSortField(undefined);
    setSortDirection(undefined);
  };

  const askDelete = (id: number) => {
    const target = filtered.find((x) => x.id === id) || null;
    setDeleteTarget(target);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync(deleteTarget.id);
    setDeleteOpen(false);
    setDeleteTarget(null);
  };

  const handleAddAmenity = async (data: { name: string }) => {
    setServerError(null);
    try {
      const result = await createAmenityMutation.mutateAsync(data);
      setHighlightedId(result.data.id);
      setAddAmenityOpen(false);
    } catch (error: any) {
      if (error?.response?.data?.message) {
        setServerError(error.response.data.message);
      }
    }
  };

  const askEdit = (id: number) => {
    const target = filtered.find((x) => x.id === id) || null;
    setEditTarget(target);
    setEditAmenityOpen(true);
  };

  const handleEditAmenity = async (data: { name: string }) => {
    if (!editTarget) return;
    setEditServerError(null);
    try {
      await updateAmenityMutation.mutateAsync({
        id: editTarget.id,
        data: data,
      });
      setHighlightedId(editTarget.id);
      setEditAmenityOpen(false);
      setEditTarget(null);
    } catch (error: any) {
      if (error?.response?.data?.message) {
        setEditServerError(error.response.data.message);
      }
    }
  };

  return (
    <div className="flex w-full flex-col gap-6">
      <PageBar
        subtitle={t("amenities.amenity_list")}
        actions={
          <>
            <Button variant="outline" size="sm" className="flex items-center gap-2 px-4 py-2 border-primary text-primary hover:bg-primary/5" onClick={() => setOpen((v) => !v)}>
              <Filter className="size-4" />
              {t("amenities.filter_search")}
            </Button>
            <Button variant="default" size="sm" className="flex items-center gap-2 px-4 py-2" onClick={() => setAddAmenityOpen(true)}>
              <Plus className="size-4" />
              {t("amenities.add_amenity")}
            </Button>
          </>
        }
      />

      {open && (
        <AmenitySearchSection
          open={open}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
          onReset={handleReset}
          onClose={() => setOpen(false)}
        />
      )}

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-sm text-slate-500">{t("common.loading")}</div>
        ) : totalItems === 0 ? (
          <div className="p-12">
            <EmptyPage/>
          </div>
        ) : (
          <AmenityTable
            filtered={filtered}
            page={page}
            perPage={perPage}
            totalPages={totalPages}
            totalItems={totalItems}
            onPageChange={(p) => setPage(p)}
            onPerPageChange={(pp) => {
              setPerPage(pp);
              setPage(DEFAULT_PAGE);
            }}
            onEdit={askEdit}
            onDelete={askDelete}
            highlightedId={highlightedId}
            toggleSort={toggleSort}
            filters={filters}
          />
        )}
      </div>

      <DeleteConfirmDialog amenity={deleteTarget} isOpen={deleteOpen} isLoading={deleteLoading} onClose={() => setDeleteOpen(false)} onConfirm={confirmDelete} />
      <AddAmenityDialog isOpen={addAmenityOpen} isLoading={createAmenityLoading} serverError={serverError} existingAmenities={serverRows.map(item => item.name)} onClose={() => setAddAmenityOpen(false)} onSubmit={handleAddAmenity} />
      <EditAmenityDialog amenity={editTarget} isOpen={editAmenityOpen} isLoading={updateAmenityLoading} serverError={editServerError} onClose={() => setEditAmenityOpen(false)} onSubmit={handleEditAmenity} />
    </div>
  );
};

export default AmenityManagement;