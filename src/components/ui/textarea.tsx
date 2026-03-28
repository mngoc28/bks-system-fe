import * as React from "react";
import { cn } from "@/lib/utils";

type PlainTextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  disableResize?: boolean;
};

const PlainTextarea = React.forwardRef<HTMLTextAreaElement, PlainTextareaProps>(
  ({ className, disableResize = false, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[120px] w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-base text-slate-700",
        "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
        "disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        disableResize ? "resize-none" : "resize-y",
        className,
      )}
      {...props}
    />
  ),
);

PlainTextarea.displayName = "PlainTextarea";

export { PlainTextarea };
