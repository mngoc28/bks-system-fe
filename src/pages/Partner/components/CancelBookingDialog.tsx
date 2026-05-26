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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const MIN_LENGTH = 5;
const MAX_LENGTH = 500;

type Props = {
  open: boolean;
  bookingId: number | string | null;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void> | void;
  title?: string;
  description?: string;
  confirmText?: string;
};

const PARTNER_CANCELLATION_REASONS = [
  { value: "Hết phòng / Trùng phòng do hệ thống lỗi (Overbooking)", label: "Hết phòng / Trùng phòng (Overbooking)", isSubjective: true },
  { value: "Phòng đang sửa chữa / Bảo trì đột xuất", label: "Phòng đang sửa chữa / Bảo trì đột xuất", isSubjective: true },
  { value: "Khách hàng liên hệ yêu cầu hủy đơn", label: "Khách hàng liên hệ yêu cầu hủy đơn", isSubjective: false },
  { value: "Giá phòng hiển thị sai / Lỗi cấu hình", label: "Giá phòng hiển thị sai / Lỗi cấu hình", isSubjective: true },
  { value: "other", label: "Lý do khác (Nhập thủ công)", isSubjective: true }
];

const CancelBookingDialog: React.FC<Props> = ({ open, bookingId, onClose, onConfirm, title, description, confirmText }) => {
  const [reason, setReason] = useState<string>("");
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [includeApology, setIncludeApology] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setReason("");
      setSelectedOption("");
      setIncludeApology(true);
      setError(null);
    }
  }, [open]);

  const selectedReasonObj = PARTNER_CANCELLATION_REASONS.find(r => r.value === selectedOption);
  const isSubjectiveSelected = selectedReasonObj ? selectedReasonObj.isSubjective : (selectedOption === "" ? false : true);

  const apologyTemplateLength = 160;
  const currentMaxLength = (includeApology && isSubjectiveSelected) ? (MAX_LENGTH - apologyTemplateLength) : MAX_LENGTH;

  const trimmed = reason.trim();
  const isInvalid = trimmed.length < MIN_LENGTH || trimmed.length > currentMaxLength;

  const handleSelectChange = (val: string) => {
    setSelectedOption(val);
    if (val === "other") {
      setReason("");
    } else {
      setReason(val);
    }
    if (error) setError(null);
  };

  const handleSubmit = async () => {
    if (isInvalid) {
      setError(`Lý do phải từ ${MIN_LENGTH} đến ${currentMaxLength} ký tự.`);
      return;
    }
    try {
      setSubmitting(true);
      let finalReason = trimmed;
      if (includeApology && isSubjectiveSelected) {
        finalReason = `Chúng tôi vô cùng cáo lỗi cùng quý khách. Rất tiếc chúng tôi phải từ chối/hủy đơn đặt phòng này vì lý do: ${trimmed}. Kính mong quý khách thông cảm cho sự bất tiện này.`;
      }
      await onConfirm(finalReason);
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
          <DialogTitle>{title ?? `Xác nhận huỷ booking #${bookingId ?? ""}`}</DialogTitle>
          <DialogDescription>
            {description ?? "Vui lòng nhập lý do huỷ booking. Lý do sẽ được lưu trong nhật ký để minh bạch với khách."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="reason-select" className="text-sm font-medium text-slate-700">
              Chọn lý do nhanh
            </label>
            <Select value={selectedOption} onValueChange={handleSelectChange}>
              <SelectTrigger id="reason-select" className="h-10 rounded-xl border-slate-200 bg-white">
                <SelectValue placeholder="Chọn một lý do có sẵn..." />
              </SelectTrigger>
              <SelectContent>
                {PARTNER_CANCELLATION_REASONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isSubjectiveSelected && (
            <div className="flex items-center gap-2 py-1">
              <input
                type="checkbox"
                id="include-apology"
                checked={includeApology}
                onChange={(e) => setIncludeApology(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="include-apology" className="text-xs font-semibold text-slate-700 cursor-pointer select-none">
                Tự động thêm lời xin lỗi trang trọng gửi tới khách hàng
              </label>
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="cancel-reason" className="text-sm font-medium text-slate-700">
              {selectedOption === "other" ? "Chi tiết lý do khác" : "Nội dung lý do"} <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="cancel-reason"
              className="min-h-28 w-full resize-y rounded-md border border-slate-200 bg-white p-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              placeholder={selectedOption === "other" ? "Vui lòng nhập lý do cụ thể..." : "Ví dụ: Khách yêu cầu huỷ, phòng đang bảo trì..."}
              maxLength={currentMaxLength}
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
                {error ?? `Tối thiểu ${MIN_LENGTH} ký tự, tối đa ${currentMaxLength}.`}
              </span>
              <span className={`tabular-nums ${trimmed.length > currentMaxLength ? "text-rose-600" : "text-slate-400"}`}>
                {trimmed.length}/{currentMaxLength}
              </span>
            </div>
          </div>

          {includeApology && isSubjectiveSelected && trimmed.length > 0 && (
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3 text-xs text-emerald-800">
              <span className="font-bold">📧 Xem trước nội dung email gửi khách:</span>
              <p className="mt-1 italic leading-relaxed">
                "Chúng tôi vô cùng cáo lỗi cùng quý khách. Rất tiếc chúng tôi phải từ chối/hủy đơn đặt phòng này vì lý do: {trimmed}. Kính mong quý khách thông cảm cho sự bất tiện này."
              </p>
            </div>
          )}
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
            {confirmText ?? "Xác nhận huỷ"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CancelBookingDialog;
