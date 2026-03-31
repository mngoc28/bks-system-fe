import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { QuestionDeleteDialogProps } from "@/dataHelper/chatbot.dataHelper";
import { Loader2, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

const QuestionDeleteDialog = ({ isOpen, onClose, onConfirm, target, isLoading }: QuestionDeleteDialogProps) => {
  const { t } = useTranslation();

  const handleOpenChange = (open: boolean) => {
    if (!open && !isLoading) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-red-100 p-2">
              <Trash2 className="size-5 text-red-600" />
            </div>
            <DialogTitle className="text-xl font-semibold text-slate-900">{t("questions.delete.title")}</DialogTitle>
          </div>
        </DialogHeader>

        <DialogDescription asChild>
          <div className="space-y-4 text-slate-600">
            <p>{t("questions.delete.message")}</p>
            {target && (
              <div className="space-y-2 rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-500">{t("questions.table.id")}</span>
                  <span className="font-semibold text-slate-800">{target.id}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-500">{t("questions.table.content")}</span>
                  <span className="text-slate-800">{target.content}</span>
                </div>
              </div>
            )}
          </div>
        </DialogDescription>

        <DialogFooter className="flex-row gap-3">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading} className="flex-1">
            {t("questions.delete.cancel")}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 border-red-600 bg-red-600 text-white hover:border-red-700 hover:bg-red-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                {t("common.deleting")}
              </>
            ) : (
              <>
                <Trash2 className="mr-2 size-4" />
                {t("questions.delete.confirm")}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QuestionDeleteDialog;
