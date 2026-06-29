import { useEffect, useMemo, useRef, useState } from "react";
import { Bot, Sparkles } from "lucide-react";
import GeminiChatbot from "./GeminiChatbot";
import { useTranslation } from "react-i18next";


const GREETING_VISIBLE_MS = 2400;
const GREETING_HIDDEN_MS = 10500;

const FloatingChatbot = () => {
  const { t, i18n } = useTranslation();
  const isVi = i18n.language.startsWith("vi");
  const chatbotGreetings = useMemo(
    () => (isVi
      ? [
          "Xin chào, mình có thể giúp gì?",
          "Chào bạn, cần hỗ trợ đặt phòng không?",
          "Hello, hỏi mình bất cứ điều gì nhé!",
          "Mình ở đây để hỗ trợ bạn 24/7",
          "Cần tìm phòng đẹp, mình lo được",
        ]
      : [
          "Hi, how can I help you?",
          "Need help booking a room?",
          "Ask me anything anytime",
          "I am here to support you 24/7",
          "Looking for a great place to stay?",
        ]),
    [isVi],
  );
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [greetingIndex, setGreetingIndex] = useState(0);
  const [isGreetingVisible, setIsGreetingVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const greetingTimerRef = useRef<number | null>(null);
  const HISTORY_STORAGE_KEY = "public_chatbot_history_default";

  const clearGreetingTimer = () => {
    if (greetingTimerRef.current !== null) {
      window.clearTimeout(greetingTimerRef.current);
      greetingTimerRef.current = null;
    }
  };

  const scheduleGreetingCycle = () => {
    clearGreetingTimer();

    greetingTimerRef.current = window.setTimeout(() => {
      setIsGreetingVisible(true);

      greetingTimerRef.current = window.setTimeout(() => {
        setIsGreetingVisible(false);
        setGreetingIndex((prev) => (prev + 1) % chatbotGreetings.length);
        scheduleGreetingCycle();
      }, GREETING_VISIBLE_MS);
    }, GREETING_HIDDEN_MS);
  };

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
    const handleOpen = () => {
      setIsOpen(true);
    };
    window.addEventListener("open-public-chatbot", handleOpen);
    return () => {
      window.removeEventListener("open-public-chatbot", handleOpen);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      setIsGreetingVisible(false);
      clearGreetingTimer();
      return;
    }

    setIsGreetingVisible(true);
    scheduleGreetingCycle();

    return () => {
      clearGreetingTimer();
    };
  }, [isOpen]);

  useEffect(() => {
    return () => {
      clearGreetingTimer();
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
      <div
        className={`chatbot-premium-panel absolute bottom-full right-0 mb-3 transition-all duration-300 overflow-hidden ${
          isMaximized ? "w-[550px]" : "w-[370px]"
        } ${
          isOpen ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"
        }`}
        style={{ maxHeight: "calc(100vh - 8rem)" }}
      >
        <GeminiChatbot
          onClose={() => setIsOpen(false)}
          isMaximized={isMaximized}
          onToggleMaximize={() => setIsMaximized((prev) => !prev)}
        />
      </div>

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        onMouseEnter={() => {
          if (!isOpen) {
            clearGreetingTimer();
            setIsGreetingVisible(true);
          }
        }}
        onMouseLeave={() => {
          if (!isOpen) {
            setIsGreetingVisible(false);
            scheduleGreetingCycle();
          }
        }}
        className="chatbot-premium-trigger group relative"
        aria-expanded={isOpen}
        aria-label={isOpen ? t("publicChatbot.actions.close") : (isVi ? "Mở chatbot" : "Open chatbot")}
      >
        {!isOpen && (
          <span
            className={`pointer-events-none absolute right-full top-1/2 mr-3 max-w-[220px] -translate-y-1/2 overflow-hidden text-ellipsis whitespace-nowrap rounded-full border border-white/15 bg-white/95 px-3 py-1 text-[11px] font-semibold text-slate-700 shadow-lg shadow-slate-900/10 backdrop-blur-md transition-all duration-300 max-sm:right-1/2 max-sm:top-full max-sm:mr-0 max-sm:mt-3 max-sm:-translate-x-1/2 max-sm:translate-y-0 ${
              isGreetingVisible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
            }`}
          >
            {chatbotGreetings[greetingIndex]}
          </span>
        )}
        <span className="relative flex size-7 items-center justify-center">
          <Bot className="chatbot-icon-anim size-7" />
          <Sparkles className="absolute -right-0.5 -top-0.5 size-3.5 text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.55)]" />
        </span>
      </button>
    </div>
  );
};

export default FloatingChatbot;
