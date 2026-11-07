import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, Tag, Sparkles, Ticket } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { showToast } from '../common/Toast';
import { handleImageError } from '../../utils/imageFallback';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
  onOpenCouponCenter?: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, onCheckout, onOpenCouponCenter }) => {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    itemCount,
    subtotal,
    discountAmount,
    shippingFee,
    grandTotal,
    appliedPromo,
    applyPromoCode,
    removePromoCode,
    collectedVouchers,
  } = useCart();

  const [promoInput, setPromoInput] = useState('');

  if (!isOpen) return null;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    const res = applyPromoCode(promoInput);
    showToast(res.message, res.success ? 'success' : 'error');
    if (res.success) setPromoInput('');
  };

  const hasOutOfStockItem = cart.some((item) => item.product.stock_quantity <= 0);

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div
          className="cart-drawer-header"
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid rgba(222, 83, 119, 0.14)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#FFF5F8',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <ShoppingBag size={19} color="#C73D62" />
            <h3 className="font-serif" style={{ fontSize: '1.35rem', fontWeight: 700, color: '#2C2224', margin: 0 }}>
              Shopping Bag
            </h3>
            <span
              style={{
                fontSize: '0.72rem',
                padding: '2px 9px',
                borderRadius: '9999px',
                background: 'linear-gradient(135deg, #DF5E7E 0%, #C73D62 100%)',
                color: '#FFFFFF',
                fontWeight: 600,
                letterSpacing: '0.04em',
                boxShadow: '0 2px 6px rgba(216, 74, 110, 0.25)',
              }}
            >
              {itemCount}
            </span>
          </div>
          <button onClick={onClose} className="btn-icon btn-ghost" style={{ borderRadius: '50%' }}>
            <X size={18} />
          </button>
        </div>

        {/* Tiered Free Gifts Progress Bar - Refined Atelier Style */}
        <div className="cart-drawer-milestones" style={{ padding: '0.85rem 1.5rem', background: '#FFFFFF', borderBottom: '1px solid rgba(222, 83, 119, 0.1)' }}>
          {/* Status Message */}
          <div style={{ fontSize: '0.8rem', marginBottom: '0.5rem', fontWeight: 500, color: '#706064' }}>
            {subtotal < 500 ? (
              <span>
                ช้อปเพิ่มอีก <strong style={{ color: '#C73D62' }}>฿{(500 - subtotal).toLocaleString()}</strong> เพื่อรับสิทธิ์ <strong>จัดส่งด่วนฟรี</strong>
              </span>
            ) : subtotal < 800 ? (
              <span style={{ color: '#C73D62' }}>
                ✓ จัดส่งฟรีแล้ว • ช้อปเพิ่ม <strong>฿{(800 - subtotal).toLocaleString()}</strong> รับฟองน้ำมาร์ชแมลโลว์
              </span>
            ) : subtotal < 1200 ? (
              <span style={{ color: '#C73D62' }}>
                ✓ รับของขวัญแล้ว • ช้อปเพิ่ม <strong>฿{(1200 - subtotal).toLocaleString()}</strong> รับกระเป๋า Atelier Curation
              </span>
            ) : (
              <span style={{ color: '#C73D62', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <Sparkles size={14} color="#C73D62" /> ยินดีด้วยค่ะ คุณได้รับสิทธิพิเศษและของขวัญครบทุกระดับแล้ว
              </span>
            )}
          </div>

          {/* Hairline Progress Bar Container */}
          <div style={{ position: 'relative', height: '4px', background: '#FEECEF', borderRadius: '2px', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${Math.min(100, (subtotal / 1200) * 100)}%`,
                background: 'linear-gradient(90deg, #F48BA5 0%, #DF5E7E 100%)',
                borderRadius: '2px',
                transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            />
          </div>

          {/* Milestones Labels */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', marginTop: '6px', color: '#706064', flexWrap: 'wrap', gap: '4px' }}>
            <span style={{ color: subtotal >= 500 ? '#C73D62' : '#A09296', fontWeight: subtotal >= 500 ? 700 : 500, whiteSpace: 'nowrap' }}>
              {subtotal >= 500 ? '●' : '○'} ส่งฟรี (฿500)
            </span>
            <span style={{ color: subtotal >= 800 ? '#C73D62' : '#A09296', fontWeight: subtotal >= 800 ? 700 : 500, whiteSpace: 'nowrap' }}>
              {subtotal >= 800 ? '●' : '○'} ฟองน้ำแต่งหน้า (฿800)
            </span>
            <span style={{ color: subtotal >= 1200 ? '#C73D62' : '#A09296', fontWeight: subtotal >= 1200 ? 700 : 500, whiteSpace: 'nowrap' }}>
              {subtotal >= 1200 ? '●' : '○'} กระเป๋า Atelier (฿1,200)
            </span>
          </div>
        </div>

        {/* Cart Items List */}
        <div className="cart-drawer-body" style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.5rem' }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: '#9CA3AF' }}>
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  background: '#FFF5F8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem auto',
                }}
              >
                <ShoppingBag size={32} color="#FFB8C9" />
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#4B5563', marginBottom: '0.4rem' }}>
                ตะกร้าสินค้าว่างเปล่า
              </h4>
              <p style={{ fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                เลือกชมเครื่องสำอางและสกินแคร์ที่ชื่นชอบ แล้วเพิ่มลงตะกร้าได้เลย
              </p>
              <button onClick={onClose} className="btn btn-primary btn-sm">
                เริ่มเลือกซื้อสินค้า
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {cart.map((item) => {
                const unitPrice = item.product.discount_price ?? item.product.price;
                return (
                  <div
                    key={item.product_id}
                    style={{
                      display: 'flex',
                      gap: '0.85rem',
                      padding: '0.85rem',
                      borderRadius: '18px',
                      background: '#FFFFFF',
                      border: '1px solid rgba(222, 83, 119, 0.14)',
                      boxShadow: '0 2px 10px rgba(223, 94, 126, 0.05)',
                    }}
                  >
                    {/* Item Image */}
                    <div
                      style={{
                        width: '74px',
                        height: '74px',
                        borderRadius: '14px',
                        overflow: 'hidden',
                        background: '#FFF5F8',
                        flexShrink: 0,
                      }}
                    >
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        onError={handleImageError}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>

                    {/* Details */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <h4
                            style={{
                              fontSize: '0.88rem',
                              fontWeight: 600,
                              color: '#2C2224',
                              lineHeight: 1.3,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              paddingRight: '4px',
                            }}
                          >
                            {item.product.name}
                          </h4>
                          <button
                            onClick={() => removeFromCart(item.product_id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#A09296',
                              cursor: 'pointer',
                              padding: '2px',
                            }}
                            title="ลบรายการ"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2px' }}>
                          <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#C73D62' }}>
                            ฿{unitPrice.toLocaleString()}
                          </div>
                          {item.product.stock_quantity <= 0 ? (
                            <span style={{ fontSize: '0.68rem', color: '#C73D62', background: '#FEECEF', padding: '2px 8px', borderRadius: '9999px', fontWeight: 700 }}>
                              สินค้าหมดสต็อก
                            </span>
                          ) : item.product.stock_quantity <= 5 ? (
                            <span style={{ fontSize: '0.68rem', color: '#C73D62', background: '#FFF0F4', padding: '2px 8px', borderRadius: '9999px', fontWeight: 600 }}>
                              เหลือ {item.product.stock_quantity} ชิ้น
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.68rem', color: '#706064', background: '#FFF0F4', padding: '2px 8px', borderRadius: '9999px', fontWeight: 500 }}>
                              คงเหลือ {item.product.stock_quantity}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Stepper */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.45rem' }}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            background: '#FFF5F8',
                            border: '1px solid #FAD1DC',
                            borderRadius: '9999px',
                            padding: '2px 4px',
                          }}
                        >
                          <button
                            onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              border: 'none',
                              background: '#FFFFFF',
                              cursor: 'pointer',
                              fontSize: '0.85rem',
                              fontWeight: 700,
                              color: '#C73D62',
                              boxShadow: '0 1px 3px rgba(216,74,110,0.15)',
                            }}
                          >
                            -
                          </button>
                          <span style={{ width: '28px', textAlign: 'center', fontSize: '0.82rem', fontWeight: 600, color: '#2C2224' }}>
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => {
                              const res = updateQuantity(item.product_id, item.quantity + 1);
                              if (!res.success && res.message) showToast(res.message, 'error');
                            }}
                            disabled={item.quantity >= item.product.stock_quantity}
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              border: 'none',
                              background: '#FFFFFF',
                              cursor: 'pointer',
                              fontSize: '0.85rem',
                              fontWeight: 700,
                              color: '#C73D62',
                              boxShadow: '0 1px 3px rgba(216,74,110,0.15)',
                            }}
                          >
                            +
                          </button>
                        </div>
                        <span style={{ fontSize: '0.82rem', color: '#706064', fontWeight: 500 }}>
                          รวม ฿{(unitPrice * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Summary & Checkout */}
        {cart.length > 0 && (
          <div
            className="cart-drawer-footer"
            style={{
              padding: '1.25rem 1.5rem',
              borderTop: '1px solid rgba(28, 25, 23, 0.08)',
              background: '#FFFFFF',
              boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.04)',
            }}
          >
            {/* Promo Code Input */}
            <div style={{ marginBottom: '1.15rem' }}>
              {appliedPromo ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: '#FAF8F5',
                    border: '1px solid rgba(197, 168, 128, 0.4)',
                    padding: '0.5rem 0.85rem',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    color: '#1C1917',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Tag size={13} color="#8C2E41" />
                    <span>โค้ด: <strong>{appliedPromo.code}</strong> (-฿{discountAmount})</span>
                  </div>
                  <button
                    onClick={removePromoCode}
                    style={{ background: 'none', border: 'none', color: '#8C2E41', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}
                  >
                    ยกเลิก
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyPromo} style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="โค้ดส่วนลด (เช่น SORA50)"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    className="form-input"
                    style={{ fontSize: '0.82rem', padding: '0.5rem 1rem', borderRadius: '9999px', textTransform: 'uppercase' }}
                  />
                  <button type="submit" className="btn btn-outline btn-sm" style={{ borderRadius: '9999px', padding: '0.5rem 1.15rem', fontSize: '0.8rem' }}>
                    ใช้โค้ด
                  </button>
                </form>
              )}

              {onOpenCouponCenter && (
                <button
                  type="button"
                  onClick={onOpenCouponCenter}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--rose-damask, #8C2E41)',
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    marginTop: '8px',
                    padding: 0,
                  }}
                >
                  <Ticket size={12} /> สิทธิพิเศษและคูปองของฉัน ({collectedVouchers.length} ใบ)
                </button>
              )}
            </div>

            {/* Price Breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#78716C' }}>
                <span>ยอดรวมสินค้า</span>
                <span style={{ color: '#1C1917', fontWeight: 500 }}>฿{subtotal.toLocaleString()}</span>
              </div>
              {discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#8C2E41', fontWeight: 600 }}>
                  <span>ส่วนลดพิเศษ</span>
                  <span>-฿{discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#78716C' }}>
                <span>บริการจัดส่งด่วน</span>
                <span>{shippingFee === 0 ? <strong style={{ color: '#1C1917' }}>ฟรี (Complimentary)</strong> : `฿${shippingFee}`}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  fontSize: '1.15rem',
                  fontWeight: 700,
                  color: '#1C1917',
                  borderTop: '1px solid rgba(28, 25, 23, 0.08)',
                  paddingTop: '0.65rem',
                  marginTop: '0.35rem',
                }}
              >
                <span>ยอดชำระสุทธิ</span>
                <span style={{ color: '#C73D62', fontSize: '1.35rem' }}>฿{grandTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={() => {
                if (hasOutOfStockItem) {
                  showToast('มีสินค้าในตะกร้าหมดสต็อก กรุณาลบออกก่อนดำเนินการสั่งซื้อค่ะ', 'error');
                  return;
                }
                onClose();
                onCheckout();
              }}
              disabled={hasOutOfStockItem}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '0.85rem',
                fontSize: '0.95rem',
                borderRadius: '9999px',
                letterSpacing: '0.02em',
                opacity: hasOutOfStockItem ? 0.6 : 1,
                cursor: hasOutOfStockItem ? 'not-allowed' : 'pointer',
                background: hasOutOfStockItem ? '#E7E5E4' : undefined,
                color: hasOutOfStockItem ? '#78716C' : undefined,
              }}
            >
              {hasOutOfStockItem ? (
                'มีสินค้าหมดในตะกร้า (กรุณานำออกก่อนสั่งซื้อ)'
              ) : (
                <>
                  ดำเนินการสั่งซื้อ (Checkout) <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
