import RowActions from "@/components/RowActions/RowActions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CLOUDINARY_HEADER_IMAGE_URL } from "@/constant";
import { UserTableProps } from "@/dataHelper/user.dataHelper";
import { safeFormatDateTime } from "@/utils/dateUtils";
import { resolveImageUrl } from "@/utils/imageUtils";
import { getStatusClass, highlightText, statusNumberToText } from "@/utils/utils";
import { ChevronDown, ChevronsUpDown, ChevronUp, ImageIcon, X } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

const UserTable: React.FC<UserTableProps> = ({ users, currentUserEmail, highlightedId, onView, onEdit, onDelete, onResetPassword, sortField, sortDirection, toggleSort, onViewModal, selectedImage, filters }) => {
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
              aria-sort={sortField === "id" ? (sortDirection === "asc" ? "ascending" : "descending") : "none"}
            >
            <span className="inline-flex items-center gap-1">
              {t("user.table_id")}
              {sortField === "id" ? (
                sortDirection === "asc" ? (
                  <ChevronUp className="size-4" />
                ) : (
                  <ChevronDown className="size-4" />
                )
              ) : (
                <ChevronsUpDown className="size-4" />
              )}
            </span>
          </TableHead>
          <TableHead className="whitespace-nowrap px-4 py-3 text-slate-700">{t("user.table_avatar")}</TableHead>
          <TableHead
            className="cursor-pointer select-none whitespace-nowrap px-4 py-3 text-slate-700"
            onClick={() => toggleSort("name")}
            aria-sort={sortField === "name" ? (sortDirection === "asc" ? "ascending" : "descending") : "none"}
          >
            <span className="inline-flex items-center gap-1">
              {t("user.table_name")}
              {sortField === "name" ? (
                sortDirection === "asc" ? (
                  <ChevronUp className="size-4" />
                ) : (
                  <ChevronDown className="size-4" />
                )
              ) : (
                <ChevronsUpDown className="size-4" />
              )}
            </span>
          </TableHead>
          <TableHead
            className="cursor-pointer select-none whitespace-nowrap px-4 py-3 text-slate-700"
            onClick={() => toggleSort("email")}
            aria-sort={sortField === "email" ? (sortDirection === "asc" ? "ascending" : "descending") : "none"}
          >
            <span className="inline-flex items-center gap-1">
              {t("user.table_email")}
              {sortField === "email" ? (
                sortDirection === "asc" ? (
                  <ChevronUp className="size-4" />
                ) : (
                  <ChevronDown className="size-4" />
                )
              ) : (
                <ChevronsUpDown className="size-4" />
              )}
            </span>
          </TableHead>
          <TableHead
            className="cursor-pointer select-none whitespace-nowrap px-4 py-3 text-slate-700"
            onClick={() => toggleSort("phone")}
            aria-sort={sortField === "phone" ? (sortDirection === "asc" ? "ascending" : "descending") : "none"}
          >
            <span className="inline-flex items-center gap-1">
              {t("user.table_phone")}
              {sortField === "phone" ? (
                sortDirection === "asc" ? (
                  <ChevronUp className="size-4" />
                ) : (
                  <ChevronDown className="size-4" />
                )
              ) : (
                <ChevronsUpDown className="size-4" />
              )}
            </span>
          </TableHead>
          <TableHead
            className="cursor-pointer select-none whitespace-nowrap px-4 py-3 text-slate-700"
            onClick={() => toggleSort("role")}
            aria-sort={sortField === "role" ? (sortDirection === "asc" ? "ascending" : "descending") : "none"}
          >
            <span className="inline-flex items-center gap-1">
              {t("user.table_role")}
              {sortField === "role" ? (
                sortDirection === "asc" ? (
                  <ChevronUp className="size-4" />
                ) : (
                  <ChevronDown className="size-4" />
                )
              ) : (
                <ChevronsUpDown className="size-4" />
              )}
            </span>
          </TableHead>
          <TableHead
            className="cursor-pointer select-none whitespace-nowrap px-4 py-3 text-slate-700"
            onClick={() => toggleSort("status")}
            aria-sort={sortField === "status" ? (sortDirection === "asc" ? "ascending" : "descending") : "none"}
          >
            <span className="inline-flex items-center gap-1">
              {t("user.table_status")}
              {sortField === "status" ? (
                sortDirection === "asc" ? (
                  <ChevronUp className="size-4" />
                ) : (
                  <ChevronDown className="size-4" />
                )
              ) : (
                <ChevronsUpDown className="size-4" />
              )}
            </span>
          </TableHead>
          <TableHead
            className="cursor-pointer select-none whitespace-nowrap px-4 py-3 text-slate-700"
            onClick={() => toggleSort("created_at")}
            aria-sort={sortField === "created_at" ? (sortDirection === "asc" ? "ascending" : "descending") : "none"}
          >
            <span className="inline-flex items-center gap-1">
              {t("user.table_created_at")}
              {sortField === "created_at" ? (
                sortDirection === "asc" ? (
                  <ChevronUp className="size-4" />
                ) : (
                  <ChevronDown className="size-4" />
                )
              ) : (
                <ChevronsUpDown className="size-4" />
              )}
            </span>
          </TableHead>
          <TableHead className="px-4 py-3 text-slate-700">{t("user.table_actions")}</TableHead>
          </tr>
        </TableHeader>
        <TableBody>
          {users.map((user) => {
            const avatarUrl = resolveImageUrl(user.avatar, { cloudinaryBaseUrl: CLOUDINARY_HEADER_IMAGE_URL });
            const fallbackImage = "/assets/images/photo_error2.png";

            return (
            <TableRow
              key={user.id}
              className={`h-[140px] hover:cursor-pointer hover:bg-muted/50 ${highlightedId === user.id ? "bg-yellow-50 animate-pulse" : ""}`}
              onClick={() => onView(user.id)}
            >
            <TableCell className="px-4 py-3 text-center align-middle">{user.id}</TableCell>
            <TableCell className="px-4 py-3 align-middle">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={user.name}
                  className="w-[150px] h-[150px] rounded cursor-pointer object-cover"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewModal(e.currentTarget.src);
                  }}
                  onError={(e) => {
                    if (e.currentTarget.src !== fallbackImage) {
                      e.currentTarget.src = fallbackImage;
                    }
                  }}
                />
              ) : (
                <div className="text-center bg-gray-200 rounded-lg w-[150px] h-[150px] flex flex-col items-center justify-center">
                  <ImageIcon className="size-12 mb-4 text-gray-400" />
                  <p className="text-gray-500">{t("user.no_images_yet")}</p>
                </div>
              )}
            </TableCell>
            <TableCell className="px-4 py-3 align-middle">{highlightText(user.name, filters?.q || "")}</TableCell>
            <TableCell className="px-4 py-3 align-middle">{highlightText(user.email, filters?.email || "")}</TableCell>
            <TableCell className="px-4 py-3 align-middle">{highlightText(user.phone || "-", filters?.phone || "")}</TableCell>
            <TableCell className="px-4 py-3 align-middle">
              <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${user.role === "admin" ? "bg-purple-50 text-purple-700" : user.role === "partner" ? "bg-blue-50 text-blue-700" : "bg-gray-50 text-gray-700"}`}>
                {user.role}
              </span>
            </TableCell>
            <TableCell className="px-4 py-3 align-middle">
              <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${getStatusClass(user.status)}`}>
                {t(`user.status.${statusNumberToText(user.status)}`)}
              </span>
            </TableCell>
            <TableCell className="px-4 py-3 align-middle">{safeFormatDateTime(user.created_at)}</TableCell>
            <TableCell className="px-4 py-3 align-middle" onClick={(e) => e.stopPropagation()}>
              <RowActions
                id={user.id.toString()}
                onView={() => onView(user.id)}
                onEdit={() => onEdit(user.id)}
                onDelete={() => onDelete(user.id)}
                onResetPassword={() => onResetPassword(user.id)}
                isDisabledEdit={user.email === currentUserEmail}
                isDisabledDelete={user.email === currentUserEmail}
                viewLabel={t("user.actions_view_and_edit")}
                hideEdit={true}
              />
            </TableCell>
            </TableRow>
            );
          })}
        </TableBody>
      </Table>
      </div>

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
              alt="User avatar enlarged"
              className="w-full aspect-[4/3] object-cover rounded-lg"
            />
          </div>
        </DialogContent>
      </Dialog>
    )}
    </div>
  );
};

export default UserTable;
