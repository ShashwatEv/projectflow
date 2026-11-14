import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabase = createClient<any>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

window.projectFlowDesktop?.onAuthCallback((callbackUrl) => {
  void (async () => {
    try {
      const callback = new URL(callbackUrl);
      if (callback.protocol !== 'projectflow:' || callback.hostname !== 'auth' || callback.pathname !== '/callback') {
        return;
      }

      const errorDescription = callback.searchParams.get('error_description');
      if (errorDescription) throw new Error(errorDescription);

      const code = callback.searchParams.get('code');
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) throw error;
      } else {
        const tokens = new URLSearchParams(callback.hash.slice(1));
        const accessToken = tokens.get('access_token');
        const refreshToken = tokens.get('refresh_token');
        if (!accessToken || !refreshToken) throw new Error('The sign-in callback did not include a session.');
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (error) throw error;
      }

      window.location.hash = '/dashboard';
    } catch (error) {
      console.error('Desktop authentication callback failed:', error);
    }
  })();
});
