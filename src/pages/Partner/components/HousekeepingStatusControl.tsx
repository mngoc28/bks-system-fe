import React, { useEffect, useState } from 'react';
import { ChevronDown, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { toastError, toastSuccess } from '@/components/ui/toast';
import { partnerService } from '@/services/partnerService';
import { cn } from '@/lib/utils';
import {
  getHousekeepingStatusStyle,
  HOUSEKEEPING_STATUS_LABELS,
  HousekeepingStatus,
} from '@/utils/partnerRoomDisplay';
import { Room } from '../types';

const HOUSEKEEPING_OPTIONS: HousekeepingStatus[] = ['clean', 'dirty', 'inspecting'];

interface HousekeepingStatusControlProps {
  roomId: string | number;
  status: HousekeepingStatus;
  occupancyStatus?: Room['status'];
  onStatusUpdated?: (status: HousekeepingStatus) => void;
}

export const HousekeepingStatusControl: React.FC<HousekeepingStatusControlProps> = ({
  roomId,
  status,
  occupancyStatus,
  onStatusUpdated,
}) => {
  const [currentStatus, setCurrentStatus] = useState<HousekeepingStatus>(status);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    setCurrentStatus(status);
  }, [status]);

  const handleSelect = async (nextStatus: HousekeepingStatus) => {
    if (nextStatus === currentStatus || isUpdating) {
      return;
    }

    const previousStatus = currentStatus;
    setCurrentStatus(nextStatus);
    setIsUpdating(true);

    try {
      await partnerService.updateHousekeepingStatus(roomId, nextStatus);
      toastSuccess('Đã cập nhật trạng thái buồng phòng.');
      onStatusUpdated?.(nextStatus);
    } catch {
      setCurrentStatus(previousStatus);
      toastError('Không thể cập nhật trạng thái buồng phòng.');
    } finally {
      setIsUpdating(false);
    }
  };

  const showVacantDirtyWarning = occupancyStatus === 'Trống' && currentStatus === 'dirty';

  return (
    <div className="flex flex-col items-start gap-1">
      <TooltipProvider>
        <Tooltip>
          <DropdownMenu>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  disabled={isUpdating}
                  aria-label="Cập nhật trạng thái buồng phòng"
                  className={cn(
                    'h-auto rounded-full border px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider shadow-none hover:bg-transparent',
                    getHousekeepingStatusStyle(currentStatus),
                    isUpdating && 'opacity-60',
                  )}
                >
                  <Sparkles className="mr-1.5 size-3.5 shrink-0" />
                  {HOUSEKEEPING_STATUS_LABELS[currentStatus]}
                  <ChevronDown className="ml-1 size-3 shrink-0 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <DropdownMenuContent align="start" className="w-44">
              {HOUSEKEEPING_OPTIONS.map((option) => (
                <DropdownMenuItem
                  key={option}
                  onClick={() => void handleSelect(option)}
                  className={cn(
                    'text-xs font-semibold uppercase tracking-wide',
                    option === currentStatus && 'bg-slate-100',
                  )}
                >
                  {HOUSEKEEPING_STATUS_LABELS[option]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <TooltipContent side="bottom" className="max-w-xs text-xs">
            Cập nhật trạng thái buồng phòng cho lễ tân và nhân viên dọn phòng
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {showVacantDirtyWarning && (
        <Badge
          variant="outline"
          className="rounded-full border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-700"
        >
          Phòng trống nhưng chưa dọn
        </Badge>
      )}
    </div>
  );
};
