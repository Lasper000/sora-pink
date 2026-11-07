import React, { useState } from 'react';
import { X, Ticket, Check, Sparkles, Copy, ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { showToast } from './Toast';
import confetti from 'canvas-confetti';

interface CouponCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCart?: () => void;
}

export const CouponCenterModal: React.FC<CouponCenterModalProps> = ({
  isOpen,
  onClose,
  onOpenCart,
}) => {
  const {
    availableVouchers,
    collectedVouchers,
    collectVoucher,
    isVoucherCollected,
    appliedPromo,
    applyPromoCode,
    removePromoCode,
    subtotal,
  } = useCart();

  const [activeTab, setActiveTab] = useState<'all' | 'collected' | 'shipping'>('all');

  if (!isOpen) return null;

  const handleCollect = (code: string) => {
    const res = collectVoucher(code);
    if (res.success) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#FFD1DC', '#F43F5E', '#BAE6FD'],
        });
      } catch {
        // safe fallback
      }
      showToast(res.message, 'success');
    } else {
      showToast(res.message, 'info');
    }
  };

  const handleApply = (code: string) => {
    const res = applyPromoCode(code);
    if (res.success) {
      showToast(res.message, 'success');
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10B981', '#34D399', '#FFD1DC'],
        });
      } catch {
        // safe fallback
      }
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    showToast(`คัดลอกโค้ด "${code}" แล้วค่ะ!`, 'success');
  };

  const filteredVouchers = availableVouchers.filter((v) => {
    if (activeTab === 'collected') return isVoucherCollected(v.code);
    if (activeTab === 'shipping') return v.freeShipping;
    return true;
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content modal-content-lg coupon-modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '680px',
          borderRadius: '24px',
          background: 'linear-gradient(180deg, #FFFFFF 0%, #FFF8FA 100%)',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #FF6B8B 0%, #E11D48 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                boxShadow: '0 4px 14px rgba(225, 29, 72, 0.3)',
              }}
            >
              <Ticket size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#1F2937', margin: 0 }}>
                  ศูนย์รวมคูปองส่วนลด
                </h3>
                <span
                  style={{
                    background: '#FFE4E6',
                    color: '#BE123C',
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                  }}
                >
                  {availableVouchers.length} ดีล
                </span>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#6B7280', margin: '2px 0 0' }}>
                กดรับคูปองแล้วใช้ลดได้ทันทีในคลิกเดียว (Voucher Wallet)
              </p>
            </div>
          </div>

          <button onClick={onClose} className="btn-icon btn-ghost">
            <X size={22} />
          </button>
        </div>

        {/* Tab Filters */}
        <div
          className="coupon-tabs-bar"
          style={{
            display: 'flex',
            gap: '0.5rem',
            marginBottom: '1.25rem',
            borderBottom: '1px solid #F3F4F6',
            paddingBottom: '0.75rem',
          }}
        >
          <button
            onClick={() => setActiveTab('all')}
            style={{
              padding: '0.4rem 1rem',
              borderRadius: '9999px',
              border: 'none',
              background: activeTab === 'all' ? '#E11D48' : '#F3F4F6',
              color: activeTab === 'all' ? '#FFFFFF' : '#4B5563',
              fontSize: '0.84rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            คูปองทั้งหมด ({availableVouchers.length})
          </button>
          <button
            onClick={() => setActiveTab('collected')}
            style={{
              padding: '0.4rem 1rem',
              borderRadius: '9999px',
              border: 'none',
              background: activeTab === 'collected' ? '#E11D48' : '#F3F4F6',
              color: activeTab === 'collected' ? '#FFFFFF' : '#4B5563',
              fontSize: '0.84rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            เก็บแล้วในกระเป๋า ({collectedVouchers.length})
          </button>
          <button
            onClick={() => setActiveTab('shipping')}
            style={{
              padding: '0.4rem 1rem',
              borderRadius: '9999px',
              border: 'none',
              background: activeTab === 'shipping' ? '#E11D48' : '#F3F4F6',
              color: activeTab === 'shipping' ? '#FFFFFF' : '#4B5563',
              fontSize: '0.84rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            โค้ดส่งฟรี (Free Shipping)
          </button>
        </div>

        {/* Voucher Cards Scrollable Area */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.9rem',
            paddingRight: '0.25rem',
          }}
        >
          {filteredVouchers.map((promo) => {
            const isApplied = appliedPromo?.code === promo.code;
            const isCollected = isVoucherCollected(promo.code);
            const canApply = !promo.minSpend || subtotal >= promo.minSpend;

            return (
              <div
                key={promo.code}
                style={{
                  display: 'flex',
                  borderRadius: '16px',
                  background: '#FFFFFF',
                  border: isApplied
                    ? '2px solid #10B981'
                    : isCollected
                    ? '1.5px solid #FFD1DC'
                    : '1px solid #E5E7EB',
                  boxShadow: isApplied
                    ? '0 6px 20px rgba(16, 185, 129, 0.15)'
                    : '0 3px 10px rgba(0, 0, 0, 0.03)',
                  overflow: 'hidden',
                  position: 'relative',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
              >
                {/* Left Ticket Stub */}
                <div
                  className="coupon-ticket-stub"
                  style={{
                    width: '120px',
                    background: promo.freeShipping
                      ? 'linear-gradient(135deg, #0284C7 0%, #38BDF8 100%)'
                      : promo.discountPercent
                      ? 'linear-gradient(135deg, #E11D48 0%, #FF6B8B 100%)'
                      : 'linear-gradient(135deg, #DB2777 0%, #F472B6 100%)',
                    color: '#FFFFFF',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0.75rem',
                    textAlign: 'center',
                    flexShrink: 0,
                    position: 'relative',
                  }}
                >
                  {promo.freeShipping ? (
                    <>
                      <Truck size={28} />
                      <span style={{ fontSize: '1rem', fontWeight: 800, marginTop: '4px' }}>ส่งฟรี</span>
                    </>
                  ) : promo.discountPercent ? (
                    <>
                      <span style={{ fontSize: '1.65rem', fontWeight: 900, lineHeight: 1 }}>
                        {promo.discountPercent}%
                      </span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em' }}>
                        DISCOUNT
                      </span>
                    </>
                  ) : (
                    <>
                      <span style={{ fontSize: '1.45rem', fontWeight: 900, lineHeight: 1 }}>
                        ฿{promo.discountAmount}
                      </span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em' }}>
                        ส่วนลดเงินสด
                      </span>
                    </>
                  )}
                </div>

                {/* Right Voucher Content */}
                <div
                  className="coupon-ticket-body"
                  style={{
                    flex: 1,
                    padding: '0.9rem 1.15rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '1rem',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '3px' }}>
                      <span
                        style={{
                          background: '#F1F5F9',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          fontFamily: 'monospace',
                          fontWeight: 700,
                          fontSize: '0.88rem',
                          color: '#0F172A',
                          border: '1px dashed #94A3B8',
                          cursor: 'pointer',
                        }}
                        onClick={() => handleCopyCode(promo.code)}
                        title="คลิกเพื่อคัดลอกโค้ด"
                      >
                        {promo.code} <Copy size={11} style={{ display: 'inline', marginLeft: '3px' }} />
                      </span>
                      {isApplied && (
                        <span
                          style={{
                            background: '#D1FAE5',
                            color: '#065F46',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '9999px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                          }}
                        >
                          <Check size={11} /> ใช้งานอยู่ในตะกร้า
                        </span>
                      )}
                    </div>

                    <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#1F2937', margin: '4px 0 2px' }}>
                      {promo.description}
                    </h4>

                    <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                      {promo.minSpend ? (
                        <span>
                          ยอดซื้อขั้นต่ำ ฿{promo.minSpend.toLocaleString()}{' '}
                          {subtotal < promo.minSpend && (
                            <span style={{ color: '#E11D48' }}>
                              (ขาดอีก ฿{(promo.minSpend - subtotal).toLocaleString()})
                            </span>
                          )}
                        </span>
                      ) : (
                        <span style={{ color: '#059669', fontWeight: 600 }}>ไม่มีขั้นต่ำ • ใช้ได้ทันที</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="coupon-ticket-actions" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flexShrink: 0 }}>
                    {isApplied ? (
                      <button
                        onClick={removePromoCode}
                        className="btn btn-sm btn-ghost"
                        style={{ color: '#DC2626', fontSize: '0.78rem' }}
                      >
                        ยกเลิกใช้
                      </button>
                    ) : isCollected ? (
                      <button
                        onClick={() => handleApply(promo.code)}
                        disabled={!canApply}
                        className="btn btn-sm"
                        style={{
                          background: canApply
                            ? 'linear-gradient(135deg, #E11D48 0%, #F43F5E 100%)'
                            : '#E2E8F0',
                          color: canApply ? '#FFFFFF' : '#94A3B8',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          padding: '0.5rem 1.15rem',
                          borderRadius: '9999px',
                          border: 'none',
                          cursor: canApply ? 'pointer' : 'not-allowed',
                          boxShadow: canApply ? '0 4px 12px rgba(225, 29, 72, 0.25)' : 'none',
                        }}
                      >
                        ใช้คูปองนี้
                      </button>
                    ) : (
                      <button
                        onClick={() => handleCollect(promo.code)}
                        className="btn btn-sm"
                        style={{
                          background: '#FFF1F5',
                          color: '#E11D48',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          padding: '0.5rem 1.15rem',
                          borderRadius: '9999px',
                          border: '1.5px solid #FFD1DC',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Sparkles size={13} /> กดเก็บคูปอง
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info bar */}
        <div
          style={{
            marginTop: '1.25rem',
            paddingTop: '1rem',
            borderTop: '1px solid #F3F4F6',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.85rem',
          }}
        >
          <div style={{ color: '#6B7280', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={16} color="#10B981" />
            <span>คูปองทุกใบเป็นของแท้ 100% จากแบรนด์ Sora Pink</span>
          </div>

          {onOpenCart && (
            <button
              onClick={() => {
                onClose();
                onOpenCart();
              }}
              className="btn btn-sm"
              style={{
                background: '#1F2937',
                color: '#FFFFFF',
                borderRadius: '10px',
                padding: '0.45rem 1rem',
                fontSize: '0.82rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              ดูตะกร้าสินค้า <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>

      <style>{`
        .coupon-modal-content {
          padding: 2rem;
        }
        @media (max-width: 640px) {
          .coupon-modal-content {
            padding: 1.25rem 1rem !important;
            border-radius: 20px !important;
          }
          .coupon-tabs-bar {
            flex-wrap: nowrap !important;
            overflow-x: auto !important;
            -webkit-overflow-scrolling: touch !important;
            scrollbar-width: none !important;
            padding-bottom: 0.5rem !important;
          }
          .coupon-tabs-bar::-webkit-scrollbar {
            display: none !important;
          }
          .coupon-tabs-bar button {
            flex-shrink: 0 !important;
            font-size: 0.78rem !important;
            padding: 0.35rem 0.75rem !important;
          }
          .coupon-ticket-stub {
            width: 85px !important;
            padding: 0.5rem 0.35rem !important;
          }
          .coupon-ticket-stub span:first-child {
            font-size: 1.25rem !important;
          }
          .coupon-ticket-body {
            padding: 0.75rem 0.85rem !important;
            gap: 0.5rem !important;
          }
        }
      `}</style>
    </div>
  );
};

