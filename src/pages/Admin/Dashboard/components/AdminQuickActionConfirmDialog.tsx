import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

export type QuickActionConfirmType = "approve_partner" | "activate_user" | "unblock_user";

export interface QuickActionConfirmState {
  type: QuickActionConfirmType;
  id: number;
  name: string;
  email?: string;
}

interface AdminQuickActionConfirmDialogProps {
  action: QuickActionConfirmState | null;
  isLoading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const AdminQuickActionConfirmDialog: React.FC<AdminQuickActionConfirmDialogProps> = ({
  action,
  isLoading = false,
  onClose,
  onConfirm,
}) => {
  const { t } = useTranslation();

  const titleMap: Record<QuickActionConfirmType, string> = {
    approve_partner: t("dashboard.confirm_approve_partner_title", { defaultValue: "Phê duyệt đối tác?" }),
    activate_user: t("dashboard.confirm_activate_user_title", { defaultValue: "Kích hoạt tài khoản?" }),
    unblock_user: t("dashboard.confirm_unblock_user_title", { defaultValue: "Mở khóa tài khoản?" }),
  };

  const descMap: Record<QuickActionConfirmType, string> = {
    approve_partner: t("dashboard.confirm_approve_partner_desc", {
      defaultValue: "Đối tác sẽ được kích hoạt và có thể đăng nhập Partner Portal.",
    }),
    activate_user: t("dashboard.confirm_activate_user_desc", {
      defaultValue: "User sẽ chuyển từ Đang chờ sang Hoạt động.",
    }),
    unblock_user: t("dashboard.confirm_unblock_user_desc", {
      defaultValue: "User sẽ được mở khóa và có thể đăng nhập lại.",
    }),
  };

  return (
    <Dialog open={!!action} onOpenChange={(open) => !open && !isLoading && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{action ? titleMap[action.type] : ""}</DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-3 pt-1">
              <p className="text-sm text-slate-600">{action ? descMap[action.type] : ""}</p>
              {action && (
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                  <p className="font-semibold text-slate-900">{action.name}</p>
                  {action.email && <p className="text-slate-500">{action.email}</p>}
                </div>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" disabled={isLoading} onClick={onClose}>
            {t("common.cancel", { defaultValue: "Hủy" })}
          </Button>
          <Button disabled={isLoading} onClick={onConfirm}>
            {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
            {t("common.confirm", { defaultValue: "Xác nhận" })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdminQuickActionConfirmDialog;
