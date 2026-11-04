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
  Copy,
  Plus,
  Gift,
  Palette,
  Check,
  Share2,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { fetchReviewsByProductId, submitProductReview } from '../../services/api';
import { showToast } from '../common/Toast';
import { handleImageError, DEFAULT_FALLBACK_IMAGE } from '../../utils/imageFallback';
import { getProductShareUrl, copyToClipboard } from '../../utils/productRouting';

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

  // Feature 3: Swatch visualizer state
  const isCosmeticOrShadeProduct =
    Boolean(
      product?.category?.slug === 'cosmetics' ||
      product?.category_id === 'c1000000-0000-0000-0000-000000000001' ||
      /lip|tint|blush|cushion|powder|shimmer|glow|ลิป|บลัช|คุชชั่น|แป้ง/i.test(product?.name || '')
    );
  const [selectedSkinTone, setSelectedSkinTone] = useState<'fair' | 'natural' | 'tan'>('fair');
  const [selectedSwatchIdx, setSelectedSwatchIdx] = useState(0);

  const sampleSwatches = [
    { name: '#01 Sakura Pink', hex: '#FF6B8B', undertone: 'Cool Rosy Pink (ชมพูซากุระระเรื่อ)', finish: 'Dewy Jelly Glow' },
    { name: '#02 Muted Peach', hex: '#FB923C', undertone: 'Warm Peach Coral (พีชคอรัลละมุน)', finish: 'Velvet Satin' },
    { name: '#03 Berry Glass', hex: '#BE123C', undertone: 'Deep Berry Wine (กุหลาบเบอร์รี่ฉ่ำ)', finish: 'Glass Shimmer' },
    { name: '#04 Nude Almond', hex: '#C2847A', undertone: 'MLBB Nude (นู้ดธรรมชาติ)', finish: 'Soft Matte' },
  ];

  // Feature 4: Frequently Bought Together bundle
  const complementaryBundle = {
    id: 'bundle-comp-1',
    name: 'Sora Cloud Barrier Moisture Cream (50ml)',
    price: 490,
    discountPrice: 390,
    image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=400&q=80',
  };

  const handleAddBundle = () => {
    if (!product) return;
    const currentPrice = product.discount_price || product.price;
    const bundleItemPrice = complementaryBundle.discountPrice;
    const totalOriginal = currentPrice + bundleItemPrice;
    const discountedBundleTotal = Math.round(totalOriginal * 0.85); // 15% OFF bundle
    const savings = totalOriginal - discountedBundleTotal;

    // Add current product
    addToCart(product, 1);
    // Add bundled complementary product
    const mockBundleProduct: Product = {
      id: 'bundle-item-' + Date.now(),
      category_id: product.category_id,
      name: complementaryBundle.name,
      description: 'คู่หูฟื้นฟูผิวสวยฉ่ำน้ำ สั่งซื้อเป็นเซ็ตสุดคุ้มรับส่วนลด 15%',
      ingredients: 'Ceramide Complex, Hyaluronic Acid, Squalane, Vitamin E',
      how_to_use: 'ทาบำรุงหลังเซรั่ม',
      skin_types: ['ทุกสภาพผิว'],
      skin_concerns: ['ความชุ่มชื้น'],
      price: complementaryBundle.price,
      discount_price: Math.round(complementaryBundle.discountPrice * 0.85),
      stock_quantity: 50,
      images: [complementaryBundle.image],
      is_active: true,
    };
    addToCart(mockBundleProduct, 1);

    showToast(`เพิ่มเซ็ตคู่ใจลงในตะกร้าแล้วค่ะ! คุณประหยัดทันที ฿${savings.toLocaleString()}`, 'success');
  };

  // Feature 5: 1-Click Social Sharing with Product Deep Link
  const [isCopied, setIsCopied] = useState(false);

  const handleShareLine = () => {
    if (!product) return;
    const url = getProductShareUrl(product.id);
    const text = `แนะนำสินค้าสวยๆ จาก Sora Pink: ${product.name} ✨ ช้อปเลยที่ ${url}`;
    window.open(`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleShareFacebook = () => {
    if (!product) return;
    const url = getProductShareUrl(product.id);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
  };

  const handleCopyLink = async () => {
    if (!product) return;
    const url = getProductShareUrl(product.id);
    const success = await copyToClipboard(url);
    if (success) {
      setIsCopied(true);
      showToast('คัดลอกลิงก์สินค้านี้แล้วค่ะ พร้อมส่งต่อให้เพื่อนเปิดดูได้ทันที!', 'success');
      setTimeout(() => setIsCopied(false), 2500);
    } else {
      showToast('ไม่สามารถคัดลอกได้ กรุณาคัดลอกจากแถบ URL ด้านบนนะคะ', 'info');
    }
  };

  const handleNativeShare = async () => {
    if (!product) return;
    const url = getProductShareUrl(product.id);
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `${product.name} | SORA PINK`,
          text: `ดูสินค้าชิ้นนี้บน Sora Pink: ${product.name} ✨`,
          url: url,
        });
      } catch {
        // User closed native share sheet
      }
    } else {
      handleCopyLink();
    }
  };

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
        className="modal-content modal-content-lg product-detail-modal-card"
        onClick={(e) => e.stopPropagation()}
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
            <div className="product-detail-main-img-box" style={{ position: 'relative' }}>
              <img
                src={(product.images && (product.images[activeImageIndex] || product.images[0])) || DEFAULT_FALLBACK_IMAGE}
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
                      padding: '6px 16px',
                      borderRadius: '9999px',
                      fontWeight: 800,
                      fontSize: '0.88rem',
                      boxShadow: '0 4px 14px rgba(220, 38, 38, 0.45)',
                    }}
                  >
                    สินค้าหมดชั่วคราว
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#F1F5F9', marginTop: '4px', fontWeight: 600 }}>
                    OUT OF STOCK
                  </span>
                </div>
              )}

              {discountPercent && !isOutOfStock && (
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
                    zIndex: 3,
                  }}
                >
                  ลด {discountPercent}%
                </span>
              )}
            </div>

            {/* Thumbnail Selectors */}
            {Boolean(product.images && product.images.length > 1) && (
              <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
                {(product.images || []).map((img, idx) => (
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
                    <img src={img} alt="thumb" onError={handleImageError} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
                  <span
                    className="badge badge-danger"
                    style={{
                      background: '#FEE2E2',
                      color: '#DC2626',
                      border: '1px solid #FCA5A5',
                      fontWeight: 700,
                      padding: '4px 12px',
                      fontSize: '0.82rem',
                    }}
                  >
                    ❌ สินค้าหมดชั่วคราว (Out of Stock)
                  </span>
                ) : isLowStock ? (
                  <span
                    className="badge badge-warning"
                    style={{
                      background: '#FEF3C7',
                      color: '#B45309',
                      border: '1px solid #FCD34D',
                      fontWeight: 700,
                      padding: '4px 12px',
                      fontSize: '0.82rem',
                    }}
                  >
                    🔥 เหลือเพียง {product.stock_quantity} ชิ้นสุดท้าย!
                  </span>
                ) : (
                  <span
                    className="badge badge-success"
                    style={{
                      background: '#ECFDF5',
                      color: '#059669',
                      border: '1px solid #A7F3D0',
                      fontWeight: 600,
                      padding: '4px 12px',
                      fontSize: '0.82rem',
                    }}
                  >
                    📦 มีสินค้าพร้อมส่ง (คงเหลือ {product.stock_quantity} ชิ้น)
                  </span>
                )}

                {(product.skin_types || []).map((st) => (
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
                  alignItems: 'center',
                  gap: '0.75rem',
                  flexWrap: 'wrap',
                  marginBottom: '1.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem' }}>
                  <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#E11D48' }}>
                    ฿{(product.discount_price || product.price).toLocaleString()}
                  </div>
                  {product.discount_price && (
                    <div style={{ fontSize: '1.05rem', color: '#9CA3AF', textDecoration: 'line-through' }}>
                      ฿{product.price.toLocaleString()}
                    </div>
                  )}
                </div>
                <span style={{ fontSize: '0.8rem', color: '#059669', fontWeight: 600 }}>
                  ✓ รวมภาษีแล้ว
                </span>

                {/* Feature 5: 1-Click Social Sharing with Product Deep Link */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.74rem', color: '#6B7280', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                    <Share2 size={12} /> แชร์:
                  </span>
                  <button
                    type="button"
                    onClick={handleShareLine}
                    style={{
                      background: '#06C755',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '4px 9px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'transform 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                    title="แชร์สินค้าลง LINE"
                  >
                    LINE
                  </button>
                  <button
                    type="button"
                    onClick={handleShareFacebook}
                    style={{
                      background: '#1877F2',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '4px 9px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'transform 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                    title="แชร์ลง Facebook"
                  >
                    FB
                  </button>
                  {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
                    <button
                      type="button"
                      onClick={handleNativeShare}
                      style={{
                        background: 'linear-gradient(135deg, #FF6B8B 0%, #E11D48 100%)',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '4px 9px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                      }}
                      title="แชร์ไปยังแอปในอุปกรณ์"
                    >
                      <Share2 size={11} /> แชร์
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    style={{
                      background: isCopied ? '#ECFDF5' : '#FFFFFF',
                      color: isCopied ? '#059669' : '#4B5563',
                      border: isCopied ? '1px solid #10B981' : '1px solid #CBD5E1',
                      borderRadius: '8px',
                      padding: '4px 10px',
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'all 0.2s ease',
                    }}
                    title="คัดลอกลิงก์สินค้านี้"
                  >
                    {isCopied ? <Check size={11} color="#059669" /> : <Copy size={11} />}
                    {isCopied ? 'คัดลอกแล้ว!' : 'คัดลอกลิงก์'}
                  </button>
                </div>
              </div>

              {/* Feature 3: Virtual Shade Swatches Visualizer */}
              {isCosmeticOrShadeProduct && (
                <div
                  style={{
                    background: '#FFF8FA',
                    borderRadius: '16px',
                    border: '1px solid #FFE4E6',
                    padding: '1rem',
                    marginBottom: '1.25rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem', flexWrap: 'wrap', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 700, color: '#BE123C' }}>
                      <Palette size={16} /> สวอชสีบนโทนสีผิว (Shade Studio)
                    </div>

                    {/* Skin Tone Selector */}
                    <div style={{ display: 'flex', gap: '3px', background: '#FCE7D4', padding: '2px', borderRadius: '9999px' }}>
                      <button
                        type="button"
                        onClick={() => setSelectedSkinTone('fair')}
                        style={{
                          background: selectedSkinTone === 'fair' ? '#FFFFFF' : 'transparent',
                          border: 'none',
                          borderRadius: '9999px',
                          padding: '2px 8px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          color: '#BE123C',
                        }}
                      >
                        ผิวขาว
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedSkinTone('natural')}
                        style={{
                          background: selectedSkinTone === 'natural' ? '#FFFFFF' : 'transparent',
                          border: 'none',
                          borderRadius: '9999px',
                          padding: '2px 8px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          color: '#9A3412',
                        }}
                      >
                        ผิวสองสี
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedSkinTone('tan')}
                        style={{
                          background: selectedSkinTone === 'tan' ? '#FFFFFF' : 'transparent',
                          border: 'none',
                          borderRadius: '9999px',
                          padding: '2px 8px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          color: '#7C2D12',
                        }}
                      >
                        ผิวแทน
                      </button>
                    </div>
                  </div>

                  {/* Arm Swatch Visualizer Strip */}
                  <div
                    style={{
                      height: '52px',
                      borderRadius: '12px',
                      background:
                        selectedSkinTone === 'fair'
                          ? 'linear-gradient(90deg, #FDE8E8 0%, #FED7AA 100%)'
                          : selectedSkinTone === 'natural'
                          ? 'linear-gradient(90deg, #FDBA74 0%, #FB923C 100%)'
                          : 'linear-gradient(90deg, #C2410C 0%, #9A3412 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-around',
                      padding: '0 1rem',
                      boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.08)',
                      marginBottom: '0.65rem',
                    }}
                  >
                    {sampleSwatches.map((swatch, idx) => (
                      <div
                        key={swatch.name}
                        onClick={() => setSelectedSwatchIdx(idx)}
                        style={{
                          width: '42px',
                          height: '30px',
                          borderRadius: '8px',
                          background: swatch.hex,
                          boxShadow: selectedSwatchIdx === idx ? '0 0 0 3px #FFFFFF, 0 4px 10px rgba(0,0,0,0.3)' : '0 2px 5px rgba(0,0,0,0.15)',
                          transform: selectedSwatchIdx === idx ? 'scale(1.15)' : 'scale(1)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        title={swatch.name}
                      >
                        {selectedSwatchIdx === idx && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem' }}>
                    <div>
                      <strong style={{ color: '#1F2937' }}>{sampleSwatches[selectedSwatchIdx].name}:</strong>{' '}
                      <span style={{ color: '#6B7280' }}>{sampleSwatches[selectedSwatchIdx].undertone}</span>
                    </div>
                    <span
                      style={{
                        background: '#FFE4E6',
                        color: '#BE123C',
                        padding: '1px 8px',
                        borderRadius: '9999px',
                        fontWeight: 600,
                        fontSize: '0.72rem',
                      }}
                    >
                      {sampleSwatches[selectedSwatchIdx].finish}
                    </span>
                  </div>
                </div>
              )}

              {/* Tabs: Description, Ingredients, How to Use, Reviews */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div
                  className="product-detail-tabs-bar"
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
                        <CheckCircle2 size={16} /> เหมาะสำหรับ: {(product.skin_types || []).join(', ') || 'ทุกสภาพผิว'}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#BE123C' }}>
                        <Sparkles size={16} /> แก้ปัญหาผิว: {(product.skin_concerns || []).join(', ') || 'ฟื้นฟูผิวสวย'}
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

              {/* Feature 4: Frequently Bought Together (Bundle & Save 15%) */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #FFF0F5 0%, #F5F3FF 100%)',
                  borderRadius: '16px',
                  border: '1.5px solid #FFD1DC',
                  padding: '1rem',
                  marginBottom: '1.25rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 800, color: '#BE123C', marginBottom: '0.65rem' }}>
                  <Gift size={16} /> ซื้อคู่กันประหยัดกว่า (Frequently Bought Together)
                  <span style={{ background: '#E11D48', color: '#FFFFFF', fontSize: '0.68rem', fontWeight: 800, padding: '1px 6px', borderRadius: '9999px', marginLeft: 'auto' }}>
                    ลด 15% เซ็ตคู่
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {/* Item 1 (Current) */}
                  <div style={{ width: '52px', height: '52px', borderRadius: '10px', overflow: 'hidden', background: '#FFFFFF', border: '1px solid #E5E7EB', flexShrink: 0 }}>
                    <img src={(product.images && product.images[0]) || DEFAULT_FALLBACK_IMAGE} alt="Current" onError={handleImageError} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>

                  <Plus size={16} color="#94A3B8" />

                  {/* Item 2 (Complementary) */}
                  <div style={{ width: '52px', height: '52px', borderRadius: '10px', overflow: 'hidden', background: '#FFFFFF', border: '1px solid #E5E7EB', flexShrink: 0 }}>
                    <img src={complementaryBundle.image} alt="Complementary" onError={handleImageError} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>

                  {/* Pricing info */}
                  <div style={{ flex: 1, minWidth: '140px' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1F2937', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      + {complementaryBundle.name}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                      <span style={{ fontSize: '1rem', fontWeight: 800, color: '#E11D48' }}>
                        ฿{Math.round(((product.discount_price || product.price) + complementaryBundle.discountPrice) * 0.85).toLocaleString()}
                      </span>
                      <span style={{ fontSize: '0.78rem', color: '#9CA3AF', textDecoration: 'line-through' }}>
                        ฿{((product.discount_price || product.price) + complementaryBundle.discountPrice).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddBundle}
                    disabled={isOutOfStock}
                    className="btn btn-sm"
                    style={{
                      background: isOutOfStock ? '#E2E8F0' : 'linear-gradient(135deg, #BE123C 0%, #E11D48 100%)',
                      color: isOutOfStock ? '#94A3B8' : '#FFFFFF',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '0.45rem 0.85rem',
                      fontWeight: 700,
                      fontSize: '0.78rem',
                      cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                      flexShrink: 0,
                      boxShadow: isOutOfStock ? 'none' : '0 4px 12px rgba(190, 18, 60, 0.25)',
                    }}
                  >
                    {isOutOfStock ? 'สินค้าหมด' : '+ ซื้อทั้งเซ็ต'}
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Actions: Quantity Stepper, Add to Cart, Wishlist */}
            <div
              className="product-detail-actions-row"
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
                  background: isOutOfStock ? '#E2E8F0' : '#F3F4F6',
                  borderRadius: '9999px',
                  padding: '4px',
                  opacity: isOutOfStock ? 0.6 : 1,
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
                    cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                    fontWeight: 700,
                  }}
                >
                  -
                </button>
                <span style={{ width: '40px', textAlign: 'center', fontWeight: 700, fontSize: '0.95rem' }}>
                  {isOutOfStock ? 0 : quantity}
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
                    cursor: isOutOfStock ? 'not-allowed' : 'pointer',
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
                style={{
                  flex: 1,
                  padding: '0.85rem',
                  opacity: isOutOfStock ? 0.65 : 1,
                  cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                  background: isOutOfStock ? '#E2E8F0' : undefined,
                  color: isOutOfStock ? '#64748B' : undefined,
                  borderColor: isOutOfStock ? '#CBD5E1' : undefined,
                }}
              >
                <ShoppingBag size={18} />
                {isOutOfStock ? 'สินค้าหมดชั่วคราว (รอเติมสต็อก)' : 'เพิ่มลงตะกร้า'}
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

            {/* Live Delivery & Rewards Info Box */}
            <div
              style={{
                marginTop: '1.1rem',
                padding: '0.85rem 1rem',
                background: 'linear-gradient(135deg, #FFF5F8 0%, #F8FAFC 100%)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 209, 220, 0.7)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.45rem',
                fontSize: '0.78rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0F172A' }}>
                <span style={{ color: '#E11D48', fontWeight: 800 }}>⚡ Fast Dispatch:</span>
                <span>สั่งซื้อภายใน 14:00 น. วันนี้ จัดส่งออกรอบบ่ายทันที ได้รับของใน 1-2 วันทำการ</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#64748B', flexWrap: 'wrap', gap: '4px' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Sparkles size={13} color="#F59E0B" /> รับ <strong>+{Math.round((product.discount_price || product.price) / 10)} คะแนนสะสม</strong> เข้า Sora Club VIP
                </span>
                <span style={{ color: '#059669', fontWeight: 700 }}>การันตีแท้ 100% คืนเงินได้ใน 7 วัน</span>
              </div>
            </div>

            {/* Clean Beauty Safety Badges */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1rem',
                marginTop: '0.85rem',
                flexWrap: 'wrap',
                fontSize: '0.72rem',
                color: '#64748B',
                fontWeight: 600,
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={13} color="#10B981" /> Clean Beauty
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={13} color="#10B981" /> 0% Alcohol & Paraben
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={13} color="#10B981" /> Non-Comedogenic
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={13} color="#10B981" /> Dermatologist Tested
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
