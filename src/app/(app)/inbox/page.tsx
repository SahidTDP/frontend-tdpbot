import { MessageSquare } from 'lucide-react';

export default function InboxPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-4 text-center">
      <MessageSquare className="h-12 w-12 mb-4 opacity-20" />
      <h3 className="font-semibold text-lg">Select a conversation</h3>
      <p className="text-sm">Choose a chat from the sidebar to start messaging</p>
    </div>
  );
}
