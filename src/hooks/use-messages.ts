import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Message, SendMessagePayload } from '@/types';
import { AGENT_ID, ensureAgentConfigured } from '@/lib/agent';
import { postAgentMessage } from '@/lib/edge';
import { useActiveChat } from '@/components/active-chat-context';

export function useMessages(chatId: string) {
  const { setActiveChatId, setActiveConversationId } = useActiveChat();

  return useQuery<Message[]>({
    queryKey: ['messages', chatId],
    queryFn: async () => {
      const { data: conv, error: e1 } = await supabase
        .from('conversations')
        .select('id, chat_id, status, assigned_to, hitl_locked')
        .eq('chat_id', chatId)
        .single();
      if (e1) {
        console.error('Error fetching conversation for messages:', e1);
        throw e1;
      }
      setActiveChatId(chatId);
      setActiveConversationId(conv.id as string);
      const { data: msgs, error: e2 } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conv.id)
        .order('created_at', { ascending: true });
      if (e2) {
        console.error('Error fetching messages:', e2);
        throw e2;
      }
      return (msgs || []) as Message[];
    },
    enabled: !!chatId,
  });
}

export function useSendMessage(chatId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: SendMessagePayload) => {
      if (!ensureAgentConfigured()) {
        throw new Error('NEXT_PUBLIC_AGENT_ID no configurado');
      }
      await postAgentMessage(chatId, payload.text);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', chatId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}
