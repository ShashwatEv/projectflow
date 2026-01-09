// --- TYPES ---
export type Attachment = {
  id: string;
  name: string;
  type: 'image' | 'file';
  url: string; // URL is now mandatory for preview
  size: string;
};

export type Reaction = {
  emoji: string;
  count: number;
  userReacted: boolean; // Did "I" click this?
};

export type Message = {
  id: string;
  text: string;
  sender: string;
  avatar: string;
  time: string;
  isMe: boolean;
  isEdited?: boolean;
  isPinned?: boolean;
  attachments?: Attachment[];
  reactions?: Reaction[]; // NEW: Store reactions here
};

export type Channel = {
  id: string;
  name: string;
  type: 'public' | 'private' | 'dm';
  description?: string;
  members?: { name: string; status: 'online' | 'offline' | 'busy'; avatar: string }[];
  unread?: number;
};

// --- AVATAR URLS (Constants) ---
export const AVATARS = {
  me: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80", // Shashwat
  alex: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  sarah: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  mike: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  bot: "https://cdn-icons-png.flaticon.com/512/4712/4712027.png"
};

// --- MOCK DATA ---
export const INITIAL_CHANNELS: Channel[] = [
  { 
    id: 'general', name: 'general', type: 'public', 
    description: 'General team announcements and discussions.',
    members: [
        { name: 'Sarah Chen', status: 'online', avatar: AVATARS.sarah },
        { name: 'Alex Morgan', status: 'busy', avatar: AVATARS.alex },
        { name: 'Mike Ross', status: 'offline', avatar: AVATARS.mike },
    ]
  },
  { id: 'design', name: 'design-team', type: 'public', unread: 2, description: 'Design specs, feedback, and assets.' },
  { id: 'dev', name: 'development', type: 'public', description: 'Code reviews and dev talk.' },
];

export const INITIAL_DMS: Channel[] = [
  { id: 'sarah', name: 'Sarah Chen', type: 'dm', members: [{ name: 'Sarah Chen', status: 'online', avatar: AVATARS.sarah }] },
  { id: 'alex', name: 'Alex Morgan', type: 'dm', members: [{ name: 'Alex Morgan', status: 'busy', avatar: AVATARS.alex }] },
];

export const MOCK_HISTORY: Record<string, Message[]> = {
  'general': [
    { 
      id: '1', sender: 'Alex Morgan', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', 
      text: 'Hey team, is the staging server down?', time: '10:30 AM', isMe: false, isPinned: true,
      reactions: [{ emoji: '👍', count: 2, userReacted: true }, { emoji: '👀', count: 1, userReacted: false }] 
    },
    { id: '2', sender: 'Mike Ross', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', text: 'Checking now...', time: '10:31 AM', isMe: false },
  ],
  'design': [
    { id: '1', sender: 'Sarah Chen', avatar: AVATARS.sarah, text: 'Here are the new icons for the sidebar.', time: '09:00 AM', isMe: false, attachments: [{id: 'a1', name: 'sidebar-icons.fig', type: 'file', size: '2.4 MB',url: '#'}] },
  ]
};