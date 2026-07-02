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
 * Detect role from email domain.
 * - *.sub.gov → sub_admin
 * - *.gov (but not .sub.gov) → admin
 * - anything else → citizen
 */
export function detectRoleFromEmail(email) {
  if (!email) return 'citizen';
  const lower = email.toLowerCase().trim();
  if (lower.endsWith('.sub.gov')) return 'sub_admin';
  if (lower.endsWith('.gov')) return 'admin';
  return 'citizen';
}

/**
 * Get role label for display.
 */
export function getRoleLabel(role) {
  switch (role) {
    case 'admin': return 'Admin';
    case 'sub_admin': return 'Sub-Admin';
    default: return 'Citizen';
  }
}

/**
 * Get role icon emoji.
 */
export function getRoleIcon(role) {
  switch (role) {
    case 'admin': return '⚙️';
    case 'sub_admin': return '🛡️';
    default: return '👤';
  }
}
