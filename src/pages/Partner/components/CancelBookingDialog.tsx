import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const MIN_LENGTH = 5;
const MAX_LENGTH = 500;

type Props = {
  open: boolean;
  bookingId: number | string | null;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void> | void;
};

const CancelBookingDialog: React.FC<Props> = ({ open, bookingId, onClose, onConfirm }) => {
  const [reason, setReason] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setReason("");
      setError(null);
    }
  }, [open]);

  const trimmed = reason.trim();
  const isInvalid = trimmed.length < MIN_LENGTH || trimmed.length > MAX_LENGTH;

  const handleSubmit = async () => {
    if (isInvalid) {
      setError(`Lý do phải từ ${MIN_LENGTH} đến ${MAX_LENGTH} ký tự.`);
      return;
    }
    try {
      setSubmitting(true);
      await onConfirm(trimmed);
      onClose();
    } catch (e) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? "Hủy booking thất bại. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(value) => { if (!value && !submitting) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Xác nhận huỷ booking #{bookingId ?? ""}</DialogTitle>
          <DialogDescription>
            Vui lòng nhập lý do huỷ booking. Lý do sẽ được lưu trong nhật ký để minh bạch với khách.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <label htmlFor="cancel-reason" className="text-sm font-medium text-slate-700">
            Lý do <span className="text-rose-500">*</span>
          </label>
          <textarea
            id="cancel-reason"
            className="min-h-28 w-full resize-y rounded-md border border-slate-200 bg-white p-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            placeholder="Ví dụ: Khách yêu cầu huỷ, phòng đang bảo trì..."
            maxLength={MAX_LENGTH + 50}
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (error) setError(null);
            }}
            aria-invalid={isInvalid && reason.length > 0}
            aria-describedby="cancel-reason-help"
          />
          <div className="flex items-center justify-between text-xs">
            <span id="cancel-reason-help" className={error ? "text-rose-600" : "text-slate-500"}>
              {error ?? `Tối thiểu ${MIN_LENGTH} ký tự, tối đa ${MAX_LENGTH}.`}
            </span>
            <span className={`tabular-nums ${trimmed.length > MAX_LENGTH ? "text-rose-600" : "text-slate-400"}`}>
              {trimmed.length}/{MAX_LENGTH}
            </span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Đóng
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={isInvalid || submitting}
          >
            {submitting ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
            Xác nhận huỷ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CancelBookingDialog;
