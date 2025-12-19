export type ConversationStatus = 'open' | 'assigned' | 'closed';

export interface Conversation {
  chat_id: string;
  status: ConversationStatus;
  assigned_to?: string;
  last_message_at: string; // ISO date string
  preview_message?: string;
}

export interface Message {
  id: string;
  chat_id: string;
  text: string;
  sender_type: 'user' | 'agent' | 'bot';
  created_at: string; // ISO date string
}

export interface SendMessagePayload {
  text: string;
}
