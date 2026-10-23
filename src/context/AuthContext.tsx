import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Profile, UserRole } from '../types';
import { supabase, isSupabaseConfigured, signInWithGoogle, signOut } from '../lib/supabase';

interface AuthContextType {
  user: any | null;
  profile: Profile | null;
  role: UserRole;
  isLoading: boolean;
  isConfigured: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmailMock: (email: string, name?: string) => void;
  logout: () => Promise<void>;
  toggleRole: (targetRole?: UserRole) => void;
  updateProfile: (updated: Partial<Profile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER_PROFILE: Profile = {
  id: 'usr-demo-01',
  full_name: 'คุณมุกดา พิรุณรัตน์ (Customer)',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  phone: '081-234-5678',
  address: '123/45 ซอยทองหล่อ 10 แขวงคลองตันเหนือ เขตวัฒนา กรุงเทพฯ 10110',
  role: 'customer',
  created_at: new Date().toISOString(),
};

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
  const [role, setRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem('sora_current_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed?.id === 'usr-demo-01') {
          return 'customer';
        }
        return parsed.role || 'customer';
      } catch {
        return 'customer';
      }
    }
    return 'customer';
  });
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
        setRole(data.role || 'customer');
      } else {
        // Fallback user from auth metadata
        const newProf: Profile = {
          id: userId,
          full_name: authUser.user_metadata?.full_name || authUser.email || 'สมาชิก Sora Pink',
          avatar_url: authUser.user_metadata?.avatar_url || '',
          role: 'customer',
        };
        setProfile(newProf);
      }
    } catch (e) {
      console.warn('Profile load error:', e);
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
    localStorage.removeItem('sora_current_profile');
  };

  const toggleRole = (targetRole?: UserRole) => {
    const nextRole: UserRole = targetRole || (role === 'admin' ? 'customer' : 'admin');
    setRole(nextRole);
    const baseProfile = profile || DEMO_USER_PROFILE;
    const updated: Profile = {
      ...baseProfile,
      role: nextRole,
      full_name: nextRole === 'admin' ? 'แอดมินโซระ (Sora Admin)' : (profile?.full_name || 'คุณมุกดา พิรุณรัตน์ (Customer)'),
    };
    setProfile(updated);
    localStorage.setItem('sora_current_profile', JSON.stringify(updated));
  };

  const updateProfile = (updated: Partial<Profile>) => {
    if (!profile) return;
    const newProf = { ...profile, ...updated };
    setProfile(newProf);
    localStorage.setItem('sora_current_profile', JSON.stringify(newProf));
    if (isConfigured && user) {
      supabase.from('profiles').update(updated).eq('id', user.id).then();
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
        loginWithEmailMock,
        logout,
        toggleRole,
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
