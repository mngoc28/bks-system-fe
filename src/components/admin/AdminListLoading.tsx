import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type AdminListLoadingProps = {
  mode?: "grid" | "table";
  className?: string;
};

const GRID_SKELETON_COUNT = 8;
const TABLE_ROW_COUNT = 8;

const AdminListLoading: React.FC<AdminListLoadingProps> = ({ mode = "grid", className }) => {
  if (mode === "table") {
    return (
      <div className={cn("overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm", className)}>
        <div className="border-b border-slate-100 bg-slate-50/80 px-4 py-3">
          <div className="flex gap-4">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
        {Array.from({ length: TABLE_ROW_COUNT }).map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-4 border-b border-slate-50 px-4 py-3 last:border-0"
          >
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5",
        className,
      )}
    >
      {Array.from({ length: GRID_SKELETON_COUNT }).map((_, index) => (
        <div key={index} className="overflow-hidden rounded-2xl border border-slate-100 bg-white">
          <Skeleton className="aspect-[16/9] w-full rounded-none" />
          <div className="space-y-2.5 p-4">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-full" />
            <div className="flex justify-center gap-2 border-t border-slate-100 pt-3">
              <Skeleton className="size-8 rounded-lg" />
              <Skeleton className="size-8 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminListLoading;
