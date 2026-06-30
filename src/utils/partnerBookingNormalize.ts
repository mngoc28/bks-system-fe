import {
  normalizePartnerBookingStatusCode,
  partnerBaseStatusLabel,
} from '@/utils/partnerBookingDisplay';
import { computeBookingTotalAmount } from '@/utils/bookingAmount';

export interface PartnerBookingDetailData {
  id: string | number;
  guestName: string;
  roomName?: string;
  propertyName?: string;
  phone?: string;
  checkIn: string;
  checkOut: string;
  totalAmount: number;
  status: string;
  rawStatus?: number;
  note?: string;
  createdAt?: string;
  stay_status?: 'pending' | 'checked_in' | 'checked_out' | 'no_show';
  deposit_amount?: number;
  deposit_status?: string;
  payment_status?: string;
  amount_paid?: number;
  amount_remaining?: number;
  cancellation_reason?: string;
  cancelled_at?: string;
  no_show_at?: string;
  contract_id?: number | null;
  bookingDeposit?: {
    id: number;
    amount: number;
    status: string;
    receipt_path: string | null;
    created_at: string;
  } | null;
}

export const normalizePartnerBookings = (rows: any[]): PartnerBookingDetailData[] => {
  return (rows || []).map((item: any) => {
    const rawStatus = normalizePartnerBookingStatusCode(item.status ?? item.booking_status);
    const startDate = item.checkIn ?? item.start_date ?? item.check_in ?? '';
    const endDate = item.checkOut ?? item.end_date ?? item.check_out ?? '';
    const priceInput = item.price && typeof item.price === 'object'
      ? { price: item.price.price, unit: item.price.unit }
      : item.price != null
        ? { price: Number(item.price), unit: 'night' }
        : null;

    return {
      id: item.id,
      guestName: item.guestName ?? item.user_name ?? item.customerName ?? 'Khách lẻ',
      roomName: item.roomName ?? item.room_name ?? item.room_number ?? '',
      checkIn: startDate,
      checkOut: endDate,
      totalAmount: computeBookingTotalAmount({
        start_date: startDate,
        end_date: endDate,
        price: priceInput,
        services: item.services,
        total_amount: item.totalAmount ?? item.total_amount,
      }),
      status: partnerBaseStatusLabel(rawStatus),
      rawStatus,
      phone: item.phone ?? item.user_phone ?? '',
      note: item.note ?? '',
      propertyName: item.propertyName ?? item.property_name ?? '',
      createdAt: item.createdAt ?? item.created_at ?? '',
      stay_status: item.stay_status || 'pending',
      deposit_amount: item.deposit_amount != null ? Number(item.deposit_amount) : undefined,
      deposit_status: item.deposit_status ?? undefined,
      payment_status: item.payment_status ?? 'unpaid',
      amount_paid: item.amount_paid != null ? Number(item.amount_paid) : undefined,
      amount_remaining: item.amount_remaining != null ? Number(item.amount_remaining) : undefined,
      cancellation_reason: item.cancellation_reason ?? undefined,
      cancelled_at: item.cancelled_at ?? undefined,
      no_show_at: item.no_show_at ?? undefined,
      contract_id: item.contract_id != null ? Number(item.contract_id) : null,
      bookingDeposit: item.booking_deposit ?? item.bookingDeposit ?? item.booking_deposits ?? undefined,
    };
  });
};
