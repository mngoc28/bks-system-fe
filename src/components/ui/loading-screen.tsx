import React from "react";
import { Spinner } from "./spinner";
import { cn } from "@/lib/utils";

interface LoadingScreenProps {
    className?: string;
    text?: string;
    size?: "sm" | "md" | "lg" | "xl";
    /** fullscreen = toàn viewport (login, suspense). content = chỉ vùng cha (admin trong layout). */
    scope?: "fullscreen" | "content";
}

/**
 * Loading overlay. Mặc định fullscreen cho auth/suspense.
 * Dùng scope="content" trong admin layout để không che sidebar.
 */
export const LoadingScreen: React.FC<LoadingScreenProps> = ({
    className,
    text,
    size = "lg",
    scope = "fullscreen",
}) => {
    const isContent = scope === "content";

    return (
        <div
          className={cn(
            "flex items-center justify-center transition-all duration-300",
            isContent
              ? "min-h-[400px] w-full rounded-2xl border border-primary/10 bg-white/60"
              : "fixed inset-0 z-[9999] bg-white/80 backdrop-blur-sm dark:bg-slate-900/80",
            className,
          )}
          role="status"
          aria-live="polite"
        >
            <Spinner size={size} showText text={text} />
        </div>
    );
};
