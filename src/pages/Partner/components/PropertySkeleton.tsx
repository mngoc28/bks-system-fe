import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";

const PropertySkeleton: React.FC = () => {
  return (
    <div className="mb-8 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      {/* Property Header Skeleton */}
      <div className="flex flex-col items-start justify-between gap-4 border-b border-gray-200 bg-slate-50 p-6 sm:flex-row sm:items-center">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-24 rounded" />
            <Skeleton className="h-5 w-20 rounded" />
            <Skeleton className="h-7 w-48 rounded" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="size-4 rounded-full" />
            <Skeleton className="h-4 w-64 rounded" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-28 rounded-md" />
          <Skeleton className="h-9 w-36 rounded-md" />
          <Skeleton className="size-9 rounded-md" />
          <Skeleton className="size-9 rounded-md" />
        </div>
      </div>

      {/* Rooms Grid Skeleton */}
      <div className="p-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex h-full flex-col space-y-4 rounded-xl border border-gray-200 p-5">
              <div className="flex items-start justify-between">
                <Skeleton className="h-6 w-32 rounded" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="size-4 rounded" />
                  <Skeleton className="h-4 w-24 rounded" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="size-4 rounded" />
                  <Skeleton className="h-4 w-48 rounded" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="size-4 rounded" />
                  <Skeleton className="h-4 w-40 rounded" />
                </div>
              </div>

              <div className="space-y-2 rounded-lg border border-slate-100 bg-slate-50 p-3">
                <Skeleton className="h-3 w-16 rounded" />
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-12 rounded" />
                  <Skeleton className="h-4 w-20 rounded" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-12 rounded" />
                  <Skeleton className="h-4 w-20 rounded" />
                </div>
              </div>

              <div className="flex gap-2 border-t border-gray-100 pt-4">
                <Skeleton className="h-8 flex-1 rounded" />
                <Skeleton className="size-8 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PropertySkeleton;

