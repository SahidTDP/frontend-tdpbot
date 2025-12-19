import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { AGENT_ID } from '@/lib/agent';
import { toast } from 'sonner';
import { AxiosError } from 'axios';

export function useChatActions(chatId: string) {
  const queryClient = useQueryClient();

  const takeMutation = useMutation({
    mutationFn: () => api.post(`/conversations/${chatId}/take`, { agent_id: AGENT_ID }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversation', chatId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      toast.success('Chat asignado correctamente');
    },
    onError: (error: AxiosError) => {
      if (error.response?.status === 409) {
        toast.error('Este chat ya fue tomado por otro agente');
      } else {
        toast.error('Error al tomar el chat');
      }
    }
  });

  const closeMutation = useMutation({
    mutationFn: () => api.post(`/conversations/${chatId}/close`, { agent_id: AGENT_ID }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversation', chatId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      toast.success('Chat cerrado');
    },
    onError: () => {
      toast.error('Error al cerrar el chat');
    }
  });

  return {
    takeChat: takeMutation.mutate,
    isTaking: takeMutation.isPending,
    closeChat: closeMutation.mutate,
    isClosing: closeMutation.isPending,
  };
}
