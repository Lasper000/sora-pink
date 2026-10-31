import React from 'react';
import { Sparkles, Heart, ShieldCheck, Truck } from 'lucide-react';

interface TrustBadgeItem {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  badge: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
}

export const BrandTrustBadges: React.FC = () => {
  const badges: TrustBadgeItem[] = [
    {
      icon: <Sparkles size={24} color="#E11D48" />,
      title: 'สูตรอ่อนโยน Clean & Gentle',
      subtitle: 'ปราศจากแอลกอฮอล์ พาราเบน และสารเคมีอันตราย 0%',
      badge: '100% ปลอดภัย',
      bgColor: 'linear-gradient(135deg, rgba(255, 240, 243, 0.85) 0%, rgba(255, 226, 233, 0.5) 100%)',
      borderColor: 'rgba(255, 209, 220, 0.7)',
      textColor: '#BE123C',
    },
    {
      icon: <Heart size={24} color="#EC4899" />,
      title: 'Cruelty-Free & Vegan',
      subtitle: 'ไม่ทดลองกับสัตว์ อุดมด้วยสารสกัดธรรมชาติและออร์แกนิก',
      badge: 'รักผิว & รักษ์โลก',
      bgColor: 'linear-gradient(135deg, rgba(253, 242, 248, 0.85) 0%, rgba(252, 231, 243, 0.5) 100%)',
      borderColor: 'rgba(244, 114, 182, 0.4)',
      textColor: '#9D174D',
    },
    {
      icon: <ShieldCheck size={24} color="#0284C7" />,
      title: 'Dermatologist Tested',
      subtitle: 'ผ่านการทดสอบการระคายเคืองโดยแพทย์ผิวหนัง สำหรับผิวแพ้ง่าย',
      badge: 'รับรองโดยแพทย์',
      bgColor: 'linear-gradient(135deg, rgba(240, 249, 255, 0.85) 0%, rgba(224, 242, 254, 0.5) 100%)',
      borderColor: 'rgba(186, 230, 253, 0.7)',
      textColor: '#0369A1',
    },
    {
      icon: <Truck size={24} color="#059669" />,
      title: 'จัดส่งด่วนฟรี ฿500+',
      subtitle: 'แพ็กบับเบิลอย่างดี จัดส่งไวใน 1-2 วัน พร้อมรับประกัน 7 วัน',
      badge: 'ส่งด่วนทั่วไทย',
      bgColor: 'linear-gradient(135deg, rgba(236, 253, 245, 0.85) 0%, rgba(209, 250, 229, 0.5) 100%)',
      borderColor: 'rgba(167, 243, 208, 0.7)',
      textColor: '#047857',
    },
  ];

  return (
    <section className="brand-trust-section" style={{ padding: '1.75rem 0', position: 'relative' }}>
      <div className="container">
        <div className="trust-badges-grid">
          {badges.map((item, index) => (
            <div
              key={index}
              className="trust-badge-card glass-panel"
              style={{
                background: item.bgColor,
                border: `1px solid ${item.borderColor}`,
                borderRadius: '18px',
                padding: '1.25rem 1.15rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '0.75rem',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.03)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div
                  className="trust-badge-icon-box"
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '14px',
                    background: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                  }}
                >
                  {item.icon}
                </div>
                <span
                  className="trust-badge-pill"
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.55rem',
                    borderRadius: '9999px',
                    background: '#FFFFFF',
                    color: item.textColor,
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
                  }}
                >
                  {item.badge}
                </span>
              </div>

              <div>
                <h4
                  className="trust-badge-title"
                  style={{
                    fontSize: '0.96rem',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    marginBottom: '0.25rem',
                    lineHeight: 1.35,
                  }}
                >
                  {item.title}
                </h4>
                <p
                  className="trust-badge-subtitle"
                  style={{
                    fontSize: '0.8rem',
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
        .trust-badge-card {
          min-width: 0 !important;
          max-width: 100% !important;
          box-sizing: border-box !important;
        }
        .trust-badge-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 24px rgba(255, 141, 168, 0.18) !important;
        }
        @media (max-width: 992px) {
          .trust-badges-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 0.85rem;
          }
        }
        @media (max-width: 640px) {
          .trust-badges-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 0.6rem;
          }
          .trust-badge-card {
            padding: 0.85rem 0.75rem !important;
            border-radius: 14px !important;
            gap: 0.5rem !important;
          }
          .trust-badge-icon-box {
            width: 36px !important;
            height: 36px !important;
            border-radius: 10px !important;
          }
          .trust-badge-icon-box svg {
            width: 18px !important;
            height: 18px !important;
          }
          .trust-badge-pill {
            font-size: 0.65rem !important;
            padding: 0.15rem 0.45rem !important;
          }
          .trust-badge-title {
            font-size: 0.84rem !important;
            margin-bottom: 0.15rem !important;
          }
          .trust-badge-subtitle {
            font-size: 0.72rem !important;
            line-height: 1.35 !important;
            display: -webkit-box !important;
            -webkit-line-clamp: 2 !important;
            -webkit-box-orient: vertical !important;
            overflow: hidden !important;
          }
        }
        [data-theme="dark"] .trust-badge-card {
          background: rgba(22, 27, 40, 0.85) !important;
          border-color: rgba(255, 255, 255, 0.1) !important;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5) !important;
        }
        [data-theme="dark"] .trust-badge-card div div {
          background: rgba(30, 36, 52, 0.95) !important;
        }
        [data-theme="dark"] .trust-badge-card span {
          background: rgba(30, 36, 52, 0.95) !important;
        }
      `}</style>
    </section>
  );
};
