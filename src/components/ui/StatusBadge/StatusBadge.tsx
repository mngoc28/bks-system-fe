import { cn } from "@/lib/utils";
import React, { ReactNode } from "react";

export type StatusType = "completed" | "pending" | "expired";

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
  children?: ReactNode;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className, children }) => {
  return (
    <div
      className={cn(
        "inline-flex w-[90px] items-center justify-center rounded-md px-2 py-1",
        {
          "bg-blue-50": status === "completed",
          "bg-amber-50": status === "pending",
          "bg-gray-50": status === "expired",
        },
        className,
      )}
    >
      <span
        className={cn("text-xs font-normal", {
          "text-blue-600": status === "completed",
          "text-amber-500": status === "pending",
          "text-gray-500": status === "expired",
        })}
      >
        {status === "completed" && "Hoàn thành"}
        {status === "pending" && "Chưa làm"}
        {status === "expired" && "Hết hạn"}
      </span>
      {children}
    </div>
  );
};

export default StatusBadge;
