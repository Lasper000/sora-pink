import React from 'react';
import { Sparkles, Heart, ShieldCheck, Truck } from 'lucide-react';

interface TrustBadgeItem {
  icon: React.ReactNode;
  tag: string;
  title: string;
  subtitle: string;
}

export const BrandTrustBadges: React.FC = () => {
  const badges: TrustBadgeItem[] = [
    {
      icon: <Sparkles size={18} color="#C73D62" />,
      tag: 'CLEAN FORMULA',
      title: 'สูตรอ่อนโยน Clean & Gentle',
      subtitle: 'ปราศจากแอลกอฮอล์ พาราเบน และสารอันตราย 0%',
    },
    {
      icon: <Heart size={18} color="#C73D62" />,
      tag: 'ETHICAL BEAUTY',
      title: 'Cruelty-Free & Vegan',
      subtitle: 'ไม่ทดลองกับสัตว์ สารสกัดจากธรรมชาติและออร์แกนิก',
    },
    {
      icon: <ShieldCheck size={18} color="#C73D62" />,
      tag: 'DERMA TESTED',
      title: 'Dermatologist Verified',
      subtitle: 'ผ่านการทดสอบโดยแพทย์ผิวหนัง สำหรับผิวแพ้ง่าย',
    },
    {
      icon: <Truck size={18} color="#C73D62" />,
      tag: 'COMPLIMENTARY',
      title: 'จัดส่งด่วนฟรี ฿500+',
      subtitle: 'แพ็กเกจจิ้งพรีเมียม จัดส่งไว 1-2 วัน พร้อมรับประกัน',
    },
  ];

  return (
    <section className="brand-trust-section" style={{ padding: '1.25rem 0', position: 'relative' }}>
      <div className="container">
        <div className="trust-badges-grid">
          {badges.map((item, index) => (
            <div
              key={index}
              className="trust-badge-card"
              style={{
                background: '#FFFFFF',
                border: '1px solid rgba(222, 83, 119, 0.14)',
                borderRadius: '20px',
                padding: '1.25rem 1.35rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.9rem',
                transition: 'all 0.25s ease',
                boxShadow: '0 4px 16px rgba(216, 74, 110, 0.05)',
              }}
            >
              <div
                className="trust-badge-icon-box"
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: '#FFF0F4',
                  border: '1px solid #FAD1DC',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {item.icon}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                  <span
                    style={{
                      fontSize: '0.62rem',
                      fontWeight: 700,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: '#C73D62',
                    }}
                  >
                    {item.tag}
                  </span>
                </div>
                <h4
                  className="trust-badge-title"
                  style={{
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    marginBottom: '0.15rem',
                    lineHeight: 1.3,
                  }}
                >
                  {item.title}
                </h4>
                <p
                  className="trust-badge-subtitle"
                  style={{
                    fontSize: '0.78rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.45,
                    margin: 0,
                  }}
                >
                  {item.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .trust-badges-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 1rem;
          width: 100%;
          box-sizing: border-box;
        }
        .trust-badge-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px -4px rgba(28, 25, 23, 0.08) !important;
          border-color: rgba(140, 46, 65, 0.25) !important;
        }
        @media (max-width: 992px) {
          .trust-badges-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 0.85rem;
          }
        }
        @media (max-width: 640px) {
          .trust-badges-grid {
            grid-template-columns: 1fr;
            gap: 0.65rem;
          }
          .trust-badge-card {
            padding: 0.9rem 1rem !important;
          }
        }
        [data-theme="dark"] .trust-badge-card {
          background: #1D1A1C !important;
          border-color: rgba(255, 255, 255, 0.08) !important;
        }
        [data-theme="dark"] .trust-badge-icon-box {
          background: #282225 !important;
          border-color: rgba(255, 255, 255, 0.1) !important;
        }
      `}</style>
    </section>
  );
};
