import React, { useState } from 'react';
import type { Product } from '../../types';
import { X, Star, ShoppingBag, Heart, ArrowRight, Copy, Check } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { showToast } from '../common/Toast';
import { handleImageError, DEFAULT_FALLBACK_IMAGE } from '../../utils/imageFallback';
import { getProductShareUrl, copyToClipboard } from '../../utils/productRouting';

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
  const [isCopied, setIsCopied] = useState(false);

  if (!product) return null;

  const isFavorited = isInWishlist(product.id);
  const isOutOfStock = product.stock_quantity <= 0;
  const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= 5;

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

  const handleShareLine = () => {
    const url = getProductShareUrl(product.id);
    const text = `ดูสินค้าชิ้นนี้บน Sora Pink: ${product.name} ✨ ${url}`;
    window.open(`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleShareFacebook = () => {
    const url = getProductShareUrl(product.id);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
  };

  const handleCopy = async () => {
    const url = getProductShareUrl(product.id);
    const success = await copyToClipboard(url);
    if (success) {
      setIsCopied(true);
      showToast('คัดลอกลิงก์สินค้านี้แล้วค่ะ!', 'success');
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="glass-card animate-pop quick-view-modal-card"
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
          <div className="quick-view-img-box" style={{ position: 'relative', background: '#FFF5F8', minHeight: '300px' }}>
            <img
              src={(product.images && product.images[0]) || DEFAULT_FALLBACK_IMAGE}
              alt={product.name}
              onError={handleImageError}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                filter: isOutOfStock ? 'grayscale(70%) opacity(0.85)' : 'none',
              }}
            />

            {/* Out of Stock Dark Overlay */}
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
                  zIndex: 2,
                  pointerEvents: 'none',
                }}
              >
                <span
                  style={{
                    background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                    color: '#FFFFFF',
                    padding: '5px 14px',
                    borderRadius: '9999px',
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    boxShadow: '0 4px 12px rgba(220, 38, 38, 0.45)',
                  }}
                >
                  สินค้าหมดชั่วคราว
                </span>
                <span style={{ fontSize: '0.68rem', color: '#F1F5F9', marginTop: '3px', fontWeight: 600 }}>
                  OUT OF STOCK
                </span>
              </div>
            )}

            {product.discount_price && !isOutOfStock && (
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
                  zIndex: 3,
                }}
              >
                SALE
              </span>
            )}
          </div>

          {/* Details Content */}
          <div className="quick-view-body" style={{ padding: '1.75rem 1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
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

              {/* Stock Level Badge */}
              <div style={{ marginBottom: '0.6rem' }}>
                {isOutOfStock ? (
                  <span
                    style={{
                      background: '#FEE2E2',
                      color: '#DC2626',
                      border: '1px solid #FCA5A5',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#DC2626' }} />
                    สินค้าหมดชั่วคราว (Out of Stock)
                  </span>
                ) : isLowStock ? (
                  <span
                    style={{
                      background: '#FEF3C7',
                      color: '#B45309',
                      border: '1px solid #FCD34D',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#F59E0B' }} />
                    เหลือเพียง {product.stock_quantity} ชิ้นสุดท้าย!
                  </span>
                ) : (
                  <span
                    style={{
                      background: '#ECFDF5',
                      color: '#059669',
                      border: '1px solid #A7F3D0',
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} />
                    มีสินค้าพร้อมส่ง (คงเหลือ {product.stock_quantity} ชิ้น)
                  </span>
                )}
              </div>

              {/* Title */}
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.6rem', lineHeight: 1.35 }}>
                {product.name}
              </h3>

              {/* Price & Share */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem' }}>
                  <span style={{ fontSize: '1.45rem', fontWeight: 900, color: '#E11D48' }}>
                    ฿{(product.discount_price || product.price).toLocaleString()}
                  </span>
                  {product.discount_price && (
                    <span style={{ fontSize: '0.92rem', color: '#9CA3AF', textDecoration: 'line-through' }}>
                      ฿{product.price.toLocaleString()}
                    </span>
                  )}
                </div>

                {/* Social Share Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <button
                    type="button"
                    onClick={handleShareLine}
                    style={{ background: '#06C755', color: '#fff', border: 'none', borderRadius: '6px', padding: '2px 7px', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}
                    title="แชร์ลง LINE"
                  >
                    LINE
                  </button>
                  <button
                    type="button"
                    onClick={handleShareFacebook}
                    style={{ background: '#1877F2', color: '#fff', border: 'none', borderRadius: '6px', padding: '2px 7px', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}
                    title="แชร์ลง FB"
                  >
                    FB
                  </button>
                  <button
                    type="button"
                    onClick={handleCopy}
                    style={{
                      background: isCopied ? '#ECFDF5' : '#F1F5F9',
                      color: isCopied ? '#059669' : '#475569',
                      border: isCopied ? '1px solid #10B981' : '1px solid #CBD5E1',
                      borderRadius: '6px',
                      padding: '2px 7px',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '3px',
                      transition: 'all 0.2s ease',
                    }}
                    title={isCopied ? 'คัดลอกลิงก์แล้ว' : 'คัดลอกลิงก์สินค้านี้'}
                  >
                    {isCopied ? <Check size={11} color="#059669" /> : <Copy size={11} />}
                    {isCopied ? 'คัดลอกแล้ว' : ''}
                  </button>
                </div>
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
                {(product.skin_types || []).slice(0, 3).map((st) => (
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
                    background: isOutOfStock ? '#E2E8F0' : '#FFFFFF',
                    opacity: isOutOfStock ? 0.6 : 1,
                  }}
                >
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1 || isOutOfStock}
                    style={{ width: '32px', height: '38px', border: 'none', background: '#F8FAFC', cursor: isOutOfStock ? 'not-allowed' : 'pointer', fontWeight: 700 }}
                  >
                    -
                  </button>
                  <span style={{ width: '34px', textAlign: 'center', fontSize: '0.9rem', fontWeight: 700 }}>
                    {isOutOfStock ? 0 : quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock_quantity, q + 1))}
                    disabled={quantity >= product.stock_quantity || isOutOfStock}
                    style={{ width: '32px', height: '38px', border: 'none', background: '#F8FAFC', cursor: isOutOfStock ? 'not-allowed' : 'pointer', fontWeight: 700 }}
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart */}
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className="btn btn-primary"
                  style={{
                    flex: 1,
                    borderRadius: '12px',
                    padding: '0.55rem 1rem',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    opacity: isOutOfStock ? 0.65 : 1,
                    cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                    background: isOutOfStock ? '#E2E8F0' : undefined,
                    color: isOutOfStock ? '#64748B' : undefined,
                    borderColor: isOutOfStock ? '#CBD5E1' : undefined,
                  }}
                >
                  <ShoppingBag size={16} />
                  {isOutOfStock ? 'สินค้าหมดชั่วคราว' : 'ใส่ตะกร้า'}
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
          .quick-view-modal-card {
            max-height: 90vh !important;
            overflow-y: auto !important;
            -webkit-overflow-scrolling: touch !important;
            border-radius: 20px !important;
          }
          .quick-view-grid {
            grid-template-columns: 1fr !important;
          }
          .quick-view-img-box {
            min-height: 220px !important;
            height: 220px !important;
          }
          .quick-view-body {
            padding: 1.15rem 1rem !important;
          }
        }
      `}</style>
    </div>
  );
};
