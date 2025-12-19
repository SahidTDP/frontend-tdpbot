import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getSocket } from '@/lib/socket';
import { Message, Conversation } from '@/types';

export function useSocketListener() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket = getSocket();

    const onMessageNew = (message: Message) => {
      // Update messages cache for this chat
      queryClient.setQueryData(['messages', message.chat_id], (old: Message[] | undefined) => {
        if (!old) return [message];
        // Check if already exists to avoid dupes
        if (old.find(m => m.id === message.id)) return old;
        return [...old, message];
      });
      
      // Also invalidate conversations to update last_message_at/preview
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    };

    const onConversationUpdated = (conversation: Conversation) => {
      // Update specific conversation cache
      queryClient.setQueryData(['conversation', conversation.chat_id], conversation);
      
      // Invalidate list to ensure sorting and filtering is correct
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    };

    socket.on('message:new', onMessageNew);
    socket.on('conversation:updated', onConversationUpdated);

    return () => {
      socket.off('message:new', onMessageNew);
      socket.off('conversation:updated', onConversationUpdated);
    };
  }, [queryClient]);
}
