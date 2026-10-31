import React, { useState } from 'react';
import type { Product } from '../../types';
import { X, Star, ShoppingBag, Heart, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { showToast } from '../common/Toast';
import { handleImageError } from '../../utils/imageFallback';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
  onOpenFullDetail: (product: Product) => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  onClose,
  onOpenFullDetail,
}) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const isFavorited = isInWishlist(product.id);
  const isOutOfStock = product.stock_quantity <= 0;

  const handleAddToCart = () => {
    const res = addToCart(product, quantity);
    showToast(res.message, res.success ? 'success' : 'error');
    onClose();
  };

  const handleWishlist = () => {
    const added = toggleWishlist(product);
    showToast(
      added ? `เพิ่ม "${product.name}" ในรายการที่ชอบแล้วค่ะ` : `นำออกจากรายการที่ชอบแล้วค่ะ`,
      'info'
    );
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="glass-card animate-pop"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '92%',
          maxWidth: '680px',
          background: '#FFFFFF',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.22)',
          border: '1.5px solid rgba(255, 209, 220, 0.8)',
          position: 'relative',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="btn-icon btn-ghost"
          style={{ position: 'absolute', top: '14px', right: '14px', zIndex: 10, background: 'rgba(255,255,255,0.85)' }}
        >
          <X size={20} />
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.2fr)' }} className="quick-view-grid">
          {/* Image */}
          <div style={{ position: 'relative', background: '#FFF5F8', minHeight: '300px' }}>
            <img
              src={product.images[0]}
              alt={product.name}
              onError={handleImageError}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            {product.discount_price && (
              <span
                style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  background: 'linear-gradient(135deg, #FF6B8B 0%, #E11D48 100%)',
                  color: '#FFFFFF',
                  padding: '3px 10px',
                  borderRadius: '9999px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                }}
              >
                SALE
              </span>
            )}
          </div>

          {/* Details Content */}
          <div style={{ padding: '1.75rem 1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              {/* Category & Rating */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#E11D48',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  {product.category?.name || 'Sora Pink'}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.8rem', fontWeight: 700, color: '#F59E0B' }}>
                  <Star size={14} fill="#F59E0B" /> {product.rating || 5.0} ({product.review_count || 48})
                </span>
              </div>

              {/* Title */}
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.6rem', lineHeight: 1.35 }}>
                {product.name}
              </h3>

              {/* Price */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem', marginBottom: '0.85rem' }}>
                <span style={{ fontSize: '1.45rem', fontWeight: 900, color: '#E11D48' }}>
                  ฿{(product.discount_price || product.price).toLocaleString()}
                </span>
                {product.discount_price && (
                  <span style={{ fontSize: '0.92rem', color: '#9CA3AF', textDecoration: 'line-through' }}>
                    ฿{product.price.toLocaleString()}
                  </span>
                )}
              </div>

              {/* Description preview */}
              <p
                style={{
                  fontSize: '0.86rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.5,
                  marginBottom: '1rem',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {product.description}
              </p>

              {/* Skin tags */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1.25rem' }}>
                {product.skin_types.slice(0, 3).map((st) => (
                  <span
                    key={st}
                    style={{
                      background: '#EFF6FF',
                      color: '#1D4ED8',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: '9999px',
                    }}
                  >
                    {st}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions Bottom */}
            <div>
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
                {/* Quantity */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    overflow: 'hidden',
                  }}
                >
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    style={{ width: '32px', height: '38px', border: 'none', background: '#F8FAFC', cursor: 'pointer', fontWeight: 700 }}
                  >
                    -
                  </button>
                  <span style={{ width: '34px', textAlign: 'center', fontSize: '0.9rem', fontWeight: 700 }}>
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    style={{ width: '32px', height: '38px', border: 'none', background: '#F8FAFC', cursor: 'pointer', fontWeight: 700 }}
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart */}
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className="btn btn-primary"
                  style={{ flex: 1, borderRadius: '12px', padding: '0.55rem 1rem', fontSize: '0.88rem', fontWeight: 700 }}
                >
                  <ShoppingBag size={16} /> ใส่ตะกร้า
                </button>

                {/* Wishlist */}
                <button
                  onClick={handleWishlist}
                  className="btn-icon btn-outline"
                  style={{ width: '42px', height: '42px', borderRadius: '12px' }}
                >
                  <Heart size={18} fill={isFavorited ? '#E11D48' : 'transparent'} color={isFavorited ? '#E11D48' : '#64748B'} />
                </button>
              </div>

              {/* View Full Details Button */}
              <button
                onClick={() => {
                  onClose();
                  onOpenFullDetail(product);
                }}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  color: '#64748B',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  padding: '4px',
                }}
              >
                ดูรายละเอียดเต็ม & ส่วนผสมทั้งหมด <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .quick-view-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};
