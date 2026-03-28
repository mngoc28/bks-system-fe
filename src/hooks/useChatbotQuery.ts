import { chatbotApi } from "@/api/chatbotApi";
import type { ApiResponse, Paginator } from "@/api/types";
import type {
  ChatbotFlowNode,
  ChatbotListParams,
  ChatbotQuestionDetailPayload,
  ChatbotRecord,
  CreateChatbotQuestionPayload,
  CreateChatbotQuestionResponse,
  DeleteChatbotResponse,
  UpdateChatbotLineFlowPayload,
  UpdateChatbotPositionPayload,
  UpdateChatbotQuestionPayload,
  UpdateChatbotQuestionResponse,
} from "@/dataHelper/chatbot.dataHelper";
import { toastError, toastSuccess } from "@/components/ui/toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useRef } from "react";

// Hook to fetch a list of chatbots with given parameters (table usage)
export const useChatbotsQuery = (params: ChatbotListParams) => {
  const { t } = useTranslation();

  return useQuery<ApiResponse<Paginator<ChatbotRecord>>>({
    queryKey: ["chatbots", params],
    queryFn: async () => {
      try {
        return await chatbotApi.getChatbots(params);
      } catch (error) {
        toastError(t("questions.list_error", { defaultValue: "Unable to load chatbot questions." }));
        throw error;
      }
    },
  });
};

// Hook to fetch all chatbots for dropdowns or selections
export const useChatbotAllQuery = () => {
  const { t } = useTranslation();

  return useQuery<ApiResponse<ChatbotRecord[]>>({
    queryKey: ["chatbots", "all"],
    queryFn: async () => {
      try {
        return await chatbotApi.getChatbotAll();
      } catch (error) {
        toastError(t("questions.list_error", { defaultValue: "Unable to load chatbot get all." }));
        throw error;
      }
    },
  });
};

// Hook to fetch details of a specific chatbot question by ID
export const useChatbotDetailQuery = (id: number | undefined) => {
  const { t } = useTranslation();

  return useQuery<ApiResponse<ChatbotQuestionDetailPayload>>({
    queryKey: ["chatbot-detail", id],
    queryFn: async () => {
      if (typeof id !== "number") {
        throw new Error("Chatbot detail id is required");
      }

      try {
        return await chatbotApi.getChatbotDetail(id);
      } catch (error) {
        toastError(t("questions.detail.error", { defaultValue: "Unable to load question detail." }));
        throw error;
      }
    },
    enabled: typeof id === "number",
  });
};

export const useChatbotFlowQuery = () => {
  const { t } = useTranslation();

  // Hook to fetch the chatbot flow structure
  return useQuery<ApiResponse<ChatbotFlowNode[]>>({
    queryKey: ["chatbot-flow"],
    queryFn: async () => {
      try {
        return await chatbotApi.getChatbotFlow();
      } catch (error) {
        toastError(t("questions.flow.error", { defaultValue: "Unable to load chatbot flow." }));
        throw error;
      }
    },
  });
};

// Hook to update the position of a chatbot question node
export const useUpdateChatbotPositionMutation = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const lastSuccessToastAtRef = useRef(0);
  const pendingMutationsRef = useRef<Record<number, boolean>>({});

  return useMutation<
    ApiResponse<unknown>,
    Error,
    { id: number; payload: UpdateChatbotPositionPayload },
    { previous?: ApiResponse<ChatbotFlowNode[]> }
  >({
    mutationFn: ({ id, payload }) => chatbotApi.updateChatbotPosition(id, payload),
    onMutate: async ({ id, payload }) => {
      await queryClient.cancelQueries({ queryKey: ["chatbot-flow"] });

      const previous = queryClient.getQueryData<ApiResponse<ChatbotFlowNode[]>>(["chatbot-flow"]);

      if (previous?.data) {
        const updatedNodes = previous.data.map((node) =>
          node.id === id ? { ...node, position_x: payload.position_x, position_y: payload.position_y } : node,
        );

        queryClient.setQueryData(["chatbot-flow"], { ...previous, data: updatedNodes });
      }

      pendingMutationsRef.current[id] = true;

      return { previous };
    },
    onSuccess: (_data, variables) => {
      if (variables) {
        delete pendingMutationsRef.current[variables.id];
      }

      const now = Date.now();
      if (now - lastSuccessToastAtRef.current > 2000) {
        toastSuccess(t("questions.flow.update_success", { defaultValue: "Position updated." }));
        lastSuccessToastAtRef.current = now;
      }
    },
    onError: (_error, variables, context) => {
      if (variables) {
        delete pendingMutationsRef.current[variables.id];
      }

      if (context?.previous) {
        queryClient.setQueryData(["chatbot-flow"], context.previous);
      }
      toastError(t("questions.flow.update_error", { defaultValue: "Failed to update position." }));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["chatbot-flow"] });
    },
  });
};

// Hook to update the line flow (connections) of chatbot questions
export const useUpdateChatbotLineFlowMutation = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<unknown>, Error, { answerId: number; payload: UpdateChatbotLineFlowPayload }>({
    mutationFn: ({ answerId, payload }) => chatbotApi.updateChatbotLineFlow(answerId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["chatbot-flow"] });
      const hasDestination = variables.payload.next_question_id !== null;
      toastSuccess(
        hasDestination
          ? t("questions.flow.update_line_success", { defaultValue: "Connection updated." })
          : t("questions.flow.delete_line_success", { defaultValue: "Connection removed." }),
      );
    },
    onError: () => {
      toastError(t("questions.flow.update_line_error", { defaultValue: "Failed to update connection." }));
    },
  });
};

// Hook to create a new chatbot question
export const useCreateChatbotMutation = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<CreateChatbotQuestionResponse>, Error, CreateChatbotQuestionPayload>({
    mutationFn: (payload) => chatbotApi.createChatbotQuestion(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatbots"] });
      toastSuccess(t("questions.create.success"));
    },
    onError: () => {
      toastError(t("questions.create.error"));
    },
  });
};

// Hook to delete a chatbot question by ID
export const useDeleteChatbotMutation = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<DeleteChatbotResponse>, Error, number>({
    mutationFn: (id) => chatbotApi.deleteChatbotQuestion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatbots"] });
      toastSuccess(t("questions.delete.success"));
    },
    onError: () => {
      toastError(t("questions.delete.error"));
    },
  });
};

// Hook to update an existing chatbot question by ID
export const useUpdateChatbotMutation = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<UpdateChatbotQuestionResponse>, Error, { id: number; payload: UpdateChatbotQuestionPayload }>({
    mutationFn: ({ id, payload }) => chatbotApi.updateChatbotQuestion(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["chatbots"], refetchType: "inactive" });
      if (variables?.id) {
        queryClient.invalidateQueries({ queryKey: ["chatbot-detail", variables.id] });
      }
      toastSuccess(t("questions.update.success"));
    },
    onError: () => {
      toastError(t("questions.update.error"));
    },
  });
};
