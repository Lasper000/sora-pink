import React, { useState } from 'react';
import type { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { showToast } from '../common/Toast';
import { Sparkles, Sun, Moon, Palette, ShoppingBag, ArrowRight } from 'lucide-react';
import { handleImageError, DEFAULT_FALLBACK_IMAGE } from '../../utils/imageFallback';

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
      title: 'Morning Dew Hydration Protocol',
      tagline: '3 ขั้นตอนผิวฉ่ำวาวอิ่มน้ำ ล็อคความชุ่มชื้นตลอดวัน',
      badge: 'SIGNATURE PROTOCOL 01',
      icon: <Sun size={18} color="#C5A880" />,
      themeColor: '#C5A880',
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
      title: 'Cellular Night Recovery Ritual',
      tagline: 'ฟื้นบำรุงและปลอบประโลมผิวอย่างล้ำลึกยามค่ำคืน',
      badge: 'OVERNIGHT RECOVERY',
      icon: <Moon size={18} color="#8C2E41" />,
      themeColor: '#8C2E41',
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
      title: 'Luminous Velvet Everyday Edit',
      tagline: 'คอมโบเมคอัพโทนธรรมชาติ สวยละมุน สไตล์คลีนบิวตี้',
      badge: 'EVERYDAY EDIT',
      icon: <Palette size={18} color="#DF5E7E" />,
      themeColor: '#DF5E7E',
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
  const hasOutOfStock = resolvedProducts.some((p) => p.stock_quantity <= 0);

  const handleAddBundleToCart = () => {
    if (hasOutOfStock) {
      showToast('ขออภัยค่ะ มีสินค้าในเซตบางรายการหมดสต็อกชั่วคราว', 'error');
      return;
    }
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
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--rose-damask, #8C2E41)',
              fontSize: '0.72rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.16em',
              marginBottom: '0.4rem',
            }}
          >
            <Sparkles size={14} /> ATELIER REGIMENS • SYNERGISTIC CARE
          </div>
          <h2
            className="font-serif"
            style={{
              fontSize: '2.3rem',
              fontWeight: 600,
              color: '#2C2224',
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
              marginBottom: '0.5rem',
            }}
          >
            Curated Beauty Rituals
          </h2>
          <p style={{ color: '#78716C', fontSize: '0.95rem', maxWidth: '560px', margin: '0 auto' }}>
            ปรนนิบัติผิวแบบองค์รวม ผสานสกินแคร์และเมคอัพที่ทำงานเกื้อหนุนกัน พร้อมสิทธิพิเศษเมื่อเลือกซื้อยกเซต
          </p>
        </div>

        {/* Routine Switcher Tabs */}
        <div className="routine-tabs-container" style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginBottom: '2.25rem', flexWrap: 'wrap' }}>
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
                  gap: '0.65rem',
                  padding: '0.65rem 1.25rem',
                  borderRadius: '8px',
                  border: isActive ? '1px solid #C73D62' : '1px solid rgba(222, 83, 119, 0.18)',
                  background: isActive ? 'linear-gradient(135deg, #DF5E7E 0%, #C73D62 100%)' : '#FFFFFF',
                  color: isActive ? '#FFFFFF' : '#706064',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  boxShadow: isActive ? '0 4px 14px rgba(216, 74, 110, 0.25)' : 'none',
                }}
              >
                {routine.icon}
                <span>{routine.title}</span>
                <span
                  style={{
                    fontSize: '0.7rem',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '4px',
                    background: isActive ? 'rgba(255, 255, 255, 0.25)' : '#FFF0F4',
                    color: isActive ? '#FFFFFF' : '#C73D62',
                    fontWeight: 700,
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
            borderRadius: '16px',
            padding: '2.25rem',
            background: '#FFFFFF',
            border: '1px solid rgba(222, 83, 119, 0.16)',
            boxShadow: '0 8px 30px rgba(216, 74, 110, 0.05)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Top Banner Tag */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span
                style={{
                  display: 'inline-block',
                  background: '#FFF0F4',
                  color: '#C73D62',
                  border: '1px solid #FAD1DC',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '4px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  marginBottom: '0.65rem',
                }}
              >
                {currentRoutine.badge}
              </span>
              <h3
                className="font-serif"
                style={{
                  fontSize: '1.65rem',
                  fontWeight: 600,
                  color: '#2C2224',
                  margin: 0,
                  letterSpacing: '-0.01em',
                }}
              >
                {currentRoutine.title}
              </h3>
              <p style={{ color: '#706064', fontSize: '0.9rem', margin: '0.35rem 0 0 0' }}>
                {currentRoutine.tagline}
              </p>
            </div>

            {/* Savings Callout Pill */}
            <div
              className="routine-savings-pill"
              style={{
                background: '#FFF5F8',
                border: '1px solid #FAD1DC',
                padding: '0.65rem 1.15rem',
                borderRadius: '8px',
                textAlign: 'right',
              }}
            >
              <div style={{ fontSize: '0.72rem', color: '#706064', fontWeight: 600, letterSpacing: '0.04em' }}>PRIVILEGE SAVINGS</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#C73D62' }}>
                ประหยัด ฿{savings.toLocaleString()} ({currentRoutine.discountPercent}%)
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
                  background: '#FFFDFE',
                  borderRadius: '10px',
                  padding: '1rem',
                  border: '1px solid rgba(222, 83, 119, 0.12)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  gap: '0.9rem',
                  alignItems: 'center',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '8px',
                    left: '8px',
                    width: '22px',
                    height: '22px',
                    borderRadius: '4px',
                    background: 'linear-gradient(135deg, #DF5E7E 0%, #C73D62 100%)',
                    color: '#FFFFFF',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2,
                    boxShadow: '0 2px 6px rgba(216, 74, 110, 0.25)',
                  }}
                >
                  {idx + 1}
                </div>

                <div
                  style={{
                    width: '74px',
                    height: '74px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    background: '#FFF5F8',
                    flexShrink: 0,
                    border: '1px solid #FAD1DC',
                  }}
                >
                  <img
                    src={(prod.images && prod.images[0]) || DEFAULT_FALLBACK_IMAGE}
                    alt={prod.name}
                    onError={handleImageError}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>

                <div style={{ overflow: 'hidden', flex: 1 }}>
                  <div style={{ fontSize: '0.68rem', color: '#C73D62', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    STEP 0{idx + 1}
                  </div>
                  <h5
                    style={{
                      fontSize: '0.88rem',
                      fontWeight: 600,
                      color: '#2C2224',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                      margin: '2px 0 4px 0',
                    }}
                  >
                    {prod.name}
                  </h5>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                    <div style={{ fontSize: '0.78rem', color: '#706064' }}>
                      <span style={{ textDecoration: 'line-through' }}>฿{prod.price.toLocaleString()}</span>
                    </div>
                    {prod.stock_quantity <= 0 ? (
                      <span style={{ fontSize: '0.68rem', color: '#C73D62', background: '#FEECEF', padding: '1px 6px', borderRadius: '3px', fontWeight: 700 }}>
                        สินค้าหมด
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.68rem', color: '#706064', background: '#FFF0F4', padding: '1px 6px', borderRadius: '3px', fontWeight: 500 }}>
                        สต็อก {prod.stock_quantity}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Action Bar */}
          <div
            style={{
              marginTop: '2rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid rgba(222, 83, 119, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1.25rem',
            }}
          >
            <div>
              <div style={{ fontSize: '0.78rem', color: '#706064', letterSpacing: '0.02em' }}>
                ราคารวมทั้งเซต 3 ชิ้น (จากราคาปกติ ฿{originalTotalPrice.toLocaleString()})
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.2rem' }}>
                <span className="routine-bundle-price" style={{ fontSize: '2rem', fontWeight: 700, color: '#C73D62', letterSpacing: '-0.02em' }}>
                  ฿{bundlePrice.toLocaleString()}
                </span>
                <span style={{ fontSize: '0.95rem', color: '#A09296', textDecoration: 'line-through' }}>
                  ฿{originalTotalPrice.toLocaleString()}
                </span>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#C73D62',
                    background: '#FFF0F4',
                    border: '1px solid #FAD1DC',
                    padding: '0.25rem 0.6rem',
                    borderRadius: '4px',
                    letterSpacing: '0.02em',
                  }}
                >
                  ประหยัด ฿{savings.toLocaleString()}
                </span>
              </div>
            </div>

            <button
              onClick={handleAddBundleToCart}
              disabled={hasOutOfStock}
              className="btn btn-primary btn-lg bundle-cta-btn"
              style={{
                padding: '0.85rem 1.85rem',
                fontSize: '0.92rem',
                fontWeight: 600,
                letterSpacing: '0.04em',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.65rem',
                borderRadius: '8px',
                opacity: hasOutOfStock ? 0.6 : 1,
                cursor: hasOutOfStock ? 'not-allowed' : 'pointer',
              }}
            >
              <ShoppingBag size={18} />
              <span>{hasOutOfStock ? 'มีสินค้าในเซตหมดชั่วคราว' : 'สั่งซื้อทั้งเซต (3 ชิ้น)'}</span>
              <ArrowRight size={16} />
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
