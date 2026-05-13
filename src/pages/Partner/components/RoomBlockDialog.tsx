import React, { useEffect, useMemo, useState } from 'react';
import { Lock, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DatePickerField } from '@/components/ui/date-picker-field';
import { PlainTextarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { partnerService } from '@/services/partnerService';
import { toastError, toastSuccess } from '@/components/ui/toast';
import { PARTNER_BLOCK_TYPE_LABEL_VI } from '@/utils/partnerBookingDisplay';

export interface RoomBlockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rooms: { id: number | string; label: string }[];
  defaultRoomId?: number | string | null;
  defaultStartDate?: string;
  defaultEndDate?: string;
  onCreated?: () => void;
}

type ConflictItem = {
  type: 'booking' | 'block';
  id?: number;
  start_date?: string;
  end_date?: string;
  status?: number | string;
  block_type?: string;
};

const BLOCK_TYPE_OPTIONS: { value: 'maintenance' | 'owner_use' | 'off_market'; label: string }[] = [
  { value: 'maintenance', label: 'Bảo trì' },
  { value: 'owner_use', label: 'Chủ nhà sử dụng' },
  { value: 'off_market', label: 'Tạm ngừng kinh doanh' },
];

/**
 * Dialog tạo Room Block (Phase 3 — T3.13).
 * - Validate: room_id, start_date <= end_date, reason ≤ 255 ký tự.
 * - Lỗi BE 409 ROOM_BLOCK_CONFLICT → highlight conflict + giữ form.
 */
export const RoomBlockDialog: React.FC<RoomBlockDialogProps> = ({
  open,
  onOpenChange,
  rooms,
  defaultRoomId,
  defaultStartDate,
  defaultEndDate,
  onCreated,
}) => {
  const [roomId, setRoomId] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [blockType, setBlockType] = useState<'maintenance' | 'owner_use' | 'off_market'>('maintenance');
  const [reason, setReason] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [conflicts, setConflicts] = useState<ConflictItem[]>([]);
  const [generalError, setGeneralError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setRoomId(defaultRoomId ? String(defaultRoomId) : (rooms[0] ? String(rooms[0].id) : ''));
    setStartDate(defaultStartDate ?? '');
    setEndDate(defaultEndDate ?? defaultStartDate ?? '');
    setBlockType('maintenance');
    setReason('');
    setNote('');
    setConflicts([]);
    setGeneralError(null);
  }, [open, defaultRoomId, defaultStartDate, defaultEndDate, rooms]);

  const isFormValid = useMemo(() => {
    if (!roomId || !startDate || !endDate || !reason.trim()) return false;
    return startDate <= endDate;
  }, [roomId, startDate, endDate, reason]);

  const handleSubmit = async () => {
    if (!isFormValid || submitting) return;
    setSubmitting(true);
    setConflicts([]);
    setGeneralError(null);
    try {
      await partnerService.createRoomBlock({
        room_id: roomId,
        start_date: startDate,
        end_date: endDate,
        block_type: blockType,
        reason: reason.trim(),
        note: note.trim() || undefined,
      });
      toastSuccess('Đã tạo block phòng.');
      onCreated?.();
      onOpenChange(false);
    } catch (err: any) {
      const status = err?.response?.status;
      const data = err?.response?.data;
      if (status === 409 && data?.code === 'ROOM_BLOCK_CONFLICT') {
        setConflicts((data?.data?.conflicts ?? []) as ConflictItem[]);
        setGeneralError('Khoảng thời gian này đã trùng với đặt phòng hoặc chặn lịch khác.');
      } else if (status === 403) {
        setGeneralError('Bạn không có quyền tạo block cho phòng này.');
      } else if (status === 422) {
        const messages = Object.values(data?.errors ?? {}).flat() as string[];
        setGeneralError(messages[0] ?? 'Dữ liệu không hợp lệ.');
      } else {
        toastError('Không thể tạo block. Vui lòng thử lại.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-900">
            <span className="rounded-lg bg-amber-50 p-1.5 text-amber-600">
              <Lock size={18} />
            </span>
            Tạo block phòng
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="block-room" className="text-xs font-bold text-slate-600 uppercase tracking-wider">Phòng</label>
            <Select value={roomId} onValueChange={setRoomId}>
              <SelectTrigger id="block-room" className="h-11 rounded-lg border-slate-200">
                <SelectValue placeholder="Chọn phòng" />
              </SelectTrigger>
              <SelectContent>
                {rooms.length === 0 && (
                  <div className="px-3 py-2 text-sm text-slate-500">Vui lòng chọn cơ sở để xem phòng.</div>
                )}
                {rooms.map((r) => (
                  <SelectItem key={r.id} value={String(r.id)}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <DatePickerField
              label="Từ ngày"
              value={startDate}
              onChange={setStartDate}
            />
            <DatePickerField
              label="Đến ngày"
              value={endDate}
              onChange={setEndDate}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="block-type" className="text-xs font-bold text-slate-600 uppercase tracking-wider">Loại block</label>
            <Select value={blockType} onValueChange={(v) => setBlockType(v as any)}>
              <SelectTrigger id="block-type" className="h-11 rounded-lg border-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BLOCK_TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="block-reason" className="text-xs font-bold text-slate-600 uppercase tracking-wider">Lý do</label>
            <Input
              id="block-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="VD: Bảo trì máy lạnh phòng 201"
              maxLength={255}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="block-note" className="text-xs font-bold text-slate-600 uppercase tracking-wider">Ghi chú nội bộ</label>
            <PlainTextarea
              id="block-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Tùy chọn — chi tiết bổ sung dành cho team."
              className="min-h-[88px]"
            />
          </div>

          {generalError && (
            <div className="flex items-start gap-2 rounded-lg border border-rose-100 bg-rose-50 p-3 text-rose-700">
              <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
              <div className="text-sm font-medium leading-relaxed">
                <p>{generalError}</p>
                {conflicts.length > 0 && (
                  <ul className="mt-2 space-y-1 text-xs">
                    {conflicts.map((c, idx) => {
                      const loai = c.type === 'booking' ? 'Đặt phòng' : 'Chặn lịch';
                      const blockNhan =
                        c.block_type != null && c.block_type !== ''
                          ? PARTNER_BLOCK_TYPE_LABEL_VI[String(c.block_type)] ?? c.block_type
                          : '';
                      return (
                        <li key={idx} className="font-mono text-slate-800">
                          {loai} #{c.id ?? '?'} — {c.start_date ?? '?'} → {c.end_date ?? '?'}
                          {blockNhan ? ` (${blockNhan})` : ''}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-row flex-wrap items-center justify-end gap-2 gap-y-2 border-t border-slate-100 pt-4 sm:justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting} className="min-w-[96px]">
            Hủy
          </Button>
          <Button
            className="min-w-[120px] bg-amber-600 hover:bg-amber-700"
            onClick={handleSubmit}
            disabled={!isFormValid || submitting}
          >
            {submitting ? 'Đang tạo...' : 'Tạo block'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RoomBlockDialog;
