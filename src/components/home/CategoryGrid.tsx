import React from 'react';
import type { Category } from '../../types';
import { Sparkles } from 'lucide-react';
import { handleImageError } from '../../utils/imageFallback';

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
        <div style={{ textAlign: 'center', marginBottom: '2.25rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: '#8C2E41',
              fontSize: '0.72rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
              marginBottom: '0.4rem',
            }}
          >
            <Sparkles size={13} color="#C5A880" /> คอลเลกชันตามหมวดหมู่
          </div>
          <h2 className="font-serif" style={{ fontSize: '2.2rem', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '0.01em' }}>
            Curated Beauty Collections
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', maxWidth: '520px', margin: '0 auto' }}>
            ตอบโจทย์การดูแลผิวพรรณตั้งแต่ศีรษะจรดปลายเท้า ด้วยสูตรพรีเมียมอ่อนโยนคัดสรรพิเศษ
          </p>
        </div>

        <div className="category-grid-container">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <div
                key={cat.id}
                onClick={() => onSelectCategory(isSelected ? '' : cat.id)}
                className="category-card-item"
                style={{
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  borderRadius: '24px',
                  border: isSelected ? '2px solid #DF5E7E' : '1px solid rgba(222, 83, 119, 0.15)',
                  boxShadow: isSelected
                    ? '0 10px 24px rgba(223, 94, 126, 0.25)'
                    : '0 2px 10px rgba(222, 83, 119, 0.06)',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                {/* Background image */}
                <img
                  src={cat.image_url}
                  alt={cat.name}
                  onError={handleImageError}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                />

                {/* Gradient overlay */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background:
                      'linear-gradient(180deg, rgba(44, 34, 36, 0.04) 0%, rgba(44, 34, 36, 0.68) 100%)',
                  }}
                />

                {/* Content */}
                <div
                  className="category-card-content"
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
                    className="category-card-badge"
                    style={{
                      background: isSelected ? 'linear-gradient(135deg, #DF5E7E, #C73D62)' : 'rgba(255, 255, 255, 0.28)',
                      color: '#FFFFFF',
                      backdropFilter: 'blur(4px)',
                      padding: '3px 10px',
                      borderRadius: '9999px',
                      fontSize: '0.68rem',
                      fontWeight: 600,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      display: 'inline-block',
                      marginBottom: '0.4rem',
                    }}
                  >
                    {isSelected ? 'เลือกอยู่' : 'ดูสินค้า'}
                  </span>
                  <h3 className="category-card-title font-serif" style={{ fontSize: '1.35rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.2rem', letterSpacing: '-0.01em' }}>
                    {cat.name}
                  </h3>
                  <p
                    className="category-card-desc"
                    style={{
                      fontSize: '0.78rem',
                      color: 'rgba(250, 248, 245, 0.85)',
                      lineHeight: 1.45,
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

      <style>{`
        @media (max-width: 640px) {
          .category-card-content {
            padding: 0.75rem 0.85rem !important;
          }
          .category-card-title {
            font-size: 0.96rem !important;
            margin-bottom: 0.1rem !important;
          }
          .category-card-desc {
            -webkit-line-clamp: 2 !important;
            font-size: 0.72rem !important;
            line-height: 1.3 !important;
          }
          .category-card-badge {
            font-size: 0.65rem !important;
            padding: 1px 6px !important;
            margin-bottom: 0.25rem !important;
          }
        }
      `}</style>
    </section>
  );
};
