export type ConversationStatus = 'open' | 'assigned' | 'closed';

export interface Conversation {
  id: string;
  chat_id: string;
  channel?: string;
  status: ConversationStatus;
  assigned_to?: string | null;
  hitl_locked?: boolean;
  last_message_at: string;
  preview_message?: string;
  unread_count?: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  text: string;
  sender_type: 'user' | 'agent' | 'bot' | 'system';
  direction?: 'inbound' | 'outbound';
  created_at: string;
  meta?: any;
}

export interface SendMessagePayload {
  text: string;
}
