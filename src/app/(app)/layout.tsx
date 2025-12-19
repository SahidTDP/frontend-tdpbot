import { ConversationList } from '@/features/inbox/conversation-list';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="w-80 border-r flex flex-col bg-background">
        <div className="p-4 border-b font-bold text-lg h-16 flex items-center">
          Inbox
        </div>
        <ConversationList />
      </aside>
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {children}
      </main>
    </div>
  );
}
