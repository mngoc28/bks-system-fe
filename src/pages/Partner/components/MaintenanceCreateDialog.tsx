import React, { useEffect, useRef, useState } from 'react';
import { Wrench } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlainTextarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePickerField } from '@/components/ui/date-picker-field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import InlineSheet from './InlineSheet';
import { MaintenanceConflictPanel } from './MaintenanceConflictPanel';
import { partnerService } from '@/services/partnerService';
import { toastError, toastSuccess } from '@/components/ui/toast';
import { useMaintenanceConflictPreview } from '@/hooks/Partner/useMaintenanceConflictPreview';
import {
  extractMaintenanceApiError,
  MAINTENANCE_TYPE_LABEL,
  resolveMaintenanceConflictPanelTone,
} from '@/utils/partnerMaintenanceDisplay';

export interface MaintenanceCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roomId: number | string;
  propertyId?: number | string;
  roomLabel?: string;
  initialTitle?: string;
  onCreated?: () => void | Promise<void>;
  variant?: 'dialog' | 'sheet';
}

const defaultFormState = () => ({
  title: '',
  description: '',
  type: 'scheduled' as 'scheduled' | 'emergency',
  start_date: new Date().toISOString().split('T')[0],
  end_date: '',
  block_calendar: true,
});

export const MaintenanceCreateDialog: React.FC<MaintenanceCreateDialogProps> = ({
  open,
  onOpenChange,
  roomId,
  propertyId,
  roomLabel,
  initialTitle,
  onCreated,
  variant = 'dialog',
}) => {
  const endDateRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState(defaultFormState);
  const [submitting, setSubmitting] = useState(false);
  const [submitConflicts, setSubmitConflicts] = useState<Record<string, unknown> | null>(null);

  const { preview, isLoading, hasRange } = useMaintenanceConflictPreview({
    roomId,
    startDate: form.start_date,
    endDate: form.end_date,
    enabled: open,
  });

  const panelTone = resolveMaintenanceConflictPanelTone(preview, form.block_calendar, hasRange);
  const isSubmitBlocked = panelTone === 'block';

  useEffect(() => {
    if (!open) {
      setForm(defaultFormState());
      setSubmitConflicts(null);
      setSubmitting(false);
      return;
    }

    if (initialTitle) {
      setForm({ ...defaultFormState(), title: initialTitle });
    }
  }, [open, initialTitle]);

  const handleAdjustDates = () => {
    endDateRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleDisableBlockCalendar = () => {
    setForm((current) => ({ ...current, block_calendar: false }));
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      toastError('Vui lòng nhập tiêu đề bảo trì.');
      return;
    }

    if (form.block_calendar && !form.end_date) {
      toastError('Vui lòng chọn ngày hoàn thành khi khóa lịch đặt phòng.');
      return;
    }

    if (isSubmitBlocked) {
      toastError('Không thể khóa lịch vì trùng booking/block. Vui lòng đổi ngày hoặc tắt khóa lịch.');
      return;
    }

    try {
      setSubmitting(true);
      setSubmitConflicts(null);
      await partnerService.createMaintenance({
        room_id: roomId,
        property_id: propertyId,
        title: form.title.trim(),
        description: form.description.trim(),
        maintenance_type: form.type,
        start_time: form.start_date,
        end_time: form.end_date || null,
        block_calendar: form.block_calendar,
      });
      toastSuccess('Đã đăng ký lịch bảo trì.');
      onOpenChange(false);
      await onCreated?.();
    } catch (err) {
      const { message, code, conflicts } = extractMaintenanceApiError(err);
      if (code === 'MAINTENANCE_CALENDAR_CONFLICT' && conflicts) {
        setSubmitConflicts(conflicts as Record<string, unknown>);
      }
      toastError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const formContent = (
    <div className="space-y-4">
      {variant === 'sheet' && (
        <div className="rounded-xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-800">
          Đăng ký bảo trì cho phòng <strong>{roomLabel || `#${roomId}`}</strong>. Bật khóa lịch để chặn đặt phòng
          trong thời gian sửa chữa.
        </div>
      )}

      <div className="grid gap-2">
        <Label htmlFor="maintenance-create-type" className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Loại bảo trì
        </Label>
        <Select
          value={form.type}
          onValueChange={(value: 'scheduled' | 'emergency') => setForm({ ...form, type: value })}
        >
          <SelectTrigger id="maintenance-create-type" className="h-11 rounded-xl">
            <SelectValue placeholder="Chọn loại" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(MAINTENANCE_TYPE_LABEL).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="maintenance-create-title" className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Tiêu đề sự cố
        </Label>
        <Input
          id="maintenance-create-title"
          value={form.title}
          onChange={(event) => setForm({ ...form, title: event.target.value })}
          placeholder="VD: Hỏng vòi nước, kiểm tra điều hòa..."
          className="h-11 rounded-xl"
        />
      </div>

      <div className="grid gap-2">
        <Label
          htmlFor="maintenance-create-description"
          className="text-xs font-bold uppercase tracking-wider text-slate-500"
        >
          Mô tả chi tiết
        </Label>
        <PlainTextarea
          id="maintenance-create-description"
          value={form.description}
          onChange={(event) => setForm({ ...form, description: event.target.value })}
          placeholder="Mô tả tình trạng hoặc yêu cầu kỹ thuật..."
          className="min-h-[110px] rounded-xl"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <DatePickerField
          id="maintenance-create-start"
          label="Ngày bắt đầu"
          labelClassName="text-xs font-bold uppercase tracking-wider text-slate-500"
          value={form.start_date}
          onChange={(ymd) => setForm({ ...form, start_date: ymd })}
          maxDate={form.end_date || undefined}
          className="space-y-2"
          triggerClassName="h-11 min-h-0 rounded-xl text-sm font-normal shadow-none hover:shadow-none"
          popoverModal
        />
        <div ref={endDateRef}>
          <DatePickerField
            id="maintenance-create-end"
            label={form.block_calendar ? 'Dự kiến hoàn thành *' : 'Dự kiến hoàn thành'}
            labelClassName="text-xs font-bold uppercase tracking-wider text-slate-500"
            value={form.end_date}
            onChange={(ymd) => setForm({ ...form, end_date: ymd })}
            minDate={form.start_date || undefined}
            className="space-y-2"
            triggerClassName="h-11 min-h-0 rounded-xl text-sm font-normal shadow-none hover:shadow-none"
            popoverModal
          />
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
        <Checkbox
          id="maintenance-create-block-calendar"
          checked={form.block_calendar}
          onCheckedChange={(checked) => setForm({ ...form, block_calendar: checked === true })}
        />
        <div className="space-y-1">
          <Label htmlFor="maintenance-create-block-calendar" className="cursor-pointer text-sm font-semibold text-slate-800">
            Khóa lịch đặt phòng trong thời gian bảo trì
          </Label>
          <p className="text-xs text-slate-500">
            Khi bật, hệ thống tạo block lịch và yêu cầu ngày hoàn thành. Tắt nếu chỉ ghi nhận sự cố mà không chặn
            booking.
          </p>
        </div>
      </div>

      <MaintenanceConflictPanel
        preview={preview}
        blockCalendar={form.block_calendar}
        hasDates={hasRange}
        isLoading={isLoading}
        onAdjustDates={handleAdjustDates}
        onDisableBlockCalendar={handleDisableBlockCalendar}
      />

      {submitConflicts && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-semibold">Lịch vừa thay đổi — vui lòng kiểm tra lại trước khi gửi.</p>
        </div>
      )}
    </div>
  );

  const footer = (
    <div className="flex w-full justify-end gap-2">
      <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
        Hủy
      </Button>
      <Button
        type="button"
        onClick={handleSubmit}
        disabled={submitting || isSubmitBlocked}
        className="bg-blue-600 hover:bg-blue-700"
      >
        {submitting ? 'Đang lưu...' : 'Xác nhận đăng ký'}
      </Button>
    </div>
  );

  if (variant === 'sheet') {
    return (
      <InlineSheet
        open={open}
        onClose={() => onOpenChange(false)}
        title="Đăng ký bảo trì / báo hỏng"
        footer={footer}
      >
        {formContent}
      </InlineSheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(90vh,calc(100vh-2rem))] flex-col gap-0 overflow-hidden p-0 sm:max-w-xl">
        <DialogHeader className="shrink-0 px-6 pt-6">
          <DialogTitle className="flex items-center gap-2 text-slate-900">
            <span className="rounded-lg bg-blue-50 p-1.5 text-blue-600">
              <Wrench size={18} />
            </span>
            Đăng ký bảo trì {roomLabel ? `phòng ${roomLabel}` : ''}
          </DialogTitle>
          <DialogDescription className="pt-2 text-sm leading-relaxed text-slate-500">
            Tạo phiếu bảo trì và kiểm tra booking/khách trước khi khóa lịch.
          </DialogDescription>
        </DialogHeader>

        <div className="custom-scrollbar flex-1 overflow-y-auto px-6 py-4">{formContent}</div>

        <DialogFooter className="shrink-0 gap-2 border-t border-slate-100 px-6 py-4">{footer}</DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
