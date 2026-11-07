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
  AlertCircle,
} from 'lucide-react';
import { showToast } from './Toast';

interface OrderTrackingModalProps {
  order: Order | null;
  onClose: () => void;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({ order, onClose }) => {
  if (!order) return null;

  const now = new Date();
  const rawDate = order.created_at ? new Date(order.created_at) : new Date();
  const orderDate = isNaN(rawDate.getTime()) ? new Date() : rawDate;

  // Thai Date Formatter Helpers
  const formatDateTime = (d: Date) => {
    return d.toLocaleString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const formatDateOnly = (d: Date) => {
    return d.toLocaleString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: '2-digit',
    });
  };

  // Calculate realistic estimated delivery date
  const orderHour = parseInt(
    orderDate.toLocaleString('en-US', {
      timeZone: 'Asia/Bangkok',
      hour: 'numeric',
      hour12: false,
    }),
    10
  );
  // If ordered after 14:00 (or late evening/night), add 2 days; otherwise 1 day
  const transitDays = orderHour >= 14 ? 2 : 1;
  const estimatedDeliveryDate = new Date(
    orderDate.getTime() + transitDays * 24 * 60 * 60 * 1000
  );

  const getDeliveryTargetLabel = (targetDate: Date) => {
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const target = new Date(
      targetDate.getFullYear(),
      targetDate.getMonth(),
      targetDate.getDate()
    );
    const diffDays = Math.round(
      (target.getTime() - today.getTime()) / (24 * 60 * 60 * 1000)
    );

    if (diffDays <= 0) {
      if (now.getHours() < 18) {
        return 'วันนี้ (ภายใน 18:00 น.)';
      } else {
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        return `วันพรุ่งนี้ (${formatDateOnly(tomorrow)} ภายใน 18:00 น.)`;
      }
    } else if (diffDays === 1) {
      return `วันพรุ่งนี้ (${formatDateOnly(targetDate)} ภายใน 18:00 น.)`;
    } else {
      return `${formatDateOnly(targetDate)} (ภายใน 18:00 น.)`;
    }
  };

  const hasRealTracking = Boolean(order.tracking_number);
  const fallbackTracking = `TH${
    order.id.replace(/[^0-9]/g, '').padEnd(10, '8').slice(0, 10) || '8719020438'
  }SP`;
  const trackingNumber = order.tracking_number || fallbackTracking;

  const copyTracking = () => {
    navigator.clipboard.writeText(trackingNumber);
    showToast(`คัดลอกเลขพัสดุ ${trackingNumber} แล้วค่ะ!`, 'success');
  };

  // Status Badge Configuration
  const getStatusConfig = () => {
    switch (order.order_status) {
      case 'pending':
        if (order.payment_method === 'promptpay') {
          return {
            label: order.admin_verified ? '✅ ยืนยันยอดเงินแล้ว' : '⏳ รอแอดมินตรวจสอบสลิป',
            color: order.admin_verified ? '#059669' : '#D97706',
            bg: order.admin_verified ? '#D1FAE5' : '#FEF3C7',
            borderColor: order.admin_verified ? '#A7F3D0' : '#FDE68A',
          };
        }
        return {
          label: '⏳ รอชำระเงิน',
          color: '#D97706',
          bg: '#FEF3C7',
          borderColor: '#FDE68A',
        };
      case 'processing':
        return {
          label: '📦 กำลังจัดเตรียมพัสดุ',
          color: '#0284C7',
          bg: '#E0F2FE',
          borderColor: '#BAE6FD',
        };
      case 'shipped':
        return {
          label: '🚚 กำลังจัดส่งให้คุณ',
          color: '#E11D48',
          bg: '#FFE4E6',
          borderColor: '#FECDD3',
        };
      case 'delivered':
        return {
          label: '✅ จัดส่งสำเร็จแล้ว',
          color: '#059669',
          bg: '#D1FAE5',
          borderColor: '#A7F3D0',
        };
      case 'cancelled':
        return {
          label: '❌ ยกเลิกคำสั่งซื้อ',
          color: '#64748B',
          bg: '#F1F5F9',
          borderColor: '#E2E8F0',
        };
      default:
        return {
          label: '📦 รับคำสั่งซื้อแล้ว',
          color: '#0284C7',
          bg: '#E0F2FE',
          borderColor: '#BAE6FD',
        };
    }
  };

  const statusConfig = getStatusConfig();
  const elapsedHours = (now.getTime() - orderDate.getTime()) / (3600 * 1000);

  // Dynamic Realistic Steps based on order_status
  interface StepItem {
    title: string;
    desc: string;
    time: string;
    done: boolean;
    active?: boolean;
    icon: React.ReactNode;
  }

  let steps: StepItem[] = [];

  if (order.order_status === 'cancelled') {
    steps = [
      {
        title: 'คำสั่งซื้อถูกบันทึกในระบบ',
        desc: 'คำสั่งซื้อของคุณถูกสร้างขึ้นในระบบ Sora Pink',
        time: formatDateTime(orderDate),
        done: true,
        icon: <CheckCircle2 size={18} color="#10B981" />,
      },
      {
        title: 'คำสั่งซื้อถูกยกเลิกแล้ว',
        desc: 'คำสั่งซื้อนี้ได้รับการยกเลิกเรียบร้อยแล้ว',
        time: formatDateTime(order.updated_at ? new Date(order.updated_at) : now),
        done: false,
        active: true,
        icon: <AlertCircle size={18} color="#EF4444" />,
      },
    ];
  } else if (order.order_status === 'pending') {
    const isPromptPay = order.payment_method === 'promptpay';
    steps = [
      {
        title: 'บันทึกคำสั่งซื้อเรียบร้อยแล้ว',
        desc: isPromptPay
          ? 'ระบบได้รับคำสั่งซื้อและหลักฐานสลิปโอนเงินของคุณแล้ว'
          : 'ระบบได้รับคำสั่งซื้อและรอการชำระเงินหรือตรวจสอบยอด',
        time: formatDateTime(orderDate),
        done: true,
        icon: <CheckCircle2 size={18} color="#10B981" />,
      },
      {
        title: isPromptPay ? 'แอดมินตรวจสอบสลิปโอนเงิน' : 'รอการยืนยันชำระเงิน',
        desc: isPromptPay
          ? order.admin_verified
            ? 'แอดมินตรวจสอบยอดเงินถูกต้องแล้ว กำลังส่งต่อให้ฝ่ายจัดเตรียมพัสดุ'
            : 'แอดมินกำลังตรวจสอบความถูกต้องของสลิปและยอดเงินในระบบ'
          : 'กรุณาชำระเงินผ่านช่องทางที่เลือกเพื่อดำเนินการจัดส่ง',
        time: order.admin_verified ? 'ตรวจสอบแล้ว' : 'กำลังรอตรวจสอบ',
        done: Boolean(order.admin_verified),
        active: !order.admin_verified,
        icon: order.admin_verified ? <CheckCircle2 size={18} color="#10B981" /> : <Clock size={18} color="#F59E0B" />,
      },
      {
        title: 'แพ็กสินค้าและบรรจุของแถม',
        desc: 'ฝ่ายคลังสินค้าจะเริ่มจัดเตรียมสินค้าทันทีที่ได้รับการยืนยันยอดเงิน',
        time: 'รอดำเนินการ',
        done: false,
        icon: <Package size={18} color="#94A3B8" />,
      },
      {
        title: 'Flash Express เข้ารับพัสดุที่คลังสินค้า',
        desc: 'ส่งต่อให้เจ้าหน้าที่ Flash Express เข้ารับตามรอบจัดส่ง',
        time: 'รอดำเนินการ',
        done: false,
        icon: <Truck size={18} color="#94A3B8" />,
      },
      {
        title: 'จัดส่งถึงที่อยู่ของคุณ',
        desc: 'พนักงานส่งพัสดุ Flash Express นำจ่ายพัสดุถึงที่อยู่ปลายทาง',
        time: `คาดว่าจะได้รับ ${formatDateOnly(estimatedDeliveryDate)}`,
        done: false,
        icon: <MapPin size={18} color="#94A3B8" />,
      },
    ];
  } else if (order.order_status === 'processing') {
    // Freshly placed order / currently packing
    steps = [
      {
        title: 'คำสั่งซื้อได้รับการยืนยันแล้ว',
        desc: 'ระบบได้รับการชำระเงินและส่งคำสั่งซื้อไปยังศูนย์จัดส่ง Sora Pink เรียบร้อย',
        time: formatDateTime(orderDate),
        done: true,
        icon: <CheckCircle2 size={18} color="#10B981" />,
      },
      {
        title: 'กำลังแพ็กสินค้าและบรรจุของแถม',
        desc: 'บรรจุกล่องพรีเมียม ห่อบับเบิ้ลกันกระแทก 3 ชั้น พร้อมสกินแคร์การ์ดของแถม',
        time: 'กำลังดำเนินการแพ็กสินค้า',
        done: false,
        active: true,
        icon: <Package size={18} color="#F59E0B" />,
      },
      {
        title: 'Flash Express เข้ารับพัสดุที่คลังสินค้า',
        desc: 'พัสดุเตรียมส่งมอบให้ Flash Express เข้ารับตามรอบจัดส่งสินค้า',
        time: 'รอบเข้ารับถัดไป (10:00 - 14:00 น.)',
        done: false,
        icon: <Truck size={18} color="#94A3B8" />,
      },
      {
        title: 'พัสดุถึงศูนย์กระจายสินค้าปลายทาง',
        desc: 'พัสดุเข้าสู่ศูนย์คัดแยกหลัก (Sorting Hub) เพื่อส่งต่อไปยังพื้นที่ปลายทาง',
        time: 'รอดำเนินการ',
        done: false,
        icon: <MapPin size={18} color="#94A3B8" />,
      },
      {
        title: 'นำส่งพัสดุถึงที่อยู่ของคุณ',
        desc: 'พนักงานจัดส่ง Flash Express จะติดต่อและนำพัสดุส่งถึงมือคุณ',
        time: `คาดว่าจะได้รับ: ${getDeliveryTargetLabel(estimatedDeliveryDate)}`,
        done: false,
        icon: <Clock size={18} color="#94A3B8" />,
      },
    ];
  } else if (order.order_status === 'shipped') {
    // Order has been dispatched by warehouse
    const packedTime = new Date(
      Math.min(orderDate.getTime() + 1.5 * 3600 * 1000, now.getTime() - 20 * 60 * 1000)
    );
    const pickupTime = new Date(
      Math.min(orderDate.getTime() + 3.5 * 3600 * 1000, now.getTime() - 10 * 60 * 1000)
    );
    const isHubDone = elapsedHours >= 8;
    const hubTime = new Date(
      Math.min(orderDate.getTime() + 8 * 3600 * 1000, now.getTime())
    );

    steps = [
      {
        title: 'คำสั่งซื้อได้รับการยืนยันแล้ว',
        desc: 'ระบบได้รับการชำระเงินและส่งคำสั่งซื้อไปยังศูนย์จัดส่ง Sora Pink',
        time: formatDateTime(orderDate),
        done: true,
        icon: <CheckCircle2 size={18} color="#10B981" />,
      },
      {
        title: 'แพ็กสินค้าและบรรจุของแถมเรียบร้อย',
        desc: 'บรรจุกล่องพรีเมียม ห่อบับเบิ้ลกันกระแทก 3 ชั้น พร้อมสกินแคร์การ์ดของแถม',
        time: formatDateTime(packedTime),
        done: true,
        icon: <Package size={18} color="#10B981" />,
      },
      {
        title: 'Flash Express เข้ารับพัสดุที่คลังสินค้า',
        desc: 'พัสดุเข้าสู่ศูนย์คัดแยกสินค้าหลัก (Main Sorting Hub)',
        time: formatDateTime(pickupTime),
        done: true,
        icon: <Truck size={18} color="#0284C7" />,
      },
      {
        title: 'พัสดุถึงศูนย์กระจายสินค้าปลายทาง',
        desc: isHubDone
          ? 'สินค้าถึงศูนย์กระจายสินค้าปลายทางเรียบร้อย เตรียมนำจ่าย'
          : 'สินค้าอยู่ระหว่างเดินทางสู่ศูนย์กระจายสินค้าปลายทาง',
        time: isHubDone ? formatDateTime(hubTime) : 'กำลังขนส่งสู่ศูนย์ปลายทาง',
        done: isHubDone,
        active: !isHubDone,
        icon: <MapPin size={18} color={isHubDone ? '#10B981' : '#F59E0B'} />,
      },
      {
        title: 'พนักงานจัดส่งกำลังนำจ่ายพัสดุ (Out for Delivery)',
        desc: 'คุณสมชาย พ. (พนักงานส่งพัสดุ Flash Express) กำลังเดินทางนำส่ง',
        time: getDeliveryTargetLabel(estimatedDeliveryDate),
        done: false,
        active: isHubDone,
        icon: <Clock size={18} color={isHubDone ? '#F59E0B' : '#94A3B8'} />,
      },
    ];
  } else if (order.order_status === 'delivered') {
    // Order delivered completely
    const packedTime = new Date(orderDate.getTime() + 1.5 * 3600 * 1000);
    const pickupTime = new Date(orderDate.getTime() + 4 * 3600 * 1000);
    const hubTime = new Date(orderDate.getTime() + 12 * 3600 * 1000);
    const deliveredTime = order.updated_at
      ? new Date(order.updated_at)
      : new Date(orderDate.getTime() + 24 * 3600 * 1000);

    steps = [
      {
        title: 'คำสั่งซื้อได้รับการยืนยันแล้ว',
        desc: 'ระบบได้รับการชำระเงินและส่งคำสั่งซื้อไปยังศูนย์จัดส่ง Sora Pink',
        time: formatDateTime(orderDate),
        done: true,
        icon: <CheckCircle2 size={18} color="#10B981" />,
      },
      {
        title: 'แพ็กสินค้าและบรรจุของแถมเรียบร้อย',
        desc: 'บรรจุกล่องพรีเมียม ห่อบับเบิ้ลกันกระแทก 3 ชั้น พร้อมสกินแคร์การ์ดของแถม',
        time: formatDateTime(packedTime),
        done: true,
        icon: <Package size={18} color="#10B981" />,
      },
      {
        title: 'Flash Express เข้ารับพัสดุที่คลังสินค้า',
        desc: 'พัสดุเข้าสู่ศูนย์คัดแยกสินค้าหลัก (Main Sorting Hub)',
        time: formatDateTime(pickupTime),
        done: true,
        icon: <Truck size={18} color="#10B981" />,
      },
      {
        title: 'พัสดุถึงศูนย์กระจายสินค้าปลายทาง',
        desc: 'สินค้าเตรียมนำส่งสู่ที่อยู่จัดส่งของคุณ',
        time: formatDateTime(hubTime),
        done: true,
        icon: <MapPin size={18} color="#10B981" />,
      },
      {
        title: 'พัสดุจัดส่งสำเร็จแล้ว',
        desc: 'เซ็นรับพัสดุเรียบร้อย ขอบคุณที่ไว้วางใจช้อปปิ้งสกินแคร์กับ Sora Pink ค่ะ 💖',
        time: formatDateTime(deliveredTime),
        done: true,
        icon: <CheckCircle2 size={18} color="#10B981" />,
      },
    ];
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content modal-content-lg order-tracking-modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '680px',
          borderRadius: '28px',
          background: 'linear-gradient(180deg, #FFFFFF 0%, #FFF9FA 100%)',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '1.25rem',
          }}
        >
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
                <h3
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    color: '#1F2937',
                    margin: 0,
                  }}
                >
                  ติดตามสถานะพัสดุเรียลไทม์
                </h3>
                <span style={{ fontSize: '0.82rem', color: '#6B7280', wordBreak: 'break-all' }}>
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
                  padding: '3px 10px',
                  borderRadius: '9999px',
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
              <span
                style={{
                  fontSize: '1.15rem',
                  fontWeight: 800,
                  color: '#0F172A',
                  fontFamily: 'monospace',
                }}
              >
                {trackingNumber}
              </span>
              <button
                onClick={copyTracking}
                className="btn btn-sm"
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '9999px',
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
              {!hasRealTracking && order.order_status === 'processing' && (
                <span
                  style={{
                    fontSize: '0.72rem',
                    color: '#0284C7',
                    background: '#E0F2FE',
                    padding: '2px 6px',
                    borderRadius: '6px',
                    fontWeight: 600,
                  }}
                >
                  เตรียมจัดส่ง
                </span>
              )}
            </div>

            {!hasRealTracking && order.order_status === 'processing' && (
              <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>
                * เลขพัสดุเตรียมจัดส่ง จะเช็คสถานะบนเว็บ Flash Express ได้เมื่อรถเข้ารับสินค้าที่คลัง
              </div>
            )}
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.78rem', color: '#6B7280' }}>สถานะปัจจุบัน</div>
            <div
              style={{
                fontSize: '0.98rem',
                fontWeight: 800,
                color: statusConfig.color,
                background: statusConfig.bg,
                border: `1px solid ${statusConfig.borderColor}`,
                padding: '4px 10px',
                borderRadius: '9999px',
                display: 'inline-block',
                marginTop: '3px',
              }}
            >
              {statusConfig.label}
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
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '4px',
                    }}
                  >
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
                    <span
                      style={{
                        fontSize: '0.78rem',
                        color: step.active ? '#B45309' : step.done ? '#475569' : '#94A3B8',
                        fontWeight: step.active || step.done ? 600 : 500,
                      }}
                    >
                      {step.time}
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: '0.82rem',
                      color: '#64748B',
                      margin: '4px 0 0',
                      lineHeight: 1.5,
                    }}
                  >
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
              <strong style={{ fontSize: '0.88rem', color: '#1E293B' }}>
                ที่อยู่จัดส่งของผู้รับ:
              </strong>
            </div>
            <div
              style={{
                fontSize: '0.84rem',
                color: '#475569',
                lineHeight: 1.6,
                paddingLeft: '1.4rem',
              }}
            >
              {order.shipping_address?.fullName || 'ลูกค้า Sora Pink'} (
              {order.shipping_address?.phone || '-'})<br />
              {order.shipping_address?.address || ''} {order.shipping_address?.province || ''}{' '}
              {order.shipping_address?.postalCode || ''}
            </div>
          </div>

          {/* Attached Slip Preview */}
          {order.slip_url && (
            <div
              style={{
                marginTop: '1rem',
                padding: '0.85rem 1rem',
                background: '#F0F9FF',
                borderRadius: '14px',
                border: '1px solid #BAE6FD',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.75rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <img
                  src={order.slip_url}
                  alt="สลิปโอนเงิน"
                  style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover', border: '1px solid #38BDF8' }}
                />
                <div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0369A1' }}>
                    หลักฐานสลิปพร้อมเพย์ที่คุณแนบ
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#0284C7' }}>
                    {order.admin_verified ? '✅ แอดมินตรวจสอบยอดเงินเรียบร้อยแล้ว' : '⏳ รอแอดมินตรวจสอบยอดเงิน'}
                  </div>
                </div>
              </div>
            </div>
          )}
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
            <span>
              สายด่วน Flash Express: <strong>1436</strong>
            </span>
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
