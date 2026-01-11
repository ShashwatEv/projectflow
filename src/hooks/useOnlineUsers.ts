import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { RealtimeChannel } from '@supabase/supabase-js';

export function useOnlineUsers() {
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!user) return;

    // 1. Join a global 'online-users' channel
    const channel = supabase.channel('global_presence');

    channel
      .on('presence', { event: 'sync' }, () => {
        const newState = channel.presenceState();
        const onlineIds = new Set<string>();
        
        // Loop through all presence state to find user IDs
        for (const id in newState) {
           const presenceEntries = newState[id] as any[]; // Array of sessions for this user ID
           presenceEntries.forEach(entry => {
             if (entry.user_id) onlineIds.add(entry.user_id);
           });
        }
        setOnlineUsers(onlineIds);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // 2. Broadcast "I am here!"
          await channel.track({ 
            user_id: user.id, 
            online_at: new Date().toISOString() 
          });
        }
      });

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return onlineUsers;
}