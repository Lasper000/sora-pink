import React, { useState } from 'react';
import { X, Sparkles, ArrowRight, Shield, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { signInWithEmail, signUpWithEmail } from '../../lib/supabase';
import { showToast } from '../common/Toast';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { loginWithGoogle, loginWithEmailMock, isConfigured, toggleRole } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      showToast('เข้าสู่ระบบด้วย Google สำเร็จ!', 'success');
      onSuccess?.();
      onClose();
    } catch {
      showToast('ไม่สามารถเข้าสู่ระบบด้วย Google ได้', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    try {
      if (isConfigured) {
        if (tab === 'login') {
          const { error } = await signInWithEmail(email, password);
          if (error) throw error;
          showToast('เข้าสู่ระบบสำเร็จ!', 'success');
        } else {
          const { error } = await signUpWithEmail(email, password, fullName);
          if (error) throw error;
          showToast('สมัครสมาชิกสำเร็จ! กรุณาตรวจสอบอีเมลยืนยัน', 'success');
        }
      } else {
        // Local demo mode
        loginWithEmailMock(email, fullName);
        showToast(`ยินดีต้อนรับคุณ ${fullName || email.split('@')[0]}!`, 'success');
      }
      onSuccess?.();
      onClose();
    } catch (err: any) {
      showToast(err.message || 'เกิดข้อผิดพลาดในการยืนยันตัวตน', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (role: 'customer' | 'admin') => {
    if (role === 'admin') {
      toggleRole('admin');
      showToast('เข้าสู่ระบบในฐานะ Admin เรียบร้อยแล้วค่ะ', 'success');
    } else {
      toggleRole('customer');
      showToast('เข้าสู่ระบบในฐานะ Customer เรียบร้อยแล้วค่ะ', 'success');
    }
    onSuccess?.();
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #FFD1DC 0%, #BFEFFF 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={20} color="#E11D48" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                {tab === 'login' ? 'เข้าสู่ระบบ Sora Pink' : 'สร้างบัญชีสมาชิกใหม่'}
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#6B7280' }}>
                รับสิทธิประโยชน์ ส่วนลด และสะสมแต้มบิวตี้
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon btn-ghost">
            <X size={20} />
          </button>
        </div>

        {/* Google OAuth Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.75rem',
            borderRadius: '14px',
            border: '1.5px solid #E5E7EB',
            background: '#FFFFFF',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            fontSize: '0.92rem',
            fontWeight: 600,
            color: '#374151',
            boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
            marginBottom: '1.25rem',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#9CA3AF')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#E5E7EB')}
        >
          {/* Google Official Colorful SVG Icon */}
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          ดำเนินการต่อด้วย Google (Sign in with Google)
        </button>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{ flex: 1, height: '1px', background: '#E5E7EB' }} />
          <span style={{ fontSize: '0.78rem', color: '#9CA3AF' }}>หรือใช้อีเมล</span>
          <div style={{ flex: 1, height: '1px', background: '#E5E7EB' }} />
        </div>

        {/* Tab Switcher */}
        <div
          style={{
            display: 'flex',
            background: '#F3F4F6',
            borderRadius: '12px',
            padding: '3px',
            marginBottom: '1.25rem',
          }}
        >
          <button
            type="button"
            onClick={() => setTab('login')}
            style={{
              flex: 1,
              padding: '0.5rem',
              borderRadius: '9px',
              border: 'none',
              background: tab === 'login' ? '#FFFFFF' : 'transparent',
              fontWeight: tab === 'login' ? 700 : 500,
              color: tab === 'login' ? '#1F2937' : '#6B7280',
              cursor: 'pointer',
              fontSize: '0.88rem',
              boxShadow: tab === 'login' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
            }}
          >
            เข้าสู่ระบบ
          </button>
          <button
            type="button"
            onClick={() => setTab('register')}
            style={{
              flex: 1,
              padding: '0.5rem',
              borderRadius: '9px',
              border: 'none',
              background: tab === 'register' ? '#FFFFFF' : 'transparent',
              fontWeight: tab === 'register' ? 700 : 500,
              color: tab === 'register' ? '#1F2937' : '#6B7280',
              cursor: 'pointer',
              fontSize: '0.88rem',
              boxShadow: tab === 'register' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
            }}
          >
            สมัครสมาชิก
          </button>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleEmailAuth} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {tab === 'register' && (
            <div>
              <label className="form-label">ชื่อ - นามสกุล</label>
              <input
                type="text"
                required
                placeholder="เช่น คุณแพรวพราว กิตติโสภณ"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="form-input"
              />
            </div>
          )}

          <div>
            <label className="form-label">อีเมล (Email)</label>
            <input
              type="email"
              required
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
            />
          </div>

          <div>
            <label className="form-label">รหัสผ่าน (Password)</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}
          >
            {tab === 'login' ? 'เข้าสู่ระบบ' : 'ยืนยันการสมัครสมาชิก'} <ArrowRight size={16} />
          </button>
        </form>

        {/* 1-Click Quick Demo Login Box */}
        <div
          style={{
            marginTop: '1.5rem',
            padding: '1rem',
            background: '#F8FAFC',
            borderRadius: '14px',
            border: '1px dashed #CBD5E1',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <Zap size={14} color="#F59E0B" /> ทางลัดสำหรับทดสอบระบบ (1-Click Quick Demo):
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
            <button
              onClick={() => handleQuickDemo('customer')}
              className="btn btn-sm"
              style={{ background: '#FFE8EF', color: '#BE123C', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
            >
              <Sparkles size={13} color="#BE123C" /> เข้าเป็น Customer
            </button>
            <button
              onClick={() => handleQuickDemo('admin')}
              className="btn btn-sm"
              style={{ background: '#E0F4FF', color: '#0369A1', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
            >
              <Shield size={13} color="#0369A1" /> เข้าเป็น Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
