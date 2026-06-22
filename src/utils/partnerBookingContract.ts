import type { NavigateFunction } from 'react-router-dom';
import { partnerService } from '@/services/partnerService';
import { toastError } from '@/components/ui/toast';

const CONTRACT_ELIGIBLE_STATUSES = new Set([1, 3]);

export const canPartnerBookingHaveContract = (rawStatus?: number): boolean =>
  rawStatus != null && CONTRACT_ELIGIBLE_STATUSES.has(rawStatus);

export const resolvePartnerBookingContractId = async (
  bookingId: string | number,
  contractId?: number | null,
): Promise<number | null> => {
  if (contractId) {
    return contractId;
  }

  const response = (await partnerService.ensureBookingContract(bookingId)) as any;
  const payload = response?.data?.data ?? response?.data ?? null;
  const resolvedId = payload?.id ?? payload?.contract_id ?? null;

  return resolvedId != null ? Number(resolvedId) : null;
};

export const navigateToPartnerBookingContract = async (
  navigate: NavigateFunction,
  booking: {
    id: string | number;
    contract_id?: number | null;
    rawStatus?: number;
  },
): Promise<number | null> => {
  if (!canPartnerBookingHaveContract(booking.rawStatus)) {
    toastError('Booking này chưa được duyệt nên chưa có hợp đồng.');
    return null;
  }

  try {
    const contractId = await resolvePartnerBookingContractId(booking.id, booking.contract_id);
    if (!contractId) {
      toastError('Không thể mở hợp đồng cho booking này.');
      return null;
    }

    navigate(`/partner/contracts/${contractId}`);
    return contractId;
  } catch {
    toastError('Không thể mở hợp đồng. Vui lòng thử lại.');
    return null;
  }
};
