import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showText?: boolean;
  text?: string;
}

const sizeMap = {
  sm: "size-4",
  md: "size-8",
  lg: "size-12",
  xl: "size-16",
};

/**
 * Standardized Loading Spinner Component
 * A premium, reusable spinner with optional text.
 */
export const Spinner: React.FC<SpinnerProps> = ({ 
  size = "md", 
  className, 
  showText = false, 
  text, 
  ...props 
}) => {
  return (
    <div 
      className={cn("flex flex-col items-center justify-center gap-3", className)} 
      {...props}
    >
      <Loader2 
        className={cn(
          "animate-spin text-indigo-600 dark:text-indigo-400", 
          sizeMap[size]
        )} 
      />
      {showText && (
        <p className="text-sm font-medium text-slate-500 animate-pulse">
          {text || "Đang tải dữ liệu..."}
        </p>
      )}
    </div>
  );
};
