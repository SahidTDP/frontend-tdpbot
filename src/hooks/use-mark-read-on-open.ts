'use client';

import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useQueryClient } from '@tanstack/react-query';
import { Conversation } from '@/types';

export function useMarkReadOnOpen(chatId: string, conversation?: Conversation) {
  const queryClient = useQueryClient();
  const doneRef = useRef(false);
  useEffect(() => {
    if (!conversation) return;
    const unread = (conversation as any).unread_count || 0;
    if (doneRef.current) return;
    if (unread <= 0) return;
    doneRef.current = true;
    supabase.rpc('mark_conversation_read', { p_chat_id: chatId, p_agent_id: null }).then(() => {
      queryClient.setQueryData(['conversations'], (old: Conversation[] | undefined) => {
        if (!old) return old;
        return old.map((c) =>
          String(c.chat_id) === String(chatId) ? ({ ...c, unread_count: 0 } as any) : c
        );
      });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    });
  }, [chatId, conversation, queryClient]);
}
