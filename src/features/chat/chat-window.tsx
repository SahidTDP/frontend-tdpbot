'use client';

import { useConversation } from '@/hooks/use-conversations';
import { ChatHeader } from './chat-header';
import { MessageList } from './message-list';
import { ChatInput } from './chat-input';
import { Skeleton } from '@/components/ui/skeleton';

interface ChatWindowProps {
  chatId: string;
}

export function ChatWindow({ chatId }: ChatWindowProps) {
  const { data: conversation, isLoading } = useConversation(chatId);

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="h-16 border-b p-4 flex items-center">
           <Skeleton className="h-8 w-48" />
        </div>
        <div className="flex-1 p-4">
           <Skeleton className="h-full w-full" />
        </div>
      </div>
    );
  }

  if (!conversation) {
    return <div className="flex items-center justify-center h-full text-muted-foreground">Conversation not found</div>;
  }

  return (
    <div className="flex flex-col h-full bg-background/50">
      <ChatHeader conversation={conversation} />
      <MessageList chatId={chatId} />
      <ChatInput chatId={chatId} conversation={conversation} />
    </div>
  );
}
