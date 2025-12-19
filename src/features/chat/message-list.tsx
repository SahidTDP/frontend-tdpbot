'use client';

import { useEffect, useRef } from 'react';
import { useMessages } from '@/hooks/use-messages';
import { MessageBubble } from './message-bubble';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MessageListProps {
  chatId: string;
}

export function MessageList({ chatId }: MessageListProps) {
  const { data: messages, isLoading } = useMessages(chatId);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
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

  return (
    <ScrollArea className="flex-1 p-4 h-full">
      <div className="flex flex-col pb-4">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
