import React from 'react';
import type { Product } from '../../types';
import { Star, Heart, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { showToast } from '../common/Toast';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

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
            src={product.images[0]}
            alt={product.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          />

          {/* Floating Badges */}
          <div
            style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            {discountPercent && (
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

            {isOutOfStock && (
              <span
                style={{
                  background: '#F3F4F6',
                  color: '#6B7280',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                }}
              >
                สินค้าหมดชั่วคราว
              </span>
            )}
          </div>

          {/* Wishlist Heart Button */}
          <button
            onClick={handleWishlistClick}
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
        </div>

        {/* Content Details */}
        <div className="product-card-body">
          {/* Skin Type tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '0.5rem' }}>
            {product.skin_types.slice(0, 2).map((st) => (
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
            {product.skin_concerns.slice(0, 1).map((sc) => (
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.75rem' }}>
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
          className="btn btn-primary btn-sm"
          style={{
            padding: '0.55rem 0.95rem',
            opacity: isOutOfStock ? 0.5 : 1,
            cursor: isOutOfStock ? 'not-allowed' : 'pointer',
          }}
          title={isOutOfStock ? 'สินค้าหมดชั่วคราว' : 'เพิ่มลงตะกร้า'}
        >
          <ShoppingBag size={15} />
          {isOutOfStock ? 'หมด' : 'ใส่ตะกร้า'}
        </button>
      </div>
    </div>
  );
};
