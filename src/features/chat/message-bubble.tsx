import { Message } from '@/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.sender_type === 'user';
  
  return (
    <div className={cn(
      "flex w-full mb-4",
      isUser ? "justify-start" : "justify-end"
    )}>
      <div className={cn(
        "max-w-[70%] rounded-lg px-4 py-2 text-sm",
        isUser 
          ? "bg-muted text-foreground rounded-tl-none" 
          : "bg-primary text-primary-foreground rounded-tr-none"
      )}>
        <p className="whitespace-pre-wrap break-words">{message.text}</p>
        <div className={cn(
          "text-[10px] mt-1 text-right opacity-70",
        )}>
          {format(new Date(message.created_at), 'HH:mm')}
        </div>
      </div>
    </div>
  );
}
