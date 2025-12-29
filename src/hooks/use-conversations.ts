import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Conversation } from '@/types';

export function useConversations(status?: string, unreadOnly?: boolean) {
  return useQuery<Conversation[]>({
    queryKey: ['conversations', status, unreadOnly],
    queryFn: async () => {
      const query = supabase
        .from('conversations')
        .select('*')
        .order('last_message_at', { ascending: false });
      if (status) query.eq('status', status);
      if (unreadOnly) query.gt('unread_count', 0);
      const { data, error } = await query;
      if (error) {
        console.error('Error fetching conversations:', error);
        throw error;
      }
      const list = (data || []) as Conversation[];
      return list;
    },
  });
}

export function useConversation(chatId: string) {
  return useQuery<Conversation>({
    queryKey: ['conversation', chatId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('chat_id', chatId)
        .single();
      if (error) {
        console.error('Error fetching conversation:', error);
        throw error;
      }
      return data as Conversation;
    },
    enabled: !!chatId,
  });
}
