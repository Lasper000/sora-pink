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
          maxWidth: '720px',
          width: '100%',
          borderRadius: '24px',
          background: 'linear-gradient(180deg, #FFFFFF 0%, #FFF8FA 100%)',
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1rem',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
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
                flexShrink: 0,
              }}
            >
              <Ticket size={22} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: '1.28rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, lineHeight: 1.2 }}>
                  ศูนย์รวมคูปองส่วนลด
                </h3>
                <span
                  style={{
                    background: '#FFE4E6',
                    color: '#BE123C',
                    padding: '2px 9px',
                    borderRadius: '9999px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {availableVouchers.length} ดีล
                </span>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#6B7280', margin: '3px 0 0', lineHeight: 1.4 }}>
                กดรับคูปองแล้วใช้ลดได้ทันทีในคลิกเดียว (Voucher Wallet)
              </p>
            </div>
          </div>

          <button onClick={onClose} className="btn-icon btn-ghost" aria-label="ปิดหน้าต่าง" style={{ flexShrink: 0 }}>
            <X size={20} />
          </button>
        </div>

        {/* Tab Filters */}
        <div
          className="coupon-tabs-bar"
          style={{
            display: 'flex',
            gap: '0.5rem',
            marginBottom: '1rem',
            borderBottom: '1px solid rgba(222, 83, 119, 0.14)',
            paddingBottom: '0.75rem',
            flexShrink: 0,
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`coupon-tab-btn ${activeTab === 'all' ? 'is-active' : ''}`}
            style={{
              padding: '0.42rem 1rem',
              borderRadius: '9999px',
              border: 'none',
              background: activeTab === 'all' ? 'linear-gradient(135deg, #DF5E7E 0%, #C73D62 100%)' : '#F3F4F6',
              color: activeTab === 'all' ? '#FFFFFF' : '#4B5563',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap',
            }}
          >
            คูปองทั้งหมด ({availableVouchers.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('collected')}
            className={`coupon-tab-btn ${activeTab === 'collected' ? 'is-active' : ''}`}
            style={{
              padding: '0.42rem 1rem',
              borderRadius: '9999px',
              border: 'none',
              background: activeTab === 'collected' ? 'linear-gradient(135deg, #DF5E7E 0%, #C73D62 100%)' : '#F3F4F6',
              color: activeTab === 'collected' ? '#FFFFFF' : '#4B5563',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap',
            }}
          >
            เก็บแล้วในกระเป๋า ({collectedVouchers.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('shipping')}
            className={`coupon-tab-btn ${activeTab === 'shipping' ? 'is-active' : ''}`}
            style={{
              padding: '0.42rem 1rem',
              borderRadius: '9999px',
              border: 'none',
              background: activeTab === 'shipping' ? 'linear-gradient(135deg, #DF5E7E 0%, #C73D62 100%)' : '#F3F4F6',
              color: activeTab === 'shipping' ? '#FFFFFF' : '#4B5563',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap',
            }}
          >
            โค้ดส่งฟรี (Free Shipping)
          </button>
        </div>

        {/* Voucher Cards Scrollable Area */}
        <div
          className="coupon-list-scroll"
          style={{
            flex: '1 1 auto',
            minHeight: 0,
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr)',
            gridAutoRows: 'max-content',
            alignContent: 'start',
            gap: '0.85rem',
            padding: '0.15rem 0.35rem 0.35rem 0.05rem',
          }}
        >
          {filteredVouchers.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '2.75rem 1.25rem',
                color: '#706064',
                borderRadius: '18px',
                border: '1px dashed rgba(222, 83, 119, 0.25)',
                background: 'rgba(255, 245, 248, 0.5)',
              }}
            >
              <Ticket size={40} color="#F48BA5" style={{ margin: '0 auto 0.65rem auto', opacity: 0.9 }} />
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
                ยังไม่มีคูปองในหมวดนี้
              </div>
              <p style={{ fontSize: '0.82rem', margin: '0 0 1rem 0' }}>
                ลองกดเก็บคูปองจากหน้ารวมทั้งหมดเพื่อรับส่วนลดพิเศษได้เลยค่ะ
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className="btn btn-primary btn-sm"
                style={{ borderRadius: '9999px' }}
              >
                ดูคูปองทั้งหมด ({availableVouchers.length})
              </button>
            </div>
          ) : (
            filteredVouchers.map((promo) => {
              const isApplied = appliedPromo?.code === promo.code;
              const isCollected = isVoucherCollected(promo.code);
              const canApply = !promo.minSpend || subtotal >= promo.minSpend;
              const missingAmount = promo.minSpend ? Math.max(0, promo.minSpend - subtotal) : 0;

              return (
                <div
                  key={promo.code}
                  className={`coupon-ticket-card ${isApplied ? 'is-applied' : ''}`}
                  style={{
                    display: 'flex',
                    alignItems: 'stretch',
                    flexShrink: 0,
                    minHeight: '112px',
                    borderRadius: '18px',
                    background: '#FFFFFF',
                    border: isApplied
                      ? '2px solid #10B981'
                      : isCollected
                      ? '1.5px solid #F7B5C6'
                      : '1px solid rgba(222, 83, 119, 0.16)',
                    boxShadow: isApplied
                      ? '0 6px 20px rgba(16, 185, 129, 0.14)'
                      : '0 4px 14px rgba(223, 94, 126, 0.06)',
                    overflow: 'hidden',
                    position: 'relative',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  }}
                >
                  {/* Left Ticket Stub */}
                  <div
                    className="coupon-ticket-stub"
                    style={{
                      width: '124px',
                      background: promo.freeShipping
                        ? 'linear-gradient(135deg, #0284C7 0%, #38BDF8 100%)'
                        : promo.discountPercent
                        ? 'linear-gradient(135deg, #E11D48 0%, #FB7185 100%)'
                        : 'linear-gradient(135deg, #C73D62 0%, #F472B6 100%)',
                      color: '#FFFFFF',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      padding: '1rem 0.75rem',
                      textAlign: 'center',
                      flexShrink: 0,
                      position: 'relative',
                      borderRight: '1.5px dashed rgba(255, 255, 255, 0.45)',
                    }}
                  >
                    {promo.freeShipping ? (
                      <>
                        <Truck size={26} strokeWidth={2.2} />
                        <span className="coupon-stub-value" style={{ fontSize: '1.05rem', fontWeight: 800, lineHeight: 1.15 }}>
                          ส่งฟรี
                        </span>
                        <span className="coupon-stub-label" style={{ fontSize: '0.68rem', fontWeight: 600, opacity: 0.92, letterSpacing: '0.04em' }}>
                          FREE SHIP
                        </span>
                      </>
                    ) : promo.discountPercent ? (
                      <>
                        <span className="coupon-stub-value" style={{ fontSize: '1.65rem', fontWeight: 900, lineHeight: 1.05 }}>
                          {promo.discountPercent}%
                        </span>
                        <span className="coupon-stub-label" style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.06em', opacity: 0.94 }}>
                          DISCOUNT
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="coupon-stub-value" style={{ fontSize: '1.48rem', fontWeight: 900, lineHeight: 1.05 }}>
                          ฿{promo.discountAmount}
                        </span>
                        <span className="coupon-stub-label" style={{ fontSize: '0.7rem', fontWeight: 700, opacity: 0.94 }}>
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
                      minWidth: 0,
                      padding: '0.95rem 1.15rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '1rem',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.32rem' }}>
                      {/* Row 1: Code badge & Status */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          className="coupon-code-badge"
                          style={{
                            background: '#FFF5F8',
                            padding: '3px 9px',
                            borderRadius: '7px',
                            fontFamily: 'monospace',
                            fontWeight: 800,
                            fontSize: '0.82rem',
                            color: '#BE123C',
                            border: '1px dashed #F48BA5',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            lineHeight: 1.2,
                          }}
                          onClick={() => handleCopyCode(promo.code)}
                          title="คลิกเพื่อคัดลอกโค้ด"
                        >
                          <span>{promo.code}</span>
                          <Copy size={11} />
                        </button>

                        {isApplied ? (
                          <span
                            style={{
                              background: '#D1FAE5',
                              color: '#065F46',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: '9999px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            <Check size={11} /> ใช้งานอยู่ในตะกร้า
                          </span>
                        ) : isCollected ? (
                          <span
                            style={{
                              background: '#FFF0F4',
                              color: '#C73D62',
                              border: '1px solid #FAD1DC',
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: '9999px',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            ✓ เก็บแล้ว
                          </span>
                        ) : null}
                      </div>

                      {/* Row 2: Description */}
                      <h4
                        style={{
                          fontSize: '0.92rem',
                          fontWeight: 700,
                          color: 'var(--text-primary)',
                          margin: 0,
                          lineHeight: 1.4,
                        }}
                      >
                        {promo.description}
                      </h4>

                      {/* Row 3: Conditions & Meta */}
                      <div
                        style={{
                          fontSize: '0.76rem',
                          color: '#64748B',
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '4px 8px',
                          alignItems: 'center',
                          lineHeight: 1.4,
                        }}
                      >
                        {promo.minSpend ? (
                          <span>
                            ขั้นต่ำ ฿{promo.minSpend.toLocaleString()}
                            {missingAmount > 0 && (
                              <span style={{ color: '#E11D48', fontWeight: 600, marginLeft: '4px' }}>
                                (ขาดอีก ฿{missingAmount.toLocaleString()})
                              </span>
                            )}
                          </span>
                        ) : (
                          <span style={{ color: '#059669', fontWeight: 600 }}>ไม่มีขั้นต่ำ • ใช้ได้ทันที</span>
                        )}
                        {promo.expiresAt && (
                          <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                            • หมดอายุ {new Date(promo.expiresAt).toLocaleDateString('th-TH')}
                          </span>
                        )}
                        {promo.onePerUser && (
                          <span style={{ fontSize: '0.7rem', color: '#C73D62', fontWeight: 600 }}>
                            • 1 สิทธิ์/บัญชี
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div
                      className="coupon-ticket-actions"
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'stretch',
                        justifyContent: 'center',
                        gap: '0.35rem',
                        flexShrink: 0,
                        minWidth: '122px',
                      }}
                    >
                      {isApplied ? (
                        <button
                          type="button"
                          onClick={removePromoCode}
                          className="btn btn-sm btn-outline"
                          style={{
                            color: '#DC2626',
                            borderColor: '#FECACA',
                            borderRadius: '9999px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            padding: '0.48rem 1rem',
                            justifyContent: 'center',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          ยกเลิกใช้
                        </button>
                      ) : isCollected ? (
                        <button
                          type="button"
                          onClick={() => handleApply(promo.code)}
                          disabled={!canApply}
                          title={!canApply ? `ช้อปเพิ่มอีก ฿${missingAmount.toLocaleString()} เพื่อใช้คูปองนี้` : 'ใช้คูปองนี้ในตะกร้า'}
                          className="btn btn-sm coupon-apply-btn"
                          style={{
                            background: canApply
                              ? 'linear-gradient(135deg, #DF5E7E 0%, #C73D62 100%)'
                              : '#F1F5F9',
                            color: canApply ? '#FFFFFF' : '#64748B',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            padding: '0.52rem 1rem',
                            borderRadius: '9999px',
                            border: canApply ? 'none' : '1px solid #E2E8F0',
                            cursor: canApply ? 'pointer' : 'not-allowed',
                            boxShadow: canApply ? '0 4px 12px rgba(225, 29, 72, 0.25)' : 'none',
                            justifyContent: 'center',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {canApply ? 'ใช้คูปองนี้' : 'ยังไม่ครบขั้นต่ำ'}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleCollect(promo.code)}
                          className="btn btn-sm coupon-collect-btn"
                          style={{
                            background: '#FFF1F5',
                            color: '#C73D62',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            padding: '0.52rem 1rem',
                            borderRadius: '9999px',
                            border: '1.5px solid #F7B5C6',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '5px',
                            whiteSpace: 'nowrap',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          <Sparkles size={13} /> เก็บคูปอง
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info bar */}
        <div
          className="coupon-modal-footer"
          style={{
            marginTop: '1rem',
            paddingTop: '0.9rem',
            borderTop: '1px solid rgba(222, 83, 119, 0.14)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.82rem',
            flexWrap: 'wrap',
            gap: '0.75rem',
            flexShrink: 0,
          }}
        >
          <div style={{ color: '#6B7280', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={16} color="#10B981" style={{ flexShrink: 0 }} />
            <span>คูปองทุกใบเป็นของแท้ 100% จากแบรนด์ Sora Pink</span>
          </div>

          {onOpenCart && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenCart();
              }}
              className="btn btn-sm coupon-go-cart-btn"
              style={{
                background: 'linear-gradient(135deg, #2C2224 0%, #4A373C 100%)',
                color: '#FFFFFF',
                borderRadius: '9999px',
                padding: '0.5rem 1.2rem',
                fontSize: '0.82rem',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                border: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              ดูตะกร้าสินค้า <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>

      <style>{`
        .coupon-modal-content {
          padding: 1.75rem 1.75rem 1.35rem 1.75rem;
          overflow: hidden !important;
        }
        .coupon-ticket-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 22px rgba(223, 94, 126, 0.12) !important;
        }
        .coupon-collect-btn:hover {
          background: linear-gradient(135deg, #DF5E7E 0%, #C73D62 100%) !important;
          color: #FFFFFF !important;
          border-color: transparent !important;
        }
        .coupon-ticket-stub::before,
        .coupon-ticket-stub::after {
          content: '';
          position: absolute;
          right: -7px;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #FFF8FA;
          z-index: 2;
        }
        .coupon-ticket-stub::before {
          top: -7px;
        }
        .coupon-ticket-stub::after {
          bottom: -7px;
        }
        [data-theme="dark"] .coupon-modal-content {
          background: linear-gradient(180deg, #161b27 0%, #111520 100%) !important;
        }
        [data-theme="dark"] .coupon-ticket-stub::before,
        [data-theme="dark"] .coupon-ticket-stub::after {
          background: #131824 !important;
        }
        [data-theme="dark"] .coupon-tab-btn:not(.is-active) {
          background: #1e2536 !important;
          color: #cbd5e1 !important;
        }
        [data-theme="dark"] .coupon-code-badge {
          background: rgba(223, 94, 126, 0.16) !important;
          color: #ff9bbb !important;
          border-color: rgba(255, 141, 168, 0.45) !important;
        }
        [data-theme="dark"] .coupon-collect-btn {
          background: rgba(223, 94, 126, 0.16) !important;
          color: #ff9bbb !important;
          border-color: rgba(255, 141, 168, 0.4) !important;
        }
        [data-theme="dark"] .coupon-apply-btn:disabled {
          background: #1e2536 !important;
          color: #94a3b8 !important;
          border-color: rgba(255, 255, 255, 0.1) !important;
        }
        [data-theme="dark"] .coupon-go-cart-btn {
          background: linear-gradient(135deg, #DF5E7E 0%, #C73D62 100%) !important;
        }
        @media (max-width: 640px) {
          .coupon-modal-content {
            padding: 1.15rem 0.95rem 1rem 0.95rem !important;
            border-radius: 20px !important;
            max-height: 90dvh !important;
          }
          .coupon-tabs-bar {
            flex-wrap: nowrap !important;
            overflow-x: auto !important;
            -webkit-overflow-scrolling: touch !important;
            scrollbar-width: none !important;
            padding-bottom: 0.55rem !important;
            margin-bottom: 0.75rem !important;
          }
          .coupon-tabs-bar::-webkit-scrollbar {
            display: none !important;
          }
          .coupon-tabs-bar button {
            flex-shrink: 0 !important;
            font-size: 0.78rem !important;
            padding: 0.36rem 0.8rem !important;
          }
          .coupon-ticket-card {
            min-height: auto !important;
          }
          .coupon-ticket-stub {
            width: 92px !important;
            padding: 0.85rem 0.45rem !important;
          }
          .coupon-stub-value {
            font-size: 1.28rem !important;
          }
          .coupon-stub-label {
            font-size: 0.64rem !important;
          }
          .coupon-ticket-body {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 0.65rem !important;
            padding: 0.85rem 0.9rem !important;
          }
          .coupon-ticket-actions {
            min-width: 0 !important;
            width: 100% !important;
          }
          .coupon-ticket-actions button {
            width: 100% !important;
            justify-content: center !important;
          }
          .coupon-modal-footer {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 0.6rem !important;
            text-align: center !important;
            margin-top: 0.75rem !important;
            padding-top: 0.75rem !important;
          }
          .coupon-modal-footer > div {
            justify-content: center !important;
            font-size: 0.76rem !important;
          }
          .coupon-modal-footer button {
            width: 100% !important;
            justify-content: center !important;
            padding: 0.6rem 1rem !important;
          }
        }
        @media (max-width: 400px) {
          .coupon-ticket-card {
            flex-direction: column !important;
          }
          .coupon-ticket-stub {
            width: 100% !important;
            flex-direction: row !important;
            justify-content: center !important;
            gap: 0.5rem !important;
            padding: 0.55rem 0.85rem !important;
            border-right: none !important;
            border-bottom: 1.5px dashed rgba(255, 255, 255, 0.45) !important;
          }
          .coupon-ticket-stub::before,
          .coupon-ticket-stub::after {
            display: none !important;
          }
          .coupon-stub-value {
            font-size: 1.15rem !important;
          }
        }
      `}</style>
    </div>
  );
};

