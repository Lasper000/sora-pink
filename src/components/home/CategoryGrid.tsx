import React from 'react';
import type { Category } from '../../types';
import { Sparkles } from 'lucide-react';

interface CategoryGridProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <section id="categories" style={{ padding: '2.5rem 0' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: '#F43F5E',
              fontSize: '0.85rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '0.4rem',
            }}
          >
            <Sparkles size={16} /> หมวดหมู่ความงาม
          </div>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 800 }}>เลือกช้อปตามหมวดหมู่</h2>
          <p style={{ color: '#6B7280', fontSize: '0.95rem' }}>
            ตอบโจทย์การดูแลตัวเองตั้งแต่ศีรษะจรดปลายเท้า ด้วยสูตรพรีเมียมอ่อนโยน
          </p>
        </div>

        <div className="category-grid-container">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <div
                key={cat.id}
                onClick={() => onSelectCategory(isSelected ? '' : cat.id)}
                className="glass-card category-card-item"
                style={{
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  borderRadius: '20px',
                  border: isSelected ? '2px solid #F43F5E' : '1px solid rgba(255, 255, 255, 0.8)',
                  boxShadow: isSelected
                    ? '0 12px 28px rgba(244, 63, 94, 0.25)'
                    : '0 4px 16px rgba(0, 0, 0, 0.06)',
                }}
              >
                {/* Background image */}
                <img
                  src={cat.image_url}
                  alt={cat.name}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.12)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                />

                {/* Gradient overlay */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background:
                      'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(20, 20, 30, 0.75) 100%)',
                  }}
                />

                {/* Content */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '1.25rem',
                    color: '#FFFFFF',
                    zIndex: 2,
                  }}
                >
                  <span
                    style={{
                      background: isSelected ? '#F43F5E' : 'rgba(255, 255, 255, 0.25)',
                      backdropFilter: 'blur(4px)',
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      display: 'inline-block',
                      marginBottom: '0.4rem',
                    }}
                  >
                    {isSelected ? 'กำลังเลือกอยู่' : 'คลิกเพื่อดูสินค้า'}
                  </span>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.2rem' }}>
                    {cat.name}
                  </h3>
                  <p
                    style={{
                      fontSize: '0.78rem',
                      color: 'rgba(255, 255, 255, 0.85)',
                      lineHeight: 1.4,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {cat.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
