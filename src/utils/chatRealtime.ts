export interface ChatMessagePayload {
  id: number;
  conversation_id: number;
  user_id: number;
  sender_id: number;
  content: string;
  is_read: boolean;
  created_at: string;
  company_name?: string | null;
  room_name?: string | null;
  property_name?: string | null;
  metadata?: Record<string, unknown> | null;
  user?: {
    name: string;
    avatar?: string;
  };
}

export const mapRealtimeChatMessage = (payload: Record<string, unknown>): ChatMessagePayload => ({
  id: Number(payload.id),
  conversation_id: Number(payload.conversation_id),
  user_id: Number(payload.sender_id),
  sender_id: Number(payload.sender_id),
  content: String(payload.content ?? ''),
  is_read: Boolean(payload.is_read),
  created_at: String(payload.created_at ?? new Date().toISOString()),
  company_name: payload.company_name ? String(payload.company_name) : null,
  room_name: payload.room_name ? String(payload.room_name) : null,
  property_name: payload.property_name ? String(payload.property_name) : null,
  metadata: (payload.metadata as Record<string, unknown> | null) ?? null,
  user: {
    name: String(payload.sender_name ?? (payload.user as { name?: string } | undefined)?.name ?? 'User'),
    avatar: (payload.user as { avatar?: string } | undefined)?.avatar,
  },
});

export const isOwnChatMessage = (
  message: Pick<ChatMessagePayload, 'sender_id'>,
  counterpartyId?: number,
): boolean => {
  if (!counterpartyId) {
    return false;
  }

  return message.sender_id !== counterpartyId;
};
