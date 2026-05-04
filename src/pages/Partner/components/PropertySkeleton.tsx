import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";

const PropertySkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
      {/* Building Header Skeleton */}
      <div className="bg-slate-50 border-b border-gray-200 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-24 rounded" />
            <Skeleton className="h-5 w-20 rounded" />
            <Skeleton className="h-7 w-48 rounded" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-64 rounded" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-28 rounded-md" />
          <Skeleton className="h-9 w-36 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
        </div>
      </div>

      {/* Rooms Grid Skeleton */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-gray-200 rounded-xl p-5 flex flex-col h-full space-y-4">
              <div className="flex justify-between items-start">
                <Skeleton className="h-6 w-32 rounded" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-4 w-24 rounded" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-4 w-48 rounded" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-4 w-40 rounded" />
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-2">
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

              <div className="pt-4 border-t border-gray-100 flex gap-2">
                <Skeleton className="h-8 flex-1 rounded" />
                <Skeleton className="h-8 w-8 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PropertySkeleton;
