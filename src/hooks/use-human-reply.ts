import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { AGENT_ID, ensureAgentConfigured } from '@/lib/agent';
import { toast } from 'sonner';
import { postAgentMessage } from '@/lib/edge';

interface HumanReplyPayload {
  chat_id: string;
  agent_id: string;
  text: string;
}

export function useHumanReply(chatId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (text: string) => {
      if (!ensureAgentConfigured()) {
        toast.error('Agent ID no configurado. Configura NEXT_PUBLIC_AGENT_ID.');
        throw new Error('NEXT_PUBLIC_AGENT_ID no configurado');
      }
      await postAgentMessage(chatId, text);
    },
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
