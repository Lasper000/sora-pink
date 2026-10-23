import React, { useState } from 'react';
import { Sparkles, ShieldCheck, HeartHandshake, Truck, RotateCcw, Send, Check } from 'lucide-react';
import { showToast } from '../common/Toast';

export const Footer: React.FC = () => {
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
        background: 'linear-gradient(180deg, #FFFFFF 0%, #FFF5F8 50%, #F0F9FF 100%)',
        borderTop: '1px solid rgba(255, 209, 220, 0.4)',
        marginTop: '5rem',
        paddingTop: '3.5rem',
        paddingBottom: '2rem',
      }}
    >
      <div className="container">
        {/* Trust Badges Bar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.5rem',
            paddingBottom: '3rem',
            borderBottom: '1px solid rgba(255, 209, 220, 0.5)',
            marginBottom: '3rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: '#FFE8EF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShieldCheck size={24} color="#F43F5E" />
            </div>
            <div>
              <h5 style={{ fontWeight: 600, fontSize: '0.95rem' }}>ของแท้ 100% ทุกชิ้น</h5>
              <p style={{ fontSize: '0.82rem', color: '#6B7280' }}>รับตรงจากแบรนด์ชั้นนำ</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: '#E0F4FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <HeartHandshake size={24} color="#0284C7" />
            </div>
            <div>
              <h5 style={{ fontWeight: 600, fontSize: '0.95rem' }}>ผ่านการทดสอบโดยแพทย์ผิวหนัง</h5>
              <p style={{ fontSize: '0.82rem', color: '#6B7280' }}>อ่อนโยน ปลอดภัย ไม่ระคายเคือง</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: '#FFE8EF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Truck size={24} color="#F43F5E" />
            </div>
            <div>
              <h5 style={{ fontWeight: 600, fontSize: '0.95rem' }}>จัดส่งด่วนทั่วประเทศ</h5>
              <p style={{ fontSize: '0.82rem', color: '#6B7280' }}>ฟรีค่าส่งเมื่อช้อปครบ ฿500</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: '#E0F4FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <RotateCcw size={24} color="#0284C7" />
            </div>
            <div>
              <h5 style={{ fontWeight: 600, fontSize: '0.95rem' }}>การันตีความพึงพอใจ</h5>
              <p style={{ fontSize: '0.82rem', color: '#6B7280' }}>เปลี่ยนคืนสินค้าได้ใน 7 วัน</p>
            </div>
          </div>
        </div>

        {/* Links & Newsletter */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '2.5rem',
            marginBottom: '3rem',
          }}
        >
          {/* Brand Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #FFD1DC 0%, #BFEFFF 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Sparkles size={16} color="#F43F5E" />
              </div>
              <span
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #E11D48 0%, #0284C7 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                SORA PINK
              </span>
            </div>
            <p style={{ fontSize: '0.88rem', color: '#6B7280', lineHeight: 1.7, marginBottom: '1rem' }}>
              ศูนย์รวมเครื่องสำอาง สกินแคร์ดูแลผิวหน้า และผลิตภัณฑ์ดูแลผิวกายแบบครบวงจร
              คัดสรรสูตรอ่อนโยน ผสานความงามแบบ Modern Pastel Minimalist เพื่อผิวฉ่ำโกลว์อย่างเป็นธรรมชาติ
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span className="badge badge-pink" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Sparkles size={11} color="#E11D48" /> Cruelty-Free (ไม่ทดลองในสัตว์)
              </span>
              <span className="badge badge-blue" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={11} color="#0284C7" /> Dermatologist Tested
              </span>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h5 style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '1rem' }}>หมวดหมู่สินค้า</h5>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.88rem', color: '#6B7280' }}>
              <li><a href="#categories" style={{ transition: 'color 0.2s' }}>เครื่องสำอาง (Cosmetics)</a></li>
              <li><a href="#categories">ดูแลผิวหน้า (Facial Skincare)</a></li>
              <li><a href="#categories">ดูแลผิวกาย (Body & Personal Care)</a></li>
              <li><a href="#categories">ดูแลเส้นผม (Hair & Scalp Care)</a></li>
              <li><a href="#flash-sale" style={{ color: '#E11D48', fontWeight: 600 }}>สินค้าลดราคาพิเศษ (Flash Sale)</a></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h5 style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '1rem' }}>บริการลูกค้า</h5>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.88rem', color: '#6B7280' }}>
              <li>ติดตามสถานะพัสดุ (Order Tracking)</li>
              <li>นโยบายการจัดส่งและเปลี่ยนสินค้า</li>
              <li>คู่มือการดูแลผิวตามสภาพผิว</li>
              <li>ติดต่อฝ่ายบริการลูกค้า (09:00 - 20:00 น.)</li>
              <li>คำถามที่พบบ่อย (FAQs)</li>
            </ul>
          </div>

          {/* Newsletter Box */}
          <div>
            <h5 style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '0.5rem' }}>รับส่วนลดพิเศษ ฿100</h5>
            <p style={{ fontSize: '0.85rem', color: '#6B7280', marginBottom: '1rem' }}>
              สมัครรับจดหมายข่าวความงาม เทคนิคการแต่งหน้า และรับคูปองส่วนลดทันที
            </p>
            <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: '0.4rem' }}>
              <input
                type="email"
                required
                placeholder="กรอกอีเมลของคุณ..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                style={{ fontSize: '0.88rem', borderRadius: '9999px', padding: '0.6rem 1rem' }}
              />
              <button type="submit" className="btn btn-primary btn-sm" style={{ padding: '0.6rem 1rem' }}>
                {subscribed ? <Check size={16} /> : <Send size={16} />}
              </button>
            </form>
          </div>
        </div>

        {/* Bottom copyright & payment methods */}
        <div
          style={{
            borderTop: '1px solid rgba(255, 209, 220, 0.4)',
            paddingTop: '1.5rem',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            fontSize: '0.82rem',
            color: '#9CA3AF',
          }}
        >
          <div>
            © 2026 SORA PINK Co., Ltd. All rights reserved. ออกแบบและพัฒนาด้วยความใส่ใจเพื่อคุณ
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span>ช่องทางชำระเงินที่รองรับ:</span>
            <span style={{ background: '#FFFFFF', padding: '2px 8px', borderRadius: '4px', border: '1px solid #E5E7EB', fontWeight: 600, color: '#003D79' }}>
              PromptPay QR
            </span>
            <span style={{ background: '#FFFFFF', padding: '2px 8px', borderRadius: '4px', border: '1px solid #E5E7EB', fontWeight: 600, color: '#1A1F71' }}>
              VISA
            </span>
            <span style={{ background: '#FFFFFF', padding: '2px 8px', borderRadius: '4px', border: '1px solid #E5E7EB', fontWeight: 600, color: '#EB001B' }}>
              Mastercard
            </span>
            <span style={{ background: '#FFFFFF', padding: '2px 8px', borderRadius: '4px', border: '1px solid #E5E7EB', fontWeight: 600, color: '#047857' }}>
              เก็บเงินปลายทาง COD
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
