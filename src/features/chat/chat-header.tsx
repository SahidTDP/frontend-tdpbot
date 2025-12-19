'use client';

import { Conversation } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useChatActions } from '@/hooks/use-chat-actions';
import { Loader2 } from 'lucide-react';

interface ChatHeaderProps {
  conversation: Conversation;
}

export function ChatHeader({ conversation }: ChatHeaderProps) {
  const { takeChat, closeChat, isTaking, isClosing } = useChatActions(conversation.chat_id);

  return (
    <div className="flex items-center justify-between p-4 border-b h-16 bg-background">
      <div className="flex items-center gap-3">
        <div className="flex flex-col">
          <h2 className="text-lg font-semibold leading-none">{conversation.chat_id}</h2>
          <div className="flex items-center gap-2 mt-1">
             <Badge variant={conversation.status === 'open' ? 'default' : 'secondary'} className="text-xs capitalize">
               {conversation.status}
             </Badge>
             {conversation.assigned_to && (
               <span className="text-xs text-muted-foreground">
                 Assigned to: {conversation.assigned_to}
               </span>
             )}
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        {conversation.status === 'open' && (
          <Button onClick={() => takeChat()} disabled={isTaking} size="sm">
            {isTaking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Take
          </Button>
        )}
        {conversation.status === 'assigned' && (
          <Button variant="outline" onClick={() => closeChat()} disabled={isClosing} size="sm">
            {isClosing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Close
          </Button>
        )}
      </div>
    </div>
  );
}
