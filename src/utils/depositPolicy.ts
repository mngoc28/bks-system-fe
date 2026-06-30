/** REQ-SDEP-001/002 — cọc giữ chỗ ngắn hạn vs ký quỹ thuê dài hạn (REQ-DEP-001). */

const isLastMinuteCheckIn = (startDate: string): boolean => {
  const checkInDate = new Date(startDate);
  const today = new Date();
  return (checkInDate.getTime() - today.getTime()) / (1000 * 60 * 60) <= 24;
};

export const computeShortTermHoldDeposit = (roomStayTotal: number, startDate: string): number => {
  if (roomStayTotal <= 0) return 0;
  return isLastMinuteCheckIn(startDate)
    ? roomStayTotal
    : Math.round(roomStayTotal * 0.5);
};

type BookingHoldDepositInput = {
  isLongTerm: boolean;
  isDepositRequired: boolean;
  roomStayTotal: number;
  startDate: string;
  priceDepositAmount?: number | null;
  roomDeposit?: number | null;
};

/** Số tiền cọc cần thanh toán khi đặt phòng (không gồm dịch vụ bổ sung). */
export const computeBookingHoldDeposit = ({
  isLongTerm,
  isDepositRequired,
  roomStayTotal,
  startDate,
  priceDepositAmount,
  roomDeposit,
}: BookingHoldDepositInput): number => {
  if (!isDepositRequired || roomStayTotal <= 0) return 0;

  if (isLongTerm) {
    const configuredDeposit = Number(priceDepositAmount ?? 0) || Number(roomDeposit ?? 0);
    if (configuredDeposit > 0) return configuredDeposit;
    return computeShortTermHoldDeposit(roomStayTotal, startDate);
  }

  return computeShortTermHoldDeposit(roomStayTotal, startDate);
};
