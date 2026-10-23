import { createClient } from '@supabase/supabase-js';
import type { Profile } from '../types';

const rawUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

// ตรวจสอบว่าได้ตั้งค่า Supabase หรือไม่
export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('https://') &&
    !supabaseUrl.includes('your-project-id')
  );
};

// สร้าง Supabase Client (ใช้ fallback dummy url เพื่อไม่ให้ runtime error เมื่อยังไม่ได้เชื่อมต่อ)
const defaultUrl = 'https://placeholder-project.supabase.co';
const defaultKey = 'placeholder-anon-key';

export const supabase = createClient(
  isSupabaseConfigured() ? supabaseUrl : defaultUrl,
  isSupabaseConfigured() ? supabaseAnonKey : defaultKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

// ----------------------------------------------------------------------------
// Supabase Authentication Helpers
// ----------------------------------------------------------------------------

/**
 * เข้าสู่ระบบด้วย Google OAuth ผ่าน Supabase
 */
export const signInWithGoogle = async () => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase is not configured. Falling back to simulated login.');
    return { data: null, error: new Error('Supabase URL/Key missing') };
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  return { data, error };
};

/**
 * เข้าสู่ระบบด้วย Email และ Password
 */
export const signInWithEmail = async (email: string, password: string) => {
  if (!isSupabaseConfigured()) {
    return { data: null, error: new Error('Supabase not configured') };
  }
  return await supabase.auth.signInWithPassword({ email, password });
};

/**
 * สมัครสมาชิกด้วย Email และ Password พร้อมบันทึก Full Name
 */
export const signUpWithEmail = async (email: string, password: string, fullName: string) => {
  if (!isSupabaseConfigured()) {
    return { data: null, error: new Error('Supabase not configured') };
  }
  return await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });
};

/**
 * ออกจากระบบ
 */
export const signOut = async () => {
  if (!isSupabaseConfigured()) {
    return { error: null };
  }
  return await supabase.auth.signOut();
};

/**
 * ดึงข้อมูล Profile ของผู้ใช้ปัจจุบันจากตาราง profiles
 */
export const fetchUserProfile = async (userId: string): Promise<Profile | null> => {
  if (!isSupabaseConfigured()) return null;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data as Profile;
  } catch (err) {
    console.error('Error fetching profile:', err);
    return null;
  }
};
