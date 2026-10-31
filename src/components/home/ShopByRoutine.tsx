import React, { useState } from 'react';
import type { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { showToast } from '../common/Toast';
import { Sparkles, Sun, Moon, Palette, ShoppingBag, ArrowRight } from 'lucide-react';

interface RoutineSet {
  id: string;
  title: string;
  tagline: string;
  badge: string;
  icon: React.ReactNode;
  themeColor: string;
  discountPercent: number;
  productIds: string[];
  description: string;
}

interface ShopByRoutineProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

export const ShopByRoutine: React.FC<ShopByRoutineProps> = ({ products, onSelectProduct }) => {
  const { addToCart } = useCart();
  const [activeRoutineId, setActiveRoutineId] = useState<string>('morning-glow');

  const routines: RoutineSet[] = [
    {
      id: 'morning-glow',
      title: '☀️ Morning Dew Glow Routine',
      tagline: '3 ขั้นตอนผิวฉ่ำวาวอิ่มน้ำ พร้อมออกแดดตลอดวัน',
      badge: 'เซตขายดีอันดับ 1 🔥',
      icon: <Sun size={20} color="#F59E0B" />,
      themeColor: '#F59E0B',
      discountPercent: 20,
      productIds: [
        'a1000000-0000-0000-0000-000000000001', // Barrier Serum
        'a1000000-0000-0000-0000-000000000002', // Velvet Tint
        'a1000000-0000-0000-0000-000000000003', // Niacinamide Solution
      ],
      description: 'รูทีนบูสต์ผิวใสยามเช้า ปลุกผิวให้ตื่นด้วยเซรั่มไฮยาเข้มข้น ลดรอยสิวด้วยไนอะซินาไมด์ และเติมความฉ่ำระเรื่อให้ริมฝีปาก',
    },
    {
      id: 'night-repair',
      title: '🌙 Deep Night Recovery & Relax',
      tagline: 'ซ่อมแซมและปลอบประโลมผิวอย่างล้ำลึกยามค่ำคืน',
      badge: 'กู้ผิวฉ่ำฟูข้ามคืน 💤',
      icon: <Moon size={20} color="#8B5CF6" />,
      themeColor: '#8B5CF6',
      discountPercent: 20,
      productIds: [
        'a1000000-0000-0000-0000-000000000004', // Sleeping Mask / Retinol
        'a1000000-0000-0000-0000-000000000007', // Hair Elixir
        'a1000000-0000-0000-0000-000000000006', // Cica Calming Cream
      ],
      description: 'ปรนนิบัติผิวก่อนนอน เติมสารอาหารกู้เกราะป้องกันผิวที่เหนื่อยล้า บำรุงเส้นผม พร้อมกลิ่นหอมผ่อนคลายช่วยให้หลับสบาย',
    },
    {
      id: 'pastel-makeup',
      title: '🌸 Sweet Pastel Daily Glam',
      tagline: 'คอมโบเมคอัพโทนชมพู สวยละมุน สไตล์เกาหลี',
      badge: 'ลุคพาสเทลน่ารัก 🍓',
      icon: <Palette size={20} color="#EC4899" />,
      themeColor: '#EC4899',
      discountPercent: 15,
      productIds: [
        'a1000000-0000-0000-0000-000000000008', // Marshmallow Blush
        'a1000000-0000-0000-0000-000000000002', // Velvet Jelly Tint
        'a1000000-0000-0000-0000-000000000005', // Sun Cushion
      ],
      description: 'แต่งหน้าง่ายใน 5 นาที คุชชั่นกันแดดผิวผ่อง ปัดแก้มมาร์ชแมลโลว์ระเรื่อ และแต้มลิปทินท์ฉ่ำวาว ติดทนนานตลอดวัน',
    },
  ];

  const currentRoutine = routines.find((r) => r.id === activeRoutineId) || routines[0];

  // Resolve products in the current routine (fallback to first available if not found)
  const bundleProducts = currentRoutine.productIds
    .map((id) => products.find((p) => p.id === id))
    .filter(Boolean) as Product[];

  // Fallback if some product IDs weren't matched
  const resolvedProducts = bundleProducts.length >= 2 
    ? bundleProducts 
    : products.slice(0, 3);

  const originalTotalPrice = resolvedProducts.reduce((sum, p) => sum + (p.price || 0), 0);
  const bundlePrice = Math.round(originalTotalPrice * (1 - currentRoutine.discountPercent / 100));
  const savings = originalTotalPrice - bundlePrice;

  const handleAddBundleToCart = () => {
    let addedCount = 0;
    resolvedProducts.forEach((p) => {
      const res = addToCart(p, 1);
      if (res.success) addedCount++;
    });

    if (addedCount > 0) {
      showToast(
        `เพิ่มเซต ${currentRoutine.title.split(' ')[1]} (${addedCount} ชิ้น) ลงตะกร้าแล้ว ประหยัด ฿${savings.toLocaleString()}! ✨`,
        'success'
      );
    }
  };

  return (
    <section id="shop-by-routine" style={{ padding: '3.5rem 0', position: 'relative' }}>
      <div className="container">
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.25rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: '#F43F5E',
              fontSize: '0.85rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '0.35rem',
            }}
          >
            <Sparkles size={16} /> BUNDLE & SAVE BIG
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            จับคู่เซตบิวตี้รูทีน <span style={{ color: '#E11D48' }}>คุ้มค่ากว่า</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '580px', margin: '0 auto' }}>
            ดูแลผิวอย่างตรงจุดด้วยสกินแคร์และเมคอัพที่คัดสรรมาให้ทำงานร่วมกันอย่างลงตัว พร้อมรับส่วนลดพิเศษเมื่อซื้อยกเซต
          </p>
        </div>

        {/* Routine Switcher Tabs */}
        <div className="routine-tabs-container" style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          {routines.map((routine) => {
            const isActive = routine.id === activeRoutineId;
            return (
              <button
                key={routine.id}
                onClick={() => setActiveRoutineId(routine.id)}
                className={`routine-tab-btn ${isActive ? 'active' : ''}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.65rem 1.25rem',
                  borderRadius: '9999px',
                  border: isActive ? `2px solid ${routine.themeColor}` : '1.5px solid var(--border-glass)',
                  background: isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.65)',
                  color: isActive ? routine.themeColor : 'var(--text-primary)',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  boxShadow: isActive ? `0 6px 20px -2px rgba(244, 63, 94, 0.25)` : '0 2px 8px rgba(0,0,0,0.03)',
                }}
              >
                {routine.icon}
                <span>{routine.title}</span>
                <span
                  style={{
                    fontSize: '0.72rem',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '9999px',
                    background: isActive ? routine.themeColor : 'rgba(244, 63, 94, 0.12)',
                    color: isActive ? '#FFFFFF' : '#E11D48',
                    fontWeight: 800,
                  }}
                >
                  -{routine.discountPercent}%
                </span>
              </button>
            );
          })}
        </div>

        {/* Routine Bundle Showcase Card */}
        <div
          className="routine-bundle-card glass-card"
          style={{
            borderRadius: '24px',
            padding: '2rem',
            border: '1.5px solid rgba(255, 209, 220, 0.7)',
            boxShadow: '0 16px 40px rgba(255, 141, 168, 0.12)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Top Banner Tag */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <span
                style={{
                  display: 'inline-block',
                  background: 'linear-gradient(135deg, #FF6B8B 0%, #E11D48 100%)',
                  color: '#FFFFFF',
                  padding: '0.3rem 0.85rem',
                  borderRadius: '9999px',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  marginBottom: '0.5rem',
                  boxShadow: '0 4px 12px rgba(225, 29, 72, 0.3)',
                }}
              >
                {currentRoutine.badge}
              </span>
              <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                {currentRoutine.title}
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: '0.25rem 0 0 0' }}>
                {currentRoutine.tagline}
              </p>
            </div>

            {/* Savings Callout Pill */}
            <div
              style={{
                background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
                border: '1px solid #A7F3D0',
                padding: '0.55rem 1rem',
                borderRadius: '16px',
                textAlign: 'right',
              }}
            >
              <div style={{ fontSize: '0.75rem', color: '#047857', fontWeight: 600 }}>ประหยัดทันทีเมื่อซื้อเซตนี้</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#065F46' }}>
                ลด ฿{savings.toLocaleString()} ({currentRoutine.discountPercent}%)
              </div>
            </div>
          </div>

          {/* 3 Bundled Products Grid */}
          <div className="bundle-products-grid">
            {resolvedProducts.map((prod, idx) => (
              <div
                key={prod.id}
                onClick={() => onSelectProduct(prod)}
                className="bundle-item-box"
                style={{
                  background: 'rgba(255, 255, 255, 0.8)',
                  borderRadius: '18px',
                  padding: '1rem',
                  border: '1px solid rgba(255, 209, 220, 0.5)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  gap: '0.85rem',
                  alignItems: 'center',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '8px',
                    left: '8px',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: '#E11D48',
                    color: '#FFFFFF',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 6px rgba(225, 29, 72, 0.4)',
                    zIndex: 2,
                  }}
                >
                  {idx + 1}
                </div>

                <div
                  style={{
                    width: '74px',
                    height: '74px',
                    borderRadius: '14px',
                    overflow: 'hidden',
                    background: '#F9FAFB',
                    flexShrink: 0,
                  }}
                >
                  <img
                    src={prod.images[0]}
                    alt={prod.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>

                <div style={{ overflow: 'hidden', flex: 1 }}>
                  <div style={{ fontSize: '0.72rem', color: '#E11D48', fontWeight: 700 }}>ขั้นตอนที่ {idx + 1}</div>
                  <h5
                    style={{
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                      margin: '2px 0 4px 0',
                    }}
                  >
                    {prod.name}
                  </h5>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    ราคาปกติ: <span style={{ textDecoration: 'line-through' }}>฿{prod.price.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Action Bar */}
          <div
            style={{
              marginTop: '1.75rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid rgba(255, 209, 220, 0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                ราคารวมทั้งเซต 3 ชิ้น (จากปกติ ฿{originalTotalPrice.toLocaleString()})
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem' }}>
                <span style={{ fontSize: '2rem', fontWeight: 900, color: '#E11D48' }}>
                  ฿{bundlePrice.toLocaleString()}
                </span>
                <span style={{ fontSize: '1rem', color: '#9CA3AF', textDecoration: 'line-through' }}>
                  ฿{originalTotalPrice.toLocaleString()}
                </span>
                <span
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: '#059669',
                    background: '#ECFDF5',
                    padding: '0.2rem 0.55rem',
                    borderRadius: '6px',
                  }}
                >
                  ประหยัด ฿{savings.toLocaleString()}
                </span>
              </div>
            </div>

            <button
              onClick={handleAddBundleToCart}
              className="btn btn-primary btn-lg bundle-cta-btn"
              style={{
                padding: '0.85rem 1.85rem',
                fontSize: '1rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.6rem',
                borderRadius: '16px',
                boxShadow: '0 8px 24px rgba(225, 29, 72, 0.35)',
              }}
            >
              <ShoppingBag size={20} />
              <span>เพิ่มทั้งเซตลงตะกร้า (3 ชิ้น)</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .bundle-products-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
        }
        .bundle-item-box:hover {
          transform: translateY(-4px);
          border-color: #E11D48 !important;
          box-shadow: 0 10px 20px rgba(255, 141, 168, 0.18) !important;
        }
        .bundle-cta-btn:hover {
          transform: translateY(-2px) scale(1.02);
        }
        @media (max-width: 868px) {
          .bundle-products-grid {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 640px) {
          .routine-tabs-container {
            flex-wrap: nowrap !important;
            overflow-x: auto !important;
            -webkit-overflow-scrolling: touch !important;
            justify-content: flex-start !important;
            padding: 0.25rem 0.25rem 0.75rem 0.25rem !important;
            scrollbar-width: none !important;
          }
          .routine-tabs-container::-webkit-scrollbar {
            display: none !important;
          }
          .routine-tab-btn {
            flex-shrink: 0 !important;
            padding: 0.5rem 0.95rem !important;
            font-size: 0.82rem !important;
          }
          .routine-bundle-card {
            padding: 1.15rem 0.85rem !important;
            border-radius: 18px !important;
          }
          .bundle-cta-btn {
            width: 100% !important;
            justify-content: center !important;
            font-size: 0.92rem !important;
            padding: 0.75rem 1rem !important;
          }
        }
        [data-theme="dark"] .routine-tab-btn {
          background: rgba(24, 29, 43, 0.8) !important;
        }
        [data-theme="dark"] .routine-tab-btn.active {
          background: rgba(36, 44, 65, 0.95) !important;
        }
        [data-theme="dark"] .bundle-item-box {
          background: rgba(22, 27, 40, 0.85) !important;
          border-color: rgba(255, 255, 255, 0.1) !important;
        }
        [data-theme="dark"] .bundle-item-box div div {
          background: rgba(18, 22, 34, 0.95) !important;
        }
      `}</style>
    </section>
  );
};
