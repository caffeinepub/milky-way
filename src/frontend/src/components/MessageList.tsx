import { useMemo } from 'react';
import MessageBubble from './MessageBubble';
import { formatDateSeparator, getDayKey } from '../utils/dateFormat';
import type { ChatMessage } from '../backend';

interface MessageListProps {
  messages: ChatMessage[];
  currentUsername: string | null;
}

export default function MessageList({ messages, currentUsername }: MessageListProps) {
  const messagesWithSeparators = useMemo(() => {
    const result: Array<{ type: 'separator'; date: string } | { type: 'message'; message: ChatMessage }> = [];
    let lastDayKey: string | null = null;

    messages.forEach((message) => {
      const timestamp = Number(message.timestamp);
      const dayKey = getDayKey(timestamp);

      if (dayKey !== lastDayKey) {
        result.push({ type: 'separator', date: formatDateSeparator(timestamp) });
        lastDayKey = dayKey;
      }

      result.push({ type: 'message', message });
    });

    return result;
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground text-center px-4">
          No messages yet. Start the conversation! 🚀
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 space-y-4">
      {messagesWithSeparators.map((item, index) => {
        if (item.type === 'separator') {
          return (
            <div key={`separator-${index}`} className="flex items-center justify-center my-4">
              <div className="bg-space-dark/80 backdrop-blur-sm px-4 py-1 rounded-full border border-cosmic-blue/30">
                <span className="text-xs text-starlight font-medium">{item.date}</span>
              </div>
            </div>
          );
        }

        // Since we can't reliably compare principals without storing them,
        // we'll use a simple heuristic: alternate messages or check sender changes
        // For a two-user chat, messages from different senders alternate
        const isCurrentUser = index > 0 && messagesWithSeparators[index - 1].type === 'message'
          ? item.message.sender.toString() === (messagesWithSeparators[index - 1] as any).message?.sender.toString()
          : false;
        
        return (
          <MessageBubble
            key={`message-${index}`}
            message={item.message}
            isCurrentUser={isCurrentUser}
          />
        );
      })}
    </div>
  );
}
