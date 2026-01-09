export type UserStatus = 'online' | 'busy' | 'away' | 'offline';

export interface User {
  id: string;
  name: string;
  avatar: string;
  status: UserStatus;
  email?: string; // Added for Database linking
}

export interface Attachment {
  id: string;   // Storage path
  name: string;
  type: 'image' | 'file';
  url: string;  // Public URL
  size: number; // Changed to number for easier math
}

export interface Reaction {
  emoji: string;
  count: number;
  userReacted: boolean;
}

export interface Message {
  id: string;
  text: string;
  senderId: string; // Maps to user_id in DB
  timestamp: string; // Display time (e.g. "10:30 AM")
  created_at: string; // DB ISO string for sorting
  attachments?: Attachment[];
  reactions?: Reaction[];
  replyCount?: number;
}

export interface Channel {
  id: string;
  name: string;
  type: 'channel' | 'dm';
  unreadCount?: number; 
}

export interface Thread {
  parentMessageId: string;
  messages: Message[];
}

// For Realtime Presence
export interface TypingState {
  user_id: string;
  username: string;
  isTyping: boolean;
}