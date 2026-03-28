import axiosClient from "./axiosClient";
import type { ApiResponse } from "./types";
import type { ChatbotQuestionDetailPayload } from "@/dataHelper/chatbot.dataHelper";

type StartQuestionData = ChatbotQuestionDetailPayload | ChatbotQuestionDetailPayload[];

const COMMON_CHATBOT_ENDPOINT = "common/chatbot";

export const commonChatbotApi = {
  // Fetch the starting question(s) for the chatbot
  getStartQuestion: (type?: number): Promise<ApiResponse<StartQuestionData>> =>
    axiosClient.get(`${COMMON_CHATBOT_ENDPOINT}/start-question`, {
      params: type !== undefined ? { type } : undefined,
    }),

    // Fetch the next question based on the provided answer ID
  getNextQuestion: (answerId: number): Promise<ApiResponse<ChatbotQuestionDetailPayload>> =>
    axiosClient.get(`${COMMON_CHATBOT_ENDPOINT}/next-question/${answerId}`),
};

export default commonChatbotApi;
