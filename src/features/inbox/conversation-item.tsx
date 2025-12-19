import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Conversation } from '@/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { User, Lock, Clock } from 'lucide-react';

interface ConversationItemProps {
  conversation: Conversation;
  isActive?: boolean;
}

export function ConversationItem({ conversation, isActive }: ConversationItemProps) {
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
            {conversation.assigned_to ? `Asignado a ${conversation.assigned_to}` : 'Asignado'}
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
            {formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: true, locale: es })}
          </span>
        )}
      </div>
      
      <div className="flex justify-between items-center mb-2">
        <p className={cn(
          "text-sm truncate pr-2 flex-1",
          conversation.status === 'open' ? "font-medium text-foreground" : "text-muted-foreground"
        )}>
          {conversation.preview_message || "Sin mensajes"}
        </p>
      </div>

      <div className="flex items-center">
        {getStatusBadge()}
      </div>
    </Link>
  );
}
