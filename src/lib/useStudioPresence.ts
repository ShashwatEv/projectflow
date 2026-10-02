import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

export interface PresenceUser {
  userId: string;
  name: string;
  activeFile: string;
}

export function useStudioPresence(projectId: string, activeFile: string) {
  const [activePeers, setActivePeers] = useState<PresenceUser[]>([]);

  useEffect(() => {
    if (!projectId) return;

    const channelName = `studio_presence_${projectId}`;
    const room = supabase.channel(channelName);

    room
      .on('presence', { event: 'sync' }, () => {
        const state = room.presenceState();
        const users: PresenceUser[] = [];
        Object.values(state).forEach((items: any) => {
          items.forEach((u: PresenceUser) => users.push(u));
        });
        setActivePeers(users);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await room.track({
            userId: localStorage.getItem('pf_user_id') || 'guest',
            name: localStorage.getItem('pf_user_name') || 'Team Member',
            activeFile,
          });
        }
      });

    return () => {
      supabase.removeChannel(room);
    };
  }, [projectId, activeFile]);

  return activePeers;
}