import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, isDemoMode } from './supabase';
import { hasPermission, getDefaultPath, ROLES } from './permissions';

const AuthContext = createContext(null);

/** Set to false to re-enable real authentication */
export const AUTH_DISABLED = true;

const DEMO_USERS = {
  citizen: {
    id: 'user-citizen-demo',
    email: 'citizen@civicpulse.app',
    name: 'Aarav Mehta',
    role: 'citizen',
    locality_id: 'kothrud',
    assigned_locality_id: null,
    avatar_url: null,
    impact_score: 450,
  },
  moderator: {
    id: 'user-moderator-demo',
    email: 'moderator@civicpulse.app',
    name: 'Arjun Menon',
    role: 'moderator',
    locality_id: 'kothrud',
    assigned_locality_id: 'kothrud',
    avatar_url: null,
    impact_score: 0,
  },
  super_admin: {
    id: 'user-admin-demo',
    email: 'admin@civicpulse.app',
    name: 'Commissioner Singh',
    role: 'super_admin',
    locality_id: null,
    assigned_locality_id: null,
    avatar_url: null,
    impact_score: 0,
  },
};

/**
 * AuthProvider manages authentication state.
 *
 * In DEMO MODE / AUTH_DISABLED:
 *   - Uses open access with switchable roles
 *   - No real auth required
 *
 * In PRODUCTION MODE:
 *   - Uses Supabase auth
 *   - Role comes from the users table
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('citizen');
  const [assignedLocalityId, setAssignedLocalityId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state
  useEffect(() => {
    if (AUTH_DISABLED || isDemoMode) {
      const savedSession = localStorage.getItem('civicpulse_demo_session');
      if (savedSession) {
        try {
          const session = JSON.parse(savedSession);
          const demoUser = DEMO_USERS[session.role] || DEMO_USERS.citizen;
          setUser(demoUser);
          setRole(demoUser.role);
          setAssignedLocalityId(demoUser.assigned_locality_id);
          setLoading(false);
          return;
        } catch {
          localStorage.removeItem('civicpulse_demo_session');
        }
      }
      // Default to citizen
      setUser(DEMO_USERS.citizen);
      setRole('citizen');
      setAssignedLocalityId(null);
      setLoading(false);
      return;
    }

    // Production: Supabase auth
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserProfile(session.user.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setUser(null);
        setRole('citizen');
        setAssignedLocalityId(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function loadUserProfile(userId) {
    if (!supabase) return;
    try {
      const { data, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (fetchError || !data) {
        setRole('citizen');
        return;
      }

      setUser(data);
      setRole(data.role || 'citizen');
      setAssignedLocalityId(data.assigned_locality_id);
    } catch {
      setRole('citizen');
    }
  }

  // Sign in with email + password
  const signIn = useCallback(async (email, password) => {
    setError(null);

    if (isDemoMode) {
      // In demo mode, determine role from email
      let demoRole = 'citizen';
      if (email.includes('admin')) demoRole = 'super_admin';
      else if (email.includes('mod')) demoRole = 'moderator';

      const demoUser = DEMO_USERS[demoRole];
      localStorage.setItem('civicpulse_demo_session', JSON.stringify({ role: demoRole }));
      setUser(demoUser);
      setRole(demoUser.role);
      setAssignedLocalityId(demoUser.assigned_locality_id);
      return { user: demoUser, error: null };
    }

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) {
        setError(authError.message);
        return { user: null, error: authError.message };
      }
      return { user: data.user, error: null };
    } catch (err) {
      setError(err.message);
      return { user: null, error: err.message };
    }
  }, []);

  // Sign up
  const signUp = useCallback(async (email, password, name) => {
    setError(null);

    if (isDemoMode) {
      const demoUser = { ...DEMO_USERS.citizen, name: name || 'New User', email };
      localStorage.setItem('civicpulse_demo_session', JSON.stringify({ role: 'citizen' }));
      setUser(demoUser);
      setRole('citizen');
      return { user: demoUser, error: null };
    }

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      });
      if (authError) {
        setError(authError.message);
        return { user: null, error: authError.message };
      }
      return { user: data.user, error: null };
    } catch (err) {
      setError(err.message);
      return { user: null, error: err.message };
    }
  }, []);

  // Sign in with phone OTP
  const signInWithPhone = useCallback(async (phone) => {
    setError(null);
    if (!supabase) {
      setError('Phone auth requires Supabase credentials.');
      return { error: 'Phone auth requires Supabase credentials.' };
    }
    try {
      const { error: authError } = await supabase.auth.signInWithOtp({ phone });
      if (authError) {
        setError(authError.message);
        return { error: authError.message };
      }
      return { error: null };
    } catch (err) {
      setError(err.message);
      return { error: err.message };
    }
  }, []);

  // Verify phone OTP
  const verifyPhoneOTP = useCallback(async (phone, token) => {
    setError(null);
    if (!supabase) {
      setError('Phone auth requires Supabase credentials.');
      return { error: 'Phone auth requires Supabase credentials.' };
    }
    try {
      const { data, error: authError } = await supabase.auth.verifyOtp({
        phone, token, type: 'sms',
      });
      if (authError) {
        setError(authError.message);
        return { error: authError.message };
      }
      return { user: data.user, error: null };
    } catch (err) {
      setError(err.message);
      return { error: err.message };
    }
  }, []);

  // Sign out
  const signOut = useCallback(async () => {
    if (AUTH_DISABLED || isDemoMode) {
      localStorage.removeItem('civicpulse_demo_session');
      setUser(DEMO_USERS.citizen);
      setRole('citizen');
      setAssignedLocalityId(null);
      return;
    }
    await supabase.auth.signOut();
    setUser(null);
    setRole('citizen');
    setAssignedLocalityId(null);
  }, []);

  // Switch role (demo mode only)
  const switchRole = useCallback((newRole) => {
    const validRoles = ['citizen', 'moderator', 'super_admin'];
    if (!validRoles.includes(newRole)) return;

    const demoUser = DEMO_USERS[newRole];
    setUser(demoUser);
    setRole(demoUser.role);
    setAssignedLocalityId(demoUser.assigned_locality_id);
    localStorage.setItem('civicpulse_demo_session', JSON.stringify({ role: newRole }));
  }, []);

  /**
   * Permission helper — check if current user can do an action
   */
  const can = useCallback((action) => {
    return hasPermission(role, action);
  }, [role]);

  const value = {
    user: user || (AUTH_DISABLED ? DEMO_USERS.citizen : null),
    role: role || 'citizen',
    assignedLocalityId,
    loading: AUTH_DISABLED ? false : loading,
    error,
    isAuthenticated: AUTH_DISABLED ? true : !!user,
    isDemoMode: AUTH_DISABLED || isDemoMode,
    authDisabled: AUTH_DISABLED,
    can,
    signUp,
    signIn,
    signInWithPhone,
    verifyPhoneOTP,
    signOut,
    switchRole,
    clearError: () => setError(null),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

export default AuthContext;
