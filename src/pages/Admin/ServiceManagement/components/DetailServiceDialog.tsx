import React from "react";
import { DetailServiceDialogProps } from "@/dataHelper/service.dataHelper";
import { t } from "i18next";
import { safeFormatDateTime } from "@/utils/dateUtils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";


/**
 * Detail Service Dialog
 * A read-only preview modal that displays all metadata for a specific service, including creation and update timestamps.
 */
const DetailServiceDialog: React.FC<DetailServiceDialogProps> = ({
    service,
    isOpen,
    isLoading = false,
    onClose,
}) => {
    const data = service ?? null;
    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-[720px]">
        <DialogHeader>
          <DialogTitle>{t("serviceManagement.title_detail")}</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="rounded border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            {t("serviceManagement.is_Loading")}
          </div>
        ) : !data ? (
          <div className="rounded border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            {t("serviceManagement.no_data")}
          </div>
        ) : (
          <div className="space-y-1">
            <div className="overflow-hidden rounded-lg border border-slate-200">
              <div className="grid grid-cols-10">
                <div className="col-span-2 border-b border-slate-200 bg-slate-50 p-3 font-medium">
                  {t("serviceManagement.id")}
                </div>
                <div className="col-span-8 border-b border-slate-200 p-3">
                  {data.id}
                </div>

                <div className="col-span-2 border-b border-slate-200 bg-slate-50 p-3 font-medium">
                  {t("serviceManagement.name")}
                </div>
                <div className="col-span-8 border-b border-slate-200 p-3">
                  {data.name}
                </div>

                <div className="col-span-2 border-b border-slate-200 bg-slate-50 p-3 font-medium">
                  {t("serviceManagement.price")}
                </div>
                <div className="col-span-8 border-b border-slate-200 p-3">
                  {(data.price)}
                </div>

                <div className="col-span-2 border-b border-slate-200 bg-slate-50 p-3 font-medium">
                  {t("serviceManagement.update_at")}
                </div>
                <div className="col-span-8 border-b border-slate-200 p-3">
                  {safeFormatDateTime(data.updated_at)}
                </div>

                <div className="col-span-2 border-b border-slate-200 bg-slate-50 p-3 font-medium">
                  {t("serviceManagement.create_at")}
                </div>
                <div className="col-span-8 border-b border-slate-200 p-3">
                  {safeFormatDateTime(data.created_at)}
                </div>

                <div className="col-span-2 border-b border-slate-200 bg-slate-50 p-3 font-medium">
                  {t("serviceManagement.description")}
                </div>
                <div className="col-span-8 border-b border-slate-200 p-3">
                  {data.description || "-"}
                </div>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
            className="h-[40px] rounded-md bg-gray-600 px-3 py-1 text-[15px] text-white hover:bg-gray-500"
          >
            {t("common.cancel")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    );
};

export default DetailServiceDialog;