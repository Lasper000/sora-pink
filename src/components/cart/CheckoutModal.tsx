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
  Upload,
  Image as ImageIcon,
  Trash2,
  Copy,
  Check,
  Clock,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { placeNewOrder } from '../../services/api';
import { showToast } from '../common/Toast';
import { generatePromptPayQR, PROMPTPAY_PHONE_FORMATTED, PROMPTPAY_NAME } from '../../utils/promptpay';
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

  // PromptPay QR & Slip upload state
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isGeneratingQr, setIsGeneratingQr] = useState<boolean>(false);
  const [slipImage, setSlipImage] = useState<string | null>(null);
  const [slipFileName, setSlipFileName] = useState<string>('');
  const [copiedPhone, setCopiedPhone] = useState<boolean>(false);

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

  // Auto-generate real PromptPay QR Code whenever grandTotal changes or promptpay is selected
  useEffect(() => {
    if (paymentMethod === 'promptpay' && grandTotal > 0) {
      setIsGeneratingQr(true);
      generatePromptPayQR(grandTotal)
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('Failed to generate PromptPay QR:', err))
        .finally(() => setIsGeneratingQr(false));
    }
  }, [paymentMethod, grandTotal]);

  const handleCopyPhone = () => {
    navigator.clipboard.writeText('0959919679');
    setCopiedPhone(true);
    showToast('คัดลอกเบอร์พร้อมเพย์ 095-991-9679 เรียบร้อยแล้วค่ะ', 'success');
    setTimeout(() => setCopiedPhone(false), 2500);
  };

  const handleSlipFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('กรุณาเลือกไฟล์รูปภาพสลิปเท่านั้นค่ะ (JPG, PNG, WEBP)', 'error');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast('ขนาดไฟล์ภาพสลิปต้องไม่เกิน 10MB ค่ะ', 'error');
      return;
    }

    setSlipFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setSlipImage(reader.result as string);
      showToast('แนบสลิปโอนเงินเรียบร้อยแล้วค่ะ ✨', 'success');
    };
    reader.onerror = () => {
      showToast('ไม่สามารถอ่านไฟล์สลิปได้ กรุณาลองใหม่อีกครั้งค่ะ', 'error');
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    if (!address.fullName.trim() || !address.phone.trim() || !address.address.trim()) {
      showToast('กรุณากรอกข้อมูลชื่อ ที่อยู่ และเบอร์โทรศัพท์ให้ครบถ้วน', 'error');
      return;
    }

    const cleanPhone = address.phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 9 || cleanPhone.length > 10) {
      showToast('กรุณากรอกเบอร์โทรศัพท์ที่ถูกต้อง (9-10 หลัก)', 'error');
      return;
    }

    // Require slip upload for PromptPay payment
    if (paymentMethod === 'promptpay' && !slipImage) {
      showToast('กรุณาแนบสลิปหลักฐานการโอนเงินก่อนยืนยันการสั่งซื้อค่ะ', 'error');
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
        paymentMethod,
        slipImage
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
      showToast('ส่งคำสั่งซื้อเรียบร้อยแล้ว! แอดมินจะตรวจสอบและยืนยันยอดเงินให้นะคะ', 'success');
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

                {/* PromptPay QR & Slip Upload if selected */}
                {paymentMethod === 'promptpay' && (
                  <div
                    style={{
                      background: 'linear-gradient(180deg, #F0F9FF 0%, #FFFFFF 100%)',
                      border: '2px solid #38BDF8',
                      borderRadius: '16px',
                      padding: '1.25rem',
                      marginBottom: '1.25rem',
                      boxShadow: '0 4px 16px rgba(2, 132, 199, 0.08)',
                    }}
                  >
                    {/* PromptPay Header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div
                          style={{
                            background: '#003D79',
                            color: '#FFFFFF',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontWeight: 800,
                            fontSize: '0.78rem',
                            letterSpacing: '0.5px',
                          }}
                        >
                          PROMPTPAY
                        </div>
                        <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0369A1' }}>
                          สแกนจ่ายผ่าน QR Code
                        </span>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#0284C7', background: '#E0F2FE', padding: '2px 8px', borderRadius: '9999px', fontWeight: 600 }}>
                        ฟรีค่าธรรมเนียม
                      </span>
                    </div>

                    {/* Real PromptPay QR Image */}
                    <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                      <div
                        style={{
                          width: '180px',
                          height: '180px',
                          background: '#FFFFFF',
                          border: '3px solid #003D79',
                          borderRadius: '16px',
                          margin: '0 auto',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '10px',
                          boxShadow: '0 6px 16px rgba(0,0,0,0.08)',
                        }}
                      >
                        {isGeneratingQr ? (
                          <div style={{ fontSize: '0.82rem', color: '#6B7280' }}>กำลังสร้าง QR Code...</div>
                        ) : qrDataUrl ? (
                          <img
                            src={qrDataUrl}
                            alt="PromptPay QR Code"
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                          />
                        ) : (
                          <QrCode size={120} color="#003D79" />
                        )}
                      </div>

                      {/* PromptPay Details */}
                      <div style={{ marginTop: '0.75rem' }}>
                        <div style={{ fontSize: '0.88rem', color: '#1F2937', fontWeight: 700 }}>
                          ชื่อบัญชี: <span style={{ color: '#0369A1' }}>{PROMPTPAY_NAME}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '4px' }}>
                          <span style={{ fontSize: '0.9rem', color: '#4B5563' }}>
                            เบอร์พร้อมเพย์: <strong style={{ color: '#0F172A', fontSize: '1rem' }}>{PROMPTPAY_PHONE_FORMATTED}</strong>
                          </span>
                          <button
                            type="button"
                            onClick={handleCopyPhone}
                            className="btn btn-outline btn-sm"
                            style={{
                              padding: '2px 8px',
                              fontSize: '0.72rem',
                              borderColor: '#38BDF8',
                              color: '#0284C7',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            {copiedPhone ? <Check size={12} color="#059669" /> : <Copy size={12} />}
                            {copiedPhone ? 'คัดลอกแล้ว' : 'คัดลอกเบอร์'}
                          </button>
                        </div>
                        <div style={{ fontSize: '0.95rem', color: '#1F2937', marginTop: '6px' }}>
                          ยอดเงินที่ต้องโอน:{' '}
                          <strong style={{ color: '#E11D48', fontSize: '1.25rem', fontWeight: 800 }}>
                            ฿{grandTotal.toLocaleString()}
                          </strong>
                        </div>
                      </div>
                    </div>

                    {/* Slip Upload Box */}
                    <div
                      style={{
                        background: '#FFFFFF',
                        border: slipImage ? '1.5px solid #10B981' : '1.5px dashed #0284C7',
                        borderRadius: '12px',
                        padding: '0.9rem',
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <label style={{ fontSize: '0.84rem', fontWeight: 700, color: '#1F2937', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Upload size={15} color="#0284C7" /> แนบสลิปหลักฐานการโอนเงิน *
                        </label>
                        {slipImage ? (
                          <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                            <Check size={11} /> แนบสลิปแล้ว
                          </span>
                        ) : (
                          <span className="badge badge-warning" style={{ background: '#FEF3C7', color: '#B45309' }}>
                            จำเป็นต้องแนบสลิป
                          </span>
                        )}
                      </div>

                      {!slipImage ? (
                        <div>
                          <label
                            htmlFor="promptpay-slip-input"
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '1rem',
                              background: '#F8FAFC',
                              borderRadius: '10px',
                              border: '1px dashed #CBD5E1',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                            }}
                          >
                            <ImageIcon size={28} color="#0284C7" style={{ marginBottom: '6px' }} />
                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0369A1' }}>
                              คลิกที่นี่เพื่ออัปโหลดรูปสลิป
                            </span>
                            <span style={{ fontSize: '0.74rem', color: '#9CA3AF', marginTop: '2px' }}>
                              รองรับไฟล์รูปภาพ JPG, PNG, WEBP (ไม่เกิน 10MB)
                            </span>
                          </label>
                          <input
                            id="promptpay-slip-input"
                            type="file"
                            accept="image/*"
                            onChange={handleSlipFileChange}
                            style={{ display: 'none' }}
                          />
                        </div>
                      ) : (
                        <div>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.75rem',
                              padding: '0.65rem',
                              background: '#F0FDF4',
                              borderRadius: '10px',
                              border: '1px solid #BBF7D0',
                            }}
                          >
                            <img
                              src={slipImage}
                              alt="สลิปที่แนบ"
                              style={{ width: '55px', height: '55px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #86EFAC' }}
                            />
                            <div style={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
                              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#166534', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {slipFileName || 'slip-transfer.jpg'}
                              </div>
                              <div style={{ fontSize: '0.74rem', color: '#15803D' }}>
                                พร้อมส่งให้แอดมินตรวจสอบยอดเงิน
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setSlipImage(null);
                                setSlipFileName('');
                              }}
                              className="btn btn-ghost btn-sm"
                              style={{ color: '#EF4444', padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}
                              title="ลบสลิปเพื่อเลือกใหม่"
                            >
                              <Trash2 size={14} /> ลบ
                            </button>
                          </div>
                        </div>
                      )}
                      <div style={{ fontSize: '0.72rem', color: '#6B7280', marginTop: '0.5rem', textAlign: 'left' }}>
                        * หลังจากส่งสลิปแล้ว แอดมินจะตรวจสอบยอดเงินและกดยืนยันออเดอร์ก่อนจัดส่งสินค้าค่ะ
                      </div>
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
                background: completedOrder?.payment_method === 'promptpay' ? '#FEF3C7' : '#ECFDF5',
                border: `3px solid ${completedOrder?.payment_method === 'promptpay' ? '#F59E0B' : '#10B981'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem auto',
              }}
            >
              {completedOrder?.payment_method === 'promptpay' ? (
                <Clock size={44} color="#D97706" />
              ) : (
                <CheckCircle2 size={48} color="#10B981" />
              )}
            </div>

            <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: completedOrder?.payment_method === 'promptpay' ? '#92400E' : '#065F46', marginBottom: '0.4rem' }}>
              {completedOrder?.payment_method === 'promptpay'
                ? 'ส่งคำสั่งซื้อและแนบสลิปเรียบร้อยแล้ว!'
                : 'การสั่งซื้อเสร็จสมบูรณ์!'}
            </h3>
            <p style={{ fontSize: '0.92rem', color: '#4B5563', maxWidth: '480px', margin: '0 auto 1.5rem auto' }}>
              {completedOrder?.payment_method === 'promptpay'
                ? 'คำสั่งซื้อของคุณถูกส่งเข้าระบบเรียบร้อยแล้ว ขณะนี้รอแอดมินตรวจสอบความถูกต้องของสลิปและกดยืนยันออเดอร์ เมื่อได้รับการอนุมัติแล้ว ทีมงานจะเริ่มแพ็กสินค้าและจัดส่งให้ทันทีค่ะ'
                : 'เราได้รับคำสั่งซื้อของคุณแล้ว ระบบได้ทำการตัดสต็อกสินค้าอัตโนมัติ และฝ่ายคลังสินค้ากำลังจัดเตรียมแพ็กเกจสุดพิเศษเพื่อคุณ'}
            </p>

            <div
              style={{
                background: '#F9FAFB',
                padding: '1.25rem',
                borderRadius: '16px',
                maxWidth: '440px',
                margin: '0 auto 1.75rem auto',
                border: '1px solid #E5E7EB',
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', flexWrap: 'wrap', gap: '4px' }}>
                <span style={{ color: '#6B7280' }}>หมายเลขคำสั่งซื้อ:</span>
                <strong style={{ color: '#0284C7', wordBreak: 'break-all' }}>{completedOrder?.id}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                <span style={{ color: '#6B7280' }}>ยอดชำระสุทธิ:</span>
                <strong style={{ color: '#E11D48' }}>฿{completedOrder?.total_amount.toLocaleString()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', alignItems: 'center' }}>
                <span style={{ color: '#6B7280' }}>สถานะออเดอร์:</span>
                {completedOrder?.payment_method === 'promptpay' ? (
                  <span className="badge badge-warning" style={{ background: '#FEF3C7', color: '#B45309', border: '1px solid #FDE68A' }}>
                    ⏳ รอแอดมินตรวจสอบสลิป
                  </span>
                ) : (
                  <span className="badge badge-blue">กำลังจัดเตรียมสินค้า</span>
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: '#6B7280' }}>ผู้รับ:</span>
                <span>{completedOrder?.shipping_address.fullName}</span>
              </div>

              {completedOrder?.slip_url && (
                <div style={{ marginTop: '0.85rem', paddingTop: '0.85rem', borderTop: '1px solid #E5E7EB' }}>
                  <div style={{ fontSize: '0.8rem', color: '#6B7280', marginBottom: '6px' }}>สลิปหลักฐานที่คุณแนบ:</div>
                  <img
                    src={completedOrder.slip_url}
                    alt="สลิปที่แนบ"
                    style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '10px', border: '1px solid #CBD5E1' }}
                  />
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
              <button onClick={onClose} className="btn btn-primary">
                กลับสู่หน้าหลัก Sora Pink
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
