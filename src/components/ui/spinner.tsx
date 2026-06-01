import React from "react";
import { cn } from "@/lib/utils";

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  spinnerClassName?: string;
  showText?: boolean;
  text?: string;
}

const sizeMap = {
  sm: "size-5 border-y-[2px]",
  md: "size-10 border-y-[3px]",
  lg: "size-14 border-y-4",
  xl: "size-20 border-y-[6px]",
};

/**
 * Standardized Loading Spinner Component
 * A premium, reusable CSS-based double spinner with two opposing segments.
 */
export const Spinner: React.FC<SpinnerProps> = ({ 
  size = "md", 
  className, 
  spinnerClassName,
  showText = false, 
  text, 
  ...props 
}) => {
  return (
    <div 
      className={cn("flex flex-col items-center justify-center gap-3", className)} 
      {...props}
    >
      <div 
        className={cn(
          "animate-spin rounded-full border-x-transparent border-t-primary border-b-sky-600 dark:border-b-sky-400", 
          sizeMap[size],
          spinnerClassName
        )} 
      />
      {showText && (
        <p className="animate-pulse text-sm font-medium text-slate-500">
          {text || "Đang tải dữ liệu..."}
        </p>
      )}
    </div>
  );
};

