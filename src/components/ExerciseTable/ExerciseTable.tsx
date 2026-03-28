import React from "react";
import { cn } from "@/lib/utils";
import StatusBadge, { StatusType } from "@/components/ui/StatusBadge";
import ButtonDetail from "@/components/ui/ButtonDetail";

export type Exercise = {
  id: string;
  title: string;
  dueDate: string;
  status: StatusType;
};

interface ExerciseTableProps {
  exercises: Exercise[];
  className?: string;
  onViewDetail: (id: string) => void;
}

const ExerciseTable: React.FC<ExerciseTableProps> = ({
  exercises,
  className,
  onViewDetail,
}) => {
  return (
    <div
      className={cn(
        "w-full border border-blue-100 rounded-md overflow-hidden",
        className
      )}
    >
      <table className="w-full border-collapse">
        <thead className="bg-slate-50">
          <tr>
            <th className="text-xs font-normal text-slate-500 text-left px-3 py-3 w-[500px]">
              <div className="flex items-center">
                <span>Bài tập/Bài kiểm tra</span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="ml-1 text-slate-500"
                >
                  <path
                    d="M8 3.33337V12.6667"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M3.33334 8H12.6667"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </th>
            <th className="text-xs font-normal text-slate-500 text-center px-3 py-3 w-[250px]">
              <div className="flex items-center justify-center">
                <span>Hạn nộp bài</span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="ml-1 text-slate-500"
                >
                  <path
                    d="M8 3.33337V12.6667"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M3.33334 8H12.6667"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </th>
            <th className="text-xs font-normal text-slate-500 text-center px-3 py-3">
              Trạng thái
            </th>
            <th className="text-xs font-normal text-slate-500 text-center px-3 py-3">
              Tùy chỉnh
            </th>
          </tr>
        </thead>
        <tbody>
          {exercises.map((exercise) => (
            <tr
              key={exercise.id}
              className="border-b border-blue-100 hover:bg-slate-50 transition-colors"
            >
              <td className="px-3 py-3">
                <div className="flex items-center gap-1.5">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-gray-700"
                  >
                    <path
                      d="M16.6668 7.5H3.3335"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M14.1668 3.33325H5.8335C4.91301 3.33325 4.1665 4.07977 4.1665 4.99992V14.9999C4.1665 15.9201 4.91301 16.6666 5.8335 16.6666H14.1668C15.087 16.6666 15.8335 15.9201 15.8335 14.9999V4.99992C15.8335 4.07977 15.087 3.33325 14.1668 3.33325Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M10 12.5H10.0083"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="text-sm font-normal text-slate-700 truncate max-w-[400px]">
                    {exercise.title}
                  </span>
                </div>
              </td>
              <td className="px-3 py-3 text-center">
                <span className="text-sm font-normal text-slate-700">
                  {exercise.dueDate}
                </span>
              </td>
              <td className="px-3 py-3">
                <div className="flex justify-center">
                  <StatusBadge status={exercise.status} />
                </div>
              </td>
              <td className="px-3 py-3">
                <div className="flex justify-center">
                  <ButtonDetail
                    onClick={() => onViewDetail(exercise.id)}
                    aria-label={`Xem chi tiết bài tập ${exercise.title}`}
                  >
                    Thông tin
                  </ButtonDetail>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={4} className="px-3 py-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <button
                    className="p-2 rounded-md hover:bg-slate-100 transition-colors"
                    aria-label="Trang trước"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-slate-700"
                    >
                      <path
                        d="M12.5 15L7.5 10L12.5 5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <div className="flex">
                    <button className="w-10 h-10 flex items-center justify-center text-sm font-bold text-slate-700 bg-slate-100 rounded-md">
                      1
                    </button>
                    <button className="w-10 h-10 flex items-center justify-center text-sm font-normal text-slate-500 hover:bg-slate-50 rounded-md">
                      2
                    </button>
                    <button className="w-10 h-10 flex items-center justify-center text-sm font-normal text-slate-500 hover:bg-slate-50 rounded-md">
                      ...
                    </button>
                    <button className="w-10 h-10 flex items-center justify-center text-sm font-normal text-slate-500 hover:bg-slate-50 rounded-md">
                      7
                    </button>
                    <button className="w-10 h-10 flex items-center justify-center text-sm font-normal text-slate-500 hover:bg-slate-50 rounded-md">
                      8
                    </button>
                  </div>
                  <button
                    className="p-2 rounded-md hover:bg-slate-100 transition-colors"
                    aria-label="Trang sau"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-slate-700"
                    >
                      <path
                        d="M7.5 5L12.5 10L7.5 15"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-2 px-3 py-1.5 border border-transparent bg-slate-100 rounded-md">
                    <span className="text-sm font-normal text-slate-700">
                      10
                    </span>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-slate-700"
                    >
                      <path
                        d="M4 6L8 10L12 6"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <span className="text-sm font-normal text-slate-700">
                    {exercises.length} kết quả
                  </span>
                </div>
              </div>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default ExerciseTable;
