import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

interface MessageListProps {
  messages: Message[];
}

export function MessageList({ messages }: MessageListProps) {
  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={cn('flex gap-3', message.role === 'user' ? 'flex-row-reverse' : 'flex-row')}
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback>{message.role === 'user' ? 'U' : 'AI'}</AvatarFallback>
          </Avatar>
          <div
            className={cn(
              'max-w-[80%] rounded-lg px-4 py-2',
              message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
            )}
          >
            <p className="text-sm whitespace-pre-wrap">
              {message.content}
              {message.isStreaming && (
                <span className="ml-0.5 inline-block h-3 w-0.5 animate-pulse bg-current opacity-70" />
              )}
            </p>
            <p
              className={cn(
                'mt-1 text-xs',
                message.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
              )}
            >
              {message.timestamp.toLocaleTimeString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
