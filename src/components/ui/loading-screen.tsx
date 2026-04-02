import React from "react";
import { Spinner } from "./spinner";
import { cn } from "@/lib/utils";

interface LoadingScreenProps {
    className?: string;
    text?: string;
    size?: "sm" | "md" | "lg" | "xl";
}

/**
 * Global Full-Screen Loading Overlay
 * Uses the standard Spinner and a backdrop for premium UX.
 */
export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
    className, 
    text, 
    size = "lg" 
}) => {
    return (
        <div 
          className={cn(
            "fixed inset-0 z-[9999] flex items-center justify-center bg-white/80 backdrop-blur-sm transition-all duration-300 dark:bg-slate-900/80",
            className
          )}
        >
            <Spinner size={size} showText text={text} />
        </div>
    );
};
