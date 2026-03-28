import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { RowActionsProps } from "@/dataHelper/booking.dataHelper";
import { Eye, KeyRound, MoreVertical, PencilLine, Trash } from "lucide-react";
import * as React from "react";
import { useTranslation } from "react-i18next";

interface ExtendedRowActionsProps extends RowActionsProps {
  onResetPassword?: (id: string | number) => void;
  isDisabledEdit?: boolean;
  isDisabledDelete?: boolean;
}

export const RowActions: React.FC<ExtendedRowActionsProps> = ({ id, onView, onEdit, onDelete, onResetPassword, isDisabledEdit = false, isDisabledDelete = false }) => {
  const { t } = useTranslation();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button aria-label={t("common.actions")} className="rounded-full p-2 transition-colors hover:bg-slate-100" type="button">
          <MoreVertical className="size-4 text-slate-600" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={6}>
        {onView && (
          <DropdownMenuItem
            onClick={() => {
              onView(id);
            }}
          >
            <Eye className="size-4" />
            <span className="ml-2">{t("common.view_details")}</span>
          </DropdownMenuItem>
        )}

        {onEdit && !isDisabledEdit && (
          <DropdownMenuItem
            onClick={() => {
              onEdit(id);
            }}
          >
            <PencilLine className="size-4" />
            <span className="ml-2">{t("common.edit")}</span>
          </DropdownMenuItem>
        )}

        {onResetPassword && (
          <DropdownMenuItem
            onClick={() => {
              onResetPassword(id);
            }}
          >
            <KeyRound className="size-4" />
            <span className="ml-2">{t("user.actions_reset_password")}</span>
          </DropdownMenuItem>
        )}

        {onDelete && !isDisabledDelete && (
          <>
            {(onView || onEdit || onResetPassword) && <DropdownMenuSeparator />}
            <DropdownMenuItem
              onClick={() => {
                onDelete(id);
              }}
            >
              <Trash className="size-4 text-red-600" />
              <span className="ml-2 text-red-600">{t("common.delete")}</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default RowActions;
