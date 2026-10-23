import React, { useState } from 'react';
import { X, ArrowRight, Tag } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { showToast } from '../common/Toast';
import confetti from 'canvas-confetti';
import {
  CutePastelPumpkin,
  CutePastelGhost,
  CutePastelCandy,
  CutePumpkinIcon,
} from '../common/HalloweenArtwork';

interface TrickOrTreatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MysteryBox {
  id: number;
  name: string;
  renderIcon: (size?: number) => React.ReactNode;
  code: string;
  discountDesc: string;
  title: string;
  color: string;
}

const BOXES: MysteryBox[] = [
  {
    id: 1,
    name: 'กล่องฟักทองพาสเทล',
    renderIcon: (size = 54) => <CutePastelPumpkin size={size} />,
    code: 'SPOOKY31',
    discountDesc: 'ลดทันที 31% เมื่อช้อปครบ ฿600',
    title: 'เย้! คุณได้คูปองลด 31%',
    color: '#FF6B8B',
  },
  {
    id: 2,
    name: 'กล่องผีน้อยคอตตอน',
    renderIcon: (size = 54) => <CutePastelGhost size={size} />,
    code: 'BOO80',
    discountDesc: 'ลดทันที ฿80 เมื่อช้อปครบ ฿599',
    title: 'เย้! คุณได้คูปองลด ฿80',
    color: '#38BDF8',
  },
  {
    id: 3,
    name: 'กล่องแคนดี้วิเศษ',
    renderIcon: (size = 54) => <CutePastelCandy size={size} />,
    code: 'FREESHIP',
    discountDesc: 'จัดส่งฟรีทุกออเดอร์ ไม่มีขั้นต่ำ',
    title: 'เย้! คุณได้คูปองส่งฟรี ไม่มีขั้นต่ำ',
    color: '#A855F7',
  },
];

export const TrickOrTreatModal: React.FC<TrickOrTreatModalProps> = ({ isOpen, onClose }) => {
  const { applyPromoCode } = useCart();
  const [selectedBox, setSelectedBox] = useState<MysteryBox | null>(null);
  const [hasRevealed, setHasRevealed] = useState(false);

  if (!isOpen) return null;

  const handleSelectBox = (box: MysteryBox) => {
    setSelectedBox(box);
    setHasRevealed(true);

    // Launch colorful Spooky Confetti
    try {
      confetti({
        particleCount: 80,
        spread: 90,
        origin: { y: 0.5 },
        colors: ['#FFD1DC', '#FFAAA6', '#BFEFFF', '#D8B4FE', '#FDE047'],
      });
    } catch {
      // Safe fallback
    }

    showToast(`เย้! ได้รับโค้ดส่วนลด ${box.code} แล้วน้า`, 'success');
  };

  const handleApplyCoupon = () => {
    if (selectedBox) {
      const res = applyPromoCode(selectedBox.code);
      showToast(res.message, res.success ? 'success' : 'error');
      onClose();
    }
  };

  const handleReset = () => {
    setSelectedBox(null);
    setHasRevealed(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          padding: '2.25rem',
          textAlign: 'center',
          background: 'linear-gradient(135deg, #FFF5F9 0%, #FFFFFF 50%, #F5F3FF 100%)',
          borderRadius: '28px',
          border: '2px solid rgba(255, 180, 210, 0.6)',
          boxShadow: '0 20px 50px rgba(168, 85, 247, 0.15)',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="btn-icon btn-ghost"
          style={{ position: 'absolute', top: '1rem', right: '1rem' }}
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#FDF2F8',
              border: '1px solid #FBCFE8',
              color: '#BE123C',
              padding: '0.35rem 1rem',
              borderRadius: '9999px',
              fontSize: '0.82rem',
              fontWeight: 700,
              marginBottom: '0.75rem',
            }}
          >
            <CutePumpkinIcon size={16} /> ดีลพิเศษต้อนรับฮาโลวีน
          </div>
          <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1F2937' }}>
            Trick or Treat!
          </h3>
          <p style={{ fontSize: '0.9rem', color: '#6B7280', maxWidth: '360px', margin: '0 auto' }}>
            เลือกกล่องของขวัญที่ชอบได้เลยน้า ลุ้นรับโค้ดส่วนลดพิเศษเฉพาะฮาโลวีนนี้!
          </p>
        </div>

        {/* Content: Choosing phase vs Revealed phase */}
        {!hasRevealed ? (
          <div>
            <div className="mystery-boxes-grid">
              {BOXES.map((box) => (
                <div
                  key={box.id}
                  onClick={() => handleSelectBox(box)}
                  className="mystery-box-item"
                >
                  <div className="mystery-box-icon" style={{ animation: 'pumpkinWiggle 2s infinite ease-in-out' }}>
                    {box.renderIcon(52)}
                  </div>
                  <div className="mystery-box-text">
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1F2937' }}>
                      {box.name}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#9CA3AF', marginTop: '2px' }}>
                      แตะเพื่อเปิดของขวัญ
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <p style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>
              ใช้เป็นส่วนลดตอนสั่งซื้อได้ทันทีเลยน้า ช้อปเพลินแน่นอน~
            </p>
          </div>
        ) : (
          /* Revealed Prize Box */
          <div className="animate-pop">
            <div
              className="pulse-glow"
              style={{
                width: 96,
                height: 96,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #FFE8EF 0%, #E0F4FF 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem auto',
                boxShadow: '0 10px 25px rgba(255, 141, 168, 0.4)',
              }}
            >
              {selectedBox?.renderIcon(68)}
            </div>

            <h4 style={{ fontSize: '1.3rem', fontWeight: 800, color: selectedBox?.color || '#E11D48', marginBottom: '0.4rem' }}>
              {selectedBox?.title}
            </h4>
            <p style={{ fontSize: '0.92rem', color: '#4B5563', marginBottom: '1.25rem' }}>
              {selectedBox?.discountDesc}
            </p>

            {/* Promo Code Box */}
            <div
              style={{
                background: '#FFFFFF',
                border: '2px dashed #F43F5E',
                padding: '0.85rem 1.25rem',
                borderRadius: '16px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '1.5rem',
                boxShadow: '0 4px 15px rgba(244, 63, 94, 0.1)',
              }}
            >
              <Tag size={20} color="#F43F5E" />
              <span style={{ fontSize: '1.3rem', fontWeight: 800, letterSpacing: '1px', color: '#BE123C' }}>
                {selectedBox?.code}
              </span>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <button
                onClick={handleApplyCoupon}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.85rem', fontSize: '1rem' }}
              >
                ใช้โค้ดนี้ในตะกร้าเลย <ArrowRight size={18} />
              </button>
              <button
                onClick={handleReset}
                className="btn btn-ghost btn-sm"
                style={{ color: '#6B7280', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <CutePumpkinIcon size={14} /> อยากลองสุ่มใหม่อีกรอบ
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
