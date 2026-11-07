import React, { useState } from 'react';
import { ShieldCheck, HeartHandshake, Truck, RotateCcw, Send, Check } from 'lucide-react';
import { showToast } from '../common/Toast';

interface FooterProps {
  onOpenAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin }) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    showToast('ขอบคุณที่สมัครรับข่าวสาร! คุณได้รับโค้ด WELCOMEPINK ลด ฿100', 'success');
    setEmail('');
  };

  return (
    <footer
      style={{
        background: '#161413',
        color: '#FAF8F5',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        marginTop: '6rem',
        paddingTop: '4.5rem',
        paddingBottom: '2.5rem',
      }}
    >
      <div className="container">
        {/* Editorial Guarantees Ribbon */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '2rem',
            paddingBottom: '3.5rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            marginBottom: '3.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#C5A880',
              }}
            >
              <ShieldCheck size={20} />
            </div>
            <div>
              <h5 style={{ fontWeight: 600, fontSize: '0.92rem', color: '#FAF8F5', letterSpacing: '0.02em' }}>100% Guaranteed Authentic</h5>
              <p style={{ fontSize: '0.78rem', color: '#A8A29E' }}>คัดสรรจากห้องแล็บและแบรนด์ชั้นนำ</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#C5A880',
              }}
            >
              <HeartHandshake size={20} />
            </div>
            <div>
              <h5 style={{ fontWeight: 600, fontSize: '0.92rem', color: '#FAF8F5', letterSpacing: '0.02em' }}>Dermatologist Tested</h5>
              <p style={{ fontSize: '0.78rem', color: '#A8A29E' }}>ปลอดภัยสำหรับผิวบอบบางแพ้ง่าย</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#C5A880',
              }}
            >
              <Truck size={20} />
            </div>
            <div>
              <h5 style={{ fontWeight: 600, fontSize: '0.92rem', color: '#FAF8F5', letterSpacing: '0.02em' }}>Complimentary Delivery</h5>
              <p style={{ fontSize: '0.78rem', color: '#A8A29E' }}>จัดส่งด่วนพิเศษฟรีเมื่อช้อปครบ ฿500</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#C5A880',
              }}
            >
              <RotateCcw size={20} />
            </div>
            <div>
              <h5 style={{ fontWeight: 600, fontSize: '0.92rem', color: '#FAF8F5', letterSpacing: '0.02em' }}>Satisfaction Promise</h5>
              <p style={{ fontSize: '0.78rem', color: '#A8A29E' }}>การันตีเปลี่ยนสินค้าภายใน 7 วัน</p>
            </div>
          </div>
        </div>

        {/* Links & Newsletter */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '3rem',
            marginBottom: '3.5rem',
          }}
        >
          {/* Brand Info */}
          <div style={{ gridColumn: 'span 1' }}>
            <div style={{ marginBottom: '1.25rem' }}>
              <div
                className="font-serif"
                style={{
                  fontSize: '1.6rem',
                  fontWeight: 600,
                  letterSpacing: '0.12em',
                  color: '#FAF8F5',
                  textTransform: 'uppercase',
                  lineHeight: 1,
                  marginBottom: '0.4rem',
                }}
              >
                SORA PINK
              </div>
              <div
                style={{
                  fontSize: '0.65rem',
                  letterSpacing: '0.22em',
                  color: '#C5A880',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                }}
              >
                Atelier de Beauté • Seoul & Bangkok
              </div>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#A8A29E', lineHeight: 1.8, marginBottom: '1.25rem' }}>
              ห้องปฏิบัติการแห่งความงามที่หลอมรวมศิลปะชั้นสูงเข้ากับนวัตกรรมชีววิทยาผิวพรรณ รังสรรค์ผลิตภัณฑ์เพื่อผิวสว่างกระจ่างใสอย่างยั่งยืน
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '3px 9px',
                  borderRadius: '4px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#C5A880',
                  fontSize: '0.68rem',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                Cruelty-Free
              </span>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '3px 9px',
                  borderRadius: '4px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#C5A880',
                  fontSize: '0.68rem',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                Clean Formulation
              </span>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h5
              style={{
                fontWeight: 600,
                fontSize: '0.82rem',
                textTransform: 'uppercase',
                letterSpacing: '0.14em',
                color: '#FAF8F5',
                marginBottom: '1.25rem',
              }}
            >
              Collections
            </h5>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem', color: '#A8A29E' }}>
              <li><a href="#categories" style={{ color: '#A8A29E', textDecoration: 'none', transition: 'color 0.2s' }}>เมคอัพและเครื่องสำอาง (Cosmetics)</a></li>
              <li><a href="#categories" style={{ color: '#A8A29E', textDecoration: 'none' }}>สกินแคร์ดูแลผิวหน้า (Facial Care)</a></li>
              <li><a href="#categories" style={{ color: '#A8A29E', textDecoration: 'none' }}>ผลิตภัณฑ์บำรุงผิวกาย (Body Curation)</a></li>
              <li><a href="#categories" style={{ color: '#A8A29E', textDecoration: 'none' }}>ทรีตเมนต์เส้นผม (Hair Rituals)</a></li>
              <li><a href="#flash-sale" style={{ color: '#C5A880', textDecoration: 'none', fontWeight: 600 }}>ข้อเสนอพิเศษ (Private Offers)</a></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h5
              style={{
                fontWeight: 600,
                fontSize: '0.82rem',
                textTransform: 'uppercase',
                letterSpacing: '0.14em',
                color: '#FAF8F5',
                marginBottom: '1.25rem',
              }}
            >
              Concierge Service
            </h5>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem', color: '#A8A29E' }}>
              <li>ติดตามสถานะคำสั่งซื้อ (Order Tracking)</li>
              <li>เงื่อนไขการจัดส่งและเปลี่ยนคืน</li>
              <li>คำปรึกษาการเลือกสกินแคร์เฉพาะบุคคล</li>
              <li>ฝ่ายบริการลูกค้า (09:00 - 20:00 น.)</li>
              <li>คำถามที่พบบ่อย (Client Inquiries)</li>
            </ul>
          </div>

          {/* Newsletter Box */}
          <div>
            <h5
              style={{
                fontWeight: 600,
                fontSize: '0.82rem',
                textTransform: 'uppercase',
                letterSpacing: '0.14em',
                color: '#FAF8F5',
                marginBottom: '0.5rem',
              }}
            >
              The Atelier Gazette
            </h5>
            <p style={{ fontSize: '0.82rem', color: '#A8A29E', marginBottom: '1.15rem', lineHeight: 1.6 }}>
              รับสิทธิพิเศษ ข่าวสารการเปิดตัวคอลเลกชันใหม่ และโค้ดส่วนลด ฿100 สำหรับคำสั่งซื้อแรก
            </p>
            <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: '0.4rem' }}>
              <input
                type="email"
                required
                placeholder="อีเมลของคุณ..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  fontSize: '0.82rem',
                  borderRadius: '6px',
                  padding: '0.65rem 0.95rem',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#FAF8F5',
                  outline: 'none',
                  flex: 1,
                }}
              />
              <button
                type="submit"
                style={{
                  padding: '0.65rem 1rem',
                  borderRadius: '6px',
                  background: '#C5A880',
                  color: '#161413',
                  border: 'none',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {subscribed ? <Check size={16} /> : <Send size={15} />}
              </button>
            </form>
          </div>
        </div>

        {/* Bottom copyright & payment methods */}
        <div
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            paddingTop: '1.75rem',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1.25rem',
            fontSize: '0.78rem',
            color: '#78716C',
          }}
        >
          <div>
            © 2026 SORA PINK ATELIER. ALL RIGHTS RESERVED.
            {onOpenAdmin && (
              <button
                onClick={onOpenAdmin}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#57534E',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  marginLeft: '10px',
                  padding: 0,
                  transition: 'color 0.2s',
                  letterSpacing: '0.04em',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#C5A880')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#57534E')}
                title="เข้าสู่ระบบจัดการร้านค้าสำหรับเจ้าหน้าที่"
              >
                • ร้านค้าและคลังสินค้า (Admin)
              </button>
            )}
          </div>
          <div className="footer-payment-methods" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <span style={{ letterSpacing: '0.04em' }}>SECURED CHECKOUT:</span>
            <span style={{ background: 'rgba(255, 255, 255, 0.06)', padding: '3px 8px', borderRadius: '4px', border: '1px solid rgba(255, 255, 255, 0.1)', fontWeight: 600, color: '#FAF8F5', fontSize: '0.72rem' }}>
              PromptPay QR
            </span>
            <span style={{ background: 'rgba(255, 255, 255, 0.06)', padding: '3px 8px', borderRadius: '4px', border: '1px solid rgba(255, 255, 255, 0.1)', fontWeight: 600, color: '#FAF8F5', fontSize: '0.72rem' }}>
              VISA
            </span>
            <span style={{ background: 'rgba(255, 255, 255, 0.06)', padding: '3px 8px', borderRadius: '4px', border: '1px solid rgba(255, 255, 255, 0.1)', fontWeight: 600, color: '#FAF8F5', fontSize: '0.72rem' }}>
              Mastercard
            </span>
            <span style={{ background: 'rgba(255, 255, 255, 0.06)', padding: '3px 8px', borderRadius: '4px', border: '1px solid rgba(255, 255, 255, 0.1)', fontWeight: 600, color: '#FAF8F5', fontSize: '0.72rem' }}>
              COD
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
