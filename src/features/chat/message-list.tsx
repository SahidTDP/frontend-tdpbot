'use client';

import { useEffect, useRef } from 'react';
import { useMessages } from '@/hooks/use-messages';
import { MessageBubble } from './message-bubble';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DateSeparator } from './date-separator';

interface MessageListProps {
  chatId: string;
}

export function MessageList({ chatId }: MessageListProps) {
  const { data: messages, isLoading } = useMessages(chatId);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      if (chatId === '51932430421') {
        const last = messages.slice(-5);
        console.log('[Debug] MessageList last 5 for', chatId, last.map(m => ({
          id: m.id,
          sender_type: m.sender_type,
          text: m.text,
          message_type: m.message_type,
          media_url: m.media_url,
          meta_raw: (m as any).meta?.raw,
          created_at: m.created_at,
        })));
      }
    }
  }, [messages]);

  if (isLoading) {
    return (
      <div className="flex-1 p-4 space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-2/3 rounded-lg" />
        ))}
      </div>
    );
  }

  if (!messages?.length) {
    return <div className="flex-1 p-4 flex items-center justify-center text-muted-foreground">No messages yet</div>;
  }

  const tz = 'America/Lima';
  const now = Date.now();
  const todayStr = new Date(now).toLocaleDateString('es-PE', { timeZone: tz });
  const yesterdayStr = new Date(now - 24 * 60 * 60 * 1000).toLocaleDateString('es-PE', { timeZone: tz });
  let lastDay = '';

  return (
    <ScrollArea className="flex-1 min-h-0 p-4 h-full">
      <div className="flex flex-col pb-4">
        {messages.map((msg) => {
          const dayKey = new Date(msg.created_at).toLocaleDateString('es-PE', { timeZone: tz });
          const label = dayKey === todayStr ? 'Hoy' : dayKey === yesterdayStr ? 'Ayer' : dayKey;
          const needSeparator = dayKey !== lastDay;
          lastDay = dayKey;
          return (
            <div key={msg.id}>
              {needSeparator && <DateSeparator label={label} />}
              <MessageBubble message={msg} />
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
