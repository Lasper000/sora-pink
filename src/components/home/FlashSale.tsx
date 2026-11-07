import React, { useState, useEffect } from 'react';
import type { Product } from '../../types';
import { Flame, Clock, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { showToast } from '../common/Toast';
import { handleImageError, DEFAULT_FALLBACK_IMAGE } from '../../utils/imageFallback';

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
    <section id="flash-sale" style={{ padding: '2.5rem 0' }}>
      <div className="container">
        <div
          className="glass-card flash-sale-main-card"
          style={{
            background: 'linear-gradient(180deg, #FFFFFF 0%, #FFFDFE 100%)',
            borderRadius: '26px',
            padding: '2.25rem 2rem',
            border: '1px solid rgba(222, 83, 119, 0.16)',
            boxShadow: '0 8px 30px rgba(216, 74, 110, 0.06)',
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
              gap: '1.25rem',
              marginBottom: '2rem',
              borderBottom: '1px solid rgba(222, 83, 119, 0.12)',
              paddingBottom: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #FFF0F4 0%, #FEE2E8 100%)',
                  border: '1px solid #FAD1DC',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#C73D62',
                  boxShadow: '0 4px 14px rgba(216, 74, 110, 0.12)',
                }}
              >
                <Flame size={22} />
              </div>
              <div>
                <div
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    color: '#C73D62',
                    marginBottom: '0.2rem',
                  }}
                >
                  LIMITED CURATION • PRIVATE OFFER
                </div>
                <h3
                  className="font-serif flash-sale-title"
                  style={{
                    fontSize: '1.65rem',
                    fontWeight: 700,
                    color: '#2C2224',
                    letterSpacing: '-0.01em',
                    lineHeight: 1.2,
                  }}
                >
                  Exclusive Flash Drop
                </h3>
              </div>
            </div>

            {/* Live Timer Boxes - Luminous Rose Petal Style */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                background: '#FFF5F8',
                padding: '0.5rem 1.15rem',
                borderRadius: '9999px',
                border: '1px solid #FAD1DC',
              }}
            >
              <Clock size={16} color="#C73D62" />
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: '#706064',
                }}
              >
                Time Remaining
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <span
                  style={{
                    background: 'linear-gradient(135deg, #DF5E7E 0%, #C73D62 100%)',
                    color: '#FFFFFF',
                    borderRadius: '10px',
                    padding: '3px 8px',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    fontFamily: 'monospace',
                    minWidth: '28px',
                    textAlign: 'center',
                    boxShadow: '0 2px 6px rgba(216, 74, 110, 0.25)',
                  }}
                >
                  {String(timeLeft.hours).padStart(2, '0')}
                </span>
                <span style={{ fontWeight: 700, color: '#C73D62' }}>:</span>
                <span
                  style={{
                    background: 'linear-gradient(135deg, #DF5E7E 0%, #C73D62 100%)',
                    color: '#FFFFFF',
                    borderRadius: '10px',
                    padding: '3px 8px',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    fontFamily: 'monospace',
                    minWidth: '28px',
                    textAlign: 'center',
                    boxShadow: '0 2px 6px rgba(216, 74, 110, 0.25)',
                  }}
                >
                  {String(timeLeft.minutes).padStart(2, '0')}
                </span>
                <span style={{ fontWeight: 700, color: '#C73D62' }}>:</span>
                <span
                  style={{
                    background: 'linear-gradient(135deg, #DF5E7E 0%, #C73D62 100%)',
                    color: '#FFFFFF',
                    borderRadius: '10px',
                    padding: '3px 8px',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    fontFamily: 'monospace',
                    minWidth: '28px',
                    textAlign: 'center',
                    boxShadow: '0 2px 6px rgba(216, 74, 110, 0.25)',
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
                    borderRadius: '22px',
                    border: '1px solid rgba(222, 83, 119, 0.16)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '1.1rem',
                    transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
                  }}
                >
                  <div>
                    {/* Image with discount badge */}
                    <div
                      className="flash-sale-card-img"
                      style={{
                        position: 'relative',
                        width: '100%',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        marginBottom: '0.85rem',
                        background: '#FFF5F8',
                      }}
                    >
                      <img
                        src={(product.images && product.images[0]) || DEFAULT_FALLBACK_IMAGE}
                        alt={product.name}
                        onError={handleImageError}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          filter: product.stock_quantity <= 0 ? 'grayscale(70%) opacity(0.85)' : 'none',
                          transition: 'transform 0.5s ease',
                        }}
                      />

                      {/* Out of Stock Overlay */}
                      {product.stock_quantity <= 0 && (
                        <div
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(44, 34, 36, 0.55)',
                            backdropFilter: 'blur(3px)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 2,
                          }}
                        >
                          <span
                            style={{
                              background: '#C73D62',
                              color: '#FFFFFF',
                              padding: '5px 14px',
                              borderRadius: '9999px',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              letterSpacing: '0.04em',
                              textTransform: 'uppercase',
                              border: '1px solid rgba(255, 255, 255, 0.2)',
                            }}
                          >
                            สินค้าหมด
                          </span>
                        </div>
                      )}

                      <span
                        style={{
                          position: 'absolute',
                          top: '10px',
                          left: '10px',
                          background: 'linear-gradient(135deg, #DF5E7E 0%, #C73D62 100%)',
                          color: '#FFFFFF',
                          padding: '3px 10px',
                          borderRadius: '9999px',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          letterSpacing: '0.04em',
                          boxShadow: '0 2px 8px rgba(216, 74, 110, 0.3)',
                          zIndex: 3,
                        }}
                      >
                        -{discountPercent}%
                      </span>
                    </div>

                    <h4
                      style={{
                        fontSize: '0.92rem',
                        fontWeight: 600,
                        color: '#2C2224',
                        marginBottom: '0.45rem',
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
                    <div style={{ marginBottom: '0.85rem' }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '0.72rem',
                          color: '#706064',
                          marginBottom: '4px',
                        }}
                      >
                        <span>สต็อกคงเหลือ</span>
                        <span style={{ fontWeight: 600, color: product.stock_quantity <= 3 ? '#C73D62' : '#2C2224' }}>
                          {product.stock_quantity > 0 ? `${product.stock_quantity} ชิ้น` : 'หมดแล้ว'}
                        </span>
                      </div>
                      <div
                        style={{
                          height: '4px',
                          borderRadius: '2px',
                          background: '#FEECEF',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            width: `${Math.min(100, Math.max(15, product.stock_quantity * 2))}%`,
                            background: product.stock_quantity <= 3 ? '#C73D62' : 'linear-gradient(90deg, #F48BA5 0%, #DF5E7E 100%)',
                            borderRadius: '2px',
                            transition: 'width 0.5s ease',
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Price & Add button */}
                  <div
                    className="flash-sale-price-row"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: '0.65rem',
                      borderTop: '1px solid rgba(222, 83, 119, 0.1)',
                    }}
                  >
                    <div>
                      <div
                        className="flash-sale-price"
                        style={{
                          fontSize: '1.2rem',
                          fontWeight: 700,
                          color: '#C73D62',
                          fontFamily: 'var(--font-sans)',
                          letterSpacing: '-0.02em',
                        }}
                      >
                        ฿{(product.discount_price || product.price).toLocaleString()}
                      </div>
                      <div
                        style={{
                          fontSize: '0.75rem',
                          color: '#A09296',
                          textDecoration: 'line-through',
                        }}
                      >
                        ฿{product.price.toLocaleString()}
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleAddToCart(e, product)}
                      disabled={product.stock_quantity <= 0}
                      className="btn btn-primary btn-sm flash-sale-add-btn"
                      style={{
                        padding: '0.45rem 1.1rem',
                        borderRadius: '9999px',
                        opacity: product.stock_quantity <= 0 ? 0.5 : 1,
                        cursor: product.stock_quantity <= 0 ? 'not-allowed' : 'pointer',
                        fontSize: '0.78rem',
                        letterSpacing: '0.04em',
                      }}
                    >
                      <ShoppingBag size={13} /> {product.stock_quantity <= 0 ? 'หมด' : 'ใส่ตะกร้า'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .flash-sale-main-card {
            padding: 1.15rem 0.85rem !important;
            border-radius: 18px !important;
          }
          .flash-sale-header {
            gap: 0.85rem !important;
            margin-bottom: 1.15rem !important;
            padding-bottom: 0.95rem !important;
          }
        }
      `}</style>
    </section>
  );
};
