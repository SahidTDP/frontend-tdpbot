import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getSocket } from '@/lib/socket';
import { Message, Conversation } from '@/types';
import { toast } from 'sonner';

export function useSocketListener() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket = getSocket();

    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id);
    });

    socket.on('connect_error', (err) => {
      console.error('❌ Socket connection error:', err);
    });

    const onMessageNew = (message: Message) => {
      console.log('📩 Socket: message:new received', message);
      
      const chatId = String(message.chat_id); // Normalize to string

      // 1. DIRECT CACHE UPDATE (Optimistic UI)
      // This is the fastest way to show the message. We don't wait for refetch.
      queryClient.setQueryData(['messages', chatId], (oldData: Message[] | undefined) => {
        if (!oldData) {
            console.log('📝 Creating new message cache for', chatId);
            return [message];
        }
        
        // Avoid duplicates
        if (oldData.some(m => m.id === message.id)) {
            console.log('⚠️ Message already in cache, skipping');
            return oldData;
        }

        console.log('📝 Appending message to cache', chatId, 'Current count:', oldData.length);
        return [...oldData, message];
      });

      // 2. Also update conversation list preview/timestamp
      queryClient.setQueryData(['conversations'], (oldData: Conversation[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.map(conv => {
            if (String(conv.chat_id) === chatId) {
                return {
                    ...conv,
                    last_message_at: message.created_at || new Date().toISOString(),
                    // You might want to update preview_message here if available in your type
                };
            }
            return conv;
        }).sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime());
      });

      // 3. Background Validation (Fallbacks)
      // We still invalidate to ensure consistency eventually
      queryClient.invalidateQueries({ queryKey: ['messages', chatId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    };

    const onConversationUpdated = (conversation: Conversation) => {
      console.log('🔄 Socket: conversation:updated received', conversation);
      const chatId = String(conversation.chat_id);

      // Update specific conversation details
      queryClient.setQueryData(['conversation', chatId], (old: Conversation | undefined) => {
          if (!old) return conversation;
          return { ...old, ...conversation };
      });

      // Update in list
      queryClient.setQueryData(['conversations'], (oldData: Conversation[] | undefined) => {
          if (!oldData) return [conversation];
          const exists = oldData.some(c => String(c.chat_id) === chatId);
          if (exists) {
              return oldData.map(c => String(c.chat_id) === chatId ? { ...c, ...conversation } : c)
                            .sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime());
          }
          return [conversation, ...oldData]
                 .sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime());
      });
      
      // Fallback invalidation
      queryClient.invalidateQueries({ queryKey: ['conversation', chatId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    };

    socket.on('message:new', onMessageNew);
    socket.on('conversation:updated', onConversationUpdated);

    return () => {
      socket.off('message:new', onMessageNew);
      socket.off('conversation:updated', onConversationUpdated);
      socket.off('connect');
      socket.off('connect_error');
    };
  }, [queryClient]);
}
