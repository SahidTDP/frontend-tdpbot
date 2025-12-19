import { useQuery } from '@tanstack/react-query';
import { api, fetcher } from '@/lib/api';
import { Conversation } from '@/types';

export function useConversations(status?: string) {
  return useQuery<Conversation[]>({
    queryKey: ['conversations', status],
    queryFn: () => fetcher(`/conversations${status ? `?status=${status}` : ''}`),
  });
}

export function useConversation(chatId: string) {
  // Try to find in cache first or fetch individual if needed
  // Assuming GET /conversations/:chatId exists for direct access
  return useQuery<Conversation>({
    queryKey: ['conversation', chatId],
    queryFn: () => fetcher(`/conversations/${chatId}`),
    enabled: !!chatId,
  });
}
