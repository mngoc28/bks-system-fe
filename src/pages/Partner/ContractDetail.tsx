import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  FileText,
  Home,
  Loader2,
  Phone,
  User,
  Zap,
  XCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { PlainTextarea } from '@/components/ui/textarea';
import { toastError, toastSuccess } from '@/components/ui/toast';
import { partnerService } from '@/services/partnerService';
import { isPartner360Enabled } from '@/lib/featureFlags';

interface UtilityFee {
  id: number;
  fee_type: string;
  calc_method: string;
  unit_price: number | string;
  is_included: boolean | number;
}

interface ContractBooking {
  id: number;
  start_date: string;
  end_date: string;
  user?: { id?: number; name?: string; phone?: string; email?: string };
  room?: {
    id?: number;
    title?: string;
    name?: string;
    utility_fees?: UtilityFee[];
    building?: { id?: number; name?: string };
  };
  price?: { price?: number };
}

interface ContractDetailModel {
  id: number;
  title: string;
  content: string;
  status: number;
  contract_type: string;
  signature_date: string | null;
  renewal_reminder_at: string | null;
  terminated_at: string | null;
  termination_reason: string | null;
  created_at: string;
  booking?: ContractBooking;
}

const STATUS_LABEL: Record<number, { label: string; cls: string }> = {
  0: { label: 'Chờ ký', cls: 'bg-amber-100 text-amber-700' },
  1: { label: 'Đã ký', cls: 'bg-emerald-100 text-emerald-700' },
  2: { label: 'Đã ký', cls: 'bg-emerald-100 text-emerald-700' },
  3: { label: 'Đã hủy', cls: 'bg-rose-100 text-rose-700' },
};

const FEE_TYPE_LABEL: Record<string, string> = {
  electricity: 'Điện',
  water: 'Nước',
  internet: 'Internet',
  management: 'Phí quản lý',
  parking: 'Phí gửi xe',
  cleaning: 'Vệ sinh',
  other: 'Khác',
};

const CALC_METHOD_LABEL: Record<string, string> = {
  fixed: 'Trọn gói/tháng',
  index: 'Theo chỉ số',
  person: 'Theo người',
};

function formatVi(date?: string | null): string {
  if (!date) return '—';
  try {
    return new Date(date).toLocaleString('vi-VN');
  } catch {
    return '—';
  }
}

function formatDateVi(date?: string | null): string {
  if (!date) return '—';
  try {
    return new Date(date).toLocaleDateString('vi-VN');
  } catch {
    return '—';
  }
}

function formatCurrency(value: number | string | undefined | null): string {
  const num = Number(value ?? 0);
  if (!Number.isFinite(num)) return '0 đ';
  return num.toLocaleString('vi-VN', { maximumFractionDigits: 0 }) + ' đ';
}

const ContractDetail: React.FC = () => {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const contractId = params.id;

  const [loading, setLoading] = useState(true);
  const [contract, setContract] = useState<ContractDetailModel | null>(null);
  const [terminateOpen, setTerminateOpen] = useState(false);
  const [terminateReason, setTerminateReason] = useState('');
  const [busy, setBusy] = useState(false);

  const partner360 = isPartner360Enabled();

  useEffect(() => {
    if (!contractId) return;
    void fetchContract();
  }, [contractId]);

  const fetchContract = async () => {
    if (!contractId) return;
    try {
      setLoading(true);
      const res: any = await partnerService.getContractDetail(contractId);
      const payload = (res?.data?.data ?? res?.data ?? null) as ContractDetailModel | null;
      setContract(payload);
    } catch (e) {
      console.error(e);
      toastError('Không thể tải chi tiết hợp đồng.');
    } finally {
      setLoading(false);
    }
  };

  const handleSetReminder = async () => {
    if (!contractId) return;
    try {
      setBusy(true);
      await partnerService.setContractRenewalReminder(contractId);
      toastSuccess('Đã đặt nhắc gia hạn hợp đồng.');
      await fetchContract();
    } catch (e: any) {
      const message = e?.response?.data?.message ?? 'Không thể đặt nhắc gia hạn.';
      toastError(message);
    } finally {
      setBusy(false);
    }
  };

  const handleTerminate = async () => {
    if (!contractId) return;
    const reason = terminateReason.trim();
    if (reason.length < 5) {
      toastError('Vui lòng nhập lý do tối thiểu 5 ký tự.');
      return;
    }
    try {
      setBusy(true);
      await partnerService.terminateContract(contractId, reason);
      toastSuccess('Đã chấm dứt hợp đồng.');
      setTerminateOpen(false);
      setTerminateReason('');
      await fetchContract();
    } catch (e: any) {
      const message = e?.response?.data?.message ?? 'Không thể chấm dứt hợp đồng.';
      toastError(message);
    } finally {
      setBusy(false);
    }
  };

  const fees: UtilityFee[] = useMemo(() => {
    return contract?.booking?.room?.utility_fees ?? [];
  }, [contract]);

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <p className="text-gray-500">Đang tải chi tiết hợp đồng...</p>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="space-y-4 p-6">
        <Button variant="ghost" onClick={() => navigate('/partner/contracts')}>
          <ArrowLeft className="mr-2" size={16} /> Quay lại danh sách hợp đồng
        </Button>
        <p className="rounded-lg border border-gray-100 bg-white p-6 text-center text-gray-500">
          Không tìm thấy hợp đồng.
        </p>
      </div>
    );
  }

  const status = STATUS_LABEL[contract.status] ?? { label: 'N/A', cls: 'bg-gray-100 text-gray-700' };
  const isLongTerm = contract.contract_type === 'LEASE_AGREEMENT';
  const isTerminated = Boolean(contract.terminated_at);
  const hasReminder = Boolean(contract.renewal_reminder_at);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/partner/contracts')}>
            <ArrowLeft size={18} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">{contract.title}</h1>
            <p className="text-xs text-gray-500">#CTR-{contract.id} · {contract.contract_type}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={`border-none ${status.cls}`}>{status.label}</Badge>
          {isTerminated && <Badge className="border-none bg-rose-100 text-rose-700">Đã chấm dứt</Badge>}
          {hasReminder && !isTerminated && (
            <Badge className="border-none bg-amber-100 text-amber-700">Đã nhắc gia hạn</Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarClock size={18} /> Thời hạn thuê
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Ngày bắt đầu</span>
              <span className="font-bold">{formatDateVi(contract.booking?.start_date)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Ngày kết thúc</span>
              <span className="font-bold">{formatDateVi(contract.booking?.end_date)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Ngày ký</span>
              <span className="font-bold">{formatVi(contract.signature_date)}</span>
            </div>
            {hasReminder && (
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Đã nhắc gia hạn lúc</span>
                <span className="font-bold text-amber-700">{formatVi(contract.renewal_reminder_at)}</span>
              </div>
            )}
            {isTerminated && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Đã chấm dứt lúc</span>
                  <span className="font-bold text-rose-700">{formatVi(contract.terminated_at)}</span>
                </div>
                {contract.termination_reason && (
                  <div className="rounded-md border border-rose-100 bg-rose-50 p-2 text-xs text-rose-700">
                    Lý do: {contract.termination_reason}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Home size={18} /> Khách thuê & tài sản
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center gap-2"><User size={14} className="text-gray-400" /> {contract.booking?.user?.name ?? '—'}</div>
            <div className="flex items-center gap-2"><Phone size={14} className="text-gray-400" /> {contract.booking?.user?.phone ?? '—'}</div>
            <div className="flex items-center gap-2 text-gray-500 text-xs">{contract.booking?.user?.email}</div>
            <div className="border-t border-gray-100 pt-2">
              <p className="font-bold text-gray-900">{contract.booking?.room?.building?.name ?? 'N/A'}</p>
              <p className="text-xs text-gray-500">{contract.booking?.room?.title ?? contract.booking?.room?.name}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Zap size={18} /> Phí tiện ích đính kèm
          </CardTitle>
        </CardHeader>
        <CardContent>
          {fees.length === 0 ? (
            <p className="text-sm italic text-gray-400">Chưa có phí tiện ích cấu hình cho phòng này.</p>
          ) : (
            <div className="overflow-hidden rounded-lg border border-gray-100">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-[11px] font-bold uppercase tracking-widest text-gray-500">
                  <tr>
                    <th className="px-4 py-3">Loại phí</th>
                    <th className="px-4 py-3">Cách tính</th>
                    <th className="px-4 py-3 text-right">Đơn giá</th>
                    <th className="px-4 py-3 text-center">Đã bao gồm</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {fees.map((fee) => (
                    <tr key={fee.id}>
                      <td className="px-4 py-3 font-medium text-gray-900">{FEE_TYPE_LABEL[fee.fee_type] ?? fee.fee_type}</td>
                      <td className="px-4 py-3 text-gray-600">{CALC_METHOD_LABEL[fee.calc_method] ?? fee.calc_method}</td>
                      <td className="px-4 py-3 text-right font-bold">{formatCurrency(fee.unit_price)}</td>
                      <td className="px-4 py-3 text-center">
                        {fee.is_included ? (
                          <CheckCircle2 size={16} className="mx-auto text-emerald-600" />
                        ) : (
                          <span className="text-xs text-gray-400">Phụ thu</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText size={18} /> Nội dung hợp đồng
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="min-h-[200px] whitespace-pre-wrap rounded-lg border border-gray-100 bg-gray-50 p-4 font-serif text-sm text-gray-700">
            {contract.content || 'Chưa có nội dung điều khoản chi tiết.'}
          </div>
        </CardContent>
      </Card>

      {partner360 && isLongTerm && !isTerminated && (
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            disabled={busy || hasReminder}
            onClick={handleSetReminder}
            className="flex items-center gap-2"
          >
            <CalendarClock size={16} /> {hasReminder ? 'Đã đánh dấu nhắc gia hạn' : 'Đánh dấu nhắc gia hạn'}
          </Button>
          <Button
            variant="destructive"
            disabled={busy}
            onClick={() => setTerminateOpen(true)}
            className="flex items-center gap-2"
          >
            <XCircle size={16} /> Chấm dứt hợp đồng
          </Button>
        </div>
      )}

      <Dialog open={terminateOpen} onOpenChange={setTerminateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chấm dứt hợp đồng #CTR-{contract.id}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label>Lý do chấm dứt (tối thiểu 5 ký tự)</Label>
            <PlainTextarea
              value={terminateReason}
              onChange={(e) => setTerminateReason(e.target.value)}
              className="min-h-[120px]"
              placeholder="VD: Khách đề nghị thanh lý trước hạn..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTerminateOpen(false)} disabled={busy}>
              Huỷ
            </Button>
            <Button variant="destructive" onClick={handleTerminate} disabled={busy}>
              {busy ? 'Đang xử lý...' : 'Xác nhận chấm dứt'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContractDetail;
