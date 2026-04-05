import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { DeleteConfirmDialogProps } from "@/dataHelper/user.dataHelper";
import { Loader2, Trash2 } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

/**
 * Delete Confirm Dialog
 * A security-focused confirmation modal that prevents accidental user deletion by displaying the target's ID, name, and email for verification.
 */
const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({ user, isOpen, isLoading = false, onClose, onConfirm }) => {
  const { t } = useTranslation();
  const handleOpenChange = (open: boolean) => {
    if (!open && !isLoading) onClose();
  };

  return (
    <Dialog open={isOpen && !!user} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-red-100 p-2">
              <Trash2 className="size-5 text-red-600" />
            </div>
            <DialogTitle className="text-xl font-semibold text-gray-900">{t("user.delete_title")}</DialogTitle>
          </div>
        </DialogHeader>

        <DialogDescription asChild>
          <div className="space-y-4">
            <p className="text-gray-600">{t("user.delete_message")}</p>
            {user && (
              <div className="space-y-2 rounded-lg bg-gray-50 p-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-500">{t("user.delete_id")}</span>
                  <span className="text-sm font-semibold">{user.id}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-500">{t("user.delete_name")}</span>
                  <span className="text-sm">{user.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-500">{t("user.delete_email")}</span>
                  <span className="text-sm">{user.email}</span>
                </div>
              </div>
            )}

            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-sm font-medium text-red-700">{t("user.delete_confirm_warning")}</p>
            </div>
          </div>
        </DialogDescription>

        <DialogFooter className="flex-row gap-3 sm:gap-3">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading} className="flex-1">
            {t("user.delete_cancel")}
          </Button>
          <Button type="button" variant="outline" onClick={onConfirm} disabled={isLoading} className="flex-1 border-red-600 bg-red-600 text-white hover:border-red-700 hover:bg-red-700">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                {t("user.delete_deleting")}
              </>
            ) : (
              <>
                <Trash2 className="mr-2 size-4" />
                {t("user.delete_confirm")}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteConfirmDialog;
