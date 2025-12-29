import Link from 'next/link';
import { Conversation } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { User, Lock, Clock } from 'lucide-react';
import { useRelativeTime } from '@/hooks/use-relative-time';
import { useChatActions } from '@/hooks/use-chat-actions';
import { AGENT_ID } from '@/lib/agent';
import { useAgents, getAgentName } from '@/hooks/use-agents';

interface ConversationItemProps {
  conversation: Conversation;
  isActive?: boolean;
}

export function ConversationItem({ conversation, isActive }: ConversationItemProps) {
  const { takeChat, isTaking } = useChatActions(conversation.chat_id);
  const rel = useRelativeTime(conversation.last_message_at, 30000);
  const { data: agents = [] } = useAgents();
  const assignedName = getAgentName(agents, conversation.assigned_to);
  const getStatusBadge = () => {
    switch (conversation.status) {
      case 'open':
        return (
          <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-[10px] px-1.5 py-0.5 gap-1">
            <Clock className="h-3 w-3" />
            Disponible
          </Badge>
        );
      case 'assigned':
        return (
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 gap-1">
            <User className="h-3 w-3" />
            {conversation.assigned_to === AGENT_ID ? 'Asignado a ti' : conversation.assigned_to ? 'Tomado' : 'Asignado'}
          </Badge>
        );
      case 'closed':
        return (
          <Badge variant="outline" className="text-muted-foreground text-[10px] px-1.5 py-0.5 gap-1">
            <Lock className="h-3 w-3" />
            Cerrado
          </Badge>
        );
    }
  };

  return (
    <Link
      href={`/chat/${conversation.chat_id}`}
      className={cn(
        "block p-3 border-b hover:bg-muted/50 transition-colors cursor-pointer",
        isActive && "bg-muted",
        conversation.status === 'open' && !isActive && "bg-green-50/50 dark:bg-green-950/20"
      )}
    >
      <div className="flex justify-between items-start mb-1.5">
        <span className="font-semibold truncate text-sm">
          {conversation.chat_id}
        </span>
        {conversation.last_message_at && (
          <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
            {rel}
          </span>
        )}
      </div>
      <div className="flex items-center justify-between gap-2 mb-2">
        <p className={cn(
          "text-sm truncate pr-2 flex-1",
          ((conversation as any).unread_count || 0) > 0 ? "font-medium text-foreground" : "text-muted-foreground"
        )}>
          {conversation.preview_message || ''}
        </p>
        {((conversation as any).unread_count || 0) > 0 && (
          <Badge variant="default" className="text-[10px] px-1.5 py-0.5">
            {Number((conversation as any).unread_count)}
          </Badge>
        )}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getStatusBadge()}
          {conversation.status !== 'open' && assignedName && (
            <span className="text-[10px] text-muted-foreground">
              Asignado a {String(conversation.assigned_to) === String(AGENT_ID) ? 'ti' : assignedName}
            </span>
          )}
        </div>
        {conversation.status === 'open' && !conversation.assigned_to && (
          <Button
            size="sm"
            disabled={isTaking}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              takeChat();
            }}
          >
            Tomar chat
          </Button>
        )}
      </div>
    </Link>
  );
}
