import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronRight, FileText, History as HistoryIcon } from 'lucide-react';
import { Booking } from '../../types';
import { cn } from '@/lib/utils';
import { Spinner } from '@/components/ui/spinner';
import { PartnerBookingDetailDialog } from '../../components/PartnerBookingDetailDialog';
import type { PartnerBookingDetailData } from '@/utils/partnerBookingNormalize';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  canPartnerBookingHaveContract,
  navigateToPartnerBookingContract,
} from '@/utils/partnerBookingContract';

interface TenantsTabProps {
  bookings: Booking[];
  isLoading?: boolean;
}

export const TenantsTab: React.FC<TenantsTabProps> = ({ bookings, isLoading }) => {
  const navigate = useNavigate();
  const [selectedBooking, setSelectedBooking] = useState<PartnerBookingDetailData | null>(null);
  const [loadingContractBookingId, setLoadingContractBookingId] = useState<string | number | null>(null);

  const handleOpenBooking = (booking: Booking) => {
    setSelectedBooking({
      id: booking.id,
      guestName: booking.guestName,
      roomName: booking.roomName,
      propertyName: booking.propertyName,
      phone: booking.phone,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      totalAmount: booking.totalAmount,
      status: booking.status,
      rawStatus: booking.rawStatus,
      note: booking.note,
      stay_status: booking.stay_status,
      contract_id: booking.contract_id,
    });
  };

  const handleKeyDown = (event: React.KeyboardEvent, booking: Booking) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleOpenBooking(booking);
    }
  };

  const handleViewContract = async (event: React.MouseEvent, booking: Booking) => {
    event.stopPropagation();
    if (!canPartnerBookingHaveContract(booking.rawStatus) || loadingContractBookingId != null) {
      return;
    }

    setLoadingContractBookingId(booking.id);
    try {
      await navigateToPartnerBookingContract(navigate, {
        id: booking.id,
        contract_id: booking.contract_id,
        rawStatus: booking.rawStatus,
      });
    } finally {
      setLoadingContractBookingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="py-16 text-center">
        <Spinner size="lg" showText text="Đang tải lịch sử đặt phòng..." />
      </div>
    );
  }

  return (
    <>
      <Card className="overflow-hidden rounded-2xl border-2 border-slate-100 shadow-xl shadow-slate-200/20 animate-in fade-in slide-in-from-bottom-4">
        {/* Mobile view */}
        <div className="space-y-3 p-3 md:hidden">
          {bookings.length > 0 ? bookings.map((b) => (
            <div
              key={`mobile-booking-${b.id}`}
              role="button"
              tabIndex={0}
              aria-label={`Xem chi tiết booking của ${b.guestName}`}
              onClick={() => handleOpenBooking(b)}
              onKeyDown={(event) => handleKeyDown(event, b)}
              className="cursor-pointer rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-blue-200 hover:bg-blue-50/30"
            >
              <p className="font-bold text-slate-900">{b.guestName}</p>
              <p className="text-xs text-slate-500">{b.phone || 'N/A'}</p>
              <p className="mt-2 text-xs text-slate-600">
                {b.checkIn ? new Date(b.checkIn).toLocaleDateString('vi-VN') : '-'} → {b.checkOut ? new Date(b.checkOut).toLocaleDateString('vi-VN') : '-'}
              </p>
              <p className="mt-1 text-sm font-bold text-slate-900">{Number(b.totalAmount || 0).toLocaleString()} đ</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge>{b.status}</Badge>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={!canPartnerBookingHaveContract(b.rawStatus) || loadingContractBookingId === b.id}
                          onClick={(event) => void handleViewContract(event, b)}
                          className="h-8 gap-1 text-xs"
                        >
                          <FileText size={14} /> Hợp đồng
                        </Button>
                      </span>
                    </TooltipTrigger>
                    {!canPartnerBookingHaveContract(b.rawStatus) && (
                      <TooltipContent>Chưa có hợp đồng — booking chưa được duyệt</TooltipContent>
                    )}
                    {canPartnerBookingHaveContract(b.rawStatus) && !b.contract_id && (
                      <TooltipContent>Hệ thống sẽ tạo hợp đồng tự động khi mở</TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          )) : (
            <div className="py-10 text-center text-sm text-slate-400">Phòng này chưa có lịch sử cư dân</div>
          )}
        </div>

        {/* Desktop view */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[720px]">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="px-6 py-6 text-left text-[10px] font-bold uppercase tracking-widest opacity-60 lg:px-10">Khách thuê / Cư dân</th>
                <th className="px-6 py-6 text-left text-[10px] font-bold uppercase tracking-widest opacity-60 lg:px-10">Thời gian ở</th>
                <th className="px-6 py-6 text-left text-[10px] font-bold uppercase tracking-widest opacity-60 lg:px-10">Giá trị hợp đồng</th>
                <th className="px-6 py-6 text-left text-[10px] font-bold uppercase tracking-widest opacity-60 lg:px-10">Trạng thái</th>
                <th className="px-6 py-6 text-right text-[10px] font-bold uppercase tracking-widest opacity-60 lg:px-10">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bookings.length > 0 ? bookings.map((b) => (
                <tr
                  key={b.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`Xem chi tiết booking của ${b.guestName}`}
                  onClick={() => handleOpenBooking(b)}
                  onKeyDown={(event) => handleKeyDown(event, b)}
                  className="cursor-pointer transition-colors hover:bg-slate-50"
                >
                  <td className="px-6 py-6 lg:px-10 lg:py-8">
                    <div className="flex items-center gap-4 lg:gap-5">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 text-base font-bold text-white shadow-lg lg:size-12 lg:text-lg">
                        {b.guestName?.[0] || 'U'}
                      </div>
                      <div className="min-w-0 space-y-1">
                        <p className="truncate text-sm font-bold text-slate-900 lg:text-base">{b.guestName}</p>
                        <p className="text-xs font-semibold tracking-tight text-slate-400">{b.phone || 'N/A'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6 lg:px-10 lg:py-8">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-700 lg:gap-3 lg:text-sm">
                      <span className="rounded-lg border border-slate-200 bg-slate-100 px-2 py-1 lg:px-3">{b.checkIn ? new Date(b.checkIn).toLocaleDateString('vi-VN') : '-'}</span>
                      <ChevronRight size={14} className="shrink-0 text-slate-300" />
                      <span className="rounded-lg border border-slate-200 bg-slate-100 px-2 py-1 lg:px-3">{b.checkOut ? new Date(b.checkOut).toLocaleDateString('vi-VN') : '-'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-6 lg:px-10 lg:py-8">
                    <p className="text-base font-bold text-slate-900 lg:text-lg">{Number(b.totalAmount || 0).toLocaleString()} <span className="text-xs">đ</span></p>
                  </td>
                  <td className="px-6 py-6 lg:px-10 lg:py-8">
                    <Badge className={cn(
                      'whitespace-nowrap px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest lg:px-4',
                      b.status === 'Đã duyệt' ? 'border-emerald-100 bg-emerald-50 text-emerald-700' :
                      b.status === 'Chờ duyệt' ? 'border-amber-100 bg-amber-50 text-amber-700' :
                      'border-rose-100 bg-rose-50 text-rose-700',
                    )}>
                      {b.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-6 text-right lg:px-10 lg:py-8">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="inline-flex">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              disabled={!canPartnerBookingHaveContract(b.rawStatus) || loadingContractBookingId === b.id}
                              onClick={(event) => void handleViewContract(event, b)}
                              className="h-8 gap-1 text-xs"
                            >
                              <FileText size={14} /> Hợp đồng
                            </Button>
                          </span>
                        </TooltipTrigger>
                        {!canPartnerBookingHaveContract(b.rawStatus) && (
                          <TooltipContent>Chưa có hợp đồng — booking chưa được duyệt</TooltipContent>
                        )}
                        {canPartnerBookingHaveContract(b.rawStatus) && !b.contract_id && (
                          <TooltipContent>Hệ thống sẽ tạo hợp đồng tự động khi mở</TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-10 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="rounded-full bg-slate-50 p-6 text-slate-200"><HistoryIcon size={48} /></div>
                      <p className="text-xs font-bold uppercase italic tracking-widest text-slate-400">Phòng này chưa có lịch sử cư dân</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <PartnerBookingDetailDialog
        booking={selectedBooking}
        open={Boolean(selectedBooking)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedBooking(null);
          }
        }}
        mode="readonly"
      />
    </>
  );
};
