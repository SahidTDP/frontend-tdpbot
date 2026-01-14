'use client';

import { InboxFilters } from './inbox-filters';
import { useConversations } from '@/hooks/use-conversations';
import { useInboxFilters } from './inbox-filter-context';

export function InboxHeader() {
  const { data: conversations = [] } = useConversations();
  const { setStatuses, setUnreadOnly } = useInboxFilters();
  const counts = {
    open: conversations.filter((c) => c.status === 'open').length,
    assigned: conversations.filter((c) => c.status === 'assigned').length,
    closed: conversations.filter((c) => c.status === 'closed').length,
    unread: conversations.filter((c: any) => c.unread_count > 0).length,
  };
  return (
    <div className="border-b bg-background">
      <div className="p-4 font-bold text-lg h-16 flex items-center justify-between">
        <span>Inbox</span>
      </div>
      <InboxFilters
        counts={counts}
        onChange={(f) => {
          setStatuses(f.statuses);
          setUnreadOnly(f.unreadOnly);
        }}
      />
    </div>
  );
}

