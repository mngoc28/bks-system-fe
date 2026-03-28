import EmptyPage from "@/components/EmptyPage";
import { Button } from "@/components/ui/button";
import { toastError } from "@/components/ui/toast";
import { DEFAULT_LIMIT, DEFAULT_PAGE, ROUTERS } from "@/constant";
import { Room, type RoomFilters, type RoomListData } from "@/dataHelper/room.dataHelper";
import { useDeleteRoomMutation, useRoomsQuery } from "@/hooks/useRoomQuery";
// import { useGetUserProfileQuery } from "@/hooks/useUserQuery";
import { Filter, Plus } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router";
import { DeleteRoomDialog, RoomSearchSection, RoomTable } from "./components";

// Main Room Manager Component
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
  const [perPage, setPerPage] = useState(DEFAULT_LIMIT);
  const [sortField, setSortField] = useState<string | undefined>(undefined);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | undefined>(undefined);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<{ id: number; room_number: string; building_name: string; } | null>(null);
  const [filter, setFilters] = useState<RoomFilters>({
    page: DEFAULT_PAGE,
    per_page: DEFAULT_LIMIT,
  });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleResetFilters = () => {
    setFilters({
      page: DEFAULT_PAGE,
      per_page: DEFAULT_LIMIT,
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

  type SortKey = "id" | "title" | "room_number" | "building" | "area" | "people" | "status" | "created_at";
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
  }

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

  const getRoomTypeName = (type: number) => {
    switch (type) {
      case 1: return t("rooms.room_type_single");
      case 2: return t("rooms.room_type_double");
      case 3: return t("rooms.room_type_mini_apartment");
      default: return "-";
    }
  }

  return (
    <div className="flex w-full flex-col gap-6 p-[12px_24px]">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-800">{t("rooms.room_list")}</h1>
        <div className="flex items-center gap-2">
          <Button variant="default" size="sm" className="flex items-center gap-2 bg-blue-600 px-4 py-2 hover:bg-blue-700" onClick={handleCreateRoom}>
            <Plus className="size-4" />
            {t("rooms.create_room")}
          </Button>
          <Button variant="default" size="sm" className="flex items-center gap-2 px-4 py-2" onClick={() => setOpen((v) => !v)}>
            <Filter className="size-4" />
            {t("common.filter")}
          </Button>
        </div>
      </div>

      {open && <RoomSearchSection
        open={open}
        filters={filters}
        setFilters={setFilters}
        onReset={handleResetFilters}
        onClose={() => setOpen((v) => !v)}
      />}

      {isLoading ? (
        <div className="rounded-lg border bg-white p-6 text-sm text-slate-500">{t("common.loading")}</div>
      ) : totalItems === 0 ? (
        <EmptyPage />
      ) : (
        <RoomTable
          sorted={rooms}
          page={page}
          totalPages={totalPages}
          perPage={perPage}
          totalItems={totalItems}
          onPageChange={(p) => setPage(p)}
          onPerPageChange={(pp) => {
            setPerPage(pp);
            setPage(DEFAULT_PAGE);
          }}
          onViewModal={setSelectedImage}
          selectedImage={selectedImage}
          onView={handleViewRoom}
          onEdit={handleEditRoom}
          onDelete={handleDeleteRoom}
          getBuildingName={(room) => room.building_name || "-"}
          getRoomTypeName={getRoomTypeName}
          sort={{ key: sortField as SortKey, direction: sortDirection || null}}
          toggleSort={toggleSort}
          highlightedId={highlightedId}
          filters={filter}
        />
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
