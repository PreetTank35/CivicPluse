import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, isDemoMode, detectRoleFromEmail, getRoleLabel } from './supabase';
import { getCurrentUser, setCurrentRole as setStoreRole, getCurrentRole as getStoreRole } from '../data/store';

const AuthContext = createContext(null);

/**
 * AuthProvider manages authentication state.
 * 
 * In DEMO MODE (no Supabase credentials):
 *   - Uses localStorage mock auth
 *   - Supports role switching for testing
 * 
 * In PRODUCTION MODE:
 *   - Uses Supabase auth
 *   - Auto-detects role from email domain
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('citizen');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state
  useEffect(() => {
    if (isDemoMode) {
      // Demo mode: check localStorage for mock session
      const demoSession = localStorage.getItem('civicpulse_demo_session');
      if (demoSession) {
        try {
          const session = JSON.parse(demoSession);
          setUser(session.user);
          setRole(session.role);
          setStoreRole(session.role);
        } catch {
          // Invalid session, clear it
          localStorage.removeItem('civicpulse_demo_session');
        }
      }
      setLoading(false);
      return;
    }

    // Production: Supabase auth
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const detectedRole = detectRoleFromEmail(session.user.email);
        // Check if user has a manually selected role stored
        const storedRole = session.user.user_metadata?.role || detectedRole;
        setUser(session.user);
        setRole(storedRole);
        setStoreRole(storedRole);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const detectedRole = detectRoleFromEmail(session.user.email);
        const storedRole = session.user.user_metadata?.role || detectedRole;
        setUser(session.user);
        setRole(storedRole);
        setStoreRole(storedRole);
      } else {
        setUser(null);
        setRole('citizen');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Sign up with email + password
  const signUp = useCallback(async (email, password, selectedRole) => {
    setError(null);

    if (isDemoMode) {
      const detectedRole = detectRoleFromEmail(email);
      const finalRole = selectedRole || detectedRole;
      const mockUser = {
        id: `demo-${Date.now()}`,
        email,
        user_metadata: { role: finalRole, full_name: email.split('@')[0] },
      };
      const session = { user: mockUser, role: finalRole };
      localStorage.setItem('civicpulse_demo_session', JSON.stringify(session));
      setUser(mockUser);
      setRole(finalRole);
      setStoreRole(finalRole);
      return { user: mockUser, error: null };
    }

    try {
      const detectedRole = detectRoleFromEmail(email);
      const finalRole = selectedRole || detectedRole;
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { role: finalRole },
        },
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

  // Sign in with email + password
  const signIn = useCallback(async (email, password) => {
    setError(null);

    if (isDemoMode) {
      const detectedRole = detectRoleFromEmail(email);
      const mockUser = {
        id: `demo-${Date.now()}`,
        email,
        user_metadata: { role: detectedRole, full_name: email.split('@')[0] },
      };
      const session = { user: mockUser, role: detectedRole };
      localStorage.setItem('civicpulse_demo_session', JSON.stringify(session));
      setUser(mockUser);
      setRole(detectedRole);
      setStoreRole(detectedRole);
      return { user: mockUser, error: null };
    }

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
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

    if (isDemoMode) {
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

    if (isDemoMode) {
      setError('Phone auth requires Supabase credentials.');
      return { error: 'Phone auth requires Supabase credentials.' };
    }

    try {
      const { data, error: authError } = await supabase.auth.verifyOtp({
        phone,
        token,
        type: 'sms',
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
    if (isDemoMode) {
      localStorage.removeItem('civicpulse_demo_session');
      setUser(null);
      setRole('citizen');
      return;
    }

    await supabase.auth.signOut();
    setUser(null);
    setRole('citizen');
  }, []);

  // Switch role (for demo / manual override)
  const switchRole = useCallback((newRole) => {
    setRole(newRole);
    setStoreRole(newRole);
    if (isDemoMode && user) {
      const session = { user, role: newRole };
      localStorage.setItem('civicpulse_demo_session', JSON.stringify(session));
    }
  }, [user]);

  const value = {
    user,
    role,
    loading,
    error,
    isAuthenticated: !!user,
    isDemoMode,
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
