import { cn } from "@/lib/utils";
import React from "react";

interface ButtonDetailProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  variant?: "default" | "outline";
}

const ButtonDetail = React.forwardRef<HTMLButtonElement, ButtonDetailProps>(
  ({ className, variant = "outline", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "px-3 py-1.5 text-xs font-bold rounded-md border transition-colors",
          variant === "outline"
            ? "border-blue-600 text-blue-600 hover:bg-blue-50"
            : "bg-blue-600 text-white hover:bg-blue-700 border-transparent",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

ButtonDetail.displayName = "ButtonDetail";

export default ButtonDetail;
