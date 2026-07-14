import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// Allow the app to work even without Supabase credentials (demo mode)
const isDemoMode = !supabaseUrl || supabaseUrl === 'https://your-project.supabase.co';

export const supabase = isDemoMode
  ? null
  : createClient(supabaseUrl, supabaseAnonKey);

export { isDemoMode };

/**
 * Get role label for display.
 */
export function getRoleLabel(role) {
  switch (role) {
    case 'super_admin': return 'Super Admin';
    case 'moderator': return 'Locality Moderator';
    default: return 'Citizen';
  }
}

/**
 * Get role icon emoji.
 */
export function getRoleIcon(role) {
  switch (role) {
    case 'super_admin': return '⚙️';
    case 'moderator': return '🛡️';
    default: return '👤';
  }
}

/**
 * Auto-detect role from email address (for demo / quick login).
 */
export function detectRoleFromEmail(email) {
  if (!email) return 'citizen';
  const lower = email.toLowerCase();
  if (lower.includes('admin')) return 'super_admin';
  if (lower.includes('mod') || lower.includes('subadmin')) return 'moderator';
  return 'citizen';
}
