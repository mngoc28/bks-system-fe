import { cn } from "@/lib/utils";
import LayoutToggle, { ViewMode } from "../LayoutToggle";

type PageBarProps = {
  /** Subtitle label shown on the left (e.g. table section name) */
  subtitle?: string;
  /** Action buttons on the right */
  actions?: React.ReactNode;
  /** Current view mode (grid or table) */
  viewMode?: ViewMode;
  /** Callback when view mode changes */
  onViewModeChange?: (mode: ViewMode) => void;
  /** Whether to show the layout toggle */
  showLayoutToggle?: boolean;
  className?: string;
};

/**
 * A consistent action bar used at the top of each management section.
 * Displays an optional section subtitle on the left and action buttons on the right.
 * Now supports an optional LayoutToggle for switching between Grid and Table views.
 */
const PageBar: React.FC<PageBarProps> = ({ 
  subtitle, 
  actions, 
  viewMode, 
  onViewModeChange, 
  showLayoutToggle = false,
  className 
}) => {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm gap-4",
        className,
      )}
    >
      <div className="flex flex-col gap-0.5">
        {subtitle && (
          <p className="text-sm font-medium text-slate-500">
            {subtitle}
          </p>
        )}
      </div>
      
      <div className="flex flex-wrap items-center gap-3">
        {showLayoutToggle && viewMode && onViewModeChange && (
          <LayoutToggle 
            viewMode={viewMode} 
            onViewModeChange={onViewModeChange} 
          />
        )}
        {showLayoutToggle && (viewMode && onViewModeChange) && (
          <div className="mx-1 hidden h-6 w-px bg-slate-200 sm:block"></div>
        )}
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
};

export default PageBar;
