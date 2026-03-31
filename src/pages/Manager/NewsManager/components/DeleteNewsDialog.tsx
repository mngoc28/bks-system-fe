import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { DeleteNewsDialogProps } from "@/dataHelper/news.dataHelper";
import { statusNews } from "@/utils/utils";

const DeleteNewsDialog: React.FC<DeleteNewsDialogProps> = ({ news, isOpen, onClose, onConfirm, isLoading = false }) => {
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
    <Dialog open={isOpen && !!news} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-red-100 p-2">
              <Trash2 className="size-5 text-red-600" />
            </div>
            <DialogTitle className="text-xl font-semibold text-gray-900">{t("news.delete_news_dialog.title")}</DialogTitle>
          </div>
        </DialogHeader>

        <DialogDescription asChild>
          <div className="space-y-4">
            <p className="text-gray-600">{t("news.delete_news_dialog.message")}</p>

            {/* News Info */}
            <div className="space-y-3 rounded-lg bg-gray-50 p-4">
              <div className="flex items-start gap-4">
                <span className="min-w-[100px] text-sm font-medium text-gray-500">{t("news.delete_news_dialog.title")}:</span>
                <span className="flex-1 text-sm font-semibold text-gray-900">{news?.title}</span>
              </div>
              <div className="flex items-start gap-4">
                <span className="min-w-[100px] text-sm font-medium text-gray-500">{t("news.delete_news_dialog.user_name")}:</span>
                <span className="flex-1 text-sm font-semibold text-gray-900">{news?.user_name}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="min-w-[100px] text-sm font-medium text-gray-500">{t("news.delete_news_dialog.status")}:</span>
                <span className={`text-sm font-semibold ${statusNews(news?.status ?? 0).color}`}>
                  {t(statusNews(news?.status ?? 0).status)}
                </span>
              </div>
            </div>
            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-sm font-medium text-red-700">{t("news.delete_news_dialog.confirm_delete_warning")}</p>
            </div>
          </div>
        </DialogDescription>

        <DialogFooter className="flex-row gap-3 sm:gap-3">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading} className="flex-1">
            {t("news.delete_news_dialog.confirm_delete_cancel")}
          </Button>
          <Button type="button" variant="outline" onClick={handleConfirm} disabled={isLoading} className="flex-1 border-red-600 bg-red-600 text-white hover:border-red-700 hover:bg-red-700">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                {t("news.delete_news_dialog.confirm_delete_loading")}
              </>
            ) : (
              <>
                <Trash2 className="mr-2 size-4" />
                {t("news.delete_news_dialog.confirm_delete_confirm")}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteNewsDialog;
