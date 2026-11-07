import React, { useState, useRef, useCallback } from 'react';
import { Sparkles, ShieldCheck, RotateCcw } from 'lucide-react';
import { handleImageError } from '../../utils/imageFallback';

interface ClinicalStudy {
  id: string;
  tabLabel: string;
  badge: string;
  title: string;
  beforeLabel: string;
  afterLabel: string;
  beforeFilter: string;
  afterFilter: string;
  imageUrl: string;
  description: string;
}

const CLINICAL_STUDIES: ClinicalStudy[] = [
  {
    id: 'skin-glow',
    tabLabel: '🌟 สภาพผิวหน้า (Skin Barrier & Glow)',
    badge: '14 DAYS CLINICAL STUDY',
    title: 'ฟื้นฟูผิวแห้งกร้าน ขาดน้ำ สู่ผิวฉ่ำโกลว์อิ่มฟูแบบ Glass Skin',
    beforeLabel: 'ก่อนใช้ (Day 0: ผิวแห้งกร้าน รอยหมองคล้ำ)',
    afterLabel: 'หลังใช้ 14 วัน (Day 14: ผิวฉ่ำโกลว์ ดูอิ่มน้ำ ✨)',
    beforeFilter: 'grayscale(60%) brightness(0.92) contrast(1.15) saturate(0.65)',
    afterFilter: 'saturate(1.15) brightness(1.05) contrast(1.02)',
    imageUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1200&q=80',
    description: 'ผลการทดสอบกับกลุ่มตัวอย่างพบว่าความชุ่มชื้นใต้ชั้นผิวเพิ่มขึ้นอย่างมีนัยสำคัญหลังใช้เป็นประจำเช้า-เย็น',
  },
  {
    id: 'serum-texture',
    tabLabel: '💧 เซรั่ม 8D Complex (Serum Efficacy)',
    badge: 'HYDRATION TESTING',
    title: 'ประสิทธิภาพการซึมลึกและเสริมเกราะป้องกันผิว',
    beforeLabel: 'ก่อนใช้ (Day 0: ผิวขาดการบำรุง)',
    afterLabel: 'หลังใช้ 14 วัน (Day 14: ล็อคความชุ่มชื้น 24 ชม. 💧)',
    beforeFilter: 'grayscale(70%) brightness(0.9) contrast(1.2)',
    afterFilter: 'saturate(1.2) brightness(1.06) contrast(1.04)',
    imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1200&q=80',
    description: 'สารสกัด Hyaluronic Acid 8D และเซราไมด์ตรงเข้าฟื้นฟูเกราะป้องกันผิวที่ถูกทำร้ายจากมลภาวะและแสงแดด',
  },
];

export const ClinicalResultsSlider: React.FC = () => {
  const [activeStudyIdx, setActiveStudyIdx] = useState(0);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeStudy = CLINICAL_STUDIES[activeStudyIdx];

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(Math.round(percentage));
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    updatePosition(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      updatePosition(e.clientX);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // safe fallback
    }
    setIsDragging(false);
  };

  return (
    <section id="clinical-proof" style={{ padding: '4.5rem 0', position: 'relative' }}>
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: '#F43F5E',
              fontSize: '0.85rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '0.4rem',
            }}
          >
            <Sparkles size={16} /> CLINICAL PROVEN RESULTS
          </div>
          <h2 style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.6rem' }}>
            ผลลัพธ์พิสูจน์จริงทางคลินิกใน <span style={{ color: '#E11D48' }}>14 วัน</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.98rem', maxWidth: '640px', margin: '0 auto' }}>
            ทดสอบกับกลุ่มตัวอย่างผู้ใช้จริง 1,000 คน ภายใต้การควบคุมและประเมินผลโดยแพทย์ผู้เชี่ยวชาญด้านผิวหนัง
          </p>
        </div>

        {/* Tab Switcher for Clinical Studies */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          {CLINICAL_STUDIES.map((study, idx) => (
            <button
              key={study.id}
              onClick={() => {
                setActiveStudyIdx(idx);
                setSliderPosition(50);
              }}
              style={{
                padding: '0.55rem 1.25rem',
                borderRadius: '9999px',
                border: activeStudyIdx === idx ? '2px solid #E11D48' : '1px solid #E5E7EB',
                background: activeStudyIdx === idx ? '#FFE8EF' : '#FFFFFF',
                color: activeStudyIdx === idx ? '#BE123C' : '#4B5563',
                fontWeight: activeStudyIdx === idx ? 700 : 500,
                fontSize: '0.88rem',
                cursor: 'pointer',
                boxShadow: activeStudyIdx === idx ? '0 4px 12px rgba(225, 29, 72, 0.15)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              {study.tabLabel}
            </button>
          ))}
        </div>

        {/* Main Grid: Interactive Slider + Stats */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 0.8fr)',
            gap: '2.5rem',
            alignItems: 'center',
          }}
          className="clinical-grid"
        >
          {/* Interactive Before & After Slider Box */}
          <div>
            <div
              ref={containerRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              style={{
                position: 'relative',
                borderRadius: '24px',
                overflow: 'hidden',
                boxShadow: '0 20px 45px rgba(225, 29, 72, 0.15)',
                border: '2px solid rgba(255, 209, 220, 0.8)',
                height: '400px',
                userSelect: 'none',
                cursor: 'ew-resize',
                background: '#FFF0F5',
                touchAction: 'none',
              }}
            >
              {/* Layer 1: AFTER Image (Day 14 Glowing, Vibrant) */}
              <img
                src={activeStudy.imageUrl}
                alt="หลังใช้ (After)"
                onError={handleImageError}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  filter: activeStudy.afterFilter,
                  transition: isDragging ? 'none' : 'filter 0.3s ease',
                  pointerEvents: 'none',
                }}
              />

              {/* Tag After (Top-Right) */}
              <div
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'rgba(225, 29, 72, 0.92)',
                  backdropFilter: 'blur(8px)',
                  color: '#FFFFFF',
                  padding: '0.35rem 0.85rem',
                  borderRadius: '9999px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  zIndex: 2,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                  pointerEvents: 'none',
                }}
              >
                {activeStudy.afterLabel}
              </div>

              {/* Layer 2: BEFORE Image (Day 0 Dull/Dry, Clipped with clipPath) */}
              <img
                src={activeStudy.imageUrl}
                alt="ก่อนใช้ (Before)"
                onError={handleImageError}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  filter: activeStudy.beforeFilter,
                  clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)`,
                  transition: isDragging ? 'none' : 'clip-path 0.1s ease',
                  zIndex: 3,
                  pointerEvents: 'none',
                }}
              />

              {/* Tag Before (Top-Left) */}
              <div
                style={{
                  position: 'absolute',
                  top: '16px',
                  left: '16px',
                  background: 'rgba(30, 41, 59, 0.82)',
                  backdropFilter: 'blur(8px)',
                  color: '#FFFFFF',
                  padding: '0.35rem 0.85rem',
                  borderRadius: '9999px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  zIndex: 4,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                  pointerEvents: 'none',
                }}
              >
                {activeStudy.beforeLabel}
              </div>

              {/* Vertical Divider Line */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: `${sliderPosition}%`,
                  width: '3px',
                  background: '#FFFFFF',
                  boxShadow: '0 0 14px rgba(0,0,0,0.4)',
                  zIndex: 5,
                  pointerEvents: 'none',
                  transform: 'translateX(-50%)',
                }}
              />

              {/* Drag Handle Button (Circle) */}
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: `${sliderPosition}%`,
                  transform: 'translate(-50%, -50%)',
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  background: '#FFFFFF',
                  border: '3px solid #E11D48',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10,
                  color: '#E11D48',
                  fontSize: '1rem',
                  fontWeight: 900,
                  cursor: 'ew-resize',
                  transition: isDragging ? 'none' : 'transform 0.15s ease',
                }}
              >
                ⇄
              </div>

              {/* Hint badge at bottom */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '14px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'rgba(0, 0, 0, 0.72)',
                  backdropFilter: 'blur(8px)',
                  color: '#FFFFFF',
                  padding: '0.3rem 0.9rem',
                  borderRadius: '9999px',
                  fontSize: '0.74rem',
                  zIndex: 6,
                  pointerEvents: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                👉 เลื่อนแถบ ซ้าย-ขวา เพื่อดูผลลัพธ์การเปลี่ยนแปลง
              </div>
            </div>

            {/* Quick Presets Bar under Slider */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                marginTop: '0.85rem',
                flexWrap: 'wrap',
              }}
            >
              <button
                type="button"
                onClick={() => setSliderPosition(100)}
                style={{
                  background: sliderPosition >= 90 ? '#E2E8F0' : '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '9999px',
                  padding: '4px 12px',
                  fontSize: '0.78rem',
                  color: '#334155',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                ดูสภาพก่อนใช้ (Day 0)
              </button>
              <button
                type="button"
                onClick={() => setSliderPosition(50)}
                style={{
                  background: sliderPosition >= 45 && sliderPosition <= 55 ? '#FFE4E6' : '#FFFFFF',
                  border: '1px solid #FECDD3',
                  borderRadius: '9999px',
                  padding: '4px 12px',
                  fontSize: '0.78rem',
                  color: '#BE123C',
                  cursor: 'pointer',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <RotateCcw size={12} /> เปรียบเทียบ 50 / 50
              </button>
              <button
                type="button"
                onClick={() => setSliderPosition(0)}
                style={{
                  background: sliderPosition <= 10 ? '#E0F2FE' : '#FFFFFF',
                  border: '1px solid #BAE6FD',
                  borderRadius: '9999px',
                  padding: '4px 12px',
                  fontSize: '0.78rem',
                  color: '#0369A1',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                ดูผลลัพธ์หลังใช้ (Day 14 Glow ✨)
              </button>
            </div>
          </div>

          {/* Clinical Statistics & Certifications */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Stat 1 */}
            <div
              className="glass-card"
              style={{
                padding: '1.25rem 1.5rem',
                borderRadius: '20px',
                background: 'rgba(255, 255, 255, 0.9)',
                border: '1.5px solid rgba(255, 209, 220, 0.6)',
                display: 'flex',
                alignItems: 'center',
                gap: '1.25rem',
              }}
            >
              <div
                style={{
                  fontSize: '2.4rem',
                  fontWeight: 900,
                  color: '#E11D48',
                  lineHeight: 1,
                  minWidth: '90px',
                }}
              >
                98%
              </div>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                  ผิวชุ่มชื้นอิ่มฟูยาวนาน 24 ชั่วโมง
                </h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
                  ไฮยาลูรอน 8D โมเลกุลซึมลึก ฟื้นฟูผิวขาดน้ำให้เปล่งปลั่งฉ่ำวาวตั้งแต่ครั้งแรกที่ใช้
                </p>
              </div>
            </div>

            {/* Stat 2 */}
            <div
              className="glass-card"
              style={{
                padding: '1.25rem 1.5rem',
                borderRadius: '20px',
                background: 'rgba(255, 255, 255, 0.9)',
                border: '1.5px solid rgba(255, 209, 220, 0.6)',
                display: 'flex',
                alignItems: 'center',
                gap: '1.25rem',
              }}
            >
              <div
                style={{
                  fontSize: '2.4rem',
                  fontWeight: 900,
                  color: '#BE123C',
                  lineHeight: 1,
                  minWidth: '90px',
                }}
              >
                94%
              </div>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                  รอยแดง รอยดำสิว และจุดด่างดำจางลง
                </h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
                  สีผิวสม่ำเสมอ กระจ่างใสขึ้นอย่างเห็นได้ชัดภายใน 14 วันแห่งการทดสอบ
                </p>
              </div>
            </div>

            {/* Stat 3 */}
            <div
              className="glass-card"
              style={{
                padding: '1.25rem 1.5rem',
                borderRadius: '20px',
                background: 'rgba(255, 255, 255, 0.9)',
                border: '1.5px solid rgba(255, 209, 220, 0.6)',
                display: 'flex',
                alignItems: 'center',
                gap: '1.25rem',
              }}
            >
              <div
                style={{
                  fontSize: '2.4rem',
                  fontWeight: 900,
                  color: '#FB7185',
                  lineHeight: 1,
                  minWidth: '90px',
                }}
              >
                96%
              </div>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                  เกราะป้องกันผิวแข็งแรงขึ้น ไม่แพ้ง่าย
                </h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
                  ลดการระคายเคือง ผิวทนต่อมลภาวะ แดด และฝุ่น PM2.5 ได้ดีขึ้นอย่างมีนัยสำคัญ
                </p>
              </div>
            </div>

            {/* Certification Footer Badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1.25rem',
                background: 'linear-gradient(135deg, rgba(255, 240, 243, 0.95) 0%, rgba(254, 226, 226, 0.7) 100%)',
                borderRadius: '16px',
                fontSize: '0.82rem',
                color: '#881337',
                fontWeight: 600,
                border: '1px solid rgba(254, 205, 211, 0.8)',
              }}
            >
              <ShieldCheck size={20} color="#E11D48" />
              <span>
                ผ่านการรับรองโดยสถาบันทดสอบเครื่องสำอางระดับสากล • <strong>Dermatologist Approved</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .clinical-grid {
            grid-template-columns: 1fr !important;
            gap: 1.75rem !important;
          }
        }
      `}</style>
    </section>
  );
};
