import React from 'react';
import type { Category, FilterState, SkinType, SkinConcern } from '../../types';
import { RotateCcw, Check, Droplet, Sparkles } from 'lucide-react';

interface ProductFilterProps {
  categories: Category[];
  filters: FilterState;
  onFilterChange: (updated: Partial<FilterState>) => void;
  onResetFilters: () => void;
  totalResults: number;
}

const ALL_SKIN_TYPES: SkinType[] = ['ผิวมัน', 'ผิวแห้ง', 'ผิวผสม', 'ผิวแพ้ง่าย', 'ทุกสภาพผิว'];
const ALL_SKIN_CONCERNS: SkinConcern[] = ['สิว', 'ความกระจ่างใส', 'ริ้วรอย', 'ความชุ่มชื้น', 'กระชับรูขุมขน'];

export const ProductFilter: React.FC<ProductFilterProps> = ({
  categories,
  filters,
  onFilterChange,
  onResetFilters,
  totalResults,
}) => {
  const toggleSkinType = (st: string) => {
    const exists = filters.skinTypes.includes(st);
    const updated = exists
      ? filters.skinTypes.filter((t) => t !== st)
      : [...filters.skinTypes, st];
    onFilterChange({ skinTypes: updated });
  };

  const toggleSkinConcern = (sc: string) => {
    const exists = filters.skinConcerns.includes(sc);
    const updated = exists
      ? filters.skinConcerns.filter((c) => c !== sc)
      : [...filters.skinConcerns, sc];
    onFilterChange({ skinConcerns: updated });
  };

  const hasActiveFilters =
    filters.categoryId ||
    filters.skinTypes.length > 0 ||
    filters.skinConcerns.length > 0 ||
    filters.minRating > 0 ||
    filters.priceRange[1] < 1500 ||
    filters.searchQuery !== '';

  return (
    <div
      className="glass-card product-filter-card"
      style={{
        padding: '1.5rem',
        borderRadius: '24px',
        marginBottom: '2rem',
        border: '1.5px solid rgba(255, 209, 220, 0.6)',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* Category Tabs */}
      <div className="category-filter-bar">
        <button
          onClick={() => onFilterChange({ categoryId: '' })}
          className={`filter-pill ${filters.categoryId === '' ? 'active' : ''}`}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Sparkles size={14} color="#F43F5E" /> สินค้าทั้งหมด
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onFilterChange({ categoryId: cat.id })}
            className={`filter-pill ${filters.categoryId === cat.id ? 'active' : ''}`}
          >
            {cat.name.split(' (')[0]}
          </button>
        ))}
      </div>

      {/* Beauty Specific Filters: Skin Type & Skin Concern */}
      <div className="skin-filter-row">
        {/* Skin Types */}
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.88rem', fontWeight: 600, color: '#374151', marginBottom: '0.6rem' }}>
            <Droplet size={15} color="#0284C7" fill="#E0F2FE" /> เหมาะสำหรับสภาพผิว:
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {ALL_SKIN_TYPES.map((type) => {
              const active = filters.skinTypes.includes(type);
              return (
                <button
                  key={type}
                  onClick={() => toggleSkinType(type)}
                  style={{
                    padding: '0.35rem 0.8rem',
                    borderRadius: '9999px',
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    border: active ? '1.5px solid #0284C7' : '1px solid #E5E7EB',
                    background: active ? '#E0F4FF' : '#FFFFFF',
                    color: active ? '#0369A1' : '#4B5563',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {type}
                  {active && <Check size={12} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Skin Concerns */}
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.88rem', fontWeight: 600, color: '#374151', marginBottom: '0.6rem' }}>
            <Sparkles size={15} color="#F43F5E" /> ปัญหาผิวที่ต้องการดูแล:
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {ALL_SKIN_CONCERNS.map((concern) => {
              const active = filters.skinConcerns.includes(concern);
              return (
                <button
                  key={concern}
                  onClick={() => toggleSkinConcern(concern)}
                  style={{
                    padding: '0.35rem 0.8rem',
                    borderRadius: '9999px',
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    border: active ? '1.5px solid #F43F5E' : '1px solid #E5E7EB',
                    background: active ? '#FFE8EF' : '#FFFFFF',
                    color: active ? '#BE123C' : '#4B5563',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {concern}
                  {active && <Check size={12} />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Bar: Price, Sort & Reset */}
      <div className="filter-bottom-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {/* Price Range Slider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem' }}>
            <span style={{ color: '#4B5563' }}>งบประมาณ:</span>
            <input
              type="range"
              min="200"
              max="1500"
              step="50"
              value={filters.priceRange[1]}
              onChange={(e) => onFilterChange({ priceRange: [0, Number(e.target.value)] })}
              style={{ accentColor: '#F43F5E', width: '120px' }}
            />
            <span style={{ fontWeight: 600, color: '#E11D48' }}>
              สูงสุด ฿{filters.priceRange[1].toLocaleString()}
            </span>
          </div>

          {/* Rating filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
            <span style={{ color: '#4B5563' }}>คะแนน:</span>
            <select
              value={filters.minRating}
              onChange={(e) => onFilterChange({ minRating: Number(e.target.value) })}
              className="form-select"
              style={{ padding: '0.3rem 0.75rem', fontSize: '0.82rem', width: 'auto', borderRadius: '8px' }}
            >
              <option value="0">ทั้งหมด</option>
              <option value="4.5">4.5 ดาวขึ้นไป</option>
              <option value="4.8">4.8 ดาวขึ้นไป</option>
            </select>
          </div>
        </div>

        {/* Sort & Results Count */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.85rem', color: '#6B7280' }}>
            พบ <strong>{totalResults}</strong> รายการ
          </span>

          <select
            value={filters.sortBy}
            onChange={(e) => onFilterChange({ sortBy: e.target.value as FilterState['sortBy'] })}
            className="form-select"
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem', width: 'auto', borderRadius: '9999px' }}
          >
            <option value="featured">แนะนำยอดนิยม</option>
            <option value="price_asc">ราคา: ต่ำ &rarr; สูง</option>
            <option value="price_desc">ราคา: สูง &rarr; ต่ำ</option>
            <option value="rating">คะแนนรีวิวสูงสุด</option>
          </select>

          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="btn btn-ghost btn-sm"
              style={{ color: '#E11D48', gap: '4px' }}
            >
              <RotateCcw size={13} /> ล้างตัวกรอง
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
