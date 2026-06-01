import React from "react";
import { LayoutGrid, TableProperties } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export type ViewMode = "grid" | "table";

interface LayoutToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  className?: string;
}

/**
 * LayoutToggle Component
 * Provides a premium-styled toggle to switch between Grid and Table layouts.
 */
const LayoutToggle: React.FC<LayoutToggleProps> = ({ viewMode, onViewModeChange, className }) => {
  const { t } = useTranslation();

  return (
    <div className={cn("flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50/50 p-1 shadow-inner", className)}>
      <Button
        variant={viewMode === "grid" ? "default" : "ghost"}
        size="sm"
        title={t("common.view_grid") || "Xem dạng lưới"}
        className={cn(
          "h-8 w-8 p-0 transition-all duration-300 rounded-lg",
          viewMode === "grid" 
            ? "bg-white text-primary shadow-sm hover:bg-white" 
            : "text-slate-500 hover:bg-primary/10 hover:text-primary"
        )}
        onClick={() => onViewModeChange("grid")}
      >
        <LayoutGrid className="size-4" />
      </Button>

      <Button
        variant={viewMode === "table" ? "default" : "ghost"}
        size="sm"
        title={t("common.view_table") || "Xem dạng bảng"}
        className={cn(
          "h-8 w-8 p-0 transition-all duration-300 rounded-lg",
          viewMode === "table" 
            ? "bg-white text-primary shadow-sm hover:bg-white" 
            : "text-slate-500 hover:bg-primary/10 hover:text-primary"
        )}
        onClick={() => onViewModeChange("table")}
      >
        <TableProperties className="size-4" />
      </Button>
    </div>
  );
};

export default LayoutToggle;
