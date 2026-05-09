import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, UserRole } from '../types';
import { supabase } from '../lib/supabase';
import { authService } from '../services/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isStaff: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<{ needsVerification: boolean }>;
  logout: () => Promise<void>;
  demoLogin: (role?: UserRole) => Promise<void>;
  loginWithProvider: (provider: 'google' | 'apple') => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session on mount
    const initSession = async () => {
      try {
        const session = await authService.getSession();
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error("Session check failed:", err);
        setLoading(false);
      }
    };
    
    initSession();

    // Listen for auth changes (Login, Logout, Token Refresh, Password Recovery)
    const { data: { subscription } } = authService.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event);
      if (session?.user) {
        if (event === 'SIGNED_IN' || event === 'PASSWORD_RECOVERY') {
           await fetchProfile(session.user.id);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Profile fetch error:', error);
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          setUser({
            id: authUser.id,
            name: authUser.user_metadata?.name || authUser.user_metadata?.full_name || 'User',
            full_name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || 'User',
            email: authUser.email || '',
            role: 'student',
            borrowedCount: 0,
            maxLimit: 3,
            createdAt: authUser.created_at,
            created_at: authUser.created_at,
            libraryId: '1',
            library_id: '1',
            xp: 0,
            streak_days: 0,
            reading_dna: {}
          } as User);
        }
        return;
      }
      
      if (data) {
        setUser({
          id: data.id,
          name: data.full_name || data.name || 'User',
          full_name: data.full_name || data.name || 'User',
          email: data.email,
          role: data.role as UserRole,
          borrowedCount: data.borrowed_count || 0,
          maxLimit: data.max_limit || 3,
          createdAt: data.created_at,
          created_at: data.created_at,
          libraryId: data.library_id || '1',
          library_id: data.library_id || '1',
          avatarUrl: data.avatar_url,
          avatar_url: data.avatar_url,
          xp: data.xp || 0,
          streak_days: data.streak_days || 0,
          reading_dna: data.reading_dna || {}
        } as User);
      }
    } catch (e) {
      console.error('Error fetching profile:', e);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    await authService.signIn(email, password);
  };

  const signup = async (name: string, email: string, password: string) => {
    const data = await authService.signUp(email, password, name);
    return { needsVerification: !data.session };
  };

  const logout = async () => {
    await authService.signOut();
  };

  const loginWithProvider = async (provider: 'google' | 'apple') => {
    await authService.signInWithProvider(provider);
  };

  const resetPassword = async (email: string) => {
    await authService.resetPassword(email);
  };

  const updatePassword = async (password: string) => {
    await authService.updatePassword(password);
  };

  const demoLogin = async (role: UserRole = 'admin') => {
    setLoading(true);
    const demoUser = await authService.signInWithDemo(role);
    setUser(demoUser as unknown as User);
    setLoading(false);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isStaff: user?.role === 'admin' || user?.role === 'librarian' || user?.role === 'teacher',
    loading,
    login,
    signup,
    logout,
    demoLogin,
    loginWithProvider,
    resetPassword,
    updatePassword
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: '#fff', flexDirection: 'column', gap: '20px' }}>
          <div style={{ width: '40px', height: '40px', border: '4px solid rgba(139, 92, 246, 0.2)', borderTopColor: '#8b5cf6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <div style={{ fontWeight: 700, letterSpacing: '1px' }}>ACADEMIC OS INITIALIZING...</div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
