import { useCallback, useEffect, useMemo, useState } from "react";
import { commonChatbotApi } from "@/api/commonChatbotApi";
import type { ChatbotMessage, ChatbotQuestionDetailPayload, UsePublicChatbotOptions } from "@/dataHelper/chatbot.dataHelper";
import { BOT_TYPING_DELAY_MS, FIRST_MESSAGE_ID } from "@/constant";
import { useTranslation } from "react-i18next";

// Hook to manage public chatbot conversation
export const usePublicChatbot = ({ type }: UsePublicChatbotOptions = {}) => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<ChatbotMessage[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<ChatbotQuestionDetailPayload | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnswering, setIsAnswering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasHydrated, setHasHydrated] = useState(false);

  const storageKey = useMemo(() => `public_chatbot_history_${type ?? "default"}`, [type]);
  const storage = useMemo(() => (typeof window === "undefined" ? null : window.localStorage), []);

  // Fetch the starting question from the API
  const fetchStartQuestion = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      storage?.removeItem(storageKey);

      const response = await commonChatbotApi.getStartQuestion(type);
      const payload = response.data;
      const questions = Array.isArray(payload) ? payload : payload ? [payload] : [];
      const firstQuestion = questions.find((item) => item.is_start_node === 1) ?? questions[0];

      if (!firstQuestion) {
        const notFoundMessage = t("publicChatbot.messages.start_not_found");
        setError(notFoundMessage);
        setMessages([
          {
            id: FIRST_MESSAGE_ID,
            type: "question",
            question: {
              id: 0,
              content: notFoundMessage,
              answers: [],
              is_start_node: 1,
              position_x: 0,
              position_y: 0,
              type: 0,
            },
            createdAt: new Date(),
          },
        ]);
        setCurrentQuestion(undefined);
      } else {
        setMessages([
          {
            id: `${FIRST_MESSAGE_ID}-${firstQuestion.id}`,
            type: "question",
            question: firstQuestion,
            createdAt: new Date(),
          },
        ]);
        setCurrentQuestion(firstQuestion);
      }
    } catch {
      setError(t("publicChatbot.messages.start_load_error"));
    } finally {
      setIsLoading(false);
      setHasHydrated(true);
    }
  }, [type, storageKey, storage, t]);

  // Handle user selecting an answer
  const handleAnswerSelect = useCallback(
    async (answerId: number, answerContent: string) => {
      setIsAnswering(true);
      setError(null);
      const now = new Date();
      setMessages((prev) => [
        ...prev,
        {
          id: `answer-${answerId}-${Date.now()}`,
          type: "answer",
          answerContent,
          createdAt: now,
        },
      ]);
      try {
        const response = await commonChatbotApi.getNextQuestion(answerId);
        const nextQuestion = response.data;

        // Simulate bot typing delay
        if (nextQuestion) {
          await new Promise((resolve) => setTimeout(resolve, BOT_TYPING_DELAY_MS));
          const questionTimestamp = new Date();
          setMessages((prev) => [
            ...prev,
            {
              id: `question-${nextQuestion.id}-${Date.now()}`,
              type: "question",
              question: nextQuestion,
              createdAt: questionTimestamp,
            },
          ]);
          setCurrentQuestion(nextQuestion);
        } else {
          setCurrentQuestion(undefined);
      }
    } catch {
      setCurrentQuestion(undefined);
    } finally {
      setIsAnswering(false);
    }
  },
    [],
  );

  // Reset the conversation to the start
  const resetConversation = useCallback(() => {
    storage?.removeItem(storageKey);
    setMessages([]);
    setCurrentQuestion(undefined);
    setError(null);
    setIsAnswering(false);
    fetchStartQuestion();
  }, [fetchStartQuestion, storageKey, storage]);

  const goBack = useCallback(() => {
    if (messages.length === 0) {
      return;
    }

    const updated = [...messages];
    const last = updated[updated.length - 1];

    if (last.type === "question") {
      updated.pop();
      if (updated.length && updated[updated.length - 1].type === "answer") {
        updated.pop();
      }
    } else {
      updated.pop();
    }

    if (updated.length === 0) {
      storage?.removeItem(storageKey);
      setMessages([]);
      setCurrentQuestion(undefined);
      fetchStartQuestion();
      return;
    }

    const lastQuestion = [...updated].reverse().find((message) => message.type === "question")?.question;
    setMessages(updated);
    setCurrentQuestion(lastQuestion);

    if (
      updated.length === 1 &&
      updated[0].type === "question" &&
      updated[0].question?.is_start_node === 1
    ) {
      storage?.removeItem(storageKey);
    }
  }, [messages, storageKey, fetchStartQuestion, storage]);

  useEffect(() => {
    let isMounted = true;

    // Hydrate conversation from localStorage
    const hydrateFromStorage = async () => {
      try {
        if (!storage) {
          await fetchStartQuestion();
          return;
        }

        const storedRaw = storage.getItem(storageKey);
        if (storedRaw) {
          const parsed = JSON.parse(storedRaw) as { messages?: Array<Omit<ChatbotMessage, "createdAt"> & { createdAt: string }> };
          if (Array.isArray(parsed.messages) && parsed.messages.length > 0) {
            const restoredMessages: ChatbotMessage[] = parsed.messages.map((msg) => ({
              ...msg,
              createdAt: new Date(msg.createdAt),
            }));

            if (isMounted) {
              setMessages(restoredMessages);
              const lastQuestion = [...restoredMessages]
                .reverse()
                .find((message) => message.type === "question")?.question;
              setCurrentQuestion(lastQuestion);
              setHasHydrated(true);
              return;
            }
          }
        }
      } catch (error) {
        console.warn(t("publicChatbot.messages.restore_warning"), error);
      }

      await fetchStartQuestion();
    };

    hydrateFromStorage();

    return () => {
      isMounted = false;
    };
  }, [fetchStartQuestion, storageKey, storage, t]);

  // Persist conversation to localStorage
  useEffect(() => {
    if (!hasHydrated) return;
    if (messages.length === 0) {
      storage?.removeItem(storageKey);
      return;
    }

    if (
      messages.length === 1 &&
      messages[0].type === "question" &&
      messages[0].question?.is_start_node === 1
    ) {
      storage?.removeItem(storageKey);
      return;
    }

    const serializable = messages.map((msg) => ({
      ...msg,
      createdAt: msg.createdAt.toISOString(),
    }));

    storage?.setItem(storageKey, JSON.stringify({ messages: serializable }));
  }, [messages, storageKey, hasHydrated, storage]);

  const availableAnswers = useMemo(() => currentQuestion?.answers ?? [], [currentQuestion?.answers]);
  const canGoBack = messages.length > 1;

  return {
    messages,
    currentQuestion,
    availableAnswers,
    isLoading,
    isAnswering,
    error,
    handleAnswerSelect,
    resetConversation,
    goBack,
    canGoBack,
  };
};

export type UsePublicChatbotReturn = ReturnType<typeof usePublicChatbot>;
