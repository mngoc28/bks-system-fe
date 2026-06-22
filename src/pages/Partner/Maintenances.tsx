import React, { useEffect, useRef, useState } from 'react';
import { Spinner } from '@/components/ui/spinner';
import { Wrench, MapPin, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toastError, toastInfo } from '@/components/ui/toast';
import PropertySelector from './components/PropertySelector';
import { MaintenanceCancelDialog } from './components/MaintenanceCancelDialog';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  usePartnerMaintenancesQuery,
  useUpdateMaintenanceMutation,
} from '@/hooks/Partner/usePartnerMaintenancesQuery';
import { extractMaintenanceApiError, getMaintenanceStatusStyle } from '@/utils/partnerMaintenanceDisplay';
import type { MaintenanceRequest } from './types';

const Maintenances: React.FC = () => {
  const [filterPropertyId, setFilterPropertyId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [cancelTarget, setCancelTarget] = useState<MaintenanceRequest | null>(null);

  const prevFiltersRef = useRef({
    propertyId: filterPropertyId,
    status: filterStatus,
  });

  useEffect(() => {
    const filtersChanged =
      prevFiltersRef.current.propertyId !== filterPropertyId ||
      prevFiltersRef.current.status !== filterStatus;
    prevFiltersRef.current = { propertyId: filterPropertyId, status: filterStatus };

    if (filtersChanged && currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [filterPropertyId, filterStatus, currentPage]);

  const { data, isLoading, isFetching, refetch } = usePartnerMaintenancesQuery({
    page: currentPage,
    perPage: pageSize,
    propertyId: filterPropertyId,
    status: filterStatus === 'all' ? undefined : filterStatus,
  });

  const updateMutation = useUpdateMaintenanceMutation();

  const requests = data?.items ?? [];
  const totalPages = data?.lastPage ?? 1;
  const totalItems = data?.total ?? 0;
  const loading = isLoading || isFetching;

  const handleStatusUpdate = async (id: number | string, status: 'in_progress' | 'completed') => {
    try {
      await updateMutation.mutateAsync({ id, payload: { status } });
      toastInfo(status === 'in_progress' ? 'Đã tiếp nhận phiếu bảo trì.' : 'Đã hoàn thành phiếu bảo trì.');
      await refetch();
    } catch (err) {
      const { message } = extractMaintenanceApiError(err);
      toastError(message);
    }
  };

  const canAccept = (status: MaintenanceRequest['status']) =>
    status === 'Chờ xử lý' || status === 'Đang chờ';

  const canComplete = (status: MaintenanceRequest['status']) =>
    status === 'Đang xử lý' || status === 'Đang sửa';

  const canCancel = (status: MaintenanceRequest['status']) =>
    status === 'Chờ xử lý' || status === 'Đang chờ' || status === 'Đang xử lý' || status === 'Đang sửa';

  const renderActions = (request: MaintenanceRequest) => (
    <div className="flex flex-wrap items-center justify-end gap-2">
      {canAccept(request.status) && (
        <Button
          onClick={() => handleStatusUpdate(request.id, 'in_progress')}
          size="sm"
          disabled={updateMutation.isPending}
          className="h-8 bg-amber-500 font-bold text-white hover:bg-amber-600"
        >
          Tiếp nhận
        </Button>
      )}
      {canComplete(request.status) && (
        <Button
          onClick={() => handleStatusUpdate(request.id, 'completed')}
          size="sm"
          disabled={updateMutation.isPending}
          className="h-8 bg-emerald-600 font-bold text-white hover:bg-emerald-700"
        >
          Xong
        </Button>
      )}
      {canCancel(request.status) && (
        <Button
          onClick={() => setCancelTarget(request)}
          size="sm"
          variant="outline"
          disabled={updateMutation.isPending}
          className="h-8 border-red-200 text-red-600 hover:bg-red-50"
        >
          Hủy
        </Button>
      )}
      {request.status === 'Đã hoàn thành' && (
        <div className="flex items-center justify-center p-2 text-emerald-500">
          <CheckCircle size={20} />
        </div>
      )}
    </div>
  );

  if (loading && requests.length === 0) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Spinner size="lg" showText text="Đang tải danh sách bảo trì..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6 md:flex-row md:items-center">
        <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          <PropertySelector
            selectedId={filterPropertyId}
            onSelect={setFilterPropertyId}
            className="w-full sm:w-64"
          />
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="h-10 w-full sm:w-44">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="planned">Chờ xử lý</SelectItem>
              <SelectItem value="in_progress">Đang xử lý</SelectItem>
              <SelectItem value="completed">Đã hoàn thành</SelectItem>
              <SelectItem value="cancelled">Đã hủy</SelectItem>
            </SelectContent>
          </Select>
          <div className="hidden h-10 w-px bg-gray-100 md:block" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý Bảo trì & Sự cố</h1>
            <p className="mt-1 text-gray-500">Xử lý các yêu cầu sửa chữa và bảo trì từ cư dân.</p>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="space-y-3 p-3 md:hidden">
          {requests.length > 0 ? (
            requests.map((request) => (
              <div key={`mobile-maint-${request.id}`} className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-gray-800">{request.title || request.type || 'Sửa chữa'}</h3>
                    {request.propertyName && (
                      <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-blue-600">
                        {request.propertyName}
                      </p>
                    )}
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
                      <MapPin size={12} /> {request.roomName || 'N/A'}
                    </p>
                  </div>
                  <span
                    className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-[10px] font-bold ${getMaintenanceStatusStyle(request.status)}`}
                  >
                    {request.status}
                  </span>
                </div>
                <p className="mt-3 line-clamp-3 text-xs text-gray-600">{request.description}</p>
                <p className="mt-2 text-[10px] text-gray-400">
                  Yêu cầu: {new Date(request.createdAt).toLocaleDateString('vi-VN')}
                </p>
                <div className="mt-3">{renderActions(request)}</div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center italic text-gray-400">Chưa có yêu cầu bảo trì nào.</div>
          )}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                <th className="px-6 py-4">Sự cố / Phòng</th>
                <th className="px-6 py-4">Mô tả chi tiết</th>
                <th className="px-6 py-4 text-center">Trạng thái</th>
                <th className="px-6 py-4 text-right">Trình tự xử lý</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {requests.length > 0 ? (
                requests.map((request) => (
                  <tr key={request.id} className="transition-colors hover:bg-slate-50/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-slate-400">
                          <Wrench size={18} />
                        </div>
                        <div>
                          <h3 className="whitespace-nowrap text-sm font-bold text-gray-800">
                            {request.title || request.type || 'Sửa chữa'}
                          </h3>
                          <div className="mt-1 flex flex-col gap-0.5">
                            {request.propertyName && (
                              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                                {request.propertyName}
                              </span>
                            )}
                            <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                              <MapPin size={12} className="text-gray-400" /> {request.roomName || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="line-clamp-2 max-w-xs text-xs text-gray-600">{request.description}</p>
                      <span className="mt-1 block text-[10px] text-gray-400">
                        Yêu cầu: {new Date(request.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-bold ${getMaintenanceStatusStyle(request.status)}`}
                      >
                        {request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">{renderActions(request)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center italic text-gray-400">
                    Chưa có yêu cầu bảo trì nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-100 bg-slate-50/30 p-4 sm:flex-row">
          <div className="flex items-center gap-3">
            <span className="whitespace-nowrap text-xs font-medium text-slate-500">Hiển thị mỗi trang</span>
            <Select
              value={String(pageSize)}
              onValueChange={(val) => {
                setPageSize(Number(val));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-8 w-20 bg-white">
                <SelectValue placeholder="10" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <span className="ml-2 text-xs text-slate-400">Tổng {totalItems} yêu cầu</span>
          </div>

          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  className={`cursor-pointer ${currentPage === 1 ? 'pointer-events-none opacity-50' : ''}`}
                />
              </PaginationItem>

              <div className="mx-2 flex items-center gap-1">
                <span className="text-xs font-bold text-slate-700">Trang {currentPage}</span>
                <span className="text-xs text-slate-400">/ {totalPages}</span>
              </div>

              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  className={`cursor-pointer ${currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}`}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>

      <MaintenanceCancelDialog
        open={Boolean(cancelTarget)}
        onOpenChange={(open) => {
          if (!open) setCancelTarget(null);
        }}
        maintenanceId={cancelTarget?.id}
        maintenanceTitle={cancelTarget?.title || cancelTarget?.type}
        onCancelled={() => {
          setCancelTarget(null);
          void refetch();
        }}
      />
    </div>
  );
};

export default Maintenances;
