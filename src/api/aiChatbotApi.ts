import axiosClient from "./axiosClient";
import type { ApiResponse } from "./types";

export interface AiChatMessagePart {
  text?: string;
  functionCall?: {
    name: string;
    args: any;
  };
  functionResponse?: {
    name: string;
    response: any;
  };
}

export interface AiChatTurn {
  role: "user" | "model" | "function";
  parts: AiChatMessagePart[];
}

export interface AiChatPayload {
  message: string;
  role?: "user" | "partner" | "admin";
  history?: AiChatTurn[];
}

export interface AiChatResponse {
  reply: string;
  history?: AiChatTurn[];
}

export const aiChatbotApi = {
  chat: (payload: AiChatPayload): Promise<ApiResponse<AiChatResponse>> =>
    axiosClient.post("common/ai-chatbot/chat", payload),
};

export default aiChatbotApi;
