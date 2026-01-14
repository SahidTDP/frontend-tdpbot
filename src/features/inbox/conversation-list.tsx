'use client';

import { useConversations } from '@/hooks/use-conversations';
import { ConversationItem } from './conversation-item';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useParams } from 'next/navigation';
import { useMemo } from 'react';
import { useInboxFilters } from './inbox-filter-context';

export function ConversationList() {
  const { statuses: selectedStatuses, unreadOnly } = useInboxFilters();
  const { data: conversations, isLoading, error } = useConversations(); 
  const params = useParams();
  const currentChatId = params?.chatId as string | undefined;
  

  const list = conversations || [];
 
  const counts = useMemo(() => {
    const open = list.filter((c) => c.status === 'open').length;
    const assigned = list.filter((c) => c.status === 'assigned').length;
    const closed = list.filter((c) => c.status === 'closed').length;
    const unread = list.filter((c) => (c as any).unread_count > 0).length;
    return { open, assigned, closed, unread };
  }, [list]);
 
  const sortedConversations = useMemo(() => {
    let filtered = list;
    if (selectedStatuses.length) {
      filtered = filtered.filter((c) => selectedStatuses.includes(c.status as any));
    }
    if (unreadOnly) {
      filtered = filtered.filter((c) => ((c as any).unread_count || 0) > 0);
    }
    return [...filtered].sort((a, b) => {
      const unreadA = (a as any).unread_count ? Number((a as any).unread_count) : 0;
      const unreadB = (b as any).unread_count ? Number((b as any).unread_count) : 0;
      if (unreadA !== unreadB) return unreadB - unreadA;
      const timeA = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
      const timeB = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
      return timeB - timeA;
    });
  }, [list, selectedStatuses, unreadOnly]);
 
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
 
  if (!list.length) {
    return <div className="p-4 text-center text-muted-foreground">No conversations found (List empty)</div>;
  }
 
  return (
    <div className="flex flex-col md:h-full h-[calc(100vh-4rem)]">
      <ScrollArea className="flex-1 min-h-0">
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
    </div>
  );
}
