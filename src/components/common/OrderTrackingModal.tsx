import React from 'react';
import type { Order } from '../../types';
import {
  X,
  Truck,
  CheckCircle2,
  Package,
  MapPin,
  Clock,
  Copy,
  PhoneCall,
  ExternalLink,
} from 'lucide-react';
import { showToast } from './Toast';

interface OrderTrackingModalProps {
  order: Order | null;
  onClose: () => void;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({ order, onClose }) => {
  if (!order) return null;

  const trackingNumber =
    order.tracking_number ||
    `TH${order.id.replace(/[^0-9]/g, '').padEnd(10, '8') || '2849102938'}SP`;

  const copyTracking = () => {
    navigator.clipboard.writeText(trackingNumber);
    showToast(`คัดลอกเลขพัสดุ ${trackingNumber} แล้วค่ะ!`, 'success');
  };

  const orderDate = new Date(order.created_at);
  const formatDate = (offsetHours = 0) => {
    const d = new Date(orderDate.getTime() + offsetHours * 60 * 60 * 1000);
    return d.toLocaleString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const steps = [
    {
      title: 'คำสั่งซื้อได้รับการยืนยันแล้ว',
      desc: 'ระบบได้รับการชำระเงินและส่งคำสั่งซื้อไปยังศูนย์จัดส่ง Sora Pink',
      time: formatDate(0),
      done: true,
      icon: <CheckCircle2 size={18} color="#10B981" />,
    },
    {
      title: 'แพ็กสินค้าและบรรจุของแถมเรียบร้อย',
      desc: 'บรรจุกล่องพรีเมียม ห่อบับเบิ้ลกันกระแทก 3 ชั้น พร้อมสกินแคร์การ์ดของแถม',
      time: formatDate(2),
      done: true,
      icon: <Package size={18} color="#10B981" />,
    },
    {
      title: 'Flash Express เข้ารับพัสดุที่คลังสินค้า',
      desc: 'พัสดุเข้าสู่ศูนย์คัดแยกสินค้าหลัก (Main Sorting Hub)',
      time: formatDate(6),
      done: true,
      icon: <Truck size={18} color="#0284C7" />,
    },
    {
      title: 'พัสดุถึงศูนย์กระจายสินค้าปลายทาง',
      desc: 'สินค้าเตรียมนำส่งสู่ที่อยู่จัดส่งของคุณ',
      time: formatDate(14),
      done: true,
      icon: <MapPin size={18} color="#E11D48" />,
    },
    {
      title: 'พนักงานจัดส่งกำลังนำจ่ายพัสดุ (Out for Delivery)',
      desc: 'คุณสมชาย พ. (พนักงานส่งพัสดุ Flash Express) กำลังเดินทางนำส่ง',
      time: 'วันนี้ (ภายใน 18:00 น.)',
      done: false,
      active: true,
      icon: <Clock size={18} color="#F59E0B" />,
    },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content modal-content-lg order-tracking-modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '680px',
          borderRadius: '24px',
          background: 'linear-gradient(180deg, #FFFFFF 0%, #FFF9FA 100%)',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #0284C7 0%, #38BDF8 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                }}
              >
                <Truck size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1F2937', margin: 0 }}>
                  ติดตามสถานะพัสดุเรียลไทม์
                </h3>
                <span style={{ fontSize: '0.82rem', color: '#6B7280' }}>
                  คำสั่งซื้อ #{order.id}
                </span>
              </div>
            </div>
          </div>

          <button onClick={onClose} className="btn-icon btn-ghost">
            <X size={20} />
          </button>
        </div>

        {/* Courier & Tracking Card */}
        <div
          style={{
            background: 'linear-gradient(135deg, #FFF0F4 0%, #F0F9FF 100%)',
            border: '1.5px solid rgba(255, 209, 220, 0.8)',
            borderRadius: '18px',
            padding: '1.2rem',
            marginBottom: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <span
                style={{
                  background: '#F59E0B',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '0.72rem',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  letterSpacing: '0.04em',
                }}
              >
                FLASH EXPRESS
              </span>
              <span style={{ fontSize: '0.8rem', color: '#4B5563', fontWeight: 600 }}>
                ส่งด่วนพิเศษทั่วไทย (Express Delivery)
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', fontFamily: 'monospace' }}>
                {trackingNumber}
              </span>
              <button
                onClick={copyTracking}
                className="btn btn-sm"
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '8px',
                  padding: '3px 8px',
                  fontSize: '0.75rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                  color: '#475569',
                }}
              >
                <Copy size={12} /> คัดลอก
              </button>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.78rem', color: '#6B7280' }}>สถานะปัจจุบัน</div>
            <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#E11D48' }}>
              🚚 กำลังนำส่งให้คุณ
            </div>
          </div>
        </div>

        {/* Timeline Stepper */}
        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem', marginBottom: '1rem' }}>
          <div style={{ position: 'relative', paddingLeft: '2.5rem' }}>
            {/* Vertical Line */}
            <div
              style={{
                position: 'absolute',
                left: '17px',
                top: '15px',
                bottom: '25px',
                width: '2px',
                background: '#E2E8F0',
                zIndex: 1,
              }}
            />

            {steps.map((step, idx) => (
              <div key={idx} style={{ position: 'relative', marginBottom: '1.6rem' }}>
                {/* Node Icon */}
                <div
                  style={{
                    position: 'absolute',
                    left: '-2.5rem',
                    top: '0',
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: step.done
                      ? '#ECFDF5'
                      : step.active
                      ? '#FEF3C7'
                      : '#F1F5F9',
                    border: step.active
                      ? '2px solid #F59E0B'
                      : step.done
                      ? '2px solid #10B981'
                      : '2px solid #CBD5E1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2,
                    boxShadow: step.active ? '0 0 12px rgba(245, 158, 11, 0.4)' : 'none',
                  }}
                >
                  {step.icon}
                </div>

                {/* Step Info */}
                <div style={{ paddingLeft: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4
                      style={{
                        fontSize: '0.92rem',
                        fontWeight: step.active ? 800 : 700,
                        color: step.active ? '#B45309' : step.done ? '#1F2937' : '#94A3B8',
                        margin: 0,
                      }}
                    >
                      {step.title}
                    </h4>
                    <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 500 }}>
                      {step.time}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '4px 0 0', lineHeight: 1.5 }}>
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Destination Details */}
          <div
            style={{
              marginTop: '1.25rem',
              padding: '1rem',
              background: '#F8FAFC',
              borderRadius: '14px',
              border: '1px solid #E2E8F0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <MapPin size={16} color="#E11D48" />
              <strong style={{ fontSize: '0.88rem', color: '#1E293B' }}>ที่อยู่จัดส่งของผู้รับ:</strong>
            </div>
            <div style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.6, paddingLeft: '1.4rem' }}>
              {order.shipping_address.fullName} ({order.shipping_address.phone})<br />
              {order.shipping_address.address} {order.shipping_address.province}{' '}
              {order.shipping_address.postalCode}
            </div>
          </div>
        </div>

        {/* Footer Support Hotline */}
        <div
          style={{
            paddingTop: '1rem',
            borderTop: '1px solid #E5E7EB',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.82rem',
            color: '#6B7280',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <PhoneCall size={14} color="#0284C7" />
            <span>สายด่วน Flash Express: <strong>1436</strong></span>
          </div>

          <a
            href={`https://www.flashexpress.co.th/tracking/?se=${trackingNumber}`}
            target="_blank"
            rel="noreferrer"
            className="btn btn-sm btn-ghost"
            style={{
              color: '#0284C7',
              fontSize: '0.8rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
            }}
          >
            เปิดหน้าเว็บ Flash Express <ExternalLink size={12} />
          </a>
        </div>
      </div>

      <style>{`
        .order-tracking-modal-content {
          padding: 2rem;
        }
        @media (max-width: 640px) {
          .order-tracking-modal-content {
            padding: 1.25rem 1rem !important;
            border-radius: 20px !important;
          }
        }
      `}</style>
    </div>
  );
};
