import { useEffect, useMemo, useRef } from "react";
import { Bot, CornerDownRight, Loader2, RefreshCcw, Undo2, X } from "lucide-react";
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
          ? "w-full max-w-full whitespace-pre-wrap rounded-3xl rounded-bl-md bg-gradient-to-br from-sky-100 via-cyan-50 to-white px-3 py-3 text-sm text-sky-900 shadow sm:max-w-[80%]"
          : "w-full max-w-full whitespace-pre-wrap rounded-3xl rounded-br-md bg-gradient-to-br from-sky-500 via-cyan-500 to-blue-500 px-3 py-3 text-sm text-white shadow sm:max-w-[80%]"
      }
    >
      {children}
    </div>
    <p className="text-[10px] font-light uppercase tracking-[0.35em] text-slate-400">
      {timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
    </p>
  </div>
);

// Typing indicator component
const TypingIndicator = ({ label }: { label: string }) => (
  <div className="flex items-center gap-2 self-start rounded-2xl bg-sky-100/70 px-3 py-2 text-sky-500 shadow-sm">
    <Loader2 className="size-4 animate-spin" />
    <span className="text-xs font-medium">{label}</span>
  </div>
);

// Main PublicChatbot component
const PublicChatbot = ({ onClose }: PublicChatbotProps) => {
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
    <div className="flex h-[500px] flex-col bg-white/95">
      <div className="flex items-center justify-between border-b border-sky-100/60 bg-gradient-to-r from-sky-500 via-cyan-500 to-blue-500 px-4 py-4 text-white">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-white/15 text-white shadow">
            <Bot className="size-5" />
          </div>
          <div className="leading-tight">
            <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-white/70">{t("publicChatbot.header.title")}</p>
            <p className="text-sm font-semibold">{t("publicChatbot.header.subtitle")}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goBack}
            className="rounded-full bg-white/15 p-1.5 text-white transition hover:bg-white/25 disabled:opacity-40"
            aria-label={t("publicChatbot.actions.back")}
            disabled={!canGoBack || isAnswering}
          >
            <Undo2 className="size-4" />
          </button>
          <button
            type="button"
            onClick={resetConversation}
            className="rounded-full bg-white/15 p-1.5 text-white transition hover:bg-white/25"
            aria-label={t("publicChatbot.actions.reset")}
          >
            <RefreshCcw className="size-4" />
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-white/20 p-1.5 text-white transition hover:bg-white/30"
              aria-label={t("publicChatbot.actions.close")}
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className="flex flex-1 flex-col gap-3 overflow-y-auto bg-gradient-to-br from-sky-50 via-white to-cyan-50 px-3 py-4 sm:px-4"
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

      <div className="border-t border-sky-100/70 bg-white/92 px-4 py-3">
        {error && <p className="mb-2 text-xs font-medium text-rose-500">{error}</p>}
        <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-sky-400">{t("publicChatbot.answer_section")}</p>
        <div className="mt-2 grid gap-2">
          {hasAnswers ? (
            availableAnswers.map((answer) => (
              <button
                key={answer.id}
                type="button"
                className="group flex items-center justify-between rounded-2xl border border-sky-200/80 bg-white px-4 py-2.5 text-left text-sm font-medium text-sky-700 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 disabled:opacity-50"
                onClick={() => handleAnswerSelect(answer.id, answer.content)}
                disabled={isAnswering}
              >
                <span className="pr-4 leading-6 whitespace-pre-wrap">{answer.content}</span>
                <CornerDownRight className="size-4 shrink-0 text-sky-400 transition group-hover:translate-x-1 group-hover:text-sky-500" />
              </button>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-sky-200 bg-white/80 px-4 py-3 text-xs text-sky-500">
              {t("publicChatbot.no_answers")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicChatbot;
