import React, { useState } from 'react';
import { Star, CheckCircle, ThumbsUp, MessageCircleHeart } from 'lucide-react';

interface ReviewItem {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  date: string;
  category: 'all' | 'glow' | 'acne' | 'makeup' | 'body';
  skinType: string;
  productName: string;
  productImage: string;
  comment: string;
  likes: number;
  highlightTag: string;
}

export const CustomerReviewsWall: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'glow' | 'acne' | 'makeup' | 'body'>('all');
  const [likedReviews, setLikedReviews] = useState<Record<string, boolean>>({});

  const reviews: ReviewItem[] = [
    {
      id: 'rev-1',
      name: 'คุณพิมพ์พิชชา ว. (K. Pim)',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      rating: 5,
      date: '3 วันที่แล้ว',
      category: 'glow',
      skinType: 'ผิวแห้ง ขาดน้ำ',
      productName: 'Sora Pink Cloud Hydrating Barrier Serum',
      productImage: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=200&q=80',
      comment: 'เซรั่มเนื้อละมุนมากกก ซึมไวสุดๆ ทาก่อนนอนตื่นมาหน้าฉ่ำฟู รอยแห้งลอกตรงร่องจมูกหายไปเลย แต่งหน้าติดทนขึ้นเยอะมาก หมดขวดแรกสั่งต่อแน่นอนค่ะ!',
      likes: 42,
      highlightTag: 'ผิวฉ่ำฟูอิ่มน้ำ 💧',
    },
    {
      id: 'rev-2',
      name: 'คุณณิชาภา ส. (K. Nicha)',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
      rating: 5,
      date: '5 วันที่แล้ว',
      category: 'acne',
      skinType: 'ผิวมัน เป็นสิวง่าย แพ้ง่าย',
      productName: 'Pastel Glow Niacinamide + Zinc Clarity Solution',
      productImage: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=200&q=80',
      comment: 'เป็นคนผิวแพ้ง่ายมาก ใช้เซรั่มตัวนี้แล้วไม่แสบไม่คันเลย สิวอักเสบยุบไวภายใน 3 วัน รอยแดงจากสิวจางลงชัดเจน แนะนำเพื่อนไป 2 คนแล้วชอบเหมือนกัน',
      likes: 38,
      highlightTag: 'ลดรอยสิวเห็นผล ✨',
    },
    {
      id: 'rev-3',
      name: 'คุณมินตรา ก. (K. Mint)',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
      rating: 5,
      date: '1 สัปดาห์ที่แล้ว',
      category: 'makeup',
      skinType: 'ทุกสภาพผิว',
      productName: 'Sora Velvet Dew Jelly Lip Tint (#03 Sakura Pink)',
      productImage: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=200&q=80',
      comment: 'สีชมพูซากุระสวยธรรมชาติมาก ทาแล้วปากดูสุขภาพดี อวบอิ่มฉ่ำวาวแต่ไม่เหนียวเหนอะหนะ กินน้ำก็ยังเหลือสเตนสีระเรื่ออยู่ ไม่ตกร่องเลยค่ะ เลิฟมากก',
      likes: 56,
      highlightTag: 'สีสวยติดทน 🌸',
    },
    {
      id: 'rev-4',
      name: 'คุณอรวรรณ พ. (K. Aor)',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      rating: 5,
      date: '1 สัปดาห์ที่แล้ว',
      category: 'body',
      skinType: 'ผิวแห้ง ผิวตัวคล้ำเสีย',
      productName: 'Sakura Petal Moisturizing Body Wash',
      productImage: 'https://images.unsplash.com/photo-1608248597359-5776d655f464?auto=format&fit=crop&w=200&q=80',
      comment: 'กลิ่นหอมฟุ้งทั้งห้องน้ำ อาบแล้วผิวนุ่มลื่นไม่แห้งตึง แฟนทักว่าตัวหอมมากกก ขวดใหญ่ใช้ได้นาน คุ้มค่าเกินราคาจริงๆ ค่ะ',
      likes: 29,
      highlightTag: 'กลิ่นหอมติดผิว 🛁',
    },
    {
      id: 'rev-5',
      name: 'คุณชลิตา ธ. (K. Lita)',
      avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&q=80',
      rating: 5,
      date: '2 สัปดาห์ที่แล้ว',
      category: 'makeup',
      skinType: 'ผิวผสม',
      productName: 'Soft Cloud Marshmallow Powder Blush',
      productImage: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=200&q=80',
      comment: 'บลัชออนมาร์ชแมลโลว์คือที่สุด! ปัดแล้วแก้มฟุ้งเป็นธรรมชาติ เบลอรูขุมขนข้างแก้มได้เนียนกริบ สีน่ารักสดใสสไตล์ไอดอลเกาหลีเลย',
      likes: 64,
      highlightTag: 'แก้มใสละมุน 🍓',
    },
    {
      id: 'rev-6',
      name: 'คุณกัญญาณัฐ ท. (K. Nat)',
      avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=150&q=80',
      rating: 5,
      date: '2 สัปดาห์ที่แล้ว',
      category: 'glow',
      skinType: 'ผิวโทรม นอนดึก',
      productName: 'Pumpkin Glow Sleeping Mask & Recovery Gel',
      productImage: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=200&q=80',
      comment: 'ช่วงสอบนอนดึกทุกคืน หน้าโทรมแห้งกร้าน โบกสลีปปิ้งมาส์กตัวนี้คืนเดียวตื่นมาหน้าเด้งฉ่ำเหมือนนอนเต็มอิ่ม 8 ชั่วโมง ไม่เหนียวหมอน ประทับใจมาก',
      likes: 47,
      highlightTag: 'กู้ผิวโทรมทันใจ 💤',
    },
  ];

  const filteredReviews = activeTab === 'all' 
    ? reviews 
    : reviews.filter((r) => r.category === activeTab);

  const toggleLike = (id: string) => {
    setLikedReviews((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section id="customer-reviews" style={{ padding: '3.5rem 0', position: 'relative' }}>
      <div className="container">
        {/* Section Header with Trust Metrics */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: '#F43F5E',
              fontSize: '0.85rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '0.35rem',
            }}
          >
            <MessageCircleHeart size={16} /> REAL LOVE & REVIEWS
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            เสียงการันตีจาก <span style={{ color: '#E11D48' }}>ผู้ใช้จริงกว่า 10,000+ คน</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '580px', margin: '0 auto' }}>
            ความประทับใจจริงจากลูกค้าที่สัมผัสผลลัพธ์ผิวสวยสุขภาพดีในแบบฉบับ Sora Pink
          </p>

          {/* Social Proof Score Banner */}
          <div
            className="trust-score-banner glass-panel"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '1.5rem',
              padding: '0.75rem 1.75rem',
              borderRadius: '9999px',
              marginTop: '1.25rem',
              border: '1.5px solid rgba(255, 209, 220, 0.8)',
              background: '#FFFFFF',
              boxShadow: '0 4px 18px rgba(255, 141, 168, 0.15)',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.6rem', fontWeight: 900, color: '#E11D48', lineHeight: 1 }}>4.9</span>
              <div>
                <div style={{ display: 'flex', gap: '2px' }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={15} fill="#F59E0B" color="#F59E0B" />
                  ))}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#6B7280', fontWeight: 600 }}>จาก 1,480+ รีวิว</div>
              </div>
            </div>

            <div style={{ width: '1px', height: '24px', background: '#E5E7EB' }} className="trust-divider" />

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 700, color: '#059669' }}>
              <CheckCircle size={18} color="#059669" />
              <span>98% ของลูกค้าพึงพอใจและกลับมาซื้อซ้ำ</span>
            </div>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.6rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'รีวิวทั้งหมด' },
            { id: 'glow', label: '✨ ผิวฉ่ำโกลว์' },
            { id: 'acne', label: '🌿 ลดสิวผิวแพ้ง่าย' },
            { id: 'makeup', label: '🌸 เมคอัพสุดละมุน' },
            { id: 'body', label: '🛁 ผิวกาย & กลิ่นหอม' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`filter-pill ${activeTab === tab.id ? 'active' : ''}`}
              style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Reviews Grid */}
        <div className="reviews-grid">
          {filteredReviews.map((rev) => {
            const isLiked = likedReviews[rev.id];
            const currentLikes = rev.likes + (isLiked ? 1 : 0);

            return (
              <div
                key={rev.id}
                className="review-card glass-card"
                style={{
                  borderRadius: '20px',
                  padding: '1.4rem',
                  border: '1px solid rgba(255, 209, 220, 0.6)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                }}
              >
                {/* Header: User Info & Stars */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <img
                        src={rev.avatar}
                        alt={rev.name}
                        style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{rev.name}</span>
                          <CheckCircle size={14} color="#059669" />
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          {rev.skinType} • {rev.date}
                        </div>
                      </div>
                    </div>

                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.55rem',
                        borderRadius: '9999px',
                        background: '#FFF1F2',
                        color: '#E11D48',
                        border: '1px solid #FFE4E6',
                      }}
                    >
                      {rev.highlightTag}
                    </span>
                  </div>

                  {/* Rating Stars */}
                  <div style={{ display: 'flex', gap: '3px', marginBottom: '0.65rem' }}>
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} size={15} fill="#F59E0B" color="#F59E0B" />
                    ))}
                  </div>

                  {/* Comment Text */}
                  <p
                    style={{
                      fontSize: '0.88rem',
                      lineHeight: 1.55,
                      color: 'var(--text-primary)',
                      margin: 0,
                    }}
                  >
                    "{rev.comment}"
                  </p>
                </div>

                {/* Footer: Purchased Product Tag & Like Counter */}
                <div
                  style={{
                    paddingTop: '0.85rem',
                    borderTop: '1px solid rgba(255, 209, 220, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden', maxWidth: '75%' }}>
                    <img
                      src={rev.productImage}
                      alt={rev.productName}
                      style={{ width: '28px', height: '28px', borderRadius: '6px', objectFit: 'cover', flexShrink: 0 }}
                    />
                    <span
                      style={{
                        fontSize: '0.76rem',
                        color: 'var(--text-secondary)',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                        fontWeight: 500,
                      }}
                    >
                      ซื้อสินค้า: <strong>{rev.productName}</strong>
                    </span>
                  </div>

                  <button
                    onClick={() => toggleLike(rev.id)}
                    style={{
                      background: isLiked ? '#FFE4E6' : 'transparent',
                      border: 'none',
                      color: isLiked ? '#E11D48' : '#9CA3AF',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '9999px',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <ThumbsUp size={14} fill={isLiked ? '#E11D48' : 'none'} />
                    <span>{currentLikes}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        .reviews-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.25rem;
        }
        .review-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 28px rgba(255, 141, 168, 0.18) !important;
        }
        @media (max-width: 992px) {
          .reviews-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 640px) {
          .reviews-grid {
            grid-template-columns: 1fr;
          }
          .trust-divider {
            display: none;
          }
        }
        [data-theme="dark"] .trust-score-banner {
          background: rgba(22, 27, 40, 0.9) !important;
          border-color: rgba(255, 255, 255, 0.1) !important;
        }
        [data-theme="dark"] .review-card {
          background: rgba(24, 29, 43, 0.85) !important;
          border-color: rgba(255, 255, 255, 0.1) !important;
        }
      `}</style>
    </section>
  );
};
