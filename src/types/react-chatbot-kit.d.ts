import { ReactChatbotKitProps } from "@/dataHelper/chatbot.dataHelper";

declare module "react-chatbot-kit" {
  import * as React from "react";

  export default class Chatbot extends React.Component<ReactChatbotKitProps> {}

  export function createChatBotMessage(message: string, options?: any): any;
  export function createClientMessage(message: string, options?: any): any;
  export function createCustomMessage(message: string, type: string, options?: any): any;
}
