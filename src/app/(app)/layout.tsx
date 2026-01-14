import { ConversationList } from '@/features/inbox/conversation-list';
import { InboxHeader } from '@/features/inbox/inbox-header';
import { InboxFilterProvider } from '@/features/inbox/inbox-filter-context';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col md:flex-row">
      <aside className="md:w-80 w-full md:border-r border-b md:border-b-0 flex flex-col bg-background sticky top-0 z-20 md:static md:z-auto">
        <InboxFilterProvider>
          <InboxHeader />
          <ConversationList />
        </InboxFilterProvider>
      </aside>
      <main className="flex-1 flex flex-col relative min-h-0">
        {children}
      </main>
    </div>
  );
}
