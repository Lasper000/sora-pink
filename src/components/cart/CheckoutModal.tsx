import React, { useState, useEffect } from 'react';
import type { ShippingAddress, PaymentMethod, Order } from '../../types';
import {
  X,
  CreditCard,
  QrCode,
  Truck,
  CheckCircle2,
  Package,
  Sparkles,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { placeNewOrder } from '../../services/api';
import { showToast } from '../common/Toast';
import confetti from 'canvas-confetti';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (order: Order) => void;
  onOpenAuth?: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, onOrderSuccess, onOpenAuth }) => {
  const { cart, subtotal, discountAmount, shippingFee, grandTotal, clearCart } = useCart();
  const { profile } = useAuth();

  const [step, setStep] = useState<'form' | 'success'>('form');
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [address, setAddress] = useState<ShippingAddress>({
    fullName: profile?.full_name || '',
    phone: profile?.phone || '',
    address: profile?.address || '',
    province: 'กรุงเทพมหานคร',
    postalCode: '10110',
    note: '',
  });

  useEffect(() => {
    if (profile) {
      setAddress((prev) => ({
        ...prev,
        fullName: prev.fullName || profile.full_name || '',
        phone: prev.phone || profile.phone || '',
        address: prev.address || profile.address || '',
      }));
    }
  }, [profile]);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('promptpay');

  if (!isOpen) return null;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    if (!address.fullName || !address.phone || !address.address) {
      showToast('กรุณากรอกข้อมูลที่อยู่จัดส่งให้ครบถ้วน', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const order = await placeNewOrder(
        profile?.id,
        cart,
        grandTotal,
        discountAmount,
        shippingFee,
        address,
        paymentMethod
      );

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FFD1DC', '#BFEFFF', '#FF8DA8', '#38BDF8'],
        });
      } catch {
        // Safe fallback if confetti isn't loaded
      }

      setCompletedOrder(order);
      setStep('success');
      clearCart();
      onOrderSuccess(order);
      showToast('สั่งซื้อสินค้าสำเร็จแล้ว! ขอบคุณที่ไว้วางใจ Sora Pink นะคะ', 'success');
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'เกิดข้อผิดพลาดในการสั่งซื้อ', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content modal-content-lg"
        onClick={(e) => e.stopPropagation()}
        style={{ padding: '2rem' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #FFD1DC 0%, #BFEFFF 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Package size={20} color="#E11D48" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                {step === 'form' ? 'ชำระเงินและระบุที่อยู่จัดส่ง' : 'คำสั่งซื้อสำเร็จ!'}
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#6B7280' }}>
                {step === 'form' ? 'ขั้นตอนสุดท้ายเพื่อรับสกินแคร์ที่คุณชื่นชอบ' : 'จัดเตรียมและตัดสต็อกสินค้าเรียบร้อยแล้ว'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon btn-ghost">
            <X size={20} />
          </button>
        </div>

        {step === 'form' ? (
          <form onSubmit={handleSubmitOrder}>
            {!profile && (
              <div
                style={{
                  background: 'linear-gradient(135deg, #FFF5F7 0%, #F0F9FF 100%)',
                  border: '1px solid #FFD1DC',
                  borderRadius: '12px',
                  padding: '0.75rem 1rem',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={16} color="#E11D48" />
                  <span style={{ fontSize: '0.84rem', color: '#374151' }}>
                    มีบัญชีอยู่แล้ว? <strong>เข้าสู่ระบบด้วย Google หรืออีเมล</strong> เพื่อดึงที่อยู่จัดส่งและสะสมคะแนน
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAuth?.();
                  }}
                  className="btn btn-sm btn-outline"
                  style={{ fontSize: '0.78rem', padding: '0.3rem 0.75rem' }}
                >
                  เข้าสู่ระบบ
                </button>
              </div>
            )}

            <div className="checkout-grid">
              {/* Left Column: Shipping Address */}
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: '#1F2937', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Truck size={18} color="#F43F5E" /> ข้อมูลที่อยู่จัดส่ง
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div>
                    <label className="form-label">ชื่อ - นามสกุล ผู้รับ *</label>
                    <input
                      type="text"
                      required
                      placeholder="เช่น คุณณิชาภา สิริรัตน์"
                      value={address.fullName}
                      onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div>
                    <label className="form-label">เบอร์โทรศัพท์ติดต่อ *</label>
                    <input
                      type="tel"
                      required
                      placeholder="เช่น 081-234-5678"
                      value={address.phone}
                      onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div>
                    <label className="form-label">ที่อยู่จัดส่ง (บ้านเลขที่, ถนน, ซอย) *</label>
                    <textarea
                      rows={2}
                      required
                      placeholder="ระบุบ้านเลขที่ หมู่บ้าน ซอย และถนน..."
                      value={address.address}
                      onChange={(e) => setAddress({ ...address, address: e.target.value })}
                      className="form-textarea"
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label className="form-label">จังหวัด *</label>
                      <input
                        type="text"
                        required
                        value={address.province}
                        onChange={(e) => setAddress({ ...address, province: e.target.value })}
                        className="form-input"
                      />
                    </div>
                    <div>
                      <label className="form-label">รหัสไปรษณีย์ *</label>
                      <input
                        type="text"
                        required
                        value={address.postalCode}
                        onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="form-label">หมายเหตุถึงผู้จัดส่ง (ถ้ามี)</label>
                    <input
                      type="text"
                      placeholder="เช่น ฝากไว้ที่ป้อม รปภ. หรือนิติบุคคล"
                      value={address.note || ''}
                      onChange={(e) => setAddress({ ...address, note: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Payment Method & Review */}
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: '#1F2937', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <CreditCard size={18} color="#0284C7" /> เลือกช่องทางการชำระเงิน
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.5rem' }}>
                  {/* PromptPay */}
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.85rem',
                      borderRadius: '14px',
                      border: paymentMethod === 'promptpay' ? '2px solid #0284C7' : '1px solid #E5E7EB',
                      background: paymentMethod === 'promptpay' ? '#F0F9FF' : '#FFFFFF',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="promptpay"
                      checked={paymentMethod === 'promptpay'}
                      onChange={() => setPaymentMethod('promptpay')}
                      style={{ accentColor: '#0284C7' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.92rem', color: '#0369A1', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <QrCode size={18} /> พร้อมเพย์ (PromptPay QR) - แนะนำ
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#6B7280' }}>
                        สแกน QR Code ผ่านแอปธนาคารได้ทุกธนาคาร ยอดเงินเข้าทันที
                      </div>
                    </div>
                  </label>

                  {/* Credit Card */}
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.85rem',
                      borderRadius: '14px',
                      border: paymentMethod === 'credit_card' ? '2px solid #F43F5E' : '1px solid #E5E7EB',
                      background: paymentMethod === 'credit_card' ? '#FFF5F8' : '#FFFFFF',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="credit_card"
                      checked={paymentMethod === 'credit_card'}
                      onChange={() => setPaymentMethod('credit_card')}
                      style={{ accentColor: '#F43F5E' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.92rem', color: '#BE123C', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CreditCard size={18} /> บัตรเครดิต / เดบิต (VISA / Mastercard)
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#6B7280' }}>
                        ปลอดภัยด้วยระบบ 3D Secure ป้องกันการโจรกรรมข้อมูล
                      </div>
                    </div>
                  </label>

                  {/* Cash on Delivery */}
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.85rem',
                      borderRadius: '14px',
                      border: paymentMethod === 'cod' ? '2px solid #10B981' : '1px solid #E5E7EB',
                      background: paymentMethod === 'cod' ? '#ECFDF5' : '#FFFFFF',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      style={{ accentColor: '#10B981' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.92rem', color: '#065F46', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Truck size={18} /> ชำระเงินปลายทาง (COD)
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#6B7280' }}>
                        ชำระเงินสดกับเจ้าหน้าที่จัดส่งพัสดุเมื่อได้รับของ
                      </div>
                    </div>
                  </label>
                </div>

                {/* PromptPay QR Preview if selected */}
                {paymentMethod === 'promptpay' && (
                  <div
                    style={{
                      background: '#F8FAFC',
                      border: '1.5px dashed #0284C7',
                      borderRadius: '16px',
                      padding: '1rem',
                      textAlign: 'center',
                      marginBottom: '1.25rem',
                    }}
                  >
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0369A1', marginBottom: '0.5rem' }}>
                      ตัวอย่างสแกน QR Code ชำระเงิน:
                    </div>
                    {/* Simulated SVG PromptPay QR */}
                    <div
                      style={{
                        width: '130px',
                        height: '130px',
                        background: '#FFFFFF',
                        border: '2px solid #003D79',
                        borderRadius: '12px',
                        margin: '0 auto',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                      }}
                    >
                      <QrCode size={90} color="#003D79" />
                      <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#003D79', marginTop: '-4px' }}>
                        PROMPTPAY
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#4B5563', marginTop: '0.4rem' }}>
                      ยอดชำระ: <strong style={{ color: '#E11D48', fontSize: '0.95rem' }}>฿{grandTotal.toLocaleString()}</strong>
                    </div>
                  </div>
                )}

                {/* Order Total Box */}
                <div
                  style={{
                    background: '#FFF5F8',
                    padding: '1rem',
                    borderRadius: '16px',
                    border: '1px solid #FFE4E6',
                    marginBottom: '1.25rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#4B5563', marginBottom: '0.3rem' }}>
                    <span>ยอดรวมสินค้า ({cart.length} รายการ)</span>
                    <span>฿{subtotal.toLocaleString()}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#E11D48', fontWeight: 600, marginBottom: '0.3rem' }}>
                      <span>ส่วนลดโปรโมชั่น</span>
                      <span>-฿{discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#4B5563', marginBottom: '0.5rem' }}>
                    <span>ค่าจัดส่ง</span>
                    <span>{shippingFee === 0 ? <strong style={{ color: '#059669' }}>ฟรี</strong> : `฿${shippingFee}`}</span>
                  </div>
                  <div
                    style={{
                      borderTop: '1px solid #FED7AA',
                      paddingTop: '0.5rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '1.2rem',
                      fontWeight: 800,
                      color: '#1F2937',
                    }}
                  >
                    <span>ยอดสุทธิ</span>
                    <span style={{ color: '#E11D48' }}>฿{grandTotal.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.9rem', fontSize: '1rem' }}
                >
                  {isSubmitting ? 'กำลังบันทึกคำสั่งซื้อ...' : `ยืนยันการสั่งซื้อ (฿${grandTotal.toLocaleString()})`}
                </button>
              </div>
            </div>
          </form>
        ) : (
          /* Order Complete Confirmation View */
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: '#ECFDF5',
                border: '3px solid #10B981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem auto',
              }}
            >
              <CheckCircle2 size={48} color="#10B981" />
            </div>

            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#065F46', marginBottom: '0.4rem' }}>
              การสั่งซื้อเสร็จสมบูรณ์!
            </h3>
            <p style={{ fontSize: '0.95rem', color: '#4B5563', maxWidth: '480px', margin: '0 auto 1.5rem auto' }}>
              เราได้รับคำสั่งซื้อของคุณแล้ว ระบบได้ทำการตัดสต็อกสินค้าอัตโนมัติ และฝ่ายคลังสินค้ากำลังจัดเตรียมแพ็กเกจสุดพิเศษเพื่อคุณ
            </p>

            <div
              style={{
                background: '#F9FAFB',
                padding: '1.25rem',
                borderRadius: '16px',
                maxWidth: '420px',
                margin: '0 auto 1.75rem auto',
                border: '1px solid #E5E7EB',
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                <span style={{ color: '#6B7280' }}>หมายเลขคำสั่งซื้อ:</span>
                <strong style={{ color: '#0284C7' }}>{completedOrder?.id}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                <span style={{ color: '#6B7280' }}>ยอดชำระสุทธิ:</span>
                <strong style={{ color: '#E11D48' }}>฿{completedOrder?.total_amount.toLocaleString()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                <span style={{ color: '#6B7280' }}>สถานะออเดอร์:</span>
                <span className="badge badge-blue">กำลังจัดเตรียมสินค้า</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: '#6B7280' }}>ผู้รับ:</span>
                <span>{completedOrder?.shipping_address.fullName}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
              <button onClick={onClose} className="btn btn-primary">
                กลับสู่หน้าหลัก
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
