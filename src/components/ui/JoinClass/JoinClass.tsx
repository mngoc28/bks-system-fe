import { cn } from "@/lib/utils";
import { useState } from "react";

interface JoinClassProps {
  onJoin: (classCode: string) => void;
  className?: string;
}

const JoinClass = ({ onJoin, className }: JoinClassProps) => {
  const [isInputVisible, setIsInputVisible] = useState(false);
  const [classCode, setClassCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleButtonClick = () => {
    if (!isInputVisible) {
      setIsInputVisible(true);
    }
  };

  const handleCancel = () => {
    setIsInputVisible(false);
    setClassCode("");
  };

  const handleSubmit = async () => {
    if (!classCode.trim()) return;

    try {
      setIsLoading(true);
      await onJoin(classCode);
      setClassCode("");
      setIsInputVisible(false);
    } catch (error) {
      console.error("Error joining class:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col items-start gap-3", className)}>
      <h2 className="text-xl font-bold text-slate-900">Tham gia vào lớp học</h2>

      {!isInputVisible ? (
        <button
          className="px-6 py-3 text-base font-bold text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors"
          onClick={handleButtonClick}
          aria-label="Nhập mã lớp của bạn"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleButtonClick();
            }
          }}
        >
          Nhập mã lớp của bạn
        </button>
      ) : (
        <>
          <div className="w-full max-w-md">
            <input
              type="text"
              value={classCode}
              onChange={(e) => setClassCode(e.target.value)}
              placeholder="Nhập mã lớp học"
              className="w-full px-6 py-3 text-base border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
              aria-label="Mã lớp học"
              disabled={isLoading}
            />
          </div>

          <div className="flex gap-3 mt-2">
            <button
              className="px-6 py-3 text-base font-bold text-blue-600 bg-white rounded-md hover:bg-slate-50 transition-colors"
              onClick={handleCancel}
              aria-label="Hủy bỏ"
              tabIndex={0}
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleCancel();
                }
              }}
            >
              Hủy bỏ
            </button>

            <button
              className={cn(
                "px-6 py-3 text-base font-bold text-white bg-blue-500 rounded-md transition-colors",
                isLoading
                  ? "opacity-70 cursor-not-allowed"
                  : "hover:bg-blue-600"
              )}
              onClick={handleSubmit}
              aria-label="Xác nhận"
              tabIndex={0}
              disabled={isLoading || !classCode.trim()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            >
              {isLoading ? "Đang xử lý..." : "Xác nhận"}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default JoinClass;
