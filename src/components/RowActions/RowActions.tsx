import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { RowActionsProps } from "@/dataHelper/booking.dataHelper";
import { Eye, KeyRound, MoreVertical, PencilLine, Trash } from "lucide-react";
import * as React from "react";
import { useTranslation } from "react-i18next";

interface ExtendedRowActionsProps extends RowActionsProps {
  onResetPassword?: (id: string | number) => void;
  isDisabledEdit?: boolean;
  isDisabledDelete?: boolean;
  viewLabel?: string;
  editLabel?: string;
  hideEdit?: boolean;
  customActions?: Array<{
    key: string;
    label: string;
    onClick: (id: string | number) => void;
    icon?: React.ReactNode;
  }>;
}

export const RowActions: React.FC<ExtendedRowActionsProps> = ({
  id,
  onView,
  onEdit,
  onDelete,
  onResetPassword,
  isDisabledEdit = false,
  isDisabledDelete = false,
  viewLabel,
  editLabel,
  hideEdit = false,
  customActions = [],
}) => {
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
            <span className="ml-2">{viewLabel || t("common.view_details")}</span>
          </DropdownMenuItem>
        )}

        {onEdit && !isDisabledEdit && !hideEdit && (
          <DropdownMenuItem
            onClick={() => {
              onEdit(id);
            }}
          >
            <PencilLine className="size-4" />
            <span className="ml-2">{editLabel || t("common.edit")}</span>
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

        {customActions.map((action) => (
          <DropdownMenuItem
            key={action.key}
            onClick={() => {
              action.onClick(id);
            }}
          >
            {action.icon}
            <span className="ml-2">{action.label}</span>
          </DropdownMenuItem>
        ))}

        {onDelete && !isDisabledDelete && (
          <>
            {(onView || onEdit || onResetPassword || customActions.length > 0) && <DropdownMenuSeparator />}
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
