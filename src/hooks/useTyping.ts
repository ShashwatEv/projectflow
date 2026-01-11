import { useState, useEffect, useRef } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

export function useTyping(channelName: string) {
  const { user } = useAuth();
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const typingTimeoutRef = useRef<any>(null);

  useEffect(() => {
    if (!user) return;

    // 1. Join the channel specifically for 'presence' (online status)
    const channel = supabase.channel(channelName);

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const typing = [];
        
        // Loop through all users in the channel
        for (const id in state) {
          const userState = state[id][0] as any;
          // If they are "typing" and it's NOT me
          if (userState.isTyping && userState.user_id !== user.id) {
            typing.push(userState.name); // Add their name to the list
          }
        }
        setTypingUsers(typing);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Initial status: I am NOT typing
          await channel.track({ user_id: user.id, name: user.email?.split('@')[0], isTyping: false });
        }
      });

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelName, user]);

  // 2. Function to call when YOU type
  const broadcastTyping = async () => {
    if (!channelRef.current || !user) return;

    // Tell everyone: "I am typing!"
    await channelRef.current.track({ 
      user_id: user.id, 
      name: user.email?.split('@')[0], 
      isTyping: true 
    });

    // Clear old timer
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    // Stop typing after 2 seconds of silence
    typingTimeoutRef.current = setTimeout(async () => {
      await channelRef.current?.track({ 
        user_id: user.id, 
        name: user.email?.split('@')[0], 
        isTyping: false 
      });
    }, 2000);
  };

  return { typingUsers, broadcastTyping };
}