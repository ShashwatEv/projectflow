import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Session } from '@supabase/supabase-js';

const SUPER_ADMIN_EMAIL = 'shashwatop69@gmail.com';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role?: string;
  location?: string;
  phone?: string;
  bio?: string;
  website?: string;
  bannerUrl?: string;
  // Verification flags
  is_verified?: boolean;
  email_verified?: boolean;
  phone_verified?: boolean;
  is_2fa_enabled?: boolean;
}

interface AuthContextType {
  session: Session | null;
  user: UserProfile | null;
  signOut: () => Promise<void>;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string, defaultEmail = '', metadata: Record<string, any> = {}) => {
    try {
      const isSuperAdmin = defaultEmail.toLowerCase().trim() === SUPER_ADMIN_EMAIL;

      // Use .maybeSingle() to prevent HTTP 406 when no row exists
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
      }

      if (data) {
        setUser({
          ...data,
          role: isSuperAdmin ? 'Admin' : (data.role || 'Member'),
          is_verified: Boolean(data.is_verified || isSuperAdmin),
          email_verified: Boolean(data.email_verified || isSuperAdmin),
          phone_verified: Boolean(data.phone_verified),
        });
      } else {
        // Fallback to auth metadata until the database row is populated
        setUser({
          id: userId,
          name: metadata.full_name || metadata.name || defaultEmail.split('@')[0] || 'User',
          email: defaultEmail,
          avatar: metadata.avatar_url || '/pfp.jpg',
          role: isSuperAdmin ? 'Admin' : 'Member',
          is_verified: isSuperAdmin,
          email_verified: isSuperAdmin,
          phone_verified: false,
        });
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (session?.user) {
      await fetchProfile(session.user.id, session.user.email ?? '', session.user.user_metadata);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email ?? '', session.user.user_metadata);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email ?? '', session.user.user_metadata);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Listen to realtime user table changes for the active session
  useEffect(() => {
    if (!session?.user?.id) return;

    const channel = supabase
      .channel(`auth_user_sync_${session.user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'users', filter: `id=eq.${session.user.id}` },
        () => {
          refreshProfile();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.user?.id]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ session, user, signOut, loading, refreshProfile }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};