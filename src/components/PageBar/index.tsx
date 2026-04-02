import React from "react";
import { cn } from "@/lib/utils";

type PageBarProps = {
  /** Subtitle label shown on the left (e.g. table section name) */
  subtitle?: string;
  /** Action buttons on the right */
  actions?: React.ReactNode;
  className?: string;
};

/**
 * A consistent action bar used at the top of each management section.
 * Displays an optional section subtitle on the left and action buttons on the right.
 */
const PageBar: React.FC<PageBarProps> = ({ subtitle, actions, className }) => {
  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm",
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
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
};

export default PageBar;
