import { Button } from "@/components/ui/button";
import { UsersEmptyStateProps } from "@/dataHelper/user.dataHelper";
import { Filter } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

const UsersEmptyState: React.FC<UsersEmptyStateProps> = ({ onOpenFilter }) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
      <div className="text-lg font-semibold text-slate-800">{t("user.empty_title")}</div>
      <p className="mt-1 text-sm text-slate-500">{t("user.empty_description")}</p>
      <div className="mt-4 flex items-center gap-2">
        {onOpenFilter && (
          <Button variant="secondary" size="sm" onClick={onOpenFilter}>
            <Filter className="mr-2 size-4" />
            {t("user.empty_open_filter")}
          </Button>
        )}
      </div>
    </div>
  );
};

export default UsersEmptyState;
