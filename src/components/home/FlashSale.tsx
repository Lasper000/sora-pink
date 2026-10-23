import React, { useState, useEffect } from 'react';
import type { Product } from '../../types';
import { Flame, Clock, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { showToast } from '../common/Toast';

interface FlashSaleProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

export const FlashSale: React.FC<FlashSaleProps> = ({ products, onSelectProduct }) => {
  const { addToCart } = useCart();
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 28, seconds: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter products with discount
  const flashSaleItems = products.filter((p) => p.discount_price && p.discount_price < p.price).slice(0, 4);

  if (flashSaleItems.length === 0) return null;

  const handleAddToCart = (e: React.MouseEvent, p: Product) => {
    e.stopPropagation();
    const res = addToCart(p, 1);
    showToast(res.message, res.success ? 'success' : 'error');
  };

  return (
    <section id="flash-sale" style={{ padding: '2rem 0' }}>
      <div className="container">
        <div
          className="glass-card"
          style={{
            background: 'linear-gradient(135deg, #FFF0F3 0%, #FFFFFF 40%, #EBF8FF 100%)',
            borderRadius: '24px',
            padding: '2rem',
            border: '1.5px solid rgba(255, 209, 220, 0.7)',
            boxShadow: '0 10px 30px rgba(255, 175, 190, 0.2)',
          }}
        >
          {/* Header with Countdown */}
          <div
            className="flash-sale-header"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '1.75rem',
              borderBottom: '1px solid rgba(255, 209, 220, 0.4)',
              paddingBottom: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #FF6B8B 0%, #E11D48 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  boxShadow: '0 6px 16px rgba(225, 29, 72, 0.4)',
                }}
              >
                <Flame size={26} className="animate-fire" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#1F2937' }}>
                  FLASH SALE ดีลเด็ดจำกัดเวลา
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#6B7280' }}>
                  ลดกระหน่ำสูงสุด 40% เฉพาะรอบวันนี้เท่านั้น!
                </p>
              </div>
            </div>

            {/* Live Timer Boxes */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={18} color="#E11D48" className="animate-breathe" />
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4B5563' }}>สิ้นสุดใน:</span>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                <span
                  style={{
                    background: 'linear-gradient(135deg, #E11D48 0%, #BE123C 100%)',
                    color: '#fff',
                    borderRadius: '8px',
                    padding: '4px 8px',
                    fontWeight: 800,
                    fontSize: '0.92rem',
                    boxShadow: '0 2px 8px rgba(225, 29, 72, 0.35)',
                    minWidth: '32px',
                    textAlign: 'center',
                  }}
                >
                  {String(timeLeft.hours).padStart(2, '0')}
                </span>
                <span style={{ fontWeight: 800, color: '#E11D48', animation: 'softBreathe 1s infinite' }}>:</span>
                <span
                  style={{
                    background: 'linear-gradient(135deg, #E11D48 0%, #BE123C 100%)',
                    color: '#fff',
                    borderRadius: '8px',
                    padding: '4px 8px',
                    fontWeight: 800,
                    fontSize: '0.92rem',
                    boxShadow: '0 2px 8px rgba(225, 29, 72, 0.35)',
                    minWidth: '32px',
                    textAlign: 'center',
                  }}
                >
                  {String(timeLeft.minutes).padStart(2, '0')}
                </span>
                <span style={{ fontWeight: 800, color: '#E11D48', animation: 'softBreathe 1s infinite' }}>:</span>
                <span
                  style={{
                    background: 'linear-gradient(135deg, #E11D48 0%, #BE123C 100%)',
                    color: '#fff',
                    borderRadius: '8px',
                    padding: '4px 8px',
                    fontWeight: 800,
                    fontSize: '0.92rem',
                    boxShadow: '0 2px 8px rgba(225, 29, 72, 0.35)',
                    minWidth: '32px',
                    textAlign: 'center',
                  }}
                >
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
              </div>
            </div>
          </div>

          {/* Items Grid */}
          <div className="flash-sale-grid-container">
            {flashSaleItems.map((product) => {
              const discountPercent = Math.round(
                ((product.price - (product.discount_price || product.price)) / product.price) * 100
              );

              return (
                <div
                  key={product.id}
                  onClick={() => onSelectProduct(product)}
                  className="glass-card flash-sale-card"
                  style={{
                    cursor: 'pointer',
                    background: '#FFFFFF',
                    borderRadius: '18px',
                    border: '1px solid rgba(255, 209, 220, 0.5)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    {/* Image with discount badge */}
                    <div
                      className="flash-sale-card-img"
                      style={{
                        position: 'relative',
                        width: '100%',
                        borderRadius: '14px',
                        overflow: 'hidden',
                        marginBottom: '0.75rem',
                        background: '#FFF5F8',
                      }}
                    >
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <span
                        style={{
                          position: 'absolute',
                          top: '8px',
                          left: '8px',
                          background: '#E11D48',
                          color: '#FFFFFF',
                          padding: '2px 8px',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                        }}
                      >
                        -{discountPercent}%
                      </span>
                    </div>

                    <h4
                      style={{
                        fontSize: '0.92rem',
                        fontWeight: 600,
                        marginBottom: '0.4rem',
                        lineHeight: 1.4,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {product.name}
                    </h4>

                    {/* Stock meter */}
                    <div style={{ marginBottom: '0.75rem' }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '0.75rem',
                          color: '#6B7280',
                          marginBottom: '3px',
                        }}
                      >
                        <span>สต็อกคงเหลือ</span>
                        <span style={{ fontWeight: 600, color: '#E11D48' }}>
                          {product.stock_quantity > 0 ? `${product.stock_quantity} ชิ้น` : 'สินค้าหมด'}
                        </span>
                      </div>
                      <div
                        style={{
                          height: '6px',
                          borderRadius: '9999px',
                          background: '#FEE2E2',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          className="striped-bar"
                          style={{
                            height: '100%',
                            width: `${Math.min(100, Math.max(15, product.stock_quantity * 2))}%`,
                            background: 'linear-gradient(90deg, #FF8DA8 0%, #E11D48 100%)',
                            borderRadius: '9999px',
                            transition: 'width 0.5s ease',
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Price & Add button */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: '0.5rem',
                      borderTop: '1px solid #F3F4F6',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#E11D48' }}>
                        ฿{(product.discount_price || product.price).toLocaleString()}
                      </div>
                      <div
                        style={{
                          fontSize: '0.78rem',
                          color: '#9CA3AF',
                          textDecoration: 'line-through',
                        }}
                      >
                        ฿{product.price.toLocaleString()}
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleAddToCart(e, product)}
                      disabled={product.stock_quantity <= 0}
                      className="btn btn-primary btn-sm"
                      style={{ padding: '0.45rem 0.75rem' }}
                    >
                      <ShoppingBag size={14} /> เพิ่ม
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
