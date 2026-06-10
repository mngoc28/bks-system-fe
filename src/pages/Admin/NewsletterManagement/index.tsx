import React, { useEffect, useState } from "react";
import Pagination from "@/components/Pagination";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import PageBar from "@/components/PageBar";
import axiosClient from "@/api/axiosClient";
import { toastError, toastSuccess } from "@/components/ui/toast";
import { Search, Trash2, FileDown, RefreshCw, Mail, CheckCircle2, XCircle } from "lucide-react";

interface NewsletterSubscription {
  id: number;
  email: string;
  status: "subscribed" | "unsubscribed";
  coupon_id: number | null;
  coupon?: {
    id: number;
    code: string;
    value: number;
    type: "percent" | "fixed";
  };
  created_at: string;
  updated_at: string;
}

const NewsletterManagement: React.FC = () => {
  const [items, setItems] = useState<NewsletterSubscription[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  // Filters and pagination states
  const [searchEmail, setSearchEmail] = useState("");
  const [debouncedEmail, setDebouncedEmail] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "subscribed" | "unsubscribed">("all");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Actions loading states (keyed by subscription ID)
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Debounce email search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedEmail(searchEmail);
      setPage(1); // Reset to first page when search changes
    }, 500);

    return () => clearTimeout(handler);
  }, [searchEmail]);

  // Fetch subscriptions
  const fetchSubscriptions = async () => {
    setIsLoading(true);
    try {
      const response = await axiosClient.get("/admin/newsletter-subscriptions", {
        params: {
          email: debouncedEmail || undefined,
          status: statusFilter === "all" ? undefined : statusFilter,
          page,
          per_page: perPage,
        },
      });

      const payload = response?.data;
      setItems(payload?.items || []);
      setTotalItems(payload?.meta?.total ?? 0);
      setTotalPages(payload?.meta?.last_page ?? 1);
    } catch (err: any) {
      toastError(err?.response?.data?.message || "Không thể tải danh sách đăng ký Coupon.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [debouncedEmail, statusFilter, page, perPage]);

  // Toggle status (subscribed <-> unsubscribed)
  const handleToggleStatus = async (id: number, currentStatus: "subscribed" | "unsubscribed") => {
    setUpdatingId(id);
    const nextStatus = currentStatus === "subscribed" ? "unsubscribed" : "subscribed";
    try {
      await axiosClient.put(`/admin/newsletter-subscriptions/${id}/status`, {
        status: nextStatus,
      });
      toastSuccess("Cập nhật trạng thái đăng ký Coupon thành công!");
      fetchSubscriptions();
    } catch (err: any) {
      toastError(err?.response?.data?.message || "Không thể cập nhật trạng thái.");
    } finally {
      setUpdatingId(null);
    }
  };

  // Delete subscription
  const handleDelete = async (id: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa email đăng ký này khỏi hệ thống?")) {
      return;
    }
    setDeletingId(id);
    try {
      await axiosClient.delete(`/admin/newsletter-subscriptions/${id}`);
      toastSuccess("Xóa email đăng ký thành công!");
      fetchSubscriptions();
    } catch (err: any) {
      toastError(err?.response?.data?.message || "Không thể xóa email đăng ký.");
    } finally {
      setDeletingId(null);
    }
  };

  // Export CSV
  const handleExportCSV = async () => {
    try {
      setIsExporting(true);
      // Fetch up to 1000 items at once matching filters for report export
      const response = await axiosClient.get("/admin/newsletter-subscriptions", {
        params: {
          email: debouncedEmail || undefined,
          status: statusFilter === "all" ? undefined : statusFilter,
          per_page: 1000,
        },
      });

      const exportItems = response?.data?.items || [];
      if (exportItems.length === 0) {
        toastError("Không có dữ liệu để xuất file CSV.");
        return;
      }

      const headers = ["ID", "Email", "Trạng thái", "Mã Coupon", "Giá trị ưu đãi", "Ngày đăng ký"];
      const rows = exportItems.map((item: NewsletterSubscription) => [
        item.id,
        item.email,
        item.status === "subscribed" ? "Đang nhận Coupon" : "Đã hủy đăng ký",
        item.coupon?.code || "N/A",
        item.coupon ? `${item.coupon.value}${item.coupon.type === "percent" ? "%" : "đ"}` : "N/A",
        item.created_at ? new Date(item.created_at).toLocaleString("vi-VN") : "",
      ]);

      const csvContent =
        "\uFEFF" + // UTF-8 BOM for Vietnamese font display in Excel
        [headers.join(","), ...rows.map((r: (string | number)[]) => r.map((val: string | number) => `"${val}"`).join(","))].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `BKS_Coupon_Leads_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toastSuccess("Xuất báo cáo CSV thành công!");
    } catch (_err) {
      toastError("Lỗi khi xuất file báo cáo CSV.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex w-full flex-col gap-6 p-[12px_24px]">
      <PageBar
        subtitle="Quản lý và xuất dữ liệu danh sách khách hàng đăng ký email để nhận mã giảm giá chào mừng."
        showLayoutToggle={false}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              disabled={isExporting || isLoading || items.length === 0}
              className="flex items-center gap-2 border-slate-200 bg-white font-semibold text-slate-600 hover:bg-slate-50 hover:text-primary transition-all shadow-sm"
            >
              <FileDown className="size-4" />
              {isExporting ? "Đang xuất..." : "Xuất báo cáo CSV"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchSubscriptions}
              disabled={isLoading}
              className="flex items-center gap-2 border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-all p-2 rounded-lg"
            >
              <RefreshCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        }
      />

      {/* Filter and Search Section */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative w-full sm:flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input
              type="text"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              placeholder="Tìm kiếm theo email..."
              className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-4 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary/20"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-slate-500 whitespace-nowrap font-medium">Trạng thái:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as any);
                setPage(1);
              }}
              className="h-10 w-full sm:w-[180px] rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-primary"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="subscribed">Đang nhận Coupon</option>
              <option value="unsubscribed">Đã hủy đăng ký</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table Content */}
      {isLoading && items.length === 0 ? (
        <div className="flex min-h-[350px] items-center justify-center rounded-2xl border border-slate-100 bg-white/50">
          <Spinner size="lg" showText text="Đang tải dữ liệu..." />
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[350px] rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="rounded-full bg-slate-50 p-4 text-slate-400">
            <Mail className="size-8" />
          </div>
          <h3 className="mt-4 text-sm font-semibold text-slate-900">Không tìm thấy email nào</h3>
          <p className="mt-1 text-xs text-slate-500 max-w-xs">
            Hệ thống chưa ghi nhận lượt đăng ký nhận Coupon nào khớp với bộ lọc tìm kiếm của bạn.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="py-4 px-6">ID</th>
                    <th className="py-4 px-6">Khách hàng Email</th>
                    <th className="py-4 px-6">Trạng thái</th>
                    <th className="py-4 px-6">Mã giảm giá đã phát</th>
                    <th className="py-4 px-6">Mức giảm</th>
                    <th className="py-4 px-6">Ngày đăng ký</th>
                    <th className="py-4 px-6 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-4 px-6 font-medium text-slate-900">#{item.id}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Mail className="size-4 text-slate-400" />
                          <span className="font-medium text-slate-800">{item.email}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {item.status === "subscribed" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Đang nhận Coupon
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 border border-slate-200">
                            Đã hủy đăng ký
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        {item.coupon ? (
                          <code className="rounded bg-slate-100 border border-slate-200 px-2 py-0.5 text-xs font-bold text-slate-700 tracking-wider">
                            {item.coupon.code}
                          </code>
                        ) : (
                          <span className="text-slate-400 text-xs italic">Không có/Mặc định</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        {item.coupon ? (
                          <span className="font-semibold text-amber-600">
                            -{item.coupon.value}{item.coupon.type === "percent" ? "%" : "đ"}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-slate-500 text-xs">
                        {new Date(item.created_at).toLocaleString("vi-VN")}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            title={item.status === "subscribed" ? "Hủy đăng ký Coupon" : "Kích hoạt lại đăng ký Coupon"}
                            disabled={updatingId === item.id || deletingId === item.id}
                            onClick={() => handleToggleStatus(item.id, item.status)}
                            className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-all hover:text-slate-800"
                          >
                            {updatingId === item.id ? (
                              <Spinner size="sm" />
                            ) : item.status === "subscribed" ? (
                              <XCircle className="size-4 text-amber-500" />
                            ) : (
                              <CheckCircle2 className="size-4 text-emerald-500" />
                            )}
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            title="Xóa thông tin khách đăng ký"
                            disabled={updatingId === item.id || deletingId === item.id}
                            onClick={() => handleDelete(item.id)}
                            className="p-2 hover:bg-rose-50 rounded-lg text-slate-500 transition-all hover:text-rose-600"
                          >
                            {deletingId === item.id ? (
                              <Spinner size="sm" />
                            ) : (
                              <Trash2 className="size-4" />
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="border-t border-slate-100 p-4">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={(p) => setPage(p)}
                perPage={perPage}
                onPerPageChange={(pp) => {
                  setPerPage(pp);
                  setPage(1);
                }}
                totalItems={totalItems}
                perPageOptions={[10, 20, 50]}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsletterManagement;
