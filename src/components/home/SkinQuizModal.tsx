import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Check,
  ArrowRight,
  Droplets,
  Scale,
  Heart,
  Droplet,
  Sun,
  Clock,
  Target,
  ShieldAlert,
} from 'lucide-react';
import type { SkinType, SkinConcern } from '../../types';

interface SkinQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyRoutine: (skinType: string, concern: string) => void;
}

export const SkinQuizModal: React.FC<SkinQuizModalProps> = ({ isOpen, onClose, onApplyRoutine }) => {
  const [selectedSkin, setSelectedSkin] = useState<SkinType>('ผิวแพ้ง่าย');
  const [selectedConcern, setSelectedConcern] = useState<SkinConcern>('ความชุ่มชื้น');

  if (!isOpen) return null;

  const skinTypes: { type: SkinType; label: string; desc: string; icon: React.ReactNode }[] = [
    {
      type: 'ผิวมัน',
      label: 'ผิวมัน (Oily)',
      desc: 'หน้ามันเยิ้มระหว่างวัน รูขุมขนกว้าง เกิดสิวง่าย',
      icon: <Sparkles size={16} color="#F59E0B" />,
    },
    {
      type: 'ผิวแห้ง',
      label: 'ผิวแห้ง (Dry)',
      desc: 'ผิวตึง ลอกเป็นขุย ขาดน้ำ แต่งหน้าไม่ค่อยติด',
      icon: <Droplets size={16} color="#0284C7" />,
    },
    {
      type: 'ผิวผสม',
      label: 'ผิวผสม (Combination)',
      desc: 'มันเฉพาะบริเวณ T-Zone (หน้าผาก จมูก คาง) แก้มแห้ง',
      icon: <Scale size={16} color="#8B5CF6" />,
    },
    {
      type: 'ผิวแพ้ง่าย',
      label: 'ผิวแพ้ง่าย (Sensitive)',
      desc: 'แสบแดงง่าย คัน ระคายเคืองเมื่อเจอฝุ่นหรือสารเคมี',
      icon: <Heart size={16} color="#EC4899" fill="#FCE7F3" />,
    },
  ];

  const concerns: { concern: SkinConcern; label: string; icon: React.ReactNode }[] = [
    {
      concern: 'สิว',
      label: 'รักษาสิว & รอยสิว',
      icon: <ShieldAlert size={15} color="#EF4444" />,
    },
    {
      concern: 'ความชุ่มชื้น',
      label: 'เติมน้ำ & ซ่อมเกราะผิว',
      icon: <Droplet size={15} color="#0284C7" fill="#E0F2FE" />,
    },
    {
      concern: 'ความกระจ่างใส',
      label: 'ผิวกระจ่างใส & ลดจุดด่างดำ',
      icon: <Sun size={15} color="#F59E0B" />,
    },
    {
      concern: 'ริ้วรอย',
      label: 'ยกกระชับ & ชะลอวัย',
      icon: <Clock size={15} color="#8B5CF6" />,
    },
    {
      concern: 'กระชับรูขุมขน',
      label: 'รูขุมขนเนียนละเอียด',
      icon: <Target size={15} color="#10B981" />,
    },
  ];

  const handleSubmit = () => {
    onApplyRoutine(selectedSkin, selectedConcern);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #FFD1DC 0%, #BFEFFF 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={20} color="#E11D48" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>เช็กสภาพผิว & ค้นหารูทีนที่ใช่</h3>
              <p style={{ fontSize: '0.82rem', color: '#6B7280' }}>ค้นหาสกินแคร์ที่ตอบโจทย์ผิวคุณที่สุดใน 1 นาที</p>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon btn-ghost">
            <X size={20} />
          </button>
        </div>

        {/* Question 1: Skin Type */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.65rem' }}>
            1. ตอนนี้สภาพผิวของคุณเป็นแบบไหนเอ่ย?
          </label>
          <div className="skin-quiz-types-grid">
            {skinTypes.map((item) => {
              const active = selectedSkin === item.type;
              return (
                <div
                  key={item.type}
                  onClick={() => setSelectedSkin(item.type)}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '12px',
                    border: active ? '2px solid #F43F5E' : '1px solid #E5E7EB',
                    background: active ? '#FFF5F8' : '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.88rem', color: active ? '#BE123C' : '#1F2937' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center' }}>{item.icon}</span> {item.label}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '0.2rem', lineHeight: 1.3 }}>
                    {item.desc}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Question 2: Skin Concern */}
        <div style={{ marginBottom: '1.75rem' }}>
          <label style={{ display: 'block', fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.65rem' }}>
            2. อยากเน้นดูแลเรื่องไหนเป็นพิเศษคะ?
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {concerns.map((c) => {
              const active = selectedConcern === c.concern;
              return (
                <button
                  key={c.concern}
                  type="button"
                  onClick={() => setSelectedConcern(c.concern)}
                  className={`filter-pill ${active ? 'active' : ''}`}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center' }}>{c.icon}</span> {c.label}
                  {active && <Check size={14} />}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <button onClick={handleSubmit} className="btn btn-primary" style={{ width: '100%', padding: '0.85rem' }}>
            ดูสกินแคร์ที่เหมาะกับฉันเลย <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
