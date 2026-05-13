import * as React from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

function parseYmdToLocalDate(value: string): Date | undefined {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return undefined;
  }
  const [y, m, d] = value.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return Number.isNaN(dt.getTime()) ? undefined : dt;
}

export interface DatePickerFieldProps {
  id?: string;
  label: string;
  value: string;
  onChange: (ymd: string) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * Chọn một ngày (chuỗi yyyy-MM-dd) — hiển thị theo locale vi, popover + lịch.
 */
export function DatePickerField({
  id,
  label,
  value,
  onChange,
  disabled,
  className,
}: DatePickerFieldProps): React.ReactElement {
  const [open, setOpen] = React.useState(false);
  const selected = parseYmdToLocalDate(value);

  return (
    <div className={cn('space-y-1.5', className)}>
      <label htmlFor={id} className="text-xs font-semibold text-slate-600">
        {label}
      </label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            disabled={disabled}
            className={cn(
              'h-11 w-full justify-start rounded-lg border-slate-200 bg-white px-3 text-left font-normal text-slate-900 shadow-sm hover:bg-slate-50',
              !value && 'text-slate-400',
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 shrink-0 text-slate-500" />
            {selected ? (
              format(selected, 'd MMMM yyyy', { locale: vi })
            ) : (
              <span>Chọn ngày</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
            mode="single"
            locale={vi}
            selected={selected}
            defaultMonth={selected}
            onSelect={(date) => {
              if (date) {
                onChange(format(date, 'yyyy-MM-dd'));
              }
              setOpen(false);
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
