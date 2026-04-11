import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DeleteConfirmDialogProps } from "@/dataHelper/service.dataHelper";
import { t } from "i18next";
import { Loader2, Trash2 } from "lucide-react";

/**
 * Delete Confirm Dialog
 * A critical confirmation modal that prevents accidental deletion of services, highlighting the specific service name and ID being removed.
 */
const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({ service, isOpen, isLoading = false, onClose, onConfirm }) => {
    const handleOpenChange = (open: boolean) => {
        if (!open && !isLoading) onClose();
    }

    return (
        <Dialog open={isOpen && !!service} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="rounded-full bg-red-100 p-2">
                            <Trash2 className="size-5 text-red-600" />
                        </div>
                        <DialogTitle className="text-xl font-semibold text-gray-900">{t('serviceManagement.delete_title')}</DialogTitle>
                    </div>
                </DialogHeader>

                <DialogDescription asChild>
                    <div className="space-y-4">
                        <p className="text-gray-600">{t('serviceManagement.delete_message')}</p>
                        {service && (
                            <div className="space-y-2 rounded-lg bg-gray-50 p-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-500">{t('serviceManagement.delete_id')}</span>
                                    <span className="text-sm font-semibold">{service.id}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-500">{t('serviceManagement.delete_name')}</span>
                                    <span className="text-sm">{service.name}</span>
                                </div>
                            </div>
                        )}
                        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                            <p className="text-sm font-medium text-red-700">{t('serviceManagement.delete_confirm_warning')}</p>
                        </div>
                    </div>
                </DialogDescription>

                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isLoading}>
                        {t('common.cancel')}
                    </Button>
                    <Button
                        variant="outline"
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="bg-red-600 hover:bg-red-700 text-white"
                    >
                        {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
                        {t('common.delete')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog >
    );
};

export default DeleteConfirmDialog;