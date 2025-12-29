import { ConversationList } from '@/features/inbox/conversation-list';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden flex-col md:flex-row">
      <aside className="md:w-80 w-full border-b md:border-r md:border-b-0 flex flex-col bg-background">
        <div className="p-4 border-b font-bold text-lg h-16 flex items-center justify-between">
          <span>Inbox</span>
        </div>
        <ConversationList />
      </aside>
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {children}
      </main>
    </div>
  );
}
