import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

/**
 * Creates a browser client compatible with Supabase SSR helpers.
 * Reads environment variables exposed via Vite (`import.meta.env`).
 */
export const createClient = () => {
  if (!supabaseUrl || !supabaseKey || supabaseUrl === 'https://your-project.supabase.co') {
    return null;
  }
  return createBrowserClient(supabaseUrl, supabaseKey);
};
