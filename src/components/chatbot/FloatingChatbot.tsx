import { useEffect, useRef, useState } from "react";
import { BotIcon } from "lucide-react";
import PublicChatbot from "./PublicChatbot";

const FloatingChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const HISTORY_STORAGE_KEY = "public_chatbot_history_default";

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    // Clear chat history on page unload
    const clearHistory = () => {
      window.localStorage.removeItem(HISTORY_STORAGE_KEY);
    };

    // Clear history when component mounts
    clearHistory();
    window.addEventListener("beforeunload", clearHistory);
    return () => {
      window.removeEventListener("beforeunload", clearHistory);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    // Close chatbot when clicking outside
    const handleOutsideClick = (event: MouseEvent | TouchEvent) => {
      if (!containerRef.current) {
        return;
      }

      if (!containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className="pointer-events-auto relative">
      {isOpen && (
        <div className="absolute bottom-full right-0 mb-3 w-[360px] overflow-hidden rounded-[32px] border border-slate-200/80 bg-white/95 shadow-2xl shadow-slate-200/70 backdrop-blur">
          <PublicChatbot onClose={() => setIsOpen(false)} />
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="group inline-flex size-14 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-slate-200/70 transition hover:scale-105 hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-300/70"
        aria-expanded={isOpen}
        aria-label={isOpen ? "Đóng chatbot" : "Mở chatbot"}
      >
        <BotIcon className="chatbot-icon-anim size-7" />
      </button>
    </div>
  );
};

export default FloatingChatbot;
