import type { Session } from '@supabase/supabase-js';
import type { UserProfile } from '../context/AuthContext';

// ---------------------------------------------------------------------------
// Super-admin identity
// ---------------------------------------------------------------------------
export const SUPER_ADMIN_EMAIL: string =
  (import.meta.env.VITE_SUPER_ADMIN_EMAIL as string | undefined)
    ?.toLowerCase()
    .trim() || 'shashwatop69@gmail.com';

/**
 * Returns true when the supplied email or user is considered an admin.
 * Matches:
 *  - Configured VITE_SUPER_ADMIN_EMAIL or default 'shashwatop69@gmail.com'
 *  - Any user with role === 'Admin' or 'admin'
 */
export function isSuperAdmin(
  emailOrUser?: string | UserProfile | null,
  role?: string | null
): boolean {
  if (!emailOrUser) return false;

  // Handle UserProfile object
  if (typeof emailOrUser === 'object') {
    if (emailOrUser.role?.toLowerCase() === 'admin') return true;
    return isSuperAdmin(emailOrUser.email, emailOrUser.role);
  }

  // Handle role passed as second arg
  if (role && role.toLowerCase() === 'admin') return true;

  const cleanEmail = emailOrUser.toLowerCase().trim();
  if (SUPER_ADMIN_EMAIL && cleanEmail === SUPER_ADMIN_EMAIL) return true;
  if (cleanEmail === 'shashwatop69@gmail.com') return true;
  return false;
}

// ---------------------------------------------------------------------------
// Verification helpers
// ---------------------------------------------------------------------------

/**
 * Returns true when the user's account is considered fully verified.
 * An account is verified when:
 *  - The user is an admin or super-admin, OR
 *  - The database `is_verified` flag is set, OR
 *  - The Supabase auth session has a confirmed email timestamp, OR
 *  - `email_verified` is true.
 */
export function isUserVerified(
  user: UserProfile | null | undefined,
  session?: Session | null
): boolean {
  if (!user) return false;
  if (isSuperAdmin(user)) return true;
  if (user.role?.toLowerCase() === 'admin') return true;
  if (Boolean(user.is_verified)) return true;
  if (Boolean(user.email_verified)) return true;
  if (session?.user?.email_confirmed_at) return true;
  return false;
}
