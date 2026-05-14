import RowActions from "@/components/RowActions/RowActions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CLOUDINARY_HEADER_IMAGE_URL } from "@/constant";
import type { Room } from "@/dataHelper/room.dataHelper";
import { RoomTableProps } from "@/dataHelper/room.dataHelper";
import { resolveImageUrl } from "@/utils/imageUtils";
import { highlightText } from "@/utils/utils";
import { ChevronDown, ChevronUp, ChevronsUpDown, ImageIcon, X } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

/**
 * Room Table
 * A tabular list of rooms providing high-density information including ID, thumbnail, status, and capacity, with support for sorting and pagination.
 */
const RoomTable: React.FC<RoomTableProps> = ({
  sorted,
  selectedImage,
  onViewModal,
  onView,
  onEdit,
  onDelete,
  getPropertyName,
  getRoomTypeName,
  sort,
  toggleSort,
  highlightedId,
  filters,
}) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-1 flex-col">
      <div className="w-full overflow-auto rounded-xl border border-blue-100 bg-white shadow-sm">
        <Table className="min-w-max text-sm text-slate-700">
          <TableHeader className="sticky top-0 z-10 bg-slate-100">
            <tr className="border-b border-gray-300">
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
                onClick={() => toggleSort("property")}
                aria-sort={sort?.key === "property" ? (sort.direction === "asc" ? "ascending" : "descending") : "none"}
              >
                <span className="inline-flex items-center gap-1">
                  {t("rooms.property")}
                  {sort?.key === "property" ? sort.direction === "asc" ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" /> : <ChevronsUpDown className="size-4" />}
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
                className={`h-[120px] hover:bg-muted/50
                ${highlightedId === room.id ? 'animate-pulse bg-green-100' : ''}`}>
                <TableCell className="px-4 py-3 text-center align-middle">{room.id}</TableCell>
                <TableCell className="px-4 py-3 align-middle">
                  {(() => {
                    const coverImage =
                      room.images?.find((img) => img.sort === 1 && Boolean(img.image_url)) ||
                      room.images?.find((img) => Boolean(img.image_url));
                    const coverImageUrl = resolveImageUrl(coverImage?.image_url, { cloudinaryBaseUrl: CLOUDINARY_HEADER_IMAGE_URL });
                    const fallbackImage = '/assets/images/photo_error2.png';

                    return coverImageUrl ? (
                    <img
                      src={coverImageUrl}
                      alt="Room"
                      className="size-[150px] cursor-pointer rounded object-cover"
                      onClick={() => onViewModal(coverImageUrl)}
                      onError={(e) => {
                        if (e.currentTarget.src !== fallbackImage) {
                          e.currentTarget.src = fallbackImage;
                        }
                      }}
                    />
                  ) : (
                    <div className="flex size-[150px] flex-col items-center justify-center rounded bg-gray-200 p-4 text-center">
                      <ImageIcon className="mx-auto mb-3 size-10 text-gray-400" />
                      <p className="text-sm text-gray-500">{t("rooms.no_images_yet")}</p>
                    </div>
                  );
                  })()}
                </TableCell>
                <TableCell className="px-4 py-3 align-middle">{highlightText(room.title, filters?.title || "")}</TableCell>
                <TableCell className="px-4 py-3 align-middle">{highlightText(room.room_number || "-", filters?.room_number || "")}</TableCell>
                <TableCell className="px-4 py-3 align-middle">{highlightText(getPropertyName(room), filters?.title || "")}</TableCell>
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

      {/* Image Modal */}
      {selectedImage && (
        <Dialog open={!!selectedImage} onOpenChange={() => onViewModal(null)}>
          <DialogContent className="max-h-[90vh] max-w-4xl p-0">
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-2 z-10 size-8 rounded-full bg-black/50 p-0 text-white hover:bg-black/70"
                onClick={() => onViewModal(null)}
              >
                <X className="size-4" />
              </Button>
              <img
                src={selectedImage}
                alt="Room image enlarged"
                className="aspect-[4/3] w-full rounded-lg object-cover"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default RoomTable;
