import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DeleteConfirmDialogProps } from "@/dataHelper/amenity.dataHelper";
import { Trash2 } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { Spinner } from "@/components/ui/spinner";

/**
 * Delete Amenity Confirmation Dialog
 * Shows a warning and requires confirmation before deleting an amenity record.
 */
const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({ amenity, isOpen, isLoading = false, onClose, onConfirm }) => {
  const { t } = useTranslation();
  const handleOpenChange = (open: boolean) => {
    if (!open && !isLoading) onClose();
  };

  return (
    <Dialog open={isOpen && !!amenity} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-red-100 p-2">
              <Trash2 className="size-5 text-red-600" />
            </div>
            <DialogTitle className="text-xl font-semibold text-gray-900">{t("amenities.delete_title")}</DialogTitle>
          </div>
        </DialogHeader>

        <DialogDescription asChild>
          <div className="space-y-4">
            <p className="text-gray-600">{t("amenities.delete_message")}</p>
            {amenity && (
              <div className="space-y-2 rounded-lg bg-gray-50 p-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-500">{t("amenities.delete_id")}</span>
                  <span className="text-sm font-semibold">{amenity.id}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-500">{t("amenities.delete_name")}</span>
                  <span className="text-sm">{amenity.name}</span>
                </div>
              </div>
            )}

            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-sm font-medium text-red-700">{t("amenities.delete_confirm_warning")}</p>
            </div>
          </div>
        </DialogDescription>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isLoading}>
            {t("common.cancel")}
          </Button>
            <Button
            variant="outline"
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-red-600 text-white hover:bg-red-700"
            >
            {isLoading && <Spinner size="sm" />}
            {t("common.delete")}
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteConfirmDialog;