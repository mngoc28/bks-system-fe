import * as React from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';
import type { Matcher } from 'react-day-picker';

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
  label: React.ReactNode;
  /** Override default label class name */
  labelClassName?: string;
  value: string;
  onChange: (ymd: string) => void;
  disabled?: boolean;
  className?: string;
  /** Disable dates before this date (yyyy-MM-dd) */
  minDate?: string;
  /** Disable dates after this date (yyyy-MM-dd) */
  maxDate?: string;
  /** Specific dates to disable (yyyy-MM-dd format) */
  excludeDates?: string[];
  invalid?: boolean;
  /** Extra classes applied to the trigger Button (overrides defaults) */
  triggerClassName?: string;
  /** Placeholder when no date is selected */
  placeholder?: string;
}

/**
 * Select a date (string yyyy-MM-dd) - display in vi locale, popover + calendar.
 */
export function DatePickerField({
  id,
  label,
  labelClassName,
  value,
  onChange,
  disabled,
  className,
  minDate,
  maxDate,
  excludeDates,
  invalid,
  triggerClassName,
  placeholder,
}: DatePickerFieldProps): React.ReactElement {
  const [open, setOpen] = React.useState(false);
  const selected = parseYmdToLocalDate(value);
  const minD = minDate ? parseYmdToLocalDate(minDate) : undefined;
  const maxD = maxDate ? parseYmdToLocalDate(maxDate) : undefined;

  const disabledMatchers = React.useMemo((): Matcher | Matcher[] | undefined => {
    const matchers: Matcher[] = [];
    if (minD) {
      matchers.push({ before: minD });
    }
    if (maxD) {
      matchers.push({ after: maxD });
    }
    if (excludeDates && excludeDates.length > 0) {
      excludeDates.forEach((dStr) => {
        const dObj = parseYmdToLocalDate(dStr);
        if (dObj) {
          matchers.push(dObj);
        }
      });
    }
    return matchers.length === 0 ? undefined : matchers.length === 1 ? matchers[0]! : matchers;
  }, [minD, maxD, excludeDates]);

  return (
    <div className={cn('space-y-1.5', className)}>
      <label
        htmlFor={id}
        className={cn('text-xs font-semibold text-slate-600', labelClassName)}
      >
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
              triggerClassName,
              !value && 'text-gray-500 font-normal',
              invalid && 'border-red-500',
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 shrink-0 text-slate-500" />
            <span className="truncate">
              {selected ? (
                format(selected, 'dd/MM/yyyy', { locale: vi })
              ) : (
                placeholder || 'Chọn ngày'
              )}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
            mode="single"
            locale={vi}
            selected={selected}
            defaultMonth={selected ?? minD}
            disabled={disabledMatchers}
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
