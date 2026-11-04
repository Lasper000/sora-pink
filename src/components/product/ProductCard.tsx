import React, { useState } from 'react';
import type { Product } from '../../types';
import { Star, Heart, ShoppingBag, Eye } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { showToast } from '../common/Toast';
import { handleImageError, DEFAULT_FALLBACK_IMAGE } from '../../utils/imageFallback';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
  onQuickView?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onClick, onQuickView }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [selectedShade, setSelectedShade] = useState(0);

  const isFavorited = isInWishlist(product.id);
  const isOutOfStock = product.stock_quantity <= 0;
  const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= 5;

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const added = toggleWishlist(product);
    showToast(
      added ? `เพิ่ม "${product.name}" ในรายการที่ชอบแล้วค่ะ` : `นำออกจากรายการที่ชอบแล้วค่ะ`,
      'info'
    );
  };

  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const res = addToCart(product, 1);
    showToast(res.message, res.success ? 'success' : 'error');
  };

  const discountPercent =
    product.discount_price && product.discount_price < product.price
      ? Math.round(((product.price - product.discount_price) / product.price) * 100)
      : null;

  return (
    <div
      onClick={onClick}
      className="glass-card"
      style={{
        borderRadius: '20px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        cursor: 'pointer',
        background: '#FFFFFF',
        border: '1px solid rgba(255, 209, 220, 0.5)',
        position: 'relative',
      }}
    >
      <div>
        {/* Image Container */}
        <div
          className="product-card-image-box"
          style={{
            position: 'relative',
            width: '100%',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #FFF5F8 0%, #F0F9FF 100%)',
          }}
        >
          <img
            src={(product.images && product.images[0]) || DEFAULT_FALLBACK_IMAGE}
            alt={product.name}
            loading="lazy"
            onError={handleImageError}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: isOutOfStock ? 'grayscale(70%) opacity(0.85)' : 'none',
              transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          />

          {/* Out of Stock Dark Overlay on Image */}
          {isOutOfStock && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(15, 23, 42, 0.42)',
                backdropFilter: 'blur(2px)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 3,
                pointerEvents: 'none',
              }}
            >
              <span
                style={{
                  background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                  color: '#FFFFFF',
                  padding: '5px 12px',
                  borderRadius: '9999px',
                  fontWeight: 800,
                  fontSize: '0.78rem',
                  letterSpacing: '0.4px',
                  boxShadow: '0 4px 12px rgba(220, 38, 38, 0.45)',
                }}
              >
                สินค้าหมดชั่วคราว
              </span>
              <span style={{ fontSize: '0.66rem', color: '#F1F5F9', marginTop: '3px', fontWeight: 600 }}>
                OUT OF STOCK
              </span>
            </div>
          )}

          {/* Floating Badges */}
          <div
            style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              zIndex: 4,
            }}
          >
            {isOutOfStock && (
              <span
                style={{
                  background: '#DC2626',
                  color: '#FFFFFF',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  boxShadow: '0 2px 6px rgba(220, 38, 38, 0.35)',
                }}
              >
                สินค้าหมด
              </span>
            )}

            {discountPercent && !isOutOfStock && (
              <span
                style={{
                  background: 'linear-gradient(135deg, #FF6B8B 0%, #E11D48 100%)',
                  color: '#FFFFFF',
                  padding: '3px 8px',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  boxShadow: '0 2px 6px rgba(225, 29, 72, 0.3)',
                }}
              >
                -{discountPercent}%
              </span>
            )}

            {isLowStock && (
              <span
                className="animate-breathe"
                style={{
                  background: '#FEF3C7',
                  color: '#B45309',
                  border: '1px solid #FCD34D',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  boxShadow: '0 2px 6px rgba(245, 158, 11, 0.25)',
                }}
              >
                เหลือเพียง {product.stock_quantity} ชิ้น!
              </span>
            )}
          </div>

          {/* Wishlist Heart Button */}
          <button
            onClick={handleWishlistClick}
            className="product-card-wishlist-btn"
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(6px)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
              transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.18)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            title={isFavorited ? 'นำออกจากที่ชอบ' : 'เพิ่มในรายการที่ชอบ'}
          >
            <Heart
              size={18}
              color={isFavorited ? '#E11D48' : '#9CA3AF'}
              fill={isFavorited ? '#E11D48' : 'none'}
              className={isFavorited ? 'animate-heart' : ''}
            />
          </button>

          {/* Quick View Button on Image */}
          {onQuickView && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickView(product);
              }}
              className="product-card-quickview-btn"
              style={{
                position: 'absolute',
                bottom: '10px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(255, 255, 255, 0.94)',
                backdropFilter: 'blur(8px)',
                color: '#E11D48',
                border: '1px solid rgba(255, 209, 220, 0.8)',
                padding: '0.32rem 0.85rem',
                borderRadius: '9999px',
                fontSize: '0.74rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                cursor: 'pointer',
              }}
            >
              <Eye size={13} /> ดูด่วน
            </button>
          )}
        </div>

        {/* Content Details */}
        <div className="product-card-body">
          {/* Skin Type tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '0.5rem' }}>
            {(product.skin_types || []).slice(0, 2).map((st) => (
              <span
                key={st}
                style={{
                  background: 'rgba(191, 239, 255, 0.35)',
                  color: '#0369A1',
                  borderRadius: '6px',
                  padding: '1px 6px',
                  fontSize: '0.72rem',
                  fontWeight: 500,
                }}
              >
                {st}
              </span>
            ))}
            {(product.skin_concerns || []).slice(0, 1).map((sc) => (
              <span
                key={sc}
                style={{
                  background: 'rgba(255, 209, 220, 0.35)',
                  color: '#BE123C',
                  borderRadius: '6px',
                  padding: '1px 6px',
                  fontSize: '0.72rem',
                  fontWeight: 500,
                }}
              >
                {sc}
              </span>
            ))}
          </div>

          {/* Makeup Shades Swatch Preview */}
          {product.category_id === 'c1000000-0000-0000-0000-000000000001' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', margin: '2px 0 6px 0' }}>
              <span style={{ fontSize: '0.68rem', color: '#94A3B8' }}>เฉดสี:</span>
              {['#E11D48', '#FB7185', '#F43F5E', '#FDA4AF'].map((color, idx) => (
                <span
                  key={color}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedShade(idx);
                  }}
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: color,
                    border: selectedShade === idx ? '2px solid #0F172A' : '1px solid #FFFFFF',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                    cursor: 'pointer',
                  }}
                />
              ))}
            </div>
          )}

          <h3
            className="product-card-title"
            style={{
              fontWeight: 600,
              color: '#1F2937',
              marginBottom: '0.4rem',
              lineHeight: 1.4,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {product.name}
          </h3>

          {/* Rating */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', color: '#F59E0B' }}>
              <Star size={14} fill="#F59E0B" />
            </div>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#374151' }}>
              {product.rating ? product.rating.toFixed(1) : '5.0'}
            </span>
            <span style={{ fontSize: '0.78rem', color: '#9CA3AF' }}>
              ({product.review_count || 12})
            </span>
          </div>

          {/* Stock Level Indicator */}
          <div style={{ marginBottom: '0.65rem' }}>
            {isOutOfStock ? (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  background: '#FEE2E2',
                  color: '#DC2626',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  border: '1px solid #FCA5A5',
                }}
              >
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#DC2626' }} />
                สินค้าหมดชั่วคราว
              </div>
            ) : isLowStock ? (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  background: '#FEF3C7',
                  color: '#B45309',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  border: '1px solid #FCD34D',
                }}
              >
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#F59E0B' }} />
                เหลือเพียง {product.stock_quantity} ชิ้นสุดท้าย!
              </div>
            ) : (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  background: '#F0FDF4',
                  color: '#15803D',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  border: '1px solid #BBF7D0',
                }}
              >
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22C55E' }} />
                คงเหลือ {product.stock_quantity} ชิ้น
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer / Price & Add to Cart */}
      <div
        className="product-card-footer"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div className="product-card-price" style={{ fontWeight: 800, color: '#E11D48' }}>
            ฿{(product.discount_price || product.price).toLocaleString()}
          </div>
          {product.discount_price && (
            <div style={{ fontSize: '0.8rem', color: '#9CA3AF', textDecoration: 'line-through' }}>
              ฿{product.price.toLocaleString()}
            </div>
          )}
        </div>

        <button
          onClick={handleAddToCartClick}
          disabled={isOutOfStock}
          className="btn btn-primary btn-sm product-card-buy-btn"
          style={{
            padding: '0.55rem 0.95rem',
            opacity: isOutOfStock ? 0.6 : 1,
            cursor: isOutOfStock ? 'not-allowed' : 'pointer',
            background: isOutOfStock ? '#E2E8F0' : undefined,
            color: isOutOfStock ? '#64748B' : undefined,
            borderColor: isOutOfStock ? '#CBD5E1' : undefined,
          }}
          title={isOutOfStock ? 'สินค้าหมดชั่วคราว' : 'เพิ่มลงตะกร้า'}
        >
          <ShoppingBag size={15} />
          <span className="product-card-btn-text">{isOutOfStock ? 'สินค้าหมด' : 'ใส่ตะกร้า'}</span>
        </button>
      </div>
    </div>
  );
};
