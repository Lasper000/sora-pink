import React, { useState, useEffect } from 'react';
import type { Product } from '../../types';
import { CheckCircle, X } from 'lucide-react';

interface LiveSalesNotificationProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

interface SaleEvent {
  customerName: string;
  location: string;
  timeAgo: string;
  productId: string;
}

const SAMPLE_SALES: SaleEvent[] = [
  {
    customerName: 'คุณมุกดา พ.',
    location: 'กรุงเทพฯ',
    timeAgo: 'เมื่อ 2 นาทีที่แล้ว',
    productId: 'a1000000-0000-0000-0000-000000000001', // Barrier Serum
  },
  {
    customerName: 'คุณพิมพ์พิชชา ว.',
    location: 'นนทบุรี',
    timeAgo: 'เมื่อ 4 นาทีที่แล้ว',
    productId: 'a1000000-0000-0000-0000-000000000002', // Velvet Lip Tint
  },
  {
    customerName: 'คุณศศิธร ม.',
    location: 'เชียงใหม่',
    timeAgo: 'เมื่อ 6 นาทีที่แล้ว',
    productId: 'a1000000-0000-0000-0000-000000000087', // Aqua Sunscreen
  },
  {
    customerName: 'คุณกานต์ดา ส.',
    location: 'ชลบุรี',
    timeAgo: 'เมื่อ 8 นาทีที่แล้ว',
    productId: 'a1000000-0000-0000-0000-000000000070', // Sakura EDP
  },
  {
    customerName: 'คุณณิชาภา ร.',
    location: 'ภูเก็ต',
    timeAgo: 'เมื่อ 11 นาทีที่แล้ว',
    productId: 'a1000000-0000-0000-0000-000000000079', // Rose Quartz Gua Sha
  },
  {
    customerName: 'คุณธนกฤต วิเศษฯ',
    location: 'ขอนแก่น',
    timeAgo: 'เมื่อ 14 นาทีที่แล้ว',
    productId: 'a1000000-0000-0000-0000-000000000003', // Niacinamide Serum
  },
  {
    customerName: 'คุณจอย ณัฐณิชา',
    location: 'นครปฐม',
    timeAgo: 'เมื่อ 17 นาทีที่แล้ว',
    productId: 'a1000000-0000-0000-0000-000000000096', // Collagen Eye Mask
  },
];

export const LiveSalesNotification: React.FC<LiveSalesNotificationProps> = ({
  products,
  onSelectProduct,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (isDismissed || products.length === 0) return;

    // First trigger after 6 seconds
    const initialTimer = setTimeout(() => {
      setIsVisible(true);
    }, 6000);

    // Periodic show / hide every 20 seconds
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % SAMPLE_SALES.length);
        setIsVisible(true);
      }, 1000);
    }, 18000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [isDismissed, products]);

  if (isDismissed || products.length === 0) return null;

  const currentSale = SAMPLE_SALES[currentIndex];
  const linkedProduct = products.find((p) => p.id === currentSale.productId) || products[0];

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '24px',
        zIndex: 990,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.96)',
        transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        pointerEvents: isVisible ? 'auto' : 'none',
      }}
    >
      <div
        onClick={() => onSelectProduct(linkedProduct)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.85rem',
          background: 'rgba(255, 255, 255, 0.94)',
          backdropFilter: 'blur(12px)',
          padding: '0.75rem 1rem 0.75rem 0.75rem',
          borderRadius: '18px',
          boxShadow: '0 12px 30px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(225, 29, 72, 0.08)',
          border: '1.5px solid rgba(255, 209, 220, 0.75)',
          maxWidth: '340px',
          cursor: 'pointer',
          position: 'relative',
        }}
      >
        {/* Product Image */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <img
            src={linkedProduct.images[0]}
            alt={linkedProduct.name}
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '12px',
              objectFit: 'cover',
              border: '1px solid #FFE4E6',
            }}
          />
          <span
            style={{
              position: 'absolute',
              bottom: '-3px',
              right: '-3px',
              background: '#10B981',
              borderRadius: '50%',
              width: '14px',
              height: '14px',
              border: '2px solid #FFFFFF',
            }}
            title="Verified Sale"
          />
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0, paddingRight: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.74rem', color: '#64748B' }}>
            <span style={{ fontWeight: 700, color: '#0F172A' }}>{currentSale.customerName}</span>
            <span>({currentSale.location})</span>
          </div>

          <p
            style={{
              fontSize: '0.82rem',
              fontWeight: 700,
              color: '#E11D48',
              margin: '2px 0',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {linkedProduct.name}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', color: '#94A3B8' }}>
            <span>{currentSale.timeAgo}</span>
            <span>•</span>
            <span style={{ color: '#059669', display: 'inline-flex', alignItems: 'center', gap: '2px', fontWeight: 600 }}>
              <CheckCircle size={11} /> ออเดอร์จริง
            </span>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsDismissed(true);
          }}
          style={{
            position: 'absolute',
            top: '6px',
            right: '6px',
            background: 'transparent',
            border: 'none',
            color: '#94A3B8',
            cursor: 'pointer',
            padding: '2px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="ปิดการแจ้งเตือน"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};
