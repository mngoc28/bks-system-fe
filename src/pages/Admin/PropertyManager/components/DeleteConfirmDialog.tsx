import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { DeleteConfirmDialogProps } from "@/dataHelper/property.dataHelper";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";

const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({ property, isOpen, onClose, onConfirm, isLoading = false }) => {
  const { t } = useTranslation();

  const handleConfirm = async () => {
    await onConfirm();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && !isLoading) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen && !!property} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-red-100 p-2">
              <Trash2 className="size-5 text-red-600" />
            </div>
            <DialogTitle className="text-xl font-semibold text-gray-900">{t("properties.delete_property")}</DialogTitle>
          </div>
        </DialogHeader>

        <DialogDescription asChild>
          <div className="space-y-4">
            <p className="text-gray-600">{t("properties.delete_confirm_message")}</p>

            {/* Property Info */}
            <div className="space-y-3 rounded-lg bg-gray-50 p-4">
              <div className="flex items-start gap-4">
                <span className="min-w-[100px] text-sm font-medium text-gray-500">{t("properties.property_name")}:</span>
                <span className="flex-1 text-sm font-semibold text-gray-900">{property?.name}</span>
              </div>
              <div className="flex items-start gap-4">
                <span className="min-w-[100px] text-sm font-medium text-gray-500">{t("properties.address")}:</span>
                <span className="flex-1 text-sm text-gray-900">
                  {property?.province_name}
                  {" - "}
                  {property?.ward_name}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="min-w-[100px] text-sm font-medium text-gray-500">{t("properties.area")}:</span>
                <span className="flex-1 text-sm text-gray-900">{property?.area} m²</span>
              </div>
            </div>

            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-sm font-medium text-red-700">{t("properties.delete_warning")}</p>
            </div>
          </div>
        </DialogDescription>

        <DialogFooter className="flex-row gap-3 sm:gap-3">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading} className="flex-1">
            {t("common.cancel")}
          </Button>
          <Button type="button" variant="outline" onClick={handleConfirm} disabled={isLoading} className="flex-1 border-red-600 bg-red-600 text-white hover:border-red-700 hover:bg-red-700">
            {isLoading ? (
              <>
                <Spinner size="sm" />
                {t("common.deleting")}
              </>
            ) : (
              <>
                <Trash2 className="mr-2 size-4" />
                {t("common.delete")}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteConfirmDialog;

