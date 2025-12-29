'use client';

import { Conversation } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useChatActions } from '@/hooks/use-chat-actions';
import { Loader2 } from 'lucide-react';
import { ensureAgentConfigured } from '@/lib/agent';
import { useAgents, getAgentName } from '@/hooks/use-agents';
import { AGENT_ID, AGENT_NAME } from '@/lib/agent';

interface ChatHeaderProps {
  conversation: Conversation;
}

export function ChatHeader({ conversation }: ChatHeaderProps) {
  const { takeChat, closeChat, isTaking, isClosing } = useChatActions(conversation.chat_id);
  const agentOk = ensureAgentConfigured();
  const { data: agents = [] } = useAgents();
  const assignedName = getAgentName(agents, conversation.assigned_to);

  return (
    <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b bg-background">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex flex-col">
          <h2 className="text-lg font-semibold leading-none truncate max-w-[60vw] md:max-w-[40vw]">{conversation.chat_id}</h2>
          <div className="flex items-center gap-2 mt-1">
             <Badge variant={conversation.status === 'open' ? 'default' : 'secondary'} className="text-xs capitalize">
               {conversation.status}
             </Badge>
             {conversation.assigned_to && (
               <span className="text-xs text-muted-foreground">
                 Asignado a: {String(conversation.assigned_to) === String(AGENT_ID) ? AGENT_NAME : (assignedName || conversation.assigned_to)}
               </span>
             )}
          </div>
        </div>
      </div>

      <div className="flex gap-2 shrink-0">
        {conversation.status === 'open' && (
          <Button onClick={() => takeChat()} disabled={isTaking || !agentOk} size="sm">
            {isTaking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Take
          </Button>
        )}
        {conversation.status === 'assigned' && (
          <Button variant="outline" onClick={() => closeChat()} disabled={isClosing || !agentOk} size="sm">
            {isClosing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Close
          </Button>
        )}
      </div>
    </div>
  );
}
