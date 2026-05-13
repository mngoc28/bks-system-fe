import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import type { DayPickerProps } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

import 'react-day-picker/dist/style.css';

export type CalendarProps = DayPickerProps;

/**
 * Lịch tháng (react-day-picker v8) — dùng kèm Popover cho chọn ngày.
 */
function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-2', className)}
      classNames={{
        months: 'flex flex-col gap-4 sm:flex-row',
        month: 'gap-2',
        caption: 'relative flex items-center justify-center px-2 py-1',
        caption_label: 'text-sm font-semibold text-slate-800',
        nav: 'flex items-center gap-1',
        nav_button: cn(
          buttonVariants({ variant: 'outline' }),
          'absolute h-8 w-8 bg-transparent p-0 opacity-80 hover:opacity-100',
        ),
        nav_button_previous: 'left-1',
        nav_button_next: 'right-1',
        table: 'w-full border-collapse',
        head_row: 'flex',
        head_cell: 'w-9 rounded-md text-[0.75rem] font-medium text-slate-500',
        row: 'mt-1 flex w-full',
        cell: cn(
          'relative h-9 w-9 p-0 text-center text-sm focus-within:relative focus-within:z-20',
          '[&:has([aria-selected])]:bg-slate-100 [&:has([aria-selected].day-outside)]:bg-slate-100/50',
        ),
        day: cn(
          buttonVariants({ variant: 'ghost' }),
          'h-9 w-9 p-0 font-normal text-slate-900 aria-selected:opacity-100',
        ),
        day_selected:
          'bg-blue-600 text-white hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white',
        day_today: 'bg-slate-100 font-semibold text-slate-900',
        day_outside: 'text-slate-400 opacity-60 aria-selected:bg-slate-100/60',
        day_disabled: 'text-slate-300 line-through opacity-40',
        day_hidden: 'invisible',
        ...classNames,
      }}
      components={{
        IconLeft: () => <ChevronLeft className="h-4 w-4" />,
        IconRight: () => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = 'Calendar';

export { Calendar };
