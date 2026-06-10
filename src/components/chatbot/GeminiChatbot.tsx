import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Bot, Send, Sparkles, RefreshCcw, X, Loader2, LifeBuoy, Maximize2, Minimize2 } from "lucide-react";
import { useUserStore } from "@/store/useUserStore";
import aiChatbotApi, { AiChatTurn } from "@/api/aiChatbotApi";
import { ROUTERS } from "@/constant";

interface Message {
  id: string;
  sender: "bot" | "user";
  text: string;
  timestamp: Date;
}

interface GeminiChatbotProps {
  onClose?: () => void;
  isMaximized?: boolean;
  onToggleMaximize?: () => void;
}

const GeminiChatbot = ({ onClose, isMaximized = false, onToggleMaximize }: GeminiChatbotProps) => {
  const { userRole, userName } = useUserStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [apiHistory, setApiHistory] = useState<AiChatTurn[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Normalize user role for API system instruction configuration
  const normalizedRole = (() => {
    const role = userRole ? userRole.toLowerCase() : "user";
    if (role === "admin") return "admin";
    if (role === "partner") return "partner";
    return "user";
  })();

  // Suggested questions based on role
  const getSuggestedQuestions = () => {
    switch (normalizedRole) {
      case "admin":
        return [
          "Làm sao để duyệt đối tác mới?",
          "Xem thống kê doanh thu hệ thống ở đâu?",
          "Quy trình giải quyết tranh chấp đặt phòng?"
        ];
      case "partner":
        return [
          "Làm thế nào để tạo gói giá mới?",
          "Cài đặt chặn phòng (block calendar) ra sao?",
          "Xem báo cáo doanh thu phòng như thế nào?"
        ];
      case "user":
      default:
        return [
          "Tìm phòng tại Đà Nẵng dưới 1 triệu.",
          "Chính sách hủy đặt phòng của hệ thống?",
          "Làm cách nào để liên hệ chủ phòng?"
        ];
    }
  };

  const initialGreeting = () => {
    const nameStr = userName ? `, ${userName}` : "";
    switch (normalizedRole) {
      case "admin":
        return `Xin chào Admin${nameStr}! Tôi là Trợ lý AI BKS. Tôi có thể hỗ trợ gì cho bạn trong việc quản lý hệ thống hôm nay?`;
      case "partner":
        return `Kính chào Đối tác${nameStr}! Tôi là Trợ lý AI hỗ trợ vận hành. Bạn cần trợ giúp gì về quản lý phòng hay doanh thu hôm nay không?`;
      case "user":
      default:
        return `Xin chào${nameStr}! Tôi là Trợ lý AI của BKS Booking. Tôi có thể giúp gì cho bạn trong việc tìm kiếm phòng nghỉ và giải đáp thông tin du lịch?`;
    }
  };

  // Initialize first greeting message
  useEffect(() => {
    setMessages([
      {
        id: "greeting",
        sender: "bot",
        text: initialGreeting(),
        timestamp: new Date(),
      },
    ]);
    setApiHistory([]);
  }, [normalizedRole, userName]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isLoading]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    setError(null);
    const userMessageText = textToSend;
    setInputValue("");

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: userMessageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await aiChatbotApi.chat({
        message: userMessageText,
        role: normalizedRole,
        history: apiHistory,
      });

      if (response.status === "success" && response.data?.reply) {
        const botMsg: Message = {
          id: `bot-${Date.now()}`,
          sender: "bot",
          text: response.data.reply,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMsg]);
        if (response.data.history) {
          setApiHistory(response.data.history);
        }
      } else {
        throw new Error(response.message || "Không nhận được phản hồi hợp lệ.");
      }
    } catch (err: any) {
      console.error("Lỗi AI Chatbot:", err);
      setError(err?.response?.data?.message || err.message || "Lỗi kết nối máy chủ.");
    } finally {
      setIsLoading(false);
    }
  };

  // Render message text with clickable React Router links for markdown links: [Room Name](/rooms/id), bold formatting, and bullet lists
  const renderMessageText = (text: string) => {
    if (!text) return "";

    const lines = text.split("\n");
    return lines.map((line, lineIdx) => {
      // Check if line is a bullet point (starts with * or -)
      const trimmedLine = line.trim();
      const isBullet = trimmedLine.startsWith("*") || trimmedLine.startsWith("-");
      let lineContent = line;
      
      if (isBullet) {
        // Strip out the bullet prefix to render a clean bullet item
        lineContent = line.replace(/^\s*[*-]\s*/, "");
      }

      // Parse bold segments (**text**) and link segments ([text](url))
      const regex = /(\*\*.*?\*\*|\[[^\]]+\]\([^)]+\))/g;
      const parts = [];
      let lastIndex = 0;
      let match;

      while ((match = regex.exec(lineContent)) !== null) {
        const matchIndex = match.index;
        // Preceding plain text
        if (matchIndex > lastIndex) {
          parts.push(lineContent.substring(lastIndex, matchIndex));
        }

        const token = match[1];
        if (token.startsWith("**") && token.endsWith("**")) {
          // It is bold. Let's see if it contains a link inside (e.g. **[Room Name](/rooms/id)**)
          const innerText = token.slice(2, -2);
          const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/;
          const linkMatch = innerText.match(linkRegex);
          
          if (linkMatch) {
            const linkText = linkMatch[1];
            const linkUrl = linkMatch[2];
            
            if (linkUrl.startsWith("/")) {
              parts.push(
                <strong key={`bold-link-${matchIndex}`} className="font-bold">
                  <Link
                    to={linkUrl}
                    className="text-cyan-400 hover:text-cyan-300 hover:underline font-semibold transition duration-150"
                  >
                    {linkText}
                  </Link>
                </strong>
              );
            } else {
              parts.push(
                <strong key={`bold-ext-${matchIndex}`} className="font-bold">
                  <a
                    href={linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:text-cyan-300 hover:underline font-semibold transition duration-150 inline-flex items-center gap-0.5"
                  >
                    {linkText}
                  </a>
                </strong>
              );
            }
          } else {
            // Standard bold text
            parts.push(
              <strong key={`bold-${matchIndex}`} className="font-bold text-white">
                {innerText}
              </strong>
            );
          }
        } else if (token.startsWith("[")) {
          // Standard plain link
          const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/;
          const linkMatch = token.match(linkRegex);
          
          if (linkMatch) {
            const linkText = linkMatch[1];
            const linkUrl = linkMatch[2];
            
            if (linkUrl.startsWith("/")) {
              parts.push(
                <Link
                  key={`link-${matchIndex}`}
                  to={linkUrl}
                  className="text-cyan-400 hover:text-cyan-300 hover:underline font-semibold transition duration-150"
                >
                  {linkText}
                </Link>
              );
            } else {
              parts.push(
                <a
                  key={`ext-${matchIndex}`}
                  href={linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 hover:underline font-semibold transition duration-150 inline-flex items-center gap-0.5"
                >
                  {linkText}
                </a>
              );
            }
          }
        }

        lastIndex = regex.lastIndex;
      }

      if (lastIndex < lineContent.length) {
        parts.push(lineContent.substring(lastIndex));
      }

      const renderedLine = parts.length > 0 ? parts : lineContent;

      if (isBullet) {
        return (
          <div key={`line-${lineIdx}`} className="flex items-start gap-2 pl-4 my-1">
            <span className="text-indigo-400 select-none">•</span>
            <div className="flex-1 text-slate-200">{renderedLine}</div>
          </div>
        );
      }

      return (
        <div key={`line-${lineIdx}`} className="min-h-[1.25rem] text-slate-200">
          {renderedLine}
        </div>
      );
    });
  };

  const handleReset = () => {
    setMessages([
      {
        id: `greeting-${Date.now()}`,
        sender: "bot",
        text: initialGreeting(),
        timestamp: new Date(),
      },
    ]);
    setApiHistory([]);
    setError(null);
    setIsLoading(false);
  };

  return (
    <div
      className="flex flex-col overflow-hidden bg-slate-950 text-slate-100 transition-all duration-300"
      style={{ height: isMaximized ? "min(680px, calc(100vh - 8rem))" : "min(520px, calc(100vh - 8rem))" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.02] px-4 py-3 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]">
              <Bot className="size-4" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-widest bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                BKS AI ASSISTANT
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">
              {normalizedRole === "admin" && "Hỗ trợ Quản trị viên"}
              {normalizedRole === "partner" && "Hỗ trợ Đối tác liên kết"}
              {normalizedRole === "user" && "Tìm phòng nghỉ & Du lịch"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {onToggleMaximize && (
            <button
              type="button"
              onClick={onToggleMaximize}
              title={isMaximized ? "Thu nhỏ" : "Phóng to"}
              className="rounded-lg bg-white/5 p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition active:scale-95"
            >
              {isMaximized ? (
                <Minimize2 className="size-4" />
              ) : (
                <Maximize2 className="size-4" />
              )}
            </button>
          )}
          <button
            type="button"
            onClick={handleReset}
            title="Làm mới cuộc hội thoại"
            className="rounded-lg bg-white/5 p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition active:scale-95"
          >
            <RefreshCcw className="size-4" />
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              title="Đóng chatbot"
              className="rounded-lg bg-white/5 p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition active:scale-95"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      </div>

      {/* Messages List - Premium Dark background */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4 py-4 space-y-4 custom-scrollbar"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex w-full ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`flex max-w-[85%] items-start gap-2.5 ${
                msg.sender === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <div
                className={`flex size-8 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold shadow-md ${
                  msg.sender === "user"
                    ? "bg-gradient-to-br from-indigo-500 to-indigo-600 text-white"
                    : "bg-slate-800 text-purple-400 border border-slate-700/60"
                }`}
              >
                {msg.sender === "user" ? "ME" : <Sparkles className="size-4 text-purple-300" />}
              </div>
              <div className="flex flex-col gap-1">
                <div
                  className={`whitespace-pre-wrap rounded-2xl p-3 text-sm shadow-md transition-all duration-200 ${
                    msg.sender === "user"
                      ? "rounded-tr-none bg-gradient-to-br from-indigo-600 via-indigo-600 to-purple-600 text-white shadow-indigo-900/20"
                      : "rounded-tl-none bg-slate-900/80 text-slate-200 border border-white/5 shadow-black/20"
                  }`}
                >
                  {renderMessageText(msg.text)}
                </div>
                <span
                  className={`text-[9px] text-slate-500 px-1 ${
                    msg.sender === "user" ? "text-right" : "text-left"
                  }`}
                >
                  {msg.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex max-w-[80%] items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-lg bg-slate-800 text-purple-400 border border-slate-700/60 shadow-md">
                <Loader2 className="size-4 animate-spin text-purple-400" />
              </div>
              <div className="rounded-2xl rounded-tl-none bg-slate-900/80 border border-white/5 p-3 text-xs text-slate-400 shadow-md flex items-center gap-2">
                <span>AI đang suy nghĩ</span>
                <span className="flex gap-1 items-center">
                  <span className="size-1 animate-bounce rounded-full bg-indigo-400" />
                  <span className="size-1 animate-bounce rounded-full bg-indigo-400 [animation-delay:0.2s]" />
                  <span className="size-1 animate-bounce rounded-full bg-indigo-400 [animation-delay:0.4s]" />
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Error notification */}
        {error && (
          <div className="rounded-xl border border-rose-900/30 bg-rose-950/20 p-3.5 text-xs text-rose-400 shadow-lg">
            <p className="font-semibold text-rose-300">Đã xảy ra sự cố:</p>
            <p className="mt-0.5 text-slate-300">{error}</p>
          </div>
        )}
      </div>

      {/* Suggested Prompts & Input Area */}
      <div className="border-t border-white/10 bg-slate-950/95 p-3 space-y-3 backdrop-blur-md">
        {/* Suggested prompts list */}
        {messages.length === 1 && !isLoading && (
          <div className="space-y-1.5 animate-in">
            <p className="text-[9px] font-extrabold uppercase tracking-wider text-slate-500">
              Gợi ý từ trợ lý ảo
            </p>
            <div className="flex flex-wrap gap-1.5">
              {getSuggestedQuestions().map((question, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSend(question)}
                  className="rounded-xl border border-white/5 bg-white/[0.03] px-3 py-1.5 text-xs text-slate-300 hover:border-indigo-500/50 hover:bg-indigo-600/10 hover:text-indigo-300 transition-all duration-200 active:scale-95 text-left"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input box */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(inputValue);
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading}
            placeholder={
              normalizedRole === "admin"
                ? "Hỏi trợ lý quản trị..."
                : normalizedRole === "partner"
                  ? "Hỏi về vận hành phòng, thanh toán..."
                  : "Tìm phòng đẹp, chính sách đặt..."
            }
            className="flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/30 focus:outline-none disabled:bg-white/[0.01] disabled:text-slate-600 transition-all"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20 hover:from-indigo-600 hover:to-purple-700 active:scale-95 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-600 disabled:shadow-none transition-all duration-200"
          >
            <Send className="size-4" />
          </button>
        </form>

        {/* Support link footer */}
        <div className="flex items-center justify-center pt-1">
          <Link
            to={ROUTERS.PUBLIC_FAQ}
            className="inline-flex items-center gap-1.5 text-[10px] font-medium text-slate-500 hover:text-indigo-400 transition-colors duration-200 group"
          >
            <LifeBuoy className="size-3 group-hover:text-indigo-400 transition-colors" />
            Xem tất cả chính sách &amp; câu hỏi thường gặp
          </Link>
        </div>
      </div>
    </div>
  );
};

export default GeminiChatbot;
