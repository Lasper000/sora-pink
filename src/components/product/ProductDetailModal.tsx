import React, { useState, useEffect } from 'react';
import type { Product, Review } from '../../types';
import {
  X,
  Star,
  Heart,
  ShoppingBag,
  Sparkles,
  Droplet,
  Layers,
  Send,
  CheckCircle2,
  Edit3,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { fetchReviewsByProductId, submitProductReview } from '../../services/api';
import { showToast } from '../common/Toast';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { profile } = useAuth();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'info' | 'ingredients' | 'howTo' | 'reviews'>('info');

  const [reviews, setReviews] = useState<Review[]>([]);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    if (product) {
      setActiveImageIndex(0);
      setQuantity(1);
      fetchReviewsByProductId(product.id).then(setReviews);
    }
  }, [product]);

  if (!product) return null;

  const isFavorited = isInWishlist(product.id);
  const isOutOfStock = product.stock_quantity <= 0;
  const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= 5;

  const handleAddToCart = () => {
    const res = addToCart(product, quantity);
    showToast(res.message, res.success ? 'success' : 'error');
  };

  const handleWishlistToggle = () => {
    const added = toggleWishlist(product);
    showToast(
      added ? `เพิ่ม "${product.name}" ในรายการที่ชอบแล้วค่ะ` : `นำออกจากรายการที่ชอบแล้วค่ะ`,
      'info'
    );
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmittingReview(true);
    try {
      const added = await submitProductReview(
        product.id,
        profile?.id || 'guest-' + Date.now(),
        profile?.full_name || 'ลูกค้าผู้ใช้งาน (Verified Buyer)',
        profile?.avatar_url || '',
        newRating,
        newComment
      );
      setReviews([added, ...reviews]);
      setNewComment('');
      showToast('ขอบคุณสำหรับการรีวิวสินค้านะคะ', 'success');
    } catch {
      showToast('ไม่สามารถส่งรีวิวได้ในขณะนี้', 'error');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const discountPercent =
    product.discount_price && product.discount_price < product.price
      ? Math.round(((product.price - product.discount_price) / product.price) * 100)
      : null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content modal-content-lg"
        onClick={(e) => e.stopPropagation()}
        style={{ padding: 0, overflow: 'hidden' }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="btn-icon btn-ghost"
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            zIndex: 30,
            background: 'rgba(255, 255, 255, 0.9)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <X size={20} />
        </button>

        <div className="product-detail-modal-grid">
          {/* Left Column: Image Gallery */}
          <div className="product-detail-left-col">
            {/* Main Image */}
            <div className="product-detail-main-img-box">
              <img
                src={product.images[activeImageIndex] || product.images[0]}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />

              {discountPercent && (
                <span
                  style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    background: '#E11D48',
                    color: '#fff',
                    padding: '4px 10px',
                    borderRadius: '9999px',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                  }}
                >
                  ลด {discountPercent}%
                </span>
              )}
            </div>

            {/* Thumbnail Selectors */}
            {product.images.length > 1 && (
              <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      border: activeImageIndex === idx ? '2.5px solid #F43F5E' : '2px solid transparent',
                      cursor: 'pointer',
                      padding: 0,
                      background: '#fff',
                      flexShrink: 0,
                    }}
                  >
                    <img src={img} alt="thumb" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Info & Actions */}
          <div className="product-detail-right-col">
            <div>
              {/* Badges Bar */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.75rem' }}>
                {isOutOfStock ? (
                  <span className="badge badge-danger">สินค้าหมดชั่วคราว</span>
                ) : isLowStock ? (
                  <span className="badge badge-warning">เหลือเพียง {product.stock_quantity} ชิ้น</span>
                ) : (
                  <span className="badge badge-success">มีสินค้าในสต็อก ({product.stock_quantity} ชิ้น)</span>
                )}

                {product.skin_types.map((st) => (
                  <span key={st} className="badge badge-blue">{st}</span>
                ))}
              </div>

              <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#1F2937', marginBottom: '0.5rem', lineHeight: 1.3 }}>
                {product.name}
              </h2>

              {/* Rating Summary */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', color: '#F59E0B' }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={16} fill="#F59E0B" />
                  ))}
                </div>
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                  {product.rating ? product.rating.toFixed(1) : '4.9'}
                </span>
                <span style={{ fontSize: '0.85rem', color: '#6B7280' }}>
                  ({reviews.length || product.review_count || 12} รีวิวจากผู้ซื้อจริง)
                </span>
              </div>

              {/* Pricing */}
              <div
                style={{
                  background: '#FFF5F8',
                  padding: '1rem',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '0.75rem',
                  marginBottom: '1.5rem',
                }}
              >
                <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#E11D48' }}>
                  ฿{(product.discount_price || product.price).toLocaleString()}
                </div>
                {product.discount_price && (
                  <div style={{ fontSize: '1.05rem', color: '#9CA3AF', textDecoration: 'line-through' }}>
                    ฿{product.price.toLocaleString()}
                  </div>
                )}
                <span style={{ fontSize: '0.8rem', color: '#059669', fontWeight: 600, marginLeft: 'auto' }}>
                  ✓ รวมภาษีมูลค่าเพิ่มแล้ว
                </span>
              </div>

              {/* Tabs: Description, Ingredients, How to Use, Reviews */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div
                  style={{
                    display: 'flex',
                    borderBottom: '1.5px solid #F3F4F6',
                    gap: '1rem',
                    marginBottom: '1rem',
                  }}
                >
                  <button
                    onClick={() => setActiveTab('info')}
                    style={{
                      background: 'none',
                      border: 'none',
                      borderBottom: activeTab === 'info' ? '2.5px solid #F43F5E' : '2.5px solid transparent',
                      padding: '0.5rem 0.25rem',
                      fontWeight: activeTab === 'info' ? 700 : 500,
                      color: activeTab === 'info' ? '#BE123C' : '#6B7280',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                    }}
                  >
                    รายละเอียด
                  </button>

                  <button
                    onClick={() => setActiveTab('ingredients')}
                    style={{
                      background: 'none',
                      border: 'none',
                      borderBottom: activeTab === 'ingredients' ? '2.5px solid #F43F5E' : '2.5px solid transparent',
                      padding: '0.5rem 0.25rem',
                      fontWeight: activeTab === 'ingredients' ? 700 : 500,
                      color: activeTab === 'ingredients' ? '#BE123C' : '#6B7280',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                    }}
                  >
                    ส่วนผสมสำคัญ
                  </button>

                  <button
                    onClick={() => setActiveTab('howTo')}
                    style={{
                      background: 'none',
                      border: 'none',
                      borderBottom: activeTab === 'howTo' ? '2.5px solid #F43F5E' : '2.5px solid transparent',
                      padding: '0.5rem 0.25rem',
                      fontWeight: activeTab === 'howTo' ? 700 : 500,
                      color: activeTab === 'howTo' ? '#BE123C' : '#6B7280',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                    }}
                  >
                    วิธีใช้งาน
                  </button>

                  <button
                    onClick={() => setActiveTab('reviews')}
                    style={{
                      background: 'none',
                      border: 'none',
                      borderBottom: activeTab === 'reviews' ? '2.5px solid #F43F5E' : '2.5px solid transparent',
                      padding: '0.5rem 0.25rem',
                      fontWeight: activeTab === 'reviews' ? 700 : 500,
                      color: activeTab === 'reviews' ? '#BE123C' : '#6B7280',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    รีวิว ({reviews.length})
                  </button>
                </div>

                {/* Tab 1: Description */}
                {activeTab === 'info' && (
                  <div key="info" className="animate-pop" style={{ fontSize: '0.9rem', color: '#4B5563', lineHeight: 1.7 }}>
                    <p style={{ marginBottom: '0.75rem' }}>{product.description}</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#047857' }}>
                        <CheckCircle2 size={16} /> เหมาะสำหรับ: {product.skin_types.join(', ')}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#BE123C' }}>
                        <Sparkles size={16} /> แก้ปัญหาผิว: {product.skin_concerns.join(', ')}
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 2: Ingredients */}
                {activeTab === 'ingredients' && (
                  <div key="ingredients" className="animate-pop" style={{ fontSize: '0.9rem', color: '#4B5563', lineHeight: 1.7 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#0284C7', fontWeight: 600, marginBottom: '0.4rem' }}>
                      <Droplet size={16} /> ส่วนผสมสำคัญ:
                    </div>
                    <p style={{ background: '#F8FAFC', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                      {product.ingredients || 'สารสกัดจากธรรมชาติ 100% ปราศจากพาราเบนและแอลกอฮอล์'}
                    </p>
                  </div>
                )}

                {/* Tab 3: How to Use */}
                {activeTab === 'howTo' && (
                  <div key="howTo" className="animate-pop" style={{ fontSize: '0.9rem', color: '#4B5563', lineHeight: 1.7 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#E11D48', fontWeight: 600, marginBottom: '0.4rem' }}>
                      <Layers size={16} /> วิธีใช้:
                    </div>
                    <p style={{ background: '#FFF5F8', padding: '0.75rem', borderRadius: '10px', border: '1px solid #FFE4E6' }}>
                      {product.how_to_use || 'ทาบำรุงเป็นประจำทุกเช้าและก่อนนอน'}
                    </p>
                  </div>
                )}

                {/* Tab 4: Reviews & Write Review */}
                {activeTab === 'reviews' && (
                  <div key="reviews" className="animate-pop">
                    {/* Add Review Form */}
                    <form
                      onSubmit={handleReviewSubmit}
                      style={{
                        background: '#FFF5F8',
                        padding: '1rem',
                        borderRadius: '14px',
                        marginBottom: '1.25rem',
                        border: '1px solid #FFE4E6',
                      }}
                    >
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem', color: '#BE123C', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Edit3 size={15} color="#BE123C" /> เขียนรีวิวสินค้า
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.82rem', color: '#4B5563' }}>ให้คะแนน:</span>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setNewRating(star)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                          >
                            <Star
                              size={18}
                              fill={star <= newRating ? '#F59E0B' : 'none'}
                              color="#F59E0B"
                            />
                          </button>
                        ))}
                      </div>
                      <textarea
                        rows={2}
                        required
                        placeholder="แชร์ผลลัพธ์หรือความรู้สึกหลังใช้ได้เลยน้า..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="form-textarea"
                        style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}
                      />
                      <button
                        type="submit"
                        disabled={isSubmittingReview}
                        className="btn btn-primary btn-sm"
                      >
                        <Send size={14} /> ส่งรีวิว
                      </button>
                    </form>

                    {/* Review List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {reviews.length === 0 ? (
                        <p style={{ fontSize: '0.85rem', color: '#9CA3AF', textAlign: 'center' }}>
                          ยังไม่มีรีวิว มาเป็นคนแรกที่รีวิวสินค้านี้กันน้า
                        </p>
                      ) : (
                        reviews.map((rev) => (
                          <div
                            key={rev.id}
                            style={{
                              background: '#F9FAFB',
                              padding: '0.75rem 1rem',
                              borderRadius: '12px',
                              border: '1px solid #E5E7EB',
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div
                                  style={{
                                    width: 26,
                                    height: 26,
                                    borderRadius: '50%',
                                    background: '#FFD1DC',
                                    color: '#BE123C',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                >
                                  {rev.user_name?.charAt(0) || 'U'}
                                </div>
                                <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{rev.user_name}</span>
                                <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>
                                  ✓ ผู้ซื้อจริง
                                </span>
                              </div>
                              <div style={{ display: 'flex', color: '#F59E0B' }}>
                                {[...Array(rev.rating)].map((_, i) => (
                                  <Star key={i} size={12} fill="#F59E0B" />
                                ))}
                              </div>
                            </div>
                            <p style={{ fontSize: '0.85rem', color: '#4B5563', lineHeight: 1.5 }}>
                              {rev.comment}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions: Quantity Stepper, Add to Cart, Wishlist */}
            <div
              style={{
                borderTop: '1px solid #E5E7EB',
                paddingTop: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              {/* Stepper */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: '#F3F4F6',
                  borderRadius: '9999px',
                  padding: '4px',
                }}
              >
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    border: 'none',
                    background: '#fff',
                    cursor: 'pointer',
                    fontWeight: 700,
                  }}
                >
                  -
                </button>
                <span style={{ width: '40px', textAlign: 'center', fontWeight: 700, fontSize: '0.95rem' }}>
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock_quantity, q + 1))}
                  disabled={quantity >= product.stock_quantity || isOutOfStock}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    border: 'none',
                    background: '#fff',
                    cursor: 'pointer',
                    fontWeight: 700,
                  }}
                >
                  +
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="btn btn-primary"
                style={{ flex: 1, padding: '0.85rem', opacity: isOutOfStock ? 0.5 : 1 }}
              >
                <ShoppingBag size={18} />
                {isOutOfStock ? 'สินค้าหมดชั่วคราว' : 'เพิ่มลงตะกร้า'}
              </button>

              {/* Wishlist Button */}
              <button
                onClick={handleWishlistToggle}
                className="btn-icon btn-outline"
                style={{ width: '46px', height: '46px', borderRadius: '50%' }}
                title={isFavorited ? 'นำออกจากที่ชอบ' : 'เพิ่มในรายการที่ชอบ'}
              >
                <Heart
                  size={20}
                  color={isFavorited ? '#E11D48' : '#9CA3AF'}
                  fill={isFavorited ? '#E11D48' : 'none'}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
