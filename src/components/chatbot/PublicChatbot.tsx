import { useEffect, useMemo, useRef } from "react";
import { Bot, CornerDownRight, Loader2, RefreshCcw, Undo2 } from "lucide-react";
import { usePublicChatbot } from "@/hooks/usePublicChatbot";
import { useTranslation } from "react-i18next";
import { PublicChatbotProps } from "@/dataHelper/chatbot.dataHelper";

const ChatBubble = ({
  variant,
  children,
  timestamp,
}: {
  variant: "bot" | "user";
  children: React.ReactNode;
  timestamp: Date;
}) => (
  <div
    className={
      variant === "bot"
        ? "flex w-full flex-col items-start gap-1"
        : "flex w-full flex-col items-end gap-1"
    }
  >
    <div
      className={
        variant === "bot"
          ? "w-full max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-tl-none bg-slate-900/80 p-3 text-sm text-slate-200 border border-white/5 shadow-md"
          : "w-full max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-tr-none bg-gradient-to-br from-sky-600 via-cyan-600 to-blue-600 p-3 text-sm text-white shadow-md shadow-sky-900/10"
      }
    >
      {children}
    </div>
    <p className="text-[10px] font-medium tracking-wider text-slate-500 uppercase px-1">
      {timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
    </p>
  </div>
);

// Typing indicator component
const TypingIndicator = ({ label }: { label: string }) => (
  <div className="flex items-center gap-2 self-start rounded-2xl bg-slate-900/80 border border-white/5 px-3 py-2 text-slate-300 shadow-md">
    <Loader2 className="size-4 animate-spin text-sky-400" />
    <span className="text-xs font-medium">{label}</span>
  </div>
);

// Main PublicChatbot component
const PublicChatbot = ({ onClose }: PublicChatbotProps) => {
  void onClose;

  const {
    messages,
    availableAnswers,
    isLoading,
    isAnswering,
    error,
    handleAnswerSelect,
    resetConversation,
    goBack,
    canGoBack,
  } = usePublicChatbot();
  const { t } = useTranslation();

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!scrollContainerRef.current) return;
    scrollContainerRef.current.scrollTo({
      top: scrollContainerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isAnswering]);

  const hasAnswers = useMemo(() => availableAnswers.length > 0, [availableAnswers]);

  return (
    <div className="flex h-[500px] flex-col bg-slate-950 text-slate-100">
      {/* Header - Matches the dark aesthetic */}
      <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.02] p-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-[0_0_15px_rgba(14,165,233,0.4)]">
              <Bot className="size-5" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500"></span>
            </span>
          </div>
          <div className="leading-tight">
            <p className="text-[10px] font-extrabold uppercase tracking-widest bg-gradient-to-r from-sky-300 to-blue-300 bg-clip-text text-transparent">
              {t("publicChatbot.header.title")}
            </p>
            <p className="text-[10px] text-slate-400 font-medium">{t("publicChatbot.header.subtitle")}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={goBack}
            className="rounded-lg bg-white/5 p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition disabled:opacity-30 disabled:hover:bg-transparent"
            aria-label={t("publicChatbot.actions.back")}
            disabled={!canGoBack || isAnswering}
          >
            <Undo2 className="size-4" />
          </button>
          <button
            type="button"
            onClick={resetConversation}
            className="rounded-lg bg-white/5 p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition"
            aria-label={t("publicChatbot.actions.reset")}
          >
            <RefreshCcw className="size-4" />
          </button>
        </div>
      </div>

      {/* Messages - Dark gradients */}
      <div
        ref={scrollContainerRef}
        className="flex flex-1 flex-col gap-3 overflow-y-auto bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4 py-4 custom-scrollbar"
      >
        {isLoading && messages.length === 0 && <TypingIndicator label={t("publicChatbot.typing")} />}

        {messages.map((message) => {
          if (message.type === "question" && message.question) {
            return (
              <ChatBubble key={message.id} variant="bot" timestamp={message.createdAt}>
                {message.question.content}
              </ChatBubble>
            );
          }

          if (message.type === "answer") {
            return (
              <ChatBubble key={message.id} variant="user" timestamp={message.createdAt}>
                {message.answerContent}
              </ChatBubble>
            );
          }

          return null;
        })}

        {isAnswering && <TypingIndicator label={t("publicChatbot.typing")} />}
      </div>

      {/* Options Selection - Glassmorphic design */}
      <div className="border-t border-white/10 bg-slate-950/95 p-3 space-y-2 backdrop-blur-md">
        {error && <p className="mb-2 text-xs font-semibold text-rose-400">{error}</p>}
        <p className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500">
          {t("publicChatbot.answer_section")}
        </p>
        <div className="mt-2 grid gap-1.5">
          {hasAnswers ? (
            availableAnswers.map((answer) => (
              <button
                key={answer.id}
                type="button"
                className="group flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.03] px-3.5 py-2.5 text-left text-xs font-semibold text-slate-200 transition-all duration-200 hover:border-sky-500/50 hover:bg-sky-600/10 hover:text-sky-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-500 disabled:opacity-50"
                onClick={() => handleAnswerSelect(answer.id, answer.content)}
                disabled={isAnswering}
              >
                <span className="whitespace-pre-wrap pr-4 leading-relaxed">{answer.content}</span>
                <CornerDownRight className="size-3.5 shrink-0 text-slate-500 transition group-hover:translate-x-1 group-hover:text-sky-400" />
              </button>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.01] px-4 py-3 text-xs text-slate-500 text-center">
              {t("publicChatbot.no_answers")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicChatbot;
