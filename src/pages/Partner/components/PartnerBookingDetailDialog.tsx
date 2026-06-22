import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, FileText, Image as ImageIcon, Loader2, UserX } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  canMarkPartnerBookingNoShow,
  countPartnerBookingNightsExclusive,
  formatPartnerBookingDateVi,
  getPartnerBookingBadgeClass,
  getPartnerDepositDisplay,
  getPartnerPaymentDisplay,
  getPartnerRowDisplayStatus,
  getPartnerStatusSubBadge,
} from '@/utils/partnerBookingDisplay';
import type { PartnerBookingDetailData } from '@/utils/partnerBookingNormalize';
import {
  canPartnerBookingHaveContract,
  navigateToPartnerBookingContract,
} from '@/utils/partnerBookingContract';

export interface PartnerBookingDetailDialogProps {
  booking: PartnerBookingDetailData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: 'full' | 'readonly';
  onViewReceipt?: (receiptPath: string) => void;
  onApprove?: (id: string | number) => void;
  onReject?: (id: string | number) => void;
  onNoShow?: (id: string | number) => void;
  onConfirmDeposit?: (id: string | number) => void | Promise<void>;
}

export const PartnerBookingDetailDialog: React.FC<PartnerBookingDetailDialogProps> = ({
  booking,
  open,
  onOpenChange,
  mode = 'readonly',
  onViewReceipt,
  onApprove,
  onReject,
  onNoShow,
  onConfirmDeposit,
}) => {
  const navigate = useNavigate();
  const isReadonly = mode === 'readonly';
  const [isContractLoading, setIsContractLoading] = useState(false);
  const canViewContract = canPartnerBookingHaveContract(booking?.rawStatus);

  const handleViewContract = async () => {
    if (!booking || !canViewContract || isContractLoading) {
      return;
    }

    setIsContractLoading(true);
    try {
      const contractId = await navigateToPartnerBookingContract(navigate, booking);
      if (contractId) {
        onOpenChange(false);
      }
    } finally {
      setIsContractLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Chi tiết booking #{booking?.id}</DialogTitle>
        </DialogHeader>

        {booking && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-slate-200 p-3">
                <p className="text-xs font-bold uppercase text-slate-500">Khách hàng</p>
                <p className="mt-1 font-semibold">{booking.guestName || 'N/A'}</p>
                <p className="mt-1 text-slate-500">{booking.phone || 'Không có số điện thoại'}</p>
              </div>
              <div className="rounded-xl border border-slate-200 p-3">
                <p className="text-xs font-bold uppercase text-slate-500">Phòng / Tòa nhà</p>
                <p className="mt-1 font-semibold">{booking.roomName || 'N/A'}</p>
                <p className="mt-1 text-slate-500">{booking.propertyName || 'N/A'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="rounded-xl border border-slate-200 p-3">
                <p className="text-xs font-bold uppercase text-slate-500">Ngày nhận phòng</p>
                <p className="mt-1 font-semibold">{formatPartnerBookingDateVi(booking.checkIn)}</p>
              </div>
              <div className="rounded-xl border border-slate-200 p-3">
                <p className="text-xs font-bold uppercase text-slate-500">Ngày trả phòng</p>
                <p className="mt-1 font-semibold">{formatPartnerBookingDateVi(booking.checkOut)}</p>
              </div>
              <div className="rounded-xl border border-slate-200 p-3">
                <p className="text-xs font-bold uppercase text-slate-500">Tổng tiền</p>
                <p className="mt-1 font-semibold text-blue-700">{(booking.totalAmount || 0).toLocaleString('vi-VN')} đ</p>
              </div>
            </div>

            {(() => {
              const nights = countPartnerBookingNightsExclusive(booking.checkIn, booking.checkOut);
              if (nights === null || nights <= 0) {
                return null;
              }
              return (
                <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-center text-sm font-semibold text-slate-700">
                  {nights} đêm lưu trú
                </div>
              );
            })()}

            {booking.createdAt && (
              <div className="flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50/50 px-4 py-2.5">
                <Clock size={14} className="shrink-0 text-blue-400" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-blue-400">Thời gian đặt phòng</p>
                  <p className="text-sm font-semibold text-blue-700">
                    {new Date(booking.createdAt).toLocaleString('vi-VN', {
                      weekday: 'long',
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            )}

            <div className="rounded-xl border border-slate-200 p-3">
              <p className="text-xs font-bold uppercase text-slate-500">Ghi chú khách hàng</p>
              <p className="mt-1 whitespace-pre-wrap text-slate-700">{booking.note || 'Không có ghi chú.'}</p>
            </div>

            {booking.payment_status && (
              <div className="space-y-2 rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-bold uppercase text-slate-500">Thanh toán đơn</p>
                {(() => {
                  const payment = getPartnerPaymentDisplay(booking.payment_status, booking.totalAmount);
                  return (
                    <>
                      <Badge variant="none" className={`text-xs font-bold border px-2.5 py-0.5 ${payment.badgeClass}`}>
                        {payment.label}
                      </Badge>
                      {payment.hint && <p className="text-xs text-slate-500">{payment.hint}</p>}
                    </>
                  );
                })()}
              </div>
            )}

            {(booking.deposit_amount ?? 0) > 0 && (
              <div className="space-y-3 rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-bold uppercase text-slate-500">Thông tin đặt cọc</p>
                {(() => {
                  const deposit = getPartnerDepositDisplay(booking.deposit_status, booking.deposit_amount);
                  return deposit ? (
                    <>
                      <Badge variant="none" className={`text-xs font-bold border px-2.5 py-0.5 ${deposit.badgeClass}`}>
                        {deposit.label}
                      </Badge>
                      {deposit.hint && <p className="text-xs text-slate-500">{deposit.hint}</p>}
                    </>
                  ) : null;
                })()}
                {booking.bookingDeposit?.receipt_path && onViewReceipt && (
                  <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-2.5 text-xs">
                    <span className="flex items-center gap-1 font-semibold text-slate-500">
                      <ImageIcon size={14} className="text-emerald-500" />
                      Minh chứng chuyển khoản:
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewReceipt(booking.bookingDeposit?.receipt_path || '')}
                      className="h-auto p-0 font-bold text-blue-600 hover:bg-transparent hover:text-blue-800"
                    >
                      Xem minh chứng
                    </Button>
                  </div>
                )}
                {!isReadonly
                  && booking.rawStatus === 1
                  && ['pending', 'payment_submitted'].includes(booking.deposit_status || '')
                  && onConfirmDeposit && (
                  <Button
                    size="sm"
                    className="w-full bg-emerald-600 font-bold text-white hover:bg-emerald-700"
                    onClick={() => void onConfirmDeposit(booking.id)}
                  >
                    Xác nhận đã nhận cọc
                  </Button>
                )}
              </div>
            )}

            {(booking.rawStatus === 2 || booking.stay_status === 'no_show') && (
              <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
                <p className="text-xs font-bold uppercase text-slate-500">Giải phóng phòng</p>
                {(() => {
                  const subBadge = getPartnerStatusSubBadge(
                    booking.rawStatus,
                    booking.stay_status,
                    booking.deposit_status,
                    booking.cancellation_reason,
                  );
                  return subBadge ? (
                    <>
                      <Badge variant="none" className={`text-xs font-bold border px-2.5 py-0.5 ${subBadge.badgeClass}`}>
                        {subBadge.label}
                      </Badge>
                      {subBadge.hint && <p className="text-xs text-slate-600">{subBadge.hint}</p>}
                    </>
                  ) : null;
                })()}
                {booking.cancellation_reason && (
                  <p className="text-xs text-slate-600">
                    <span className="font-semibold text-slate-500">Lý do: </span>
                    {booking.cancellation_reason}
                  </p>
                )}
              </div>
            )}

            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <div className="flex flex-col items-start gap-1">
                <Badge
                  variant="none"
                  className={`border px-3 py-1 font-semibold ${getPartnerBookingBadgeClass(
                    booking.rawStatus ?? 1,
                    booking.stay_status,
                  )}`}
                >
                  {getPartnerRowDisplayStatus(booking.rawStatus ?? 1, booking.stay_status)}
                </Badge>
              </div>

              {!isReadonly && (
                <div className="flex items-center gap-2">
                  {booking.rawStatus === 0 && onReject && onApprove && (
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="font-bold text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                        onClick={() => onReject(booking.id)}
                      >
                        Từ chối
                      </Button>
                      <Button
                        size="sm"
                        className="bg-emerald-600 font-bold shadow-sm hover:bg-emerald-700"
                        onClick={() => onApprove(booking.id)}
                      >
                        Duyệt booking
                      </Button>
                    </>
                  )}
                  {canMarkPartnerBookingNoShow(
                    booking.rawStatus,
                    booking.stay_status,
                    booking.checkIn,
                  ) && onNoShow && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1 border-slate-300 font-bold text-slate-700"
                      onClick={() => onNoShow(booking.id)}
                    >
                      <UserX size={14} />
                      Không đến
                    </Button>
                  )}
                </div>
              )}
            </div>

            {canViewContract && (
              <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-end">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-flex w-full sm:w-auto">
                        <Button
                          type="button"
                          variant="outline"
                          disabled={isContractLoading}
                          onClick={() => void handleViewContract()}
                          className="w-full gap-2 sm:w-auto"
                        >
                          {isContractLoading ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <FileText size={16} />
                          )}
                          {booking.contract_id ? 'Xem hợp đồng' : 'Tạo & xem hợp đồng'}
                        </Button>
                      </span>
                    </TooltipTrigger>
                    {!booking.contract_id && (
                      <TooltipContent>
                        Booking đã duyệt nhưng chưa có hợp đồng — hệ thống sẽ tạo tự động
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
                {isReadonly && (
                  <Button type="button" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
                    Đóng
                  </Button>
                )}
              </DialogFooter>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
