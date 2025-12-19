import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, fetcher } from '@/lib/api';
import { Message, SendMessagePayload } from '@/types';
import { AGENT_ID } from '@/lib/agent';

export function useMessages(chatId: string) {
  return useQuery<Message[]>({
    queryKey: ['messages', chatId],
    queryFn: () => fetcher(`/conversations/${chatId}/messages`),
    enabled: !!chatId,
  });
}

export function useSendMessage(chatId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SendMessagePayload) => 
      api.post(`/messages/send`, { 
        chat_id: chatId, 
        agent_id: AGENT_ID,
        ...payload 
      }),
    onSuccess: (data) => {
      // Optimistically update or invalidate
      // For now, let's invalidate
      queryClient.invalidateQueries({ queryKey: ['messages', chatId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}
