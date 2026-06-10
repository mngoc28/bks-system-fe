import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { MoreHorizontal } from "lucide-react";
import { useTranslation } from "react-i18next";

const MAX_INLINE_ACTIONS = 4;

export type AdminCardCrossNavAction = {
  key: string;
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
};

type AdminCardCrossNavMenuProps = {
  actions: AdminCardCrossNavAction[];
  className?: string;
};

const AdminCardCrossNavMenu: React.FC<AdminCardCrossNavMenuProps> = ({ actions, className }) => {
  const { t } = useTranslation();

  if (actions.length === 0) {
    return null;
  }

  const useInlineToolbar = actions.length <= MAX_INLINE_ACTIONS;

  return (
    <div
      className={cn(
        "mt-4 flex border-t border-slate-100 pt-3 dark:border-slate-800",
        useInlineToolbar ? "justify-center" : "justify-end",
        className,
      )}
    >
      {useInlineToolbar ? (
        <TooltipProvider delayDuration={300}>
          <div className="flex flex-wrap items-center gap-1">
            {actions.map((action) => (
              <Tooltip key={action.key}>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8 rounded-lg text-slate-500 hover:bg-primary/10 hover:text-primary"
                    aria-label={action.label}
                    onClick={(e) => {
                      e.stopPropagation();
                      action.onClick();
                    }}
                  >
                    {action.icon}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">{action.label}</TooltipContent>
              </Tooltip>
            ))}
          </div>
        </TooltipProvider>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 text-xs font-semibold text-slate-600 hover:text-primary"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="size-4" />
              {t("adminCrossNav.related_actions")}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={6} onClick={(e) => e.stopPropagation()}>
            {actions.map((action) => (
              <DropdownMenuItem
                key={action.key}
                onClick={(e) => {
                  e.stopPropagation();
                  action.onClick();
                }}
              >
                {action.icon}
                <span className={action.icon ? "ml-2" : undefined}>{action.label}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};

export default AdminCardCrossNavMenu;
