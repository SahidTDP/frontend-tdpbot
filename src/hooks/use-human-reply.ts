import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { AGENT_ID } from '@/lib/agent';
import { toast } from 'sonner';

interface HumanReplyPayload {
  chat_id: string;
  agent_id: string;
  text: string;
}

export function useHumanReply(chatId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (text: string) => 
      api.post(`/messages/human-reply`, { 
        chat_id: chatId, 
        agent_id: AGENT_ID,
        text 
      } as HumanReplyPayload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', chatId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error) => {
      console.error('Failed to send reply:', error);
      toast.error('Error al enviar el mensaje. Intenta de nuevo.');
    }
  });
}
