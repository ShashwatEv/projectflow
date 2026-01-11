import { Loader2 } from 'lucide-react';

interface TypingIndicatorProps {
  users: string[];
}

export default function TypingIndicator({ users }: TypingIndicatorProps) {
  if (users.length === 0) return null;

  // Format text: "Alex is typing..." or "Alex and Sam are typing..."
  const text = users.length === 1 
    ? `${users[0]} is typing...`
    : `${users.join(', ')} are typing...`;

  return (
    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 px-4 py-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex gap-1">
        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
      </div>
      <span className="font-medium">{text}</span>
    </div>
  );
}