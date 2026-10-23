import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, Tag, Sparkles } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { showToast } from '../common/Toast';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, onCheckout }) => {
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

  const freeShippingThreshold = 500;
  const freeShippingRemaining = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingProgress = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #F3F4F6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, #FFF5F8 0%, #FFFFFF 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <ShoppingBag size={20} color="#E11D48" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>ตะกร้าสินค้าของคุณ</h3>
            <span className="badge badge-pink">{itemCount} ชิ้น</span>
          </div>
          <button onClick={onClose} className="btn-icon btn-ghost">
            <X size={20} />
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div style={{ padding: '0.75rem 1.5rem', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
            {freeShippingRemaining > 0 ? (
              <span style={{ color: '#4B5563' }}>
                ซื้อเพิ่มอีก <strong>฿{freeShippingRemaining.toLocaleString()}</strong> เพื่อส่งฟรี!
              </span>
            ) : (
              <span className="animate-breathe" style={{ color: '#059669', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <Sparkles size={15} color="#059669" /> ยินดีด้วยนะคะ! ได้รับสิทธิ์จัดส่งฟรีแล้ว
              </span>
            )}
            <span style={{ fontWeight: 700, color: '#E11D48' }}>฿500</span>
          </div>
          <div style={{ height: '7px', background: '#E2E8F0', borderRadius: '9999px', overflow: 'hidden' }}>
            <div
              className="striped-bar"
              style={{
                height: '100%',
                width: `${freeShippingProgress}%`,
                background: 'linear-gradient(90deg, #FFB3C6 0%, #38BDF8 100%)',
                borderRadius: '9999px',
                transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            />
          </div>
        </div>

        {/* Cart Items List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.5rem' }}>
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
                      padding: '0.75rem',
                      borderRadius: '16px',
                      background: '#FFFFFF',
                      border: '1px solid #F3F4F6',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                    }}
                  >
                    {/* Item Image */}
                    <div
                      style={{
                        width: '74px',
                        height: '74px',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        background: '#FFF5F8',
                        flexShrink: 0,
                      }}
                    >
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
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
                              color: '#1F2937',
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
                              color: '#9CA3AF',
                              cursor: 'pointer',
                              padding: '2px',
                            }}
                            title="ลบรายการ"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#E11D48', marginTop: '2px' }}>
                          ฿{unitPrice.toLocaleString()}
                        </div>
                      </div>

                      {/* Stepper */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.4rem' }}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            background: '#F3F4F6',
                            borderRadius: '9999px',
                            padding: '2px',
                          }}
                        >
                          <button
                            onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              border: 'none',
                              background: '#fff',
                              cursor: 'pointer',
                              fontSize: '0.85rem',
                              fontWeight: 700,
                            }}
                          >
                            -
                          </button>
                          <span style={{ width: '28px', textAlign: 'center', fontSize: '0.82rem', fontWeight: 600 }}>
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
                              background: '#fff',
                              cursor: 'pointer',
                              fontSize: '0.85rem',
                              fontWeight: 700,
                            }}
                          >
                            +
                          </button>
                        </div>
                        <span style={{ fontSize: '0.82rem', color: '#6B7280' }}>
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
            style={{
              padding: '1.25rem 1.5rem',
              borderTop: '1px solid #E5E7EB',
              background: '#FFFFFF',
              boxShadow: '0 -4px 15px rgba(0, 0, 0, 0.04)',
            }}
          >
            {/* Promo Code Input */}
            <div style={{ marginBottom: '1rem' }}>
              {appliedPromo ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: '#ECFDF5',
                    border: '1px solid #A7F3D0',
                    padding: '0.45rem 0.75rem',
                    borderRadius: '10px',
                    fontSize: '0.82rem',
                    color: '#065F46',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Tag size={14} color="#059669" />
                    <span>ใช้โค้ด: <strong>{appliedPromo.code}</strong> (-฿{discountAmount})</span>
                  </div>
                  <button
                    onClick={removePromoCode}
                    style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}
                  >
                    ยกเลิก
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyPromo} style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="โค้ดส่วนลด (เช่น SORA50, GLOW20)"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    className="form-input"
                    style={{ fontSize: '0.85rem', padding: '0.5rem 0.75rem', textTransform: 'uppercase' }}
                  />
                  <button type="submit" className="btn btn-outline btn-sm">
                    ใช้โค้ด
                  </button>
                </form>
              )}
            </div>

            {/* Price Breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.88rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6B7280' }}>
                <span>ยอดรวมสินค้า</span>
                <span>฿{subtotal.toLocaleString()}</span>
              </div>
              {discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#E11D48', fontWeight: 600 }}>
                  <span>ส่วนลดคูปอง</span>
                  <span>-฿{discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6B7280' }}>
                <span>ค่าจัดส่งพัสดุ</span>
                <span>{shippingFee === 0 ? <strong style={{ color: '#059669' }}>ฟรี</strong> : `฿${shippingFee}`}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '1.15rem',
                  fontWeight: 800,
                  color: '#1F2937',
                  borderTop: '1px solid #F3F4F6',
                  paddingTop: '0.5rem',
                  marginTop: '0.25rem',
                }}
              >
                <span>ยอดชำระสุทธิ</span>
                <span style={{ color: '#E11D48' }}>฿{grandTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={() => {
                onClose();
                onCheckout();
              }}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.85rem', fontSize: '1rem' }}
            >
              ดำเนินการสั่งซื้อ (Checkout) <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
