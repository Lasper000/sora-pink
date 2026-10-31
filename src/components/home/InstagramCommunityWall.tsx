import React from 'react';
import type { Product } from '../../types';
import { Heart, MessageCircle, ExternalLink, ShoppingBag } from 'lucide-react';
import { handleImageError } from '../../utils/imageFallback';

const InstagramIcon: React.FC<{ size?: number; color?: string }> = ({ size = 20, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: 'inline-block', verticalAlign: 'middle' }}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

interface CommunityPost {
  id: string;
  author: string;
  image: string;
  likes: string;
  comments: string;
  productId?: string;
  caption: string;
}

interface InstagramCommunityWallProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

export const InstagramCommunityWall: React.FC<InstagramCommunityWallProps> = ({ products, onSelectProduct }) => {
  const posts: CommunityPost[] = [
    {
      id: 'ig-1',
      author: '@mookda.style',
      image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80',
      likes: '1.8k',
      comments: '124',
      productId: 'a1000000-0000-0000-0000-000000000002', // Velvet Lip Tint
      caption: 'My everyday lip tint! สี #03 Sakura Pink ละมุนตุ้นมากกก ฉ่ำวาวทั้งวัน 🌸💕 #SoraPinkGlow',
    },
    {
      id: 'ig-2',
      author: '@pimmy_glow',
      image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80',
      likes: '2.4k',
      comments: '189',
      productId: 'a1000000-0000-0000-0000-000000000001', // Barrier Serum
      caption: 'เซรั่มปุยเมฆกู้ผิวโทรมให้กลับมาฉ่ำวาว อิ่มฟูสมชื่อ Pink Cloud Serum เลยย ☁️✨',
    },
    {
      id: 'ig-3',
      author: '@beauty_with_grace',
      image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=600&q=80',
      likes: '1.2k',
      comments: '78',
      productId: 'a1000000-0000-0000-0000-000000000008', // Marshmallow Blush
      caption: 'บลัชออนมาร์ชแมลโลว์เนื้อนุ่มมาก ปัดแก้มฟุ้งๆ ดูเด็กลงไป 5 ปีเลยย 🍓🎀',
    },
    {
      id: 'ig-4',
      author: '@nicha_pastel',
      image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=600&q=80',
      likes: '960',
      comments: '62',
      productId: 'a1000000-0000-0000-0000-000000000006', // Sakura Body Wash
      caption: 'อาบน้ำแบบเจ้าหญิง กลิ่นซากุระหอมฟุ้งติดตัวข้ามวัน ผิวนุ่มน่ากอดสุดๆ 🛁🌸',
    },
    {
      id: 'ig-5',
      author: '@fah_skincareroutine',
      image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80',
      likes: '3.1k',
      comments: '245',
      productId: 'a1000000-0000-0000-0000-000000000004', // Pumpkin Mask
      caption: 'ไอเทมกู้ผิวฉุกเฉินตอนนอนดึก โบกตัวนี้ตื่นมาหน้าใสปิ๊ง ไม่โทรมเลยย เลิฟฟฟ 🎃✨',
    },
    {
      id: 'ig-6',
      author: '@fern.lifestyle',
      image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=600&q=80',
      likes: '1.5k',
      comments: '110',
      productId: 'a1000000-0000-0000-0000-000000000007', // Hair Elixir
      caption: 'ออยล์ใส่ผมกุหลาบที่หอมแพงที่สุด! ปลายผมไม่แห้งชี้ฟู เงาสวยเล่นแสงมาก 🌹💫',
    },
  ];

  return (
    <section id="community-wall" style={{ padding: '3.5rem 0', position: 'relative' }}>
      <div className="container">
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.25rem' }}>
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
            <InstagramIcon size={16} /> #SORAPINKGLOW COMMUNITY
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            ไอเดียผิวสวยจาก <span style={{ color: '#E11D48' }}>#SoraPink</span> บน Instagram
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '580px', margin: '0 auto' }}>
            แท็ก @sorapink.official และติดแฮชแท็ก <strong>#SoraPinkGlow</strong> เพื่อลุ้นรับโค้ดส่วนลด ฿200 ทุกสัปดาห์
          </p>
        </div>

        {/* Instagram Visual Grid */}
        <div className="community-grid">
          {posts.map((post) => {
            const linkedProduct = post.productId
              ? products.find((p) => p.id === post.productId)
              : null;

            return (
              <div
                key={post.id}
                className="community-card"
                style={{
                  position: 'relative',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  aspectRatio: '1 / 1',
                  background: '#F3F4F6',
                  cursor: 'pointer',
                  boxShadow: '0 6px 18px rgba(0, 0, 0, 0.06)',
                }}
              >
                {/* Image */}
                <img
                  src={post.image}
                  alt={post.author}
                  onError={handleImageError}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                  className="community-img"
                />

                {/* Top Badge: Author tag */}
                <div
                  style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    background: 'rgba(0, 0, 0, 0.55)',
                    backdropFilter: 'blur(8px)',
                    color: '#FFFFFF',
                    padding: '0.25rem 0.65rem',
                    borderRadius: '9999px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    zIndex: 2,
                  }}
                >
                  <InstagramIcon size={12} />
                  <span>{post.author}</span>
                </div>

                {/* Hover Overlay */}
                <div className="community-overlay">
                  <div style={{ display: 'flex', gap: '1rem', color: '#FFFFFF', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Heart size={16} fill="#FF4D6D" color="#FF4D6D" /> {post.likes}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MessageCircle size={16} fill="#FFFFFF" color="#FFFFFF" /> {post.comments}
                    </span>
                  </div>

                  <p
                    style={{
                      color: 'rgba(255, 255, 255, 0.92)',
                      fontSize: '0.78rem',
                      lineHeight: 1.4,
                      textAlign: 'center',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      margin: '0 0 0.85rem 0',
                    }}
                  >
                    "{post.caption}"
                  </p>

                  {/* Shop this item button */}
                  {linkedProduct && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectProduct(linkedProduct);
                      }}
                      className="btn btn-sm"
                      style={{
                        background: '#FFFFFF',
                        color: '#E11D48',
                        borderRadius: '9999px',
                        padding: '0.35rem 0.85rem',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                      }}
                    >
                      <ShoppingBag size={13} /> ช้อปไอเทมในรูป
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Instagram Follow Bar */}
        <div style={{ textAlign: 'center', marginTop: '2.25rem', padding: '0 0.5rem' }}>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.6rem',
              padding: '0.65rem 1.4rem',
              borderRadius: '9999px',
              fontSize: '0.92rem',
              fontWeight: 700,
              textDecoration: 'none',
              maxWidth: '100%',
              boxSizing: 'border-box',
              flexWrap: 'wrap',
            }}
          >
            <InstagramIcon size={18} color="#E11D48" />
            <span style={{ wordBreak: 'break-word' }}>ติดตาม @sorapink.official บน Instagram (128K Followers)</span>
            <ExternalLink size={14} />
          </a>
        </div>
      </div>

      <style>{`
        .community-grid {
          display: grid;
          grid-template-columns: repeat(6, minmax(0, 1fr));
          gap: 1rem;
          width: 100%;
          box-sizing: border-box;
        }
        .community-card {
          min-width: 0 !important;
          max-width: 100% !important;
          box-sizing: border-box !important;
        }
        .community-card:hover .community-img {
          transform: scale(1.08);
        }
        .community-overlay {
          position: absolute;
          inset: 0;
          background: rgba(15, 23, 42, 0.72);
          backdrop-filter: blur(4px);
          display: flex;
          flex-direction: column;
          align-items: center;
          justifyContent: center;
          padding: 1rem;
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: 3;
        }
        .community-card:hover .community-overlay {
          opacity: 1;
        }
        @media (max-width: 1024px) {
          .community-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }
        @media (max-width: 640px) {
          .community-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 0.65rem;
          }
        }
      `}</style>
    </section>
  );
};
