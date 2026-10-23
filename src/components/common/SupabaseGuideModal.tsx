import React, { useState } from 'react';
import { X, Database, Check, Copy, ExternalLink } from 'lucide-react';
import { isSupabaseConfigured } from '../../lib/supabase';
import { showToast } from './Toast';

interface SupabaseGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseGuideModal: React.FC<SupabaseGuideModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const isConnected = isSupabaseConfigured();

  if (!isOpen) return null;

  const envTemplate = `VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('คัดลอกลงคลิปบอร์ดแล้ว', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content modal-content-lg"
        onClick={(e) => e.stopPropagation()}
        style={{ padding: '2rem' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #FFD1DC 0%, #BFEFFF 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Database size={24} color="#0284C7" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>คู่มือการเชื่อมต่อ Supabase Backend</h2>
              <p style={{ fontSize: '0.88rem', color: '#6B7280' }}>
                ระบบฐานข้อมูล PostgreSQL, Authentication และ Storage
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon btn-ghost">
            <X size={20} />
          </button>
        </div>

        {/* Status Card */}
        <div
          style={{
            padding: '1.25rem',
            borderRadius: '16px',
            background: isConnected ? '#ECFDF5' : '#FFF7ED',
            border: `1.5px solid ${isConnected ? '#A7F3D0' : '#FED7AA'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: '50%',
                backgroundColor: isConnected ? '#10B981' : '#F59E0B',
                boxShadow: `0 0 10px ${isConnected ? '#10B981' : '#F59E0B'}`,
              }}
            />
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: isConnected ? '#065F46' : '#9A3412' }}>
                {isConnected ? 'สถานะ: เชื่อมต่อ Supabase สำเร็จแล้ว (Live Database)' : 'สถานะ: กำลังใช้งาน Demo Store Mode'}
              </h4>
              <p style={{ fontSize: '0.85rem', color: isConnected ? '#047857' : '#B45309' }}>
                {isConnected
                  ? 'ข้อมูลสินค้า ออเดอร์ รีวิว และ Auth เชื่อมต่อกับ Supabase PostgreSQL จริง'
                  : 'ระบบทำงานในโหมดจำลอง สามารถทดสอบเพิ่มสินค้า สั่งซื้อ ตัดสต็อก และเข้าใช้งานได้ 100%'}
              </p>
            </div>
          </div>
          <span className={`badge ${isConnected ? 'badge-success' : 'badge-warning'}`}>
            {isConnected ? 'LIVE CLOUD' : 'LOCAL DEMO'}
          </span>
        </div>

        {/* Steps to setup */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Step 1 */}
          <div style={{ background: '#F9FAFB', padding: '1.25rem', borderRadius: '14px', border: '1px solid #E5E7EB' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span style={{ background: '#FFD1DC', color: '#BE123C', width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' }}>
                1
              </span>
              <h4 style={{ fontWeight: 600 }}>รันสคริปต์ SQL Schema ใน Supabase</h4>
            </div>
            <p style={{ fontSize: '0.88rem', color: '#4B5563', marginBottom: '0.75rem' }}>
              นำไฟล์ <code style={{ background: '#E5E7EB', padding: '2px 6px', borderRadius: '4px' }}>supabase_schema.sql</code> ที่สร้างไว้ในโปรเจกต์ ไปรันในแท็บ <strong>SQL Editor</strong> บน Supabase Dashboard สคริปต์จะสร้างตารางทั้ง 8 ตาราง, ระบบตัดสต็อกอัตโนมัติ (Trigger), Row Level Security (RLS) และข้อมูลสินค้าเริ่มต้น
            </p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => copyToClipboard('supabase_schema.sql')}
              >
                <Copy size={14} /> คัดลอกชื่อไฟล์ SQL
              </button>
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noreferrer"
                className="btn btn-ghost btn-sm"
              >
                ไปยัง Supabase Dashboard <ExternalLink size={14} />
              </a>
            </div>
          </div>

          {/* Step 2 */}
          <div style={{ background: '#F9FAFB', padding: '1.25rem', borderRadius: '14px', border: '1px solid #E5E7EB' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span style={{ background: '#BFEFFF', color: '#0369A1', width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' }}>
                2
              </span>
              <h4 style={{ fontWeight: 600 }}>ตั้งค่าตัวแปรในไฟล์ .env</h4>
            </div>
            <p style={{ fontSize: '0.88rem', color: '#4B5563', marginBottom: '0.75rem' }}>
              ไปที่เมนู <strong>Project Settings &gt; API</strong> บน Supabase แล้วคัดลอก Project URL และ anon public key มาใส่ในไฟล์ <code style={{ background: '#E5E7EB', padding: '2px 6px', borderRadius: '4px' }}>.env</code>:
            </p>
            <div
              style={{
                background: '#1F2937',
                color: '#F9FAFB',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                fontFamily: 'monospace',
                fontSize: '0.82rem',
                position: 'relative',
              }}
            >
              <pre style={{ whiteSpace: 'pre-wrap' }}>{envTemplate}</pre>
              <button
                onClick={() => copyToClipboard(envTemplate)}
                style={{
                  position: 'absolute',
                  top: '0.5rem',
                  right: '0.5rem',
                  background: 'rgba(255,255,255,0.15)',
                  border: 'none',
                  color: '#fff',
                  borderRadius: '6px',
                  padding: '4px 8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.75rem',
                }}
              >
                {copied ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
                {copied ? 'คัดลอกแล้ว' : 'คัดลอก'}
              </button>
            </div>
          </div>

          {/* Step 3 */}
          <div style={{ background: '#F9FAFB', padding: '1.25rem', borderRadius: '14px', border: '1px solid #E5E7EB' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span style={{ background: '#FFE4E6', color: '#BE123C', width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' }}>
                3
              </span>
              <h4 style={{ fontWeight: 600 }}>ตั้งค่า Google OAuth (Sign in with Google)</h4>
            </div>
            <p style={{ fontSize: '0.88rem', color: '#4B5563' }}>
              1. ไปที่ <a href="https://console.cloud.google.com" target="_blank" rel="noreferrer" style={{ color: '#0284C7', textDecoration: 'underline' }}>Google Cloud Console</a> &gt; สร้าง OAuth 2.0 Client ID<br/>
              2. ระบุ Authorized Redirect URI เป็น: <code style={{ background: '#E5E7EB', padding: '2px 6px', borderRadius: '4px' }}>https://&lt;your-project&gt;.supabase.co/auth/v1/callback</code><br/>
              3. นำ Client ID และ Client Secret ไปใส่ในเมนู <strong>Supabase &gt; Authentication &gt; Providers &gt; Google</strong>
            </p>
          </div>
        </div>

        <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
          <button className="btn btn-primary" onClick={onClose}>
            เข้าใจแล้ว เริ่มใช้งาน Sora Pink
          </button>
        </div>
      </div>
    </div>
  );
};
