import EmptyPage from "@/components/EmptyPage";
import { Button } from "@/components/ui/button";
import { DEFAULT_CARD_LIMIT, DEFAULT_PAGE } from "@/constant";
import type { Amenity, AmenityFilters } from "@/dataHelper/amenity.dataHelper";
import { useAmenitiesQuery, useCreateAmenityMutation, useDeleteAmenityMutation, useUpdateAmenityMutation } from "@/hooks/useAmenityQuery";
import { Filter, Plus } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { AddAmenityDialog, AmenitySearchSection, DeleteConfirmDialog, EditAmenityDialog, AmenityCard } from "./components";
import PageBar from "@/components/PageBar";
import Pagination from "@/components/Pagination";
import { Spinner } from "@/components/ui/spinner";

const AmenityManagement: React.FC = () => {
  const { t } = useTranslation();
  const [highlightedId, setHighlightedId] = useState<number | null>(null);
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [perPage, setPerPage] = useState(DEFAULT_CARD_LIMIT);
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

  useEffect(() => {
    if (highlightedId) {
      const timer = setTimeout(() => setHighlightedId(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [highlightedId]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchName(searchValue);
      setPage(DEFAULT_PAGE);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchValue]);

  useEffect(() => {
    if (!editAmenityOpen) setEditServerError(null);
  }, [editAmenityOpen]);

  useEffect(() => {
    if (!addAmenityOpen) setServerError(null);
  }, [addAmenityOpen]);

  const filters: AmenityFilters = {
    name: searchName,
    page,
    per_page: perPage,
    sort_field: sortField,
    sort_direction: sortDirection,
  };

  const { data: apiData, isLoading } = useAmenitiesQuery(filters);

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

  const filtered = useMemo(() => serverRows, [serverRows]);

  const totalItems = apiData?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));

  const deleteMutation = useDeleteAmenityMutation();
  const createAmenityMutation = useCreateAmenityMutation();
  const updateAmenityMutation = useUpdateAmenityMutation();

  const handleReset = () => {
    setSearchValue("");
    setSearchName("");
    setPage(DEFAULT_PAGE);
    setPerPage(DEFAULT_CARD_LIMIT);
    setSortField(undefined);
    setSortDirection(undefined);
  };

  const askDelete = (id: number) => {
    setDeleteTarget(filtered.find((x) => x.id === id) || null);
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
      if (error?.response?.data?.message) setServerError(error.response.data.message);
    }
  };

  const askEdit = (id: number) => {
    setEditTarget(filtered.find((x) => x.id === id) || null);
    setEditAmenityOpen(true);
  };

  const handleEditAmenity = async (data: { name: string }) => {
    if (!editTarget) return;
    setEditServerError(null);
    try {
      await updateAmenityMutation.mutateAsync({ id: editTarget.id, data });
      setHighlightedId(editTarget.id);
      setEditAmenityOpen(false);
      setEditTarget(null);
    } catch (error: any) {
      if (error?.response?.data?.message) setEditServerError(error.response.data.message);
    }
  };

  return (
    <div className="flex w-full flex-col gap-6 p-[0_24px_24px]">
      <PageBar
        subtitle={t("amenities.amenity_list")}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 border-slate-200 bg-white font-semibold text-slate-600 transition-all hover:bg-slate-50 hover:text-indigo-600"
              onClick={() => setOpen((v) => !v)}
            >
              <Filter className="size-4" />
              {t("common.filter")}
            </Button>
            <Button
              variant="default"
              size="sm"
              className="flex items-center gap-2 bg-indigo-600 font-semibold text-white shadow-md transition-all hover:bg-indigo-700 hover:shadow-indigo-200"
              onClick={() => setAddAmenityOpen(true)}
            >
              <Plus className="size-4" />
              {t("amenities.add_amenity")}
            </Button>
          </div>
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

      {isLoading ? (
        <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-slate-100 bg-white/50">
          <Spinner size="lg" showText text={t("common.loading_data")} />
        </div>
      ) : totalItems === 0 ? (
        <EmptyPage />
      ) : (
        <div className="flex flex-col gap-8">
           <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 px-4">
              {filtered.map((m) => (
                <AmenityCard
                  key={m.id}
                  amenity={m}
                  onEdit={askEdit}
                  onDelete={askDelete}
                  isHighlighted={highlightedId === m.id}
                />
              ))}
           </div>
           {totalItems > 0 && (
             <div className="p-4">
               <Pagination
                 currentPage={page}
                 totalPages={totalPages}
                 onPageChange={(p) => setPage(p)}
                 perPage={perPage}
                 onPerPageChange={(pp) => {
                   setPerPage(pp);
                   setPage(DEFAULT_PAGE);
                 }}
                 totalItems={totalItems}
                 perPageOptions={[12, 24, 48]}
               />
             </div>
           )}
        </div>
      )}

      <DeleteConfirmDialog amenity={deleteTarget} isOpen={deleteOpen} isLoading={deleteMutation.isPending} onClose={() => setDeleteOpen(false)} onConfirm={confirmDelete} />
      <AddAmenityDialog isOpen={addAmenityOpen} isLoading={createAmenityMutation.isPending} serverError={serverError} existingAmenities={serverRows.map(item => item.name)} onClose={() => setAddAmenityOpen(false)} onSubmit={handleAddAmenity} />
      <EditAmenityDialog amenity={editTarget} isOpen={editAmenityOpen} isLoading={updateAmenityMutation.isPending} serverError={editServerError} onClose={() => setEditAmenityOpen(false)} onSubmit={handleEditAmenity} />
    </div>
  );
};

export default AmenityManagement;