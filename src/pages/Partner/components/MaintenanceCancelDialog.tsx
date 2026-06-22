import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { PlainTextarea } from '@/components/ui/textarea';
import { partnerService } from '@/services/partnerService';
import { extractMaintenanceApiError } from '@/utils/partnerMaintenanceDisplay';
import { toastError, toastSuccess } from '@/components/ui/toast';

interface MaintenanceCancelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  maintenanceId?: number | string | null;
  maintenanceTitle?: string;
  onCancelled?: () => void;
}

export const MaintenanceCancelDialog: React.FC<MaintenanceCancelDialogProps> = ({
  open,
  onOpenChange,
  maintenanceId,
  maintenanceTitle,
  onCancelled,
}) => {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setReason('');
      setSubmitting(false);
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!maintenanceId || !reason.trim()) {
      toastError('Vui lòng nhập lý do hủy bảo trì.');
      return;
    }

    try {
      setSubmitting(true);
      await partnerService.updateMaintenance(maintenanceId, {
        status: 'cancelled',
        cancellation_reason: reason.trim(),
      });
      toastSuccess('Đã hủy phiếu bảo trì.');
      onCancelled?.();
      onOpenChange(false);
    } catch (err) {
      const { message } = extractMaintenanceApiError(err);
      toastError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Hủy phiếu bảo trì</DialogTitle>
          <DialogDescription>
            {maintenanceTitle
              ? `Xác nhận hủy "${maintenanceTitle}". Lịch phòng sẽ được mở lại nếu đã khóa.`
              : 'Nhập lý do hủy phiếu bảo trì.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-2">
          <Label htmlFor="maintenance-cancel-reason" className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Lý do hủy
          </Label>
          <PlainTextarea
            id="maintenance-cancel-reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="VD: Sửa xong sớm hơn dự kiến, báo nhầm sự cố..."
            className="min-h-[100px] rounded-xl"
          />
        </div>

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Đóng
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleSubmit}
            disabled={submitting}
            aria-label="Xác nhận hủy phiếu bảo trì"
          >
            {submitting ? 'Đang xử lý...' : 'Xác nhận hủy'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
