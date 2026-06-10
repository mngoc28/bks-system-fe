import React from "react";
import { useTranslation } from "react-i18next";
import { Check, Unlock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { usePendingPartnersQuery, useVerifyPartnerMutation } from "@/hooks/usePartnerApprovalQuery";
import {
  useBlockedUsersQuery,
  usePendingUsersQuery,
  useUpdateUserStatusMutation,
} from "@/hooks/useUserQuery";
import AdminQuickActionConfirmDialog, {
  type QuickActionConfirmState,
} from "./AdminQuickActionConfirmDialog";

interface AdminQuickActionPanelProps {
  onViewAllPartners: () => void;
  onViewAllPendingUsers: () => void;
  onViewAllBlockedUsers: () => void;
}

const AdminQuickActionPanel: React.FC<AdminQuickActionPanelProps> = ({
  onViewAllPartners,
  onViewAllPendingUsers,
  onViewAllBlockedUsers,
}) => {
  const { t } = useTranslation();
  const { data: pendingPartners = [], isLoading: isPartnersLoading } = usePendingPartnersQuery();
  const { data: pendingUsers = [], isLoading: isUsersLoading } = usePendingUsersQuery();
  const { data: blockedUsers = [], isLoading: isBlockedLoading } = useBlockedUsersQuery();
  const verifyPartner = useVerifyPartnerMutation();
  const updateUserStatus = useUpdateUserStatusMutation();

  const [rejectTargetId, setRejectTargetId] = React.useState<number | null>(null);
  const [rejectReason, setRejectReason] = React.useState("");
  const [confirmAction, setConfirmAction] = React.useState<QuickActionConfirmState | null>(null);

  const handleRejectPartner = async (id: number) => {
    if (!rejectReason.trim()) return;
    await verifyPartner.mutateAsync({ id, action: "reject", rejection_reason: rejectReason.trim() });
    setRejectTargetId(null);
    setRejectReason("");
  };

  const handleConfirmAction = async () => {
    if (!confirmAction) return;

    if (confirmAction.type === "approve_partner") {
      await verifyPartner.mutateAsync({ id: confirmAction.id, action: "approve" });
    } else {
      await updateUserStatus.mutateAsync({ id: confirmAction.id, status: 1 });
    }

    setConfirmAction(null);
  };

  const isBusy = verifyPartner.isPending || updateUserStatus.isPending;

  return (
    <>
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-1 text-sm font-bold uppercase tracking-wide text-slate-600">
          {t("dashboard.quick_actions_title", { defaultValue: "Xử lý nhanh" })}
        </h2>
        <p className="mb-4 text-xs text-slate-500">
          {t("dashboard.quick_actions_hint", {
            defaultValue: "Duyệt đối tác và quản lý tài khoản user — mọi thao tác đều cần xác nhận.",
          })}
        </p>

        <div className="space-y-5">
          <section>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-700">
                {t("dashboard.partner_pending", { defaultValue: "Đối tác chờ duyệt" })}
              </h3>
              <button type="button" onClick={onViewAllPartners} className="text-xs font-semibold text-slate-600 hover:text-slate-900">
                {t("common.view_more", { defaultValue: "Xem thêm" })}
              </button>
            </div>
            {isPartnersLoading ? (
              <div className="flex h-24 items-center justify-center">
                <Spinner size="sm" />
              </div>
            ) : pendingPartners.length === 0 ? (
              <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-4 text-center text-xs text-slate-500">
                {t("dashboard.no_pending_partners", { defaultValue: "Không có hồ sơ đối tác chờ duyệt" })}
              </p>
            ) : (
              <div className="space-y-2">
                {pendingPartners.map((partner) => (
                  <div key={partner.id} className="rounded-xl border border-amber-100 bg-amber-50/50 px-3 py-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">{partner.name}</p>
                        <p className="truncate text-xs text-slate-500">
                          {partner.partner_info?.company_name || partner.email}
                        </p>
                      </div>
                      {rejectTargetId !== partner.id && (
                        <div className="flex shrink-0 gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 border-emerald-200 bg-white px-2 text-emerald-700 hover:bg-emerald-50"
                            disabled={isBusy}
                            onClick={() =>
                              setConfirmAction({
                                type: "approve_partner",
                                id: partner.id,
                                name: partner.name,
                                email: partner.email,
                              })
                            }
                          >
                            <Check className="size-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 border-rose-200 bg-white px-2 text-rose-700 hover:bg-rose-50"
                            disabled={isBusy}
                            onClick={() => {
                              setRejectTargetId(partner.id);
                              setRejectReason("");
                            }}
                          >
                            <X className="size-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>
                    {rejectTargetId === partner.id && (
                      <div className="mt-2 space-y-2">
                        <Input
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder={t("dashboard.reject_reason_placeholder", { defaultValue: "Lý do từ chối..." })}
                          className="h-8 text-xs"
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="destructive"
                            className="h-7"
                            disabled={isBusy || !rejectReason.trim()}
                            onClick={() => handleRejectPartner(partner.id)}
                          >
                            {t("common.confirm", { defaultValue: "Xác nhận" })}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7"
                            onClick={() => {
                              setRejectTargetId(null);
                              setRejectReason("");
                            }}
                          >
                            {t("common.cancel", { defaultValue: "Hủy" })}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-sky-700">
                {t("dashboard.user_pending", { defaultValue: "User đang chờ" })}
              </h3>
              <button type="button" onClick={onViewAllPendingUsers} className="text-xs font-semibold text-slate-600 hover:text-slate-900">
                {t("common.view_more", { defaultValue: "Xem thêm" })}
              </button>
            </div>
            {isUsersLoading ? (
              <div className="flex h-24 items-center justify-center">
                <Spinner size="sm" />
              </div>
            ) : pendingUsers.length === 0 ? (
              <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-4 text-center text-xs text-slate-500">
                {t("dashboard.no_pending_users", { defaultValue: "Không có user chờ kích hoạt" })}
              </p>
            ) : (
              <div className="space-y-2">
                {pendingUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between gap-2 rounded-xl border border-sky-100 bg-sky-50/50 px-3 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">{user.name}</p>
                      <p className="truncate text-xs text-slate-500">{user.email}</p>
                    </div>
                    <Button
                      size="sm"
                      className="h-7 shrink-0 bg-sky-600 px-2 text-xs hover:bg-sky-700"
                      disabled={isBusy}
                      onClick={() =>
                        setConfirmAction({
                          type: "activate_user",
                          id: user.id,
                          name: user.name,
                          email: user.email,
                        })
                      }
                    >
                      <Check className="mr-1 size-3.5" />
                      {t("dashboard.activate_user", { defaultValue: "Kích hoạt" })}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {blockedUsers.length > 0 && (
            <section>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-rose-700">
                  {t("dashboard.user_block", { defaultValue: "User bị khóa" })}
                </h3>
                <button
                  type="button"
                  onClick={onViewAllBlockedUsers}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  {t("common.view_more", { defaultValue: "Xem thêm" })}
                </button>
              </div>
              {isBlockedLoading ? (
                <Spinner size="sm" />
              ) : (
                <div className="space-y-2">
                  {blockedUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between gap-2 rounded-xl border border-rose-100 bg-rose-50/40 px-3 py-2.5"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">{user.name}</p>
                        <p className="truncate text-xs text-slate-500">{user.email}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 shrink-0 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                        disabled={isBusy}
                        onClick={() =>
                          setConfirmAction({
                            type: "unblock_user",
                            id: user.id,
                            name: user.name,
                            email: user.email,
                          })
                        }
                      >
                        <Unlock className="mr-1 size-3.5" />
                        {t("dashboard.unblock_user", { defaultValue: "Mở khóa" })}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      </div>

      <AdminQuickActionConfirmDialog
        action={confirmAction}
        isLoading={isBusy}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleConfirmAction}
      />
    </>
  );
};

export default AdminQuickActionPanel;
