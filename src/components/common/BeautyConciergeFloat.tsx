import React, { useState } from 'react';
import { Sparkles, MessageCircle, X, Compass, Package, Gift, ChevronRight } from 'lucide-react';
import { showToast } from './Toast';

interface BeautyConciergeFloatProps {
  onOpenSkinQuiz: () => void;
  onOpenProfile: () => void;
  onOpenSecretPromo?: () => void;
}

export const BeautyConciergeFloat: React.FC<BeautyConciergeFloatProps> = ({
  onOpenSkinQuiz,
  onOpenProfile,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleCopySecretCode = () => {
    navigator.clipboard.writeText('GLOW20');
    showToast('คัดลอกโค้ดลับ GLOW20 (ลด 20%) สำเร็จแล้วค่ะ! นำไปกรอกในตะกร้าได้เลย 💖', 'success');
  };

  return (
    <>
      {/* Floating Action Button */}
      <div
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 995,
        }}
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #FF6B8B 0%, #E11D48 100%)',
            color: '#FFFFFF',
            border: '2px solid rgba(255, 255, 255, 0.8)',
            boxShadow: '0 8px 24px rgba(225, 29, 72, 0.4), 0 2px 6px rgba(0, 0, 0, 0.1)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            transition: 'transform 0.3s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          title="Sora Pink VIP Concierge"
        >
          {isOpen ? <X size={24} /> : <Sparkles size={24} className="animate-pulse" />}
          {/* Notification dot */}
          <span
            style={{
              position: 'absolute',
              top: '2px',
              right: '2px',
              width: '14px',
              height: '14px',
              background: '#10B981',
              borderRadius: '50%',
              border: '2px solid #FFFFFF',
            }}
          />
        </button>
      </div>

      {/* Floating Concierge Drawer / Popup */}
      {isOpen && (
        <div
          className="glass-card animate-pop"
          style={{
            position: 'fixed',
            bottom: '90px',
            right: '24px',
            zIndex: 996,
            width: '320px',
            background: '#FFFFFF',
            borderRadius: '24px',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.18)',
            border: '1.5px solid rgba(255, 209, 220, 0.8)',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              background: 'linear-gradient(135deg, #FFF0F3 0%, #FFE4E8 100%)',
              padding: '1.2rem',
              borderBottom: '1px solid rgba(255, 209, 220, 0.5)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: '#E11D48',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(225, 29, 72, 0.3)',
              }}
            >
              <Sparkles size={20} />
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 800, color: '#881337' }}>
                Sora Beauty Concierge
              </h4>
              <span style={{ fontSize: '0.72rem', color: '#BE123C', fontWeight: 600 }}>
                ผู้ช่วยผิวสวย & สิทธิพิเศษ VIP ✨
              </span>
            </div>
          </div>

          {/* Quick Menu Actions */}
          <div style={{ padding: '0.75rem' }}>
            {/* Action 1: Skin Quiz */}
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenSkinQuiz();
              }}
              className="concierge-item"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 0.85rem',
                borderRadius: '14px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background 0.2s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ background: '#EFF6FF', color: '#1D4ED8', padding: '6px', borderRadius: '10px' }}>
                  <Compass size={17} />
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1F2937' }}>
                    แบบทดสอบตรวจสภาพผิว
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#6B7280' }}>หาเซ็ตสกินแคร์ที่เหมาะกับคุณ</div>
                </div>
              </div>
              <ChevronRight size={15} color="#9CA3AF" />
            </button>

            {/* Action 2: Track Orders */}
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenProfile();
              }}
              className="concierge-item"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 0.85rem',
                borderRadius: '14px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background 0.2s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ background: '#ECFDF5', color: '#059669', padding: '6px', borderRadius: '10px' }}>
                  <Package size={17} />
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1F2937' }}>
                    ติดตามสถานะพัสดุ
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#6B7280' }}>ดูเลขพัสดุ & ประวัติคำสั่งซื้อ</div>
                </div>
              </div>
              <ChevronRight size={15} color="#9CA3AF" />
            </button>

            {/* Action 3: Secret Promo Code */}
            <button
              onClick={handleCopySecretCode}
              className="concierge-item"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 0.85rem',
                borderRadius: '14px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background 0.2s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ background: '#FFF1F2', color: '#E11D48', padding: '6px', borderRadius: '10px' }}>
                  <Gift size={17} />
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1F2937' }}>
                    โค้ดลับลด 20% (GLOW20)
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#6B7280' }}>คลิกเพื่อก็อปปี้โค้ดนำไปใช้</div>
                </div>
              </div>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#E11D48', background: '#FFE4E8', padding: '2px 6px', borderRadius: '6px' }}>
                คัดลอก
              </span>
            </button>

            {/* LINE Official Hotline */}
            <div
              style={{
                margin: '0.5rem 0 0.2rem 0',
                padding: '0.7rem 0.85rem',
                background: '#F8FAFC',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.75rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569' }}>
                <MessageCircle size={15} color="#06C755" />
                <span>ปรึกษาบิวตี้แอดมิน: <strong>@sorapink</strong></span>
              </div>
              <span style={{ color: '#06C755', fontWeight: 700 }}>ออนไลน์ 24h</span>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .concierge-item:hover {
          background: #FFF1F2 !important;
        }
      `}</style>
    </>
  );
};
