import React from "react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface SyllabusCardProps {
  id: string;
  title: string;
  isPinned: boolean;
  progress: number;
  className?: string;
  onTogglePin: (id: string, isPinned: boolean) => void;
}

const SyllabusCard = ({
  id,
  title,
  isPinned,
  progress,
  className,
  onTogglePin,
}: SyllabusCardProps) => {
  const navigate = useNavigate();

  const handleDetailsClick = () => {
    navigate(`/course/${id}`);
  };

  const handleTogglePin = (e: React.MouseEvent) => {
    e.stopPropagation();
    onTogglePin(id, !isPinned);
  };

  return (
    <div
      className={cn(
        "flex justify-between items-center w-full p-6 px-10 bg-slate-50 border border-slate-500 rounded-md",
        className
      )}
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1">
          {isPinned && (
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-blue-500"
            >
              <path
                d="M10.6667 8.66667V3.33333C10.6667 2.97971 10.5262 2.64057 10.2762 2.39052C10.0261 2.14048 9.68696 2 9.33333 2H6.66667C6.31304 2 5.97391 2.14048 5.72386 2.39052C5.47381 2.64057 5.33333 2.97971 5.33333 3.33333V8.66667L3.33333 10.6667V12H12.6667V10.6667L10.6667 8.66667Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
          <h3 className="text-xl font-bold text-slate-900">{title}</h3>
        </div>

        <div className="flex items-center gap-8">
          <button
            className={cn(
              "flex items-center text-base gap-1",
              isPinned ? "text-blue-500" : "text-slate-900 hover:text-blue-500"
            )}
            onClick={handleTogglePin}
            aria-label={isPinned ? "Gỡ ghim" : "Ghim lên đầu trang"}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onTogglePin(id, !isPinned);
              }
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10.6667 8.66667V3.33333C10.6667 2.97971 10.5262 2.64057 10.2762 2.39052C10.0261 2.14048 9.68696 2 9.33333 2H6.66667C6.31304 2 5.97391 2.14048 5.72386 2.39052C5.47381 2.64057 5.33333 2.97971 5.33333 3.33333V8.66667L3.33333 10.6667V12H12.6667V10.6667L10.6667 8.66667Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>{isPinned ? "Gỡ ghim" : "Ghim lên đầu trang"}</span>
          </button>

          <div className="flex flex-col gap-1.5">
            <div className="w-32 h-2 bg-slate-200 rounded-full">
              <div
                className="h-full bg-blue-500 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <button
        className="px-6 py-3 text-base font-bold text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors"
        onClick={handleDetailsClick}
        aria-label="Xem chi tiết"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleDetailsClick();
          }
        }}
      >
        Chi tiết
      </button>
    </div>
  );
};

export default SyllabusCard;
