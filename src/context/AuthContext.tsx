import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Profile, UserRole } from '../types';
import { supabase, isSupabaseConfigured, signInWithGoogle, signInWithFacebook, signOut } from '../lib/supabase';

interface AuthContextType {
  user: any | null;
  profile: Profile | null;
  role: UserRole;
  isLoading: boolean;
  isConfigured: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithFacebook: () => Promise<void>;
  loginWithEmailMock: (email: string, name?: string) => void;
  logout: () => Promise<void>;
  updateProfile: (updated: Partial<Profile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<Profile | null>(() => {
    const saved = localStorage.getItem('sora_current_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Clear previous demo mock user so guest starts clean
        if (parsed?.id === 'usr-demo-01') {
          localStorage.removeItem('sora_current_profile');
          return null;
        }
        return parsed;
      } catch {
        return null;
      }
    }
    return null;
  });
  const [role, setRole] = useState<UserRole>('customer');
  const [isLoading, setIsLoading] = useState(true);
  const isConfigured = isSupabaseConfigured();

  useEffect(() => {
    if (!isConfigured) {
      setIsLoading(false);
      return;
    }

    // Check active Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        loadSupabaseProfile(session.user.id, session.user);
      }
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        loadSupabaseProfile(session.user.id, session.user);
      } else {
        setUser(null);
        setProfile(null);
        setRole('customer');
        localStorage.removeItem('sora_current_profile');
      }
    });

    return () => subscription.unsubscribe();
  }, [isConfigured]);

  const loadSupabaseProfile = async (userId: string, authUser: any) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && data) {
        setProfile(data as Profile);
        setRole(data.role === 'admin' ? 'admin' : 'customer');
      } else {
        // Fallback user from auth metadata
        const newProf: Profile = {
          id: userId,
          full_name: authUser.user_metadata?.full_name || authUser.email || 'สมาชิก Sora Pink',
          avatar_url: authUser.user_metadata?.avatar_url || '',
          role: 'customer',
        };
        setProfile(newProf);
        setRole('customer');
      }
    } catch (e) {
      console.warn('Profile load error:', e);
      setRole('customer');
    }
  };

  const loginWithGoogle = async () => {
    if (isConfigured) {
      await signInWithGoogle();
    } else {
      // Demo simulated Google login
      const googleMockUser: Profile = {
        id: 'usr-google-' + Date.now().toString().slice(-4),
        full_name: 'Sora Google User (สิริกร วรโชติ)',
        avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
        phone: '089-987-6543',
        address: '55/9 ถนนสุขุมวิท ซอย 39 แขวงคลองตันเหนือ เขตวัฒนา กรุงเทพฯ 10110',
        role: 'customer',
      };
      setProfile(googleMockUser);
      setRole('customer');
      localStorage.setItem('sora_current_profile', JSON.stringify(googleMockUser));
    }
  };

  const loginWithFacebook = async () => {
    if (isConfigured) {
      await signInWithFacebook();
    } else {
      // Demo simulated Facebook login
      const facebookMockUser: Profile = {
        id: 'usr-fb-' + Date.now().toString().slice(-4),
        full_name: 'Sora Facebook User (มินตรา สดใส)',
        avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
        phone: '083-456-7890',
        address: '99/1 ซอยอารีย์ ถนนพหลโยธิน แขวงพญาไท เขตพญาไท กรุงเทพฯ 10400',
        role: 'customer',
      };
      setProfile(facebookMockUser);
      setRole('customer');
      localStorage.setItem('sora_current_profile', JSON.stringify(facebookMockUser));
    }
  };

  const loginWithEmailMock = (email: string, name?: string) => {
    const mockUser: Profile = {
      id: 'usr-email-' + Date.now().toString().slice(-4),
      full_name: name || email.split('@')[0],
      avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
      phone: '082-345-6789',
      address: '88/1 ถนนพหลโยธิน แขวงสามเสนใน เขตพญาไท กรุงเทพฯ 10400',
      role: 'customer',
    };
    setProfile(mockUser);
    setRole('customer');
    localStorage.setItem('sora_current_profile', JSON.stringify(mockUser));
  };

  const logout = async () => {
    if (isConfigured) {
      await signOut();
    }
    setUser(null);
    setProfile(null);
    setRole('customer');
    localStorage.removeItem('sora_current_profile');
  };

  const updateProfile = (updated: Partial<Profile>) => {
    if (!profile) return;
    // Security: normal users cannot escalate their role via client updateProfile
    const { role: _role, ...safeUpdates } = updated;
    const newProf = { ...profile, ...safeUpdates };
    setProfile(newProf);
    localStorage.setItem('sora_current_profile', JSON.stringify(newProf));
    if (isConfigured && user) {
      supabase.from('profiles').update(safeUpdates).eq('id', user.id).then();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        isLoading,
        isConfigured,
        loginWithGoogle,
        loginWithFacebook,
        loginWithEmailMock,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
