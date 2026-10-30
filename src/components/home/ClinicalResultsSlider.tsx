import React, { useState, useRef, useCallback } from 'react';
import { Sparkles, ShieldCheck } from 'lucide-react';

export const ClinicalResultsSlider: React.FC = () => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const position = Math.max(5, Math.min(95, (x / rect.width) * 100));
      setSliderPosition(position);
    },
    []
  );

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      handleMove(e.clientX);
    }
  };

  return (
    <section id="clinical-proof" style={{ padding: '4rem 0', position: 'relative' }}>
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
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
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.98rem', maxWidth: '620px', margin: '0 auto' }}>
            ทดสอบกับกลุ่มตัวอย่างผู้ใช้จริง 1,000 คน ภายใต้การควบคุมและประเมินผลโดยแพทย์ผู้เชี่ยวชาญด้านผิวหนัง
          </p>
        </div>

        {/* Main Grid: Interactive Slider + Stats */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.15fr) minmax(0, 0.85fr)',
            gap: '2.5rem',
            alignItems: 'center',
          }}
          className="clinical-grid"
        >
          {/* Interactive Before & After Slider */}
          <div
            ref={containerRef}
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
            onMouseLeave={() => setIsDragging(false)}
            onMouseMove={handleMouseMove}
            onTouchMove={handleTouchMove}
            style={{
              position: 'relative',
              borderRadius: '24px',
              overflow: 'hidden',
              boxShadow: '0 16px 36px rgba(225, 29, 72, 0.12)',
              border: '2px solid rgba(255, 209, 220, 0.7)',
              height: '380px',
              userSelect: 'none',
              cursor: 'ew-resize',
              background: '#0F172A',
            }}
          >
            {/* After Image (Background layer) */}
            <img
              src="https://images.unsplash.com/photo-1512290900672-1f558a2c9763?auto=format&fit=crop&w=1000&q=80"
              alt="After 14 Days"
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
            {/* Tag After */}
            <div
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'rgba(225, 29, 72, 0.88)',
                backdropFilter: 'blur(8px)',
                color: '#FFFFFF',
                padding: '0.35rem 0.85rem',
                borderRadius: '9999px',
                fontSize: '0.8rem',
                fontWeight: 700,
                zIndex: 2,
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              }}
            >
              หลังใช้ 14 วัน (Day 14 Glow ✨)
            </div>

            {/* Before Image (Clipped layer) */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                bottom: 0,
                width: `${sliderPosition}%`,
                overflow: 'hidden',
                zIndex: 3,
                borderRight: '3px solid #FFFFFF',
                boxShadow: '4px 0 16px rgba(0,0,0,0.3)',
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=80"
                alt="Before"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: containerRef.current ? `${containerRef.current.offsetWidth}px` : '1000px',
                  height: '100%',
                  objectFit: 'cover',
                  filter: 'grayscale(25%) contrast(92%)',
                }}
              />
              {/* Tag Before */}
              <div
                style={{
                  position: 'absolute',
                  top: '16px',
                  left: '16px',
                  background: 'rgba(15, 23, 42, 0.75)',
                  backdropFilter: 'blur(8px)',
                  color: '#FFFFFF',
                  padding: '0.35rem 0.85rem',
                  borderRadius: '9999px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                }}
              >
                ก่อนใช้ (Day 0)
              </div>
            </div>

            {/* Drag Handle Bar & Button */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: `${sliderPosition}%`,
                transform: 'translate(-50%, -50%)',
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: '#FFFFFF',
                border: '3px solid #E11D48',
                boxShadow: '0 4px 18px rgba(0,0,0,0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
                color: '#E11D48',
                fontSize: '0.85rem',
                fontWeight: 900,
              }}
            >
              ⇄
            </div>

            {/* Hint label bottom */}
            <div
              style={{
                position: 'absolute',
                bottom: '12px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(0, 0, 0, 0.65)',
                backdropFilter: 'blur(6px)',
                color: '#FFFFFF',
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.72rem',
                zIndex: 4,
                pointerEvents: 'none',
              }}
            >
              เลื่อนแถบ ซ้าย-ขวา เพื่อเปรียบเทียบผลลัพธ์
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
                background: 'rgba(255, 255, 255, 0.85)',
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
                background: 'rgba(255, 255, 255, 0.85)',
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
                background: 'rgba(255, 255, 255, 0.85)',
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
                background: 'linear-gradient(135deg, rgba(255, 240, 243, 0.85) 0%, rgba(254, 226, 226, 0.5) 100%)',
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
