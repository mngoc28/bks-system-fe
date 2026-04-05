import EmptyPage from "@/components/EmptyPage";
import { Button } from "@/components/ui/button";
import { toastError } from "@/components/ui/toast";
import { DEFAULT_CARD_LIMIT, DEFAULT_PAGE, ROUTERS } from "@/constant";
import { Room, type RoomFilters, type RoomListData } from "@/dataHelper/room.dataHelper";
import { useDeleteRoomMutation, useRoomsQuery } from "@/hooks/useRoomQuery";
// import { useGetUserProfileQuery } from "@/hooks/useUserQuery";
import { Filter, Plus } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router";
import { DeleteRoomDialog, RoomSearchSection, RoomCard } from "./components";
import Pagination from "@/components/Pagination";
import { Spinner } from "@/components/ui/spinner";
import PageBar from "@/components/PageBar";

// Main Room Manager Component
/**
 * Room Manager Page
 * The central hub for property managers to oversee all room listings, featuring advanced search filters, status tracking, and quick actions for editing or deletion.
 */
const RoomManager: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const [highlightedId, setHighlightedId] = useState<number | null>(null);

  const [open, setOpen] = useState(false);

  // Set highlightedId and pagination from navigation state
  useEffect(() => {
    if (location.state?.highlightedId) {
      setHighlightedId(location.state.highlightedId);
      // Clear the state to prevent re-highlighting on subsequent navigations
      window.history.replaceState({}, document.title);
    }
    if (location.state?.page) {
      setPage(location.state.page);
    }
    if (location.state?.perPage) {
      setPerPage(location.state.perPage);
    }
    if (location.state?.sortField) {
      setSortField(location.state.sortField);
    }
    if (location.state?.sortDirection) {
      setSortDirection(location.state.sortDirection);
    }
    if (location.state?.filter) {
      setFilters(location.state.filter);
    }
  }, [location.state]);


  const [page, setPage] = useState(DEFAULT_PAGE);
  const [perPage, setPerPage] = useState(DEFAULT_CARD_LIMIT);
  const [sortField, setSortField] = useState<string | undefined>(undefined);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | undefined>(undefined);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<{ id: number; room_number: string; building_name: string; } | null>(null);
  const [filter, setFilters] = useState<RoomFilters>({
    page: DEFAULT_PAGE,
    per_page: DEFAULT_CARD_LIMIT,
  });

  const handleResetFilters = () => {
    setFilters({
      page: DEFAULT_PAGE,
      per_page: DEFAULT_CARD_LIMIT,
    });
    setSortField(undefined);
    setSortDirection(undefined);
  };

  // create filters object to send API
  const filters: RoomFilters = useMemo(() => ({
    page,
    per_page: perPage,
    sort_field: sortField,
    sort_direction: sortDirection,
    ...(filter.title && { title: filter.title }),
    ...(filter.room_number && { room_number: filter.room_number }),
    ...(filter.room_type && { room_type: filter.room_type }),
    ...(filter.status !== undefined && { status: filter.status }),
    ...(filter.min_area && { min_area: filter.min_area }),
    ...(filter.max_area && { max_area: filter.max_area }),
    ...(filter.min_price && { min_price: filter.min_price }),
    ...(filter.max_price && { max_price: filter.max_price }),
    ...(filter.floor_number && { floor_number: filter.floor_number }),
    ...(filter.people && { people: filter.people }),
  }), [filter, page, perPage, sortField, sortDirection]);

  // call api to get rooms with filters
  const { data, isLoading } = useRoomsQuery(filters) as { data: RoomListData | undefined; isLoading: boolean };
  const deleteRoomMutation = useDeleteRoomMutation();

  // handle rooms data from API
  const rooms = useMemo(() => {
    return data?.data?? [];
  }, [data]);

  // pagination info form API
  const totalPages = data?.last_page ?? 1;
  const totalItems = data?.total ?? rooms.length;



  const handleCreateRoom = () => {
    navigate(ROUTERS.ROOMS_ADD, { state: { page, perPage, sortField, sortDirection, filter } });
  }

  const handleViewRoom = (id: string | number) => {
    navigate(`${ROUTERS.ROOMS_DETAIL}/${id}`, { state: { page, perPage, sortField, sortDirection, filter, highlightedId: id } });
  }

  const handleEditRoom = (id: string | number) => {
    navigate(`${ROUTERS.ROOMS_EDIT}/${id}`, { state: { page, perPage, sortField, sortDirection, filter, highlightedId: id, fromRoomList: true } });
  }

  // Scroll to highlighted room when rooms data changes
  useEffect(() => {
    if (highlightedId && rooms.length > 0) {
      // wait for DOM to update
      setTimeout(() => {
        const element = document.getElementById(`room-${highlightedId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  }, [highlightedId, rooms]);

  // Scroll to room after data is loaded (for scrollToId)
  useEffect(() => {
    if (location.state?.scrollToId && rooms.length > 0 && !isLoading) {
      const element = document.getElementById(`room-row-${location.state.scrollToId}`);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
      }
      // Clear the state to prevent re-scrolling on subsequent navigations
      window.history.replaceState({}, document.title);
    }
  }, [location.state?.scrollToId, rooms, isLoading]);

  // Clear highlightedId after 3 seconds
  useEffect(() => {
    if (highlightedId) {
      // Scroll to highlighted element
      const element = document.getElementById(`room-row-${highlightedId}`);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
      
      const timer = setTimeout(() => setHighlightedId(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [highlightedId]);

  const handleDeleteRoom = (room: Room) => {
    setRoomToDelete({
      id: room.id,
      room_number: room.room_number || '',
      building_name: room.building_name || '-'
    });
    setDeleteDialogOpen(true);
  }

  const handleConfirmDeleteRoom = async () => {
    if (!roomToDelete) return;
    try {
      await deleteRoomMutation.mutateAsync(roomToDelete.id);
      setDeleteDialogOpen(false);
      setRoomToDelete(null);
    } catch (error: any) {
      if (error.response?.status === 422 && error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const errorsMessage = Object.values(errors).flat().join(', ');
        toastError(errorsMessage);
      } else {
        toastError(t("rooms.error_deleting_room"));
      }
    }
  }



  return (
    <div className="flex w-full flex-col gap-8 p-[24px_32px]">
      <PageBar
        subtitle={t("rooms.room_list_subtitle") || "Quản lý danh sách phòng và trạng thái lưu trú."}
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
              onClick={handleCreateRoom}
            >
              <Plus className="size-4" />
              {t("rooms.create_room")}
            </Button>
          </div>
        }
      />

      {open && <RoomSearchSection
        open={open}
        filters={filters}
        setFilters={setFilters}
        onReset={handleResetFilters}
        onClose={() => setOpen((v) => !v)}
      />}

      {isLoading ? (
        <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-slate-100 bg-white/50">
          <Spinner size="lg" showText text={t("common.loading_data")} />
        </div>
      ) : totalItems === 0 ? (
        <EmptyPage />
      ) : (
        <div className="flex flex-col gap-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {rooms.map((room: Room) => (
              <RoomCard
                key={room.id}
                room={room}
                onView={handleViewRoom}
                onEdit={handleEditRoom}
                onDelete={handleDeleteRoom}
                isDeleting={deleteRoomMutation.isPending && roomToDelete?.id === room.id}
                highlighted={highlightedId === room.id}
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
      <DeleteRoomDialog
        isOpen={deleteDialogOpen}
        room={roomToDelete}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setRoomToDelete(null);
        }}
        onConfirm={handleConfirmDeleteRoom}
        isLoading={deleteRoomMutation.isPending}
      />
    </div>
  );
};

export default RoomManager;
