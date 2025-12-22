'use client';

import { useConversations } from '@/hooks/use-conversations';
import { ConversationItem } from './conversation-item';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useParams } from 'next/navigation';

export function ConversationList() {
  // Fetch ALL conversations to debug connection
  const { data: conversations, isLoading, error } = useConversations(); 
  const params = useParams();
  const currentChatId = params?.chatId as string | undefined;

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="space-y-2">
             <div className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-12" />
             </div>
             <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500 text-sm">
        Error loading conversations. <br/>
        Check console logs.
      </div>
    );
  }

  if (!conversations?.length) {
    return <div className="p-4 text-center text-muted-foreground">No conversations found (List empty)</div>;
  }

  // Sort: last_message_at desc
  const sortedConversations = [...conversations].sort((a, b) => {
    const timeA = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
    const timeB = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
    return timeB - timeA;
  });

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col">
        {sortedConversations.map((conv) => (
          <ConversationItem 
            key={conv.chat_id} 
            conversation={conv} 
            isActive={currentChatId === conv.chat_id}
          />
        ))}
      </div>
    </ScrollArea>
  );
}
