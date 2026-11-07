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
      className="glass-card product-card-container"
      style={{
        borderRadius: '12px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        cursor: 'pointer',
        background: '#FFFFFF',
        border: '1px solid rgba(28, 25, 23, 0.08)',
        position: 'relative',
        transition: 'all 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
        boxShadow: '0 2px 10px -2px rgba(28, 25, 23, 0.04)',
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
            background: '#FAF7F4',
            borderBottom: '1px solid rgba(28, 25, 23, 0.05)',
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
              transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.06)')}
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
                background: 'rgba(28, 25, 23, 0.45)',
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
                  background: '#8C2E41',
                  color: '#FAF8F5',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  fontWeight: 600,
                  fontSize: '0.74rem',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                สินค้าหมดชั่วคราว
              </span>
              <span style={{ fontSize: '0.62rem', color: '#FAF8F5', marginTop: '3px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
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
                  background: '#8C2E41',
                  color: '#FAF8F5',
                  padding: '2px 7px',
                  borderRadius: '4px',
                  fontSize: '0.65rem',
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}
              >
                สินค้าหมด
              </span>
            )}

            {discountPercent && !isOutOfStock && (
              <span
                style={{
                  background: '#1C1917',
                  color: '#FAF8F5',
                  padding: '2px 7px',
                  borderRadius: '4px',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                }}
              >
                -{discountPercent}%
              </span>
            )}

            {isLowStock && (
              <span
                style={{
                  background: '#FAF5F0',
                  color: '#92540E',
                  border: '1px solid rgba(197, 168, 128, 0.4)',
                  padding: '2px 7px',
                  borderRadius: '4px',
                  fontSize: '0.65rem',
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                }}
              >
                เหลือ {product.stock_quantity} ชิ้น
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
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              background: 'rgba(255, 255, 255, 0.92)',
              backdropFilter: 'blur(6px)',
              border: '1px solid rgba(28, 25, 23, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
              transition: 'transform 0.2s ease, background 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            title={isFavorited ? 'นำออกจากที่ชอบ' : 'เพิ่มในรายการที่ชอบ'}
          >
            <Heart
              size={15}
              color={isFavorited ? '#8C2E41' : '#8F8881'}
              fill={isFavorited ? '#8C2E41' : 'none'}
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
                background: '#FFFFFF',
                color: '#1C1917',
                border: '1px solid rgba(28, 25, 23, 0.12)',
                padding: '0.3rem 0.8rem',
                borderRadius: '4px',
                fontSize: '0.72rem',
                fontWeight: 600,
                letterSpacing: '0.05em',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                boxShadow: '0 4px 12px rgba(28, 25, 23, 0.08)',
                cursor: 'pointer',
              }}
            >
              <Eye size={12} /> ดูด่วน
            </button>
          )}
        </div>

        {/* Content Details */}
        <div className="product-card-body" style={{ padding: '1rem 1.15rem' }}>
          {/* Skin Type tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '0.45rem' }}>
            {(product.skin_types || []).slice(0, 2).map((st) => (
              <span
                key={st}
                style={{
                  background: '#FAF5F0',
                  color: '#57534E',
                  borderRadius: '4px',
                  padding: '1px 6px',
                  fontSize: '0.68rem',
                  fontWeight: 500,
                  letterSpacing: '0.04em',
                }}
              >
                {st}
              </span>
            ))}
            {(product.skin_concerns || []).slice(0, 1).map((sc) => (
              <span
                key={sc}
                style={{
                  background: '#FDF2F4',
                  color: '#8C2E41',
                  borderRadius: '4px',
                  padding: '1px 6px',
                  fontSize: '0.68rem',
                  fontWeight: 500,
                  letterSpacing: '0.04em',
                }}
              >
                {sc}
              </span>
            ))}
          </div>

          {/* Makeup Shades Swatch Preview */}
          {product.category_id === 'c1000000-0000-0000-0000-000000000001' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', margin: '2px 0 6px 0' }}>
              <span style={{ fontSize: '0.66rem', color: '#8F8881', letterSpacing: '0.04em' }}>เฉดสี:</span>
              {['#8C2E41', '#B96677', '#C87D88', '#DF9EA8'].map((color, idx) => (
                <span
                  key={color}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedShade(idx);
                  }}
                  style={{
                    width: '11px',
                    height: '11px',
                    borderRadius: '50%',
                    background: color,
                    border: selectedShade === idx ? '2px solid #1C1917' : '1px solid #FFFFFF',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
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
              color: 'var(--text-primary)',
              fontSize: '0.92rem',
              marginBottom: '0.35rem',
              lineHeight: 1.35,
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
            <div style={{ display: 'flex', alignItems: 'center', color: '#C5A880' }}>
              <Star size={13} fill="#C5A880" />
            </div>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {product.rating ? product.rating.toFixed(1) : '5.0'}
            </span>
            <span style={{ fontSize: '0.74rem', color: '#8F8881' }}>
              ({product.review_count || 12})
            </span>
          </div>

          {/* Stock Level Indicator */}
          <div style={{ marginBottom: '0.45rem' }}>
            {isOutOfStock ? (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: '#8C2E41',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                }}
              >
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#8C2E41' }} />
                สินค้าหมดชั่วคราว
              </span>
            ) : isLowStock ? (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: '#92540E',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                }}
              >
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#F59E0B' }} />
                เหลือเพียง {product.stock_quantity} ชิ้นสุดท้าย
              </span>
            ) : (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: '#1B7340',
                  fontSize: '0.72rem',
                  fontWeight: 500,
                }}
              >
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#22C55E' }} />
                มีสินค้าพร้อมส่ง
              </span>
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
          padding: '0.85rem 1.15rem 1.1rem 1.15rem',
          borderTop: '1px solid rgba(28, 25, 23, 0.05)',
        }}
      >
        <div>
          <div className="product-card-price" style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
            ฿{(product.discount_price || product.price).toLocaleString()}
          </div>
          {product.discount_price && (
            <div style={{ fontSize: '0.76rem', color: '#8F8881', textDecoration: 'line-through' }}>
              ฿{product.price.toLocaleString()}
            </div>
          )}
        </div>

        <button
          onClick={handleAddToCartClick}
          disabled={isOutOfStock}
          className="btn btn-primary btn-sm product-card-buy-btn"
          style={{
            padding: '0.45rem 0.9rem',
            borderRadius: '6px',
            fontSize: '0.78rem',
            letterSpacing: '0.04em',
            opacity: isOutOfStock ? 0.5 : 1,
            cursor: isOutOfStock ? 'not-allowed' : 'pointer',
            background: isOutOfStock ? '#E7E2DF' : undefined,
            color: isOutOfStock ? '#8F8881' : undefined,
            borderColor: isOutOfStock ? 'transparent' : undefined,
          }}
          title={isOutOfStock ? 'สินค้าหมดชั่วคราว' : 'ใส่ตะกร้า'}
        >
          <ShoppingBag size={14} />
          <span className="product-card-btn-text">{isOutOfStock ? 'สินค้าหมด' : 'ใส่ตะกร้า'}</span>
        </button>
      </div>
    </div>
  );
};
