import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { useAuth } from '../context/AuthContext';

export function useStudioPresence(projectId?: string, activeFile?: string) {
  const { user } = useAuth();
  const [activePeers, setActivePeers] = useState<any[]>([]);

  useEffect(() => {
    if (!projectId || !user?.id) return;

    // Use authentic profile avatar from AuthContext
    const userAny = user as any;
    const myAvatar = 
      user.avatar || 
      userAny.user_metadata?.avatar_url || 
      userAny.avatar_url || 
      '';

    const channel = supabase.channel(`studio_presence_${projectId}`, {
      config: {
        presence: {
          key: user.id, // Keying by user.id deduplicates multiple tabs or strict-mode sessions
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const peers: any[] = [];

        Object.entries(state).forEach(([key, presences]: [string, any]) => {
          // EXCLUDE YOURSELF: Only show real teammates who are not you
          if (key !== user.id) {
            presences.forEach((p: any) => peers.push(p));
          }
        });

        setActivePeers(peers);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            userId: user.id,
            name: user.name || user.email?.split('@')[0] || 'Engineer',
            avatar: myAvatar,
            activeFile: activeFile || '',
            onlineAt: new Date().toISOString(),
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, user?.id, activeFile]);

  return activePeers;
}