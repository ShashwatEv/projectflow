import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Session } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role?: string;
  location?: string;
  phone?: string;
  bannerUrl?: string;
}

interface AuthContextType {
  session: Session | null;
  user: UserProfile | null;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

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

  const fetchProfile = async (userId: string, defaultEmail = '', metadata: Record<string, any> = {}) => {
    try {
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
        setUser(data);
      } else {
        // Fallback to auth metadata until the database row is populated
        setUser({
          id: userId,
          name: metadata.full_name || metadata.name || defaultEmail.split('@')[0] || 'User',
          email: defaultEmail,
          avatar: metadata.avatar_url || '',
          role: 'Member'
        });
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ session, user, signOut, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};