'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useHumanReply } from '@/hooks/use-human-reply';
import { Loader2, Send, Lock, UserX } from 'lucide-react';
import { Conversation } from '@/types';
import { AGENT_ID } from '@/lib/agent';

interface ChatInputProps {
  chatId: string;
  conversation: Conversation;
}

export function ChatInput({ chatId, conversation }: ChatInputProps) {
  const [content, setContent] = useState('');
  const { mutate: sendReply, isPending } = useHumanReply(chatId);

  const handleSend = () => {
    if (!content.trim()) return;
    sendReply(content, {
      onSuccess: () => setContent('')
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Logic for blocking
  let isBlocked = false;
  let blockReason = '';
  let BlockIcon = Lock;

  if (conversation.status === 'open') {
    isBlocked = true;
    blockReason = 'Debes tomar el chat para responder';
  } else if (conversation.status === 'closed') {
    isBlocked = true;
    blockReason = 'Conversación cerrada';
  } else if (conversation.status === 'assigned') {
    if (conversation.assigned_to !== AGENT_ID) {
      isBlocked = true;
      blockReason = `Asignado a ${conversation.assigned_to}`;
      BlockIcon = UserX;
    }
  }

  if (isBlocked) {
    return (
      <div className="p-4 border-t bg-muted/30 flex items-center justify-center text-muted-foreground gap-2 h-[82px]">
        <BlockIcon className="h-4 w-4" />
        <span className="text-sm font-medium">{blockReason}</span>
      </div>
    );
  }

  return (
    <div className="p-4 border-t bg-background">
      <div className="flex gap-2">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe una respuesta..."
          disabled={isPending}
          className="min-h-[50px] resize-none focus-visible:ring-1"
        />
        <Button 
          onClick={handleSend} 
          disabled={isPending || !content.trim()}
          className="h-[50px] w-[50px] shrink-0"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
