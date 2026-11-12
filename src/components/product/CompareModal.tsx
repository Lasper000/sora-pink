import React from 'react';
import type { Product } from '../../types';
import { X, Scale, Star, ShoppingBag, Trash2, Sparkles, Droplet } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { showToast } from '../common/Toast';
import { handleImageError, DEFAULT_FALLBACK_IMAGE } from '../../utils/imageFallback';

interface CompareModalProps {
  compareList: Product[];
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onRemoveProduct: (productId: string) => void;
  onClearAll: () => void;
  onSelectProduct: (product: Product) => void;
}

export const CompareModal: React.FC<CompareModalProps> = ({
  compareList,
  isOpen,
  onOpen,
  onClose,
  onRemoveProduct,
  onClearAll,
  onSelectProduct,
}) => {
  const { addToCart } = useCart();

  if (compareList.length === 0) return null;

  return (
    <>
      {/* Floating Compare Pill Bar */}
      {!isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '18px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 990,
            background: 'rgba(255, 255, 255, 0.96)',
            backdropFilter: 'blur(14px)',
            border: '1.5px solid #FAD1DC',
            borderRadius: '9999px',
            padding: '0.5rem 0.9rem',
            boxShadow: '0 14px 36px rgba(223, 94, 126, 0.24)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            maxWidth: '94vw',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            {compareList.map((item) => (
              <div
                key={item.id}
                style={{
                  position: 'relative',
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: '2px solid #DF5E7E',
                  flexShrink: 0,
                }}
                title={item.name}
              >
                <img
                  src={item.images?.[0] || DEFAULT_FALLBACK_IMAGE}
                  alt={item.name}
                  onError={handleImageError}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={onOpen}
            className="btn btn-primary btn-sm"
            style={{
              borderRadius: '9999px',
              padding: '0.42rem 0.95rem',
              fontSize: '0.78rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              whiteSpace: 'nowrap',
            }}
          >
            <Scale size={14} /> เปรียบเทียบสินค้า ({compareList.length}/3)
          </button>

          <button
            type="button"
            onClick={onClearAll}
            style={{
              background: 'none',
              border: 'none',
              color: '#8F8881',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
            }}
            title="ล้างรายการเปรียบเทียบ"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Full Side-by-Side Comparison Modal */}
      {isOpen && (
        <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1150 }}>
          <div
            className="modal-content modal-content-lg"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '960px',
              borderRadius: '26px',
              padding: '1.75rem',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.25rem',
                borderBottom: '1px solid #FCE7F3',
                paddingBottom: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #DF5E7E 0%, #C73D62 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                  }}
                >
                  <Scale size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#2C2224', margin: 0 }}>
                    เปรียบเทียบผลิตภัณฑ์สกินแคร์ ({compareList.length} รายการ)
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: '#706064', margin: '2px 0 0' }}>
                    เปรียบเทียบส่วนผสม สภาพผิวที่เหมาะสม และความคุ้มค่าแบบเคียงข้างกัน
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={onClearAll}
                  className="btn btn-ghost btn-sm"
                  style={{ color: '#C73D62', fontSize: '0.78rem', borderRadius: '9999px' }}
                >
                  <Trash2 size={14} /> ล้างทั้งหมด
                </button>
                <button onClick={onClose} className="btn-icon btn-ghost">
                  <X size={20} />
                </button>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${compareList.length}, minmax(230px, 1fr))`,
                  gap: '1rem',
                }}
              >
                {compareList.map((prod) => {
                  const unitPrice = prod.discount_price ?? prod.price;
                  const isOutOfStock = prod.stock_quantity <= 0;
                  return (
                    <div
                      key={prod.id}
                      style={{
                        background: '#FFF9FB',
                        border: '1px solid #FAD1DC',
                        borderRadius: '20px',
                        padding: '1.15rem',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        position: 'relative',
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => onRemoveProduct(prod.id)}
                        style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          background: '#FFFFFF',
                          border: '1px solid #FAD1DC',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#8F8881',
                        }}
                        title="นำออกจากตารางเปรียบเทียบ"
                      >
                        <X size={14} />
                      </button>

                      <div>
                        <div
                          onClick={() => {
                            onClose();
                            onSelectProduct(prod);
                          }}
                          style={{
                            width: '100%',
                            height: '160px',
                            borderRadius: '14px',
                            overflow: 'hidden',
                            background: '#FFFFFF',
                            marginBottom: '0.85rem',
                            cursor: 'pointer',
                          }}
                        >
                          <img
                            src={prod.images?.[0] || DEFAULT_FALLBACK_IMAGE}
                            alt={prod.name}
                            onError={handleImageError}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>

                        <h4
                          onClick={() => {
                            onClose();
                            onSelectProduct(prod);
                          }}
                          style={{
                            fontSize: '0.92rem',
                            fontWeight: 700,
                            color: '#2C2224',
                            marginBottom: '0.4rem',
                            cursor: 'pointer',
                            minHeight: '2.5rem',
                          }}
                        >
                          {prod.name}
                        </h4>

                        {/* Price & Rating */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', paddingBottom: '0.65rem', borderBottom: '1px dashed #FAD1DC' }}>
                          <div>
                            <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#C73D62' }}>
                              ฿{unitPrice.toLocaleString()}
                            </span>
                            {prod.discount_price && (
                              <span style={{ fontSize: '0.75rem', color: '#9CA3AF', textDecoration: 'line-through', marginLeft: '6px' }}>
                                ฿{prod.price.toLocaleString()}
                              </span>
                            )}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.8rem', fontWeight: 700, color: '#B45309' }}>
                            <Star size={13} fill="#F59E0B" color="#F59E0B" />
                            {prod.rating?.toFixed(1) || '5.0'}
                          </div>
                        </div>

                        {/* Skin Types */}
                        <div style={{ marginBottom: '0.65rem' }}>
                          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#8F8881', marginBottom: '4px' }}>
                            สภาพผิวที่แนะนำ:
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            {(prod.skin_types || ['ทุกสภาพผิว']).map((st) => (
                              <span
                                key={st}
                                style={{
                                  fontSize: '0.7rem',
                                  padding: '2px 8px',
                                  borderRadius: '9999px',
                                  background: '#FFFFFF',
                                  border: '1px solid #FAD1DC',
                                  color: '#C73D62',
                                  fontWeight: 600,
                                }}
                              >
                                {st}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Skin Concerns */}
                        <div style={{ marginBottom: '0.65rem' }}>
                          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#8F8881', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Sparkles size={12} color="#DF5E7E" /> ช่วยดูแลปัญหาผิว:
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#2C2224', fontWeight: 600 }}>
                            {(prod.skin_concerns || []).join(', ') || 'ฟื้นบำรุงผิวครบวงจร'}
                          </div>
                        </div>

                        {/* Active Ingredients */}
                        <div style={{ marginBottom: '0.85rem' }}>
                          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#8F8881', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Droplet size={12} color="#0284C7" /> ส่วนผสมหลัก (Key Ingredients):
                          </div>
                          <div
                            style={{
                              fontSize: '0.76rem',
                              color: '#4B5563',
                              background: '#FFFFFF',
                              padding: '0.5rem 0.65rem',
                              borderRadius: '10px',
                              border: '1px solid #FCE7F3',
                              lineHeight: 1.45,
                            }}
                          >
                            {prod.ingredients || 'สารสกัดอ่อนโยนจากธรรมชาติ'}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={isOutOfStock}
                        onClick={() => {
                          const res = addToCart(prod, 1);
                          showToast(res.message, res.success ? 'success' : 'error');
                        }}
                        className="btn btn-primary btn-sm"
                        style={{
                          width: '100%',
                          borderRadius: '9999px',
                          padding: '0.55rem',
                          fontSize: '0.8rem',
                        }}
                      >
                        <ShoppingBag size={14} /> {isOutOfStock ? 'สินค้าหมดชั่วคราว' : 'เพิ่มลงตะกร้า'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
