import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { AGENT_ID, ensureAgentConfigured } from '@/lib/agent';
import { toast } from 'sonner';
import { postAgentMessage } from '@/lib/edge';
import { useActiveChat } from '@/components/active-chat-context';
import type { Message, Conversation } from '@/types';
import { useHumanReply } from './use-human-reply';

export function useChatActions(chatId: string) {
  const queryClient = useQueryClient();
  const { activeChatId } = useActiveChat();
  const { mutateAsync: sendReply } = useHumanReply(chatId);

  const takeMutation = useMutation({
    mutationFn: async () => {
      if (!ensureAgentConfigured()) {
        toast.error('Agent ID no configurado. Configura NEXT_PUBLIC_AGENT_ID.');
        throw new Error('NEXT_PUBLIC_AGENT_ID no configurado');
      }
      const { data: agent, error: agentErr } = await supabase
        .from('agents')
        .select('id,is_active,name')
        .eq('id', AGENT_ID)
        .single();
      if (agentErr || !agent) {
        toast.error('Agente no encontrado en la base de datos');
        throw new Error('Agente no encontrado');
      }
      if (!agent.is_active) {
        toast.error('Agente inactivo, activa el agente para tomar casos');
        throw new Error('Agente inactivo');
      }
      const { data: takeData, error: takeErr } = await supabase.rpc('take_conversation', { p_chat_id: chatId, p_agent_id: AGENT_ID });
      if (takeErr) throw takeErr;
      const ok = (takeData?.ok ?? true) as boolean;
      if (ok) {
        const text = `${agent.name} ha entrado al chat`;
        await sendReply(text);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversation', chatId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      toast.success('Chat asignado correctamente');
      const nowIso = new Date().toISOString();
      const preview = 'Ha entrado al chat';
      queryClient.setQueryData(['conversations'], (old: Conversation[] | undefined) => {
        if (!old) return old;
        return old.map((c) =>
          String(c.chat_id) === String(chatId)
            ? ({ ...c, status: 'assigned', assigned_to: AGENT_ID, last_message_at: nowIso, preview_message: preview } as any)
            : c
        ).sort(
          (a, b) =>
            new Date(b.last_message_at).getTime() -
            new Date(a.last_message_at).getTime()
        );
      });
      // Optimistic preview only (messages will arrive via Realtime)
    },
    onError: (error: any) => {
      const msg = String(error?.message || '').toLowerCase();
      if (msg.includes('conflict') || msg.includes('assigned')) {
        toast.error('Este chat ya fue tomado por otro agente');
      } else {
        if ((error as any)?.code === '404') {
          toast.error('RPC take_conversation no disponible (404). Verifica que exista en Supabase (schema chatbot).');
        } else {
          toast.error('Error al tomar el chat');
        }
      }
    }
  });

  const closeMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc('close_conversation', { p_chat_id: chatId });
      if (error) throw error;
    },
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
