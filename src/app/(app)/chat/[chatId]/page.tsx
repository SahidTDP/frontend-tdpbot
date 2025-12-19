import { ChatWindow } from '@/features/chat/chat-window';

interface PageProps {
  params: Promise<{ chatId: string }>;
}

export default async function ChatPage({ params }: PageProps) {
  const { chatId } = await params;
  return <ChatWindow chatId={chatId} />;
}
