import React from 'react';
import { Loader2, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export interface PartnerConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
}

export const PartnerConfirmDialog: React.FC<PartnerConfirmDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Xác nhận',
  cancelLabel = 'Hủy',
  destructive = false,
  isLoading = false,
  onConfirm,
}) => {
  const handleConfirm = async () => {
    await onConfirm();
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && isLoading) return;
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-900">
            {destructive ? (
              <span className="rounded-lg bg-rose-50 p-1.5 text-rose-600">
                <Trash2 size={18} />
              </span>
            ) : null}
            {title}
          </DialogTitle>
          {description ? (
            <DialogDescription className="pt-1 text-sm leading-relaxed text-slate-500">
              {description}
            </DialogDescription>
          ) : null}
        </DialogHeader>

        <DialogFooter className="flex flex-row items-center justify-end gap-2 pt-2 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="min-w-[80px]"
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={destructive ? 'destructive' : 'default'}
            onClick={handleConfirm}
            disabled={isLoading}
            className={destructive ? 'min-w-[100px] bg-rose-600 hover:bg-rose-700' : 'min-w-[100px]'}
          >
            {isLoading ? <Loader2 size={16} className="mr-2 animate-spin" /> : null}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PartnerConfirmDialog;
