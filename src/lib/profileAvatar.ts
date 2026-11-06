import type { User } from '@supabase/supabase-js';

export function getGoogleProfilePhoto(user: User | null | undefined): string | null {
  if (!user) return null;

  const providers = Array.isArray(user.app_metadata?.providers)
    ? user.app_metadata.providers
    : [];
  if (user.app_metadata?.provider !== 'google' && !providers.includes('google')) {
    return null;
  }

  const candidate = user.user_metadata?.avatar_url ?? user.user_metadata?.picture;
  if (typeof candidate !== 'string') return null;

  try {
    return new URL(candidate).protocol === 'https:' ? candidate : null;
  } catch {
    return null;
  }
}
