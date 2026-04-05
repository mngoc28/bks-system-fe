import Pagination from "@/components/Pagination";
import RowActions from "@/components/RowActions/RowActions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CLOUDINARY_HEADER_IMAGE_URL } from "@/constant";
import type { Room } from "@/dataHelper/room.dataHelper";
import { RoomTableProps } from "@/dataHelper/room.dataHelper";
import { highlightText } from "@/utils/utils";
import { ImageIcon, ChevronDown, ChevronUp, ChevronsUpDown, X } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

/**
 * Room Table
 * A tabular list of rooms providing high-density information including ID, thumbnail, status, and capacity, with support for sorting and pagination.
 */
const RoomTable: React.FC<RoomTableProps> = ({
  sorted,
  page,
  totalPages,
  perPage,
  totalItems,
  selectedImage,
  onPageChange,
  onPerPageChange,
  onViewModal,
  onView,
  onEdit,
  onDelete,
  getBuildingName,
  getRoomTypeName,
  sort,
  toggleSort,
  highlightedId,
  filters,
}) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-1 flex-col">
      <div className="w-full overflow-auto rounded-xl border border-blue-100 bg-white">
        <Table className="min-w-max bg-white text-sm text-slate-700">
          <TableHeader>
            <tr className="border-b border-gray-300 bg-slate-100">
              <TableHead
                className="cursor-pointer select-none whitespace-nowrap px-4 py-3 text-center text-slate-700"
                onClick={() => toggleSort("id")}
                aria-sort={sort?.key === "id" ? (sort.direction === "asc" ? "ascending" : "descending") : "none"}
              >
                <span className="inline-flex items-center gap-1">
                  ID
                  {sort?.key === "id" ? sort.direction === "asc" ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" /> : <ChevronsUpDown className="size-4" />}
                </span>
              </TableHead>
              <TableHead className="whitespace-nowrap px-4 py-3 text-slate-700">{t("rooms.image_header")}</TableHead>
              <TableHead
                className="cursor-pointer select-none whitespace-nowrap px-4 py-3 text-slate-700"
                onClick={() => toggleSort("title")}
                aria-sort={sort?.key === "title" ? (sort.direction === "asc" ? "ascending" : "descending") : "none"}
              >
                <span className="inline-flex items-center gap-1">
                  {t("rooms.room_title")}
                  {sort?.key === "title" ? sort.direction === "asc" ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" /> : <ChevronsUpDown className="size-4" />}
                </span>
              </TableHead>

              <TableHead
                className="cursor-pointer select-none whitespace-nowrap px-4 py-3 text-slate-700"
                onClick={() => toggleSort("room_number")}
                aria-sort={sort?.key === "room_number" ? (sort.direction === "asc" ? "ascending" : "descending") : "none"}
              >
                <span className="inline-flex items-center gap-1">
                  {t("rooms.room_number")}
                  {sort?.key === "room_number" ? sort.direction === "asc" ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" /> : <ChevronsUpDown className="size-4" />}
                </span>
              </TableHead>

              <TableHead
                className="cursor-pointer select-none whitespace-nowrap px-4 py-3 text-slate-700"
                onClick={() => toggleSort("building")}
                aria-sort={sort?.key === "building" ? (sort.direction === "asc" ? "ascending" : "descending") : "none"}
              >
                <span className="inline-flex items-center gap-1">
                  {t("rooms.building")}
                  {sort?.key === "building" ? sort.direction === "asc" ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" /> : <ChevronsUpDown className="size-4" />}
                </span>
              </TableHead>

              <TableHead className="whitespace-nowrap px-4 py-3 text-slate-700">{t("rooms.room_type")}</TableHead>

              <TableHead
                className="cursor-pointer select-none whitespace-nowrap px-4 py-3 text-center text-slate-700"
                onClick={() => toggleSort("area")}
                aria-sort={sort?.key === "area" ? (sort.direction === "asc" ? "ascending" : "descending") : "none"}
              >
                <span className="inline-flex items-center gap-1">
                  {t("rooms.area")}
                  {sort?.key === "area" ? sort.direction === "asc" ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" /> : <ChevronsUpDown className="size-4" />}
                </span>
              </TableHead>

              <TableHead
                className="cursor-pointer select-none whitespace-nowrap px-4 py-3 text-center text-slate-700"
                onClick={() => toggleSort("people")}
                aria-sort={sort?.key === "people" ? (sort.direction === "asc" ? "ascending" : "descending") : "none"}
              >
                <span className="inline-flex items-center gap-1">
                  {t("rooms.people")}
                  {sort?.key === "people" ? sort.direction === "asc" ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" /> : <ChevronsUpDown className="size-4" />}
                </span>
              </TableHead>

              <TableHead
                className="cursor-pointer select-none whitespace-nowrap px-4 py-3 text-center text-slate-700"
                onClick={() => toggleSort("status")}
                aria-sort={sort?.key === "status" ? (sort.direction === "asc" ? "ascending" : "descending") : "none"}
              >
                <span className="inline-flex items-center gap-1">
                  {t("rooms.status")}
                  {sort?.key === "status" ? sort.direction === "asc" ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" /> : <ChevronsUpDown className="size-4" />}
                </span>
              </TableHead>

              <TableHead className="whitespace-nowrap px-4 py-3 text-slate-700">{t("common.customize")}</TableHead>
            </tr>
          </TableHeader>

          <TableBody>
            {sorted.map((room: Room) => (
              <TableRow
                key={room.id}
                id={`room-row-${room.id}`}
                className={`hover:bg-muted/50 h-[120px]
                ${highlightedId === room.id ? 'bg-green-100 animate-pulse' : ''}`}>
                <TableCell className="px-4 py-3 text-center align-middle">{room.id}</TableCell>
                <TableCell className="px-4 py-3 align-middle">
                  {room.images && room.images.length > 0 ? (
                    <img
                      src={CLOUDINARY_HEADER_IMAGE_URL + room.images[0].image_url}
                      alt="Room"
                      className="w-[150px] h-[150px] object-cover rounded cursor-pointer"
                      onClick={() => onViewModal(CLOUDINARY_HEADER_IMAGE_URL + room.images![0].image_url)}
                      onError={(e) => {
                        if (e.currentTarget.src !== '/assets/images/photo_error.png') {
                          e.currentTarget.src = '/assets/images/photo_error.png';
                        }
                      }}
                    />
                  ) : (
                    <div className="text-center bg-gray-200 rounded-lg w-[150px] h-[150px] flex flex-col items-center justify-center">
                      <ImageIcon className="size-12 mb-4 text-gray-400" />
                      <p className="text-gray-500">{t("rooms.no_images_yet")}</p>
                    </div>
                  )}
                </TableCell>
                <TableCell className="px-4 py-3 align-middle">{highlightText(room.title, filters?.title || "")}</TableCell>
                <TableCell className="px-4 py-3 align-middle">{highlightText(room.room_number || "-", filters?.room_number || "")}</TableCell>
                <TableCell className="px-4 py-3 align-middle">{highlightText(getBuildingName(room), filters?.title || "")}</TableCell>
                <TableCell className="px-4 py-3 align-middle">{getRoomTypeName(room.room_type)}</TableCell>
                <TableCell className="px-4 py-3 text-center align-middle">{room.area} m²</TableCell>
                <TableCell className="px-4 py-3 text-center align-middle">{room.people}</TableCell>
                <TableCell className="px-4 py-3 text-center align-middle">
                  <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${room.status ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-700"}`}>
                    {room.status ? t("rooms.status_public") : t("rooms.status_private")}
                  </span>
                </TableCell>
                <TableCell className="px-4 py-3 align-middle">
                  <RowActions id={room.id.toString()} onView={onView} onEdit={onEdit} onDelete={() => onDelete(room)} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {totalItems > 0 && (
        <div className="p-4">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={onPageChange}
            perPage={perPage}
            onPerPageChange={onPerPageChange}
            totalItems={totalItems}
          />
        </div>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <Dialog open={!!selectedImage} onOpenChange={() => onViewModal(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] p-0">
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full w-8 h-8 p-0"
                onClick={() => onViewModal(null)}
              >
                <X className="size-4" />
              </Button>
              <img
                src={selectedImage}
                alt="Room image enlarged"
                className="w-full aspect-[4/3] object-cover rounded-lg"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default RoomTable;