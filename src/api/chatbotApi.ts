import type {
  ChatbotFlowNode,
  ChatbotListParams,
  ChatbotQuestionDetailPayload,
  ChatbotRecord,
  CreateChatbotQuestionPayload,
  CreateChatbotQuestionResponse,
  DeleteChatbotResponse,
  UpdateChatbotPositionPayload,
  UpdateChatbotLineFlowPayload,
  UpdateChatbotQuestionPayload,
  UpdateChatbotQuestionResponse,
} from "@/dataHelper/chatbot.dataHelper";
import axiosClient from "./axiosClient";
import type { ApiResponse, Paginator } from "./types";

const CHATBOT_ENDPOINT = "admin/chatbot";

export const chatbotApi = {
  // For fetching chatbots with pagination
  getChatbots: (params: ChatbotListParams): Promise<ApiResponse<Paginator<ChatbotRecord>>> =>
    axiosClient.get(CHATBOT_ENDPOINT, {
      params,
    }),

  // For fetching all chatbots for dropdown/select usage
  getChatbotAll: (): Promise<ApiResponse<ChatbotRecord[]>> => axiosClient.get(`${CHATBOT_ENDPOINT}`),

  // For fetching chatbot question detail by ID
  getChatbotDetail: (id: number): Promise<ApiResponse<ChatbotQuestionDetailPayload>> => axiosClient.get(`${CHATBOT_ENDPOINT}/detail/${id}`),

  // For creating a new chatbot question
  createChatbotQuestion: (payload: CreateChatbotQuestionPayload): Promise<ApiResponse<CreateChatbotQuestionResponse>> => axiosClient.post(`${CHATBOT_ENDPOINT}/create`, payload),

  // For deleting a chatbot question by ID
  deleteChatbotQuestion: (id: number): Promise<ApiResponse<DeleteChatbotResponse>> => axiosClient.delete(`${CHATBOT_ENDPOINT}/delete/${id}`),

  // For updating an existing chatbot question by ID
  updateChatbotQuestion: (id: number, payload: UpdateChatbotQuestionPayload): Promise<ApiResponse<UpdateChatbotQuestionResponse>> => axiosClient.put(`${CHATBOT_ENDPOINT}/update/${id}`, payload),

  // For fetching the chatbot flow structure
  getChatbotFlow: (): Promise<ApiResponse<ChatbotFlowNode[]>> => axiosClient.get(`${CHATBOT_ENDPOINT}/list-question-flow`),

  // For updating the position of chatbot questions in the flow
  updateChatbotPosition: (id: number, payload: UpdateChatbotPositionPayload): Promise<ApiResponse<unknown>> => axiosClient.put(`${CHATBOT_ENDPOINT}/update-position/${id}`, payload),

  // For updating the line flow of chatbot questions
  updateChatbotLineFlow: (id: number, payload: UpdateChatbotLineFlowPayload): Promise<ApiResponse<unknown>> =>
    axiosClient.put(`${CHATBOT_ENDPOINT}/update-line-flow/${id}`, payload),
};

export default chatbotApi;
