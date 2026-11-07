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
        padding: '1.75rem',
        borderRadius: '24px',
        marginBottom: '2.5rem',
        background: '#FFFFFF',
        border: '1px solid rgba(222, 83, 119, 0.16)',
        boxShadow: '0 6px 24px rgba(216, 74, 110, 0.05)',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* Category Tabs */}
      <div className="category-filter-bar">
        <button
          onClick={() => onFilterChange({ categoryId: '' })}
          className={`filter-pill category-tab-btn ${filters.categoryId === '' ? 'active' : ''}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            flexShrink: 0,
            whiteSpace: 'nowrap',
          }}
        >
          <Sparkles size={13} color={filters.categoryId === '' ? '#FFFFFF' : '#C73D62'} /> ทั้งหมด (All)
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onFilterChange({ categoryId: cat.id })}
            className={`filter-pill category-tab-btn ${filters.categoryId === cat.id ? 'active' : ''}`}
            style={{
              flexShrink: 0,
              whiteSpace: 'nowrap',
            }}
          >
            {cat.name.split(' (')[0]}
          </button>
        ))}
      </div>

      {/* Beauty Specific Filters: Skin Type & Skin Concern */}
      <div className="skin-filter-row">
        {/* Skin Types */}
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 600, color: '#706064', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.65rem' }}>
            <Droplet size={14} color="#C73D62" /> เหมาะสำหรับสภาพผิว:
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
            {ALL_SKIN_TYPES.map((type) => {
              const active = filters.skinTypes.includes(type);
              return (
                <button
                  key={type}
                  onClick={() => toggleSkinType(type)}
                  style={{
                    padding: '0.4rem 1rem',
                    borderRadius: '9999px',
                    fontSize: '0.8rem',
                    fontWeight: active ? 600 : 500,
                    cursor: 'pointer',
                    border: active ? '1px solid #C73D62' : '1px solid #F0C4CF',
                    background: active ? 'linear-gradient(135deg, #DF5E7E 0%, #C73D62 100%)' : '#FFF8FA',
                    color: active ? '#FFFFFF' : '#706064',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
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
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 600, color: '#706064', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.65rem' }}>
            <Sparkles size={14} color="#C73D62" /> ปัญหาผิวเป้าหมาย:
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
            {ALL_SKIN_CONCERNS.map((concern) => {
              const active = filters.skinConcerns.includes(concern);
              return (
                <button
                  key={concern}
                  onClick={() => toggleSkinConcern(concern)}
                  style={{
                    padding: '0.4rem 1rem',
                    borderRadius: '9999px',
                    fontSize: '0.8rem',
                    fontWeight: active ? 600 : 500,
                    cursor: 'pointer',
                    border: active ? '1px solid #C73D62' : '1px solid #F0C4CF',
                    background: active ? 'linear-gradient(135deg, #DF5E7E 0%, #C73D62 100%)' : '#FFF8FA',
                    color: active ? '#FFFFFF' : '#706064',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {concern}
                  {active && <Check size={11} />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Bar: Price, Sort & Reset */}
      <div className="filter-bottom-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
          {/* Price Range Slider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.82rem' }}>
            <span style={{ color: '#706064', fontWeight: 500 }}>ช่วงราคา:</span>
            <input
              type="range"
              min="200"
              max="1500"
              step="50"
              value={filters.priceRange[1]}
              onChange={(e) => onFilterChange({ priceRange: [0, Number(e.target.value)] })}
              style={{ accentColor: '#DF5E7E', width: '120px' }}
            />
            <span style={{ fontWeight: 600, color: '#C73D62' }}>
              สูงสุด ฿{filters.priceRange[1].toLocaleString()}
            </span>
          </div>

          {/* Rating filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem' }}>
            <span style={{ color: '#706064', fontWeight: 500 }}>คะแนน:</span>
            <select
              value={filters.minRating}
              onChange={(e) => onFilterChange({ minRating: Number(e.target.value) })}
              className="form-select"
              style={{ padding: '0.35rem 1rem', fontSize: '0.8rem', width: 'auto', borderRadius: '9999px', border: '1px solid #F0C4CF' }}
            >
              <option value="0">ทั้งหมด</option>
              <option value="4.5">4.5 ดาวขึ้นไป</option>
              <option value="4.8">4.8 ดาวขึ้นไป</option>
            </select>
          </div>
        </div>

        {/* Sort & Results Count */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.82rem', color: '#706064' }}>
            ค้นพบ <strong style={{ color: '#C73D62' }}>{totalResults}</strong> รายการ
          </span>

          <select
            value={filters.sortBy}
            onChange={(e) => onFilterChange({ sortBy: e.target.value as FilterState['sortBy'] })}
            className="form-select"
            style={{ padding: '0.35rem 1rem', fontSize: '0.82rem', width: 'auto', borderRadius: '9999px', border: '1px solid #F0C4CF' }}
          >
            <option value="featured">คัดสรรยอดนิยม (Featured)</option>
            <option value="price_asc">ราคา: ต่ำ &rarr; สูง</option>
            <option value="price_desc">ราคา: สูง &rarr; ต่ำ</option>
            <option value="rating">คะแนนรีวิวสูงสุด</option>
          </select>

          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="btn btn-ghost btn-sm"
              style={{ color: '#C73D62', gap: '4px', fontSize: '0.8rem', fontWeight: 600 }}
            >
              <RotateCcw size={12} /> รีเซ็ตตัวกรอง
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
