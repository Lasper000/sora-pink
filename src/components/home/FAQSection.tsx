import React, { useState } from 'react';
import { HelpCircle, ChevronDown, Sparkles, MessageCircle } from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  badge?: string;
}

interface FAQSectionProps {
  onOpenSkinQuiz?: () => void;
}

export const FAQSection: React.FC<FAQSectionProps> = ({ onOpenSkinQuiz }) => {
  const [openId, setOpenId] = useState<string>('faq-1');

  const faqs: FAQItem[] = [
    {
      id: 'faq-1',
      question: 'ผิวแพ้ง่าย หรือเป็นสิวระคายเคืองง่าย ใช้ผลิตภัณฑ์ของ Sora Pink ได้ไหม?',
      answer: 'ใช้ได้อย่างสบายใจ 100% ค่ะ ผลิตภัณฑ์ทุกชิ้นของ Sora Pink คิดค้นสูตรแบบ Clean & Gentle ผ่านการทดสอบการระคายเคืองโดยแพทย์ผิวหนัง (Dermatologist Tested) ปราศจากสารก่อการระคายเคือง 8 ชนิด: แอลกอฮอล์, พาราเบน, มิเนอรัลออยล์, สเตียรอยด์, สีสังเคราะห์, สารฟอกขาว, ซิลิโคนอุดตัน และสารกันเสียอันตราย เหมาะกับผิวแพ้ง่ายเป็นพิเศษค่ะ',
      badge: 'สูตรอ่อนโยน 🌿',
    },
    {
      id: 'faq-2',
      question: 'ระยะเวลาจัดส่งกี่วัน และคิดค่าจัดส่งอย่างไร?',
      answer: 'เราจัดส่งพัสดุด่วนทุกวันผ่าน Flash Express และ Kerry Express: พื้นที่กรุงเทพฯ และปริมณฑลได้รับสินค้าภายใน 1-2 วันทำการ, ต่างจังหวัด 2-3 วันทำการ • โปรโมชั่นพิเศษ: ช้อปครบ ฿500 จัดส่งด่วนฟรีทั่วประเทศ! (หากยอดไม่ถึง ฿500 ค่าจัดส่งมาตรฐานเพียง ฿50 ค่ะ)',
      badge: 'ส่งฟรี ฿500+ 🚚',
    },
    {
      id: 'faq-3',
      question: 'มีบริการเก็บเงินปลายทาง (COD) หรือชำระเงินช่องทางใดได้บ้าง?',
      answer: 'มีบริการเก็บเงินปลายทาง (COD) จ่ายเงินกับเจ้าหน้าที่ขนส่งเมื่อได้รับของได้เลยค่ะ นอกจากนี้ยังรองรับการสแกนจ่ายผ่าน QR PromptPay ได้ทุกธนาคาร, บัตรเครดิต/เดบิต Visa, Mastercard และ TrueMoney Wallet สะดวกและปลอดภัยด้วยระบบความปลอดภัยระดับสากลค่ะ',
      badge: 'มีเก็บเงินปลายทาง 💳',
    },
    {
      id: 'faq-4',
      question: 'สินค้ามีอายุการใช้งานนานเท่าไหร่ และควรเก็บรักษาอย่างไร?',
      answer: 'สินค้าที่ยังไม่เปิดใช้งานมีอายุ 3 ปีนับจากวันผลิต (มีระบุวันผลิตและหมดอายุชัดเจนใต้กล่องสินค้าทุกชิ้น) หลังจากเปิดใช้งานแล้วแนะนำให้ใช้ให้หมดภายใน 12 เดือน เพื่อประสิทธิภาพของสารสกัดที่ดีที่สุด แนะนำเก็บในอุณหภูมิห้อง หลีกเลี่ยงแสงแดดและความร้อนสูงค่ะ',
    },
    {
      id: 'faq-5',
      question: 'หากได้รับสินค้าชำรุด หรือเกิดอาการแพ้ มีนโยบายรับประกันอย่างไร?',
      answer: 'Sora Pink มีนโยบายรับประกันความพึงพอใจภายใน 7 วันทำการค่ะ หากพบสินค้าแตกหัก เสียหายจากการขนส่ง ทางเราเปลี่ยนชิ้นใหม่ให้ทันทีโดยไม่มีค่าใช้จ่าย หรือกรณีเกิดอาการแพ้ (มีใบรับรองแพทย์) ทางแบรนด์ยินดีคืนเงินเต็มจำนวน 100% ค่ะ',
      badge: 'รับประกัน 7 วัน ✨',
    },
    {
      id: 'faq-6',
      question: 'ไม่แน่ใจว่าสภาพผิวของตัวเองควรใช้รูทีนแบบไหน มีตัวช่วยแนะนำไหม?',
      answer: 'คุณสามารถกดทำแบบทดสอบวิเคราะห์ผิว (Skin Routine Quiz) บนหน้าเว็บของเราเพื่อรับการแนะนำรูทีนและสารสกัดที่เหมาะกับปัญหาผิวได้ทันทีใน 1 นาที หรือทักข้อความปรึกษาทีม Beauty Advisor ของเราได้ตลอดเวลาค่ะ',
    },
  ];

  const toggleFAQ = (id: string) => {
    setOpenId((prev) => (prev === id ? '' : id));
  };

  return (
    <section id="faq-section" style={{ padding: '3.5rem 0 4.5rem 0', position: 'relative' }}>
      <div className="container" style={{ maxWidth: '860px' }}>
        {/* Section Header */}
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
            <HelpCircle size={16} /> FREQUENTLY ASKED QUESTIONS
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            คำถามที่พบบ่อยเกี่ยวกับ <span style={{ color: '#E11D48' }}>Sora Pink</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: '0 auto' }}>
            รวมทุกข้อสงสัยเรื่องความปลอดภัย การใช้งาน การจัดส่ง และการรับประกันสินค้า
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {faqs.map((faq) => {
            const isOpen = openId === faq.id;

            return (
              <div
                key={faq.id}
                className="faq-accordion-item glass-card"
                style={{
                  borderRadius: '18px',
                  border: isOpen ? '1.5px solid #FF8DA8' : '1px solid rgba(255, 209, 220, 0.6)',
                  overflow: 'hidden',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: isOpen ? '0 10px 25px rgba(255, 141, 168, 0.15)' : '0 2px 8px rgba(0, 0, 0, 0.02)',
                }}
              >
                {/* Question Row */}
                <button
                  onClick={() => toggleFAQ(faq.id)}
                  style={{
                    width: '100%',
                    padding: '1.25rem 1.4rem',
                    background: 'transparent',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontSize: '1rem',
                        fontWeight: 700,
                        color: isOpen ? '#E11D48' : 'var(--text-primary)',
                        lineHeight: 1.4,
                      }}
                    >
                      {faq.question}
                    </span>
                    {faq.badge && (
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '0.15rem 0.55rem',
                          borderRadius: '9999px',
                          background: '#FFF1F2',
                          color: '#E11D48',
                          border: '1px solid #FFE4E6',
                        }}
                      >
                        {faq.badge}
                      </span>
                    )}
                  </div>

                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: isOpen ? '#E11D48' : 'rgba(255, 209, 220, 0.4)',
                      color: isOpen ? '#FFFFFF' : '#4B5563',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.3s ease, background 0.2s ease',
                      flexShrink: 0,
                    }}
                  >
                    <ChevronDown size={18} />
                  </div>
                </button>

                {/* Answer Content */}
                {isOpen && (
                  <div
                    style={{
                      padding: '0 1.4rem 1.35rem 1.4rem',
                      fontSize: '0.9rem',
                      lineHeight: 1.65,
                      color: 'var(--text-secondary)',
                      borderTop: '1px dashed rgba(255, 209, 220, 0.5)',
                      paddingTop: '1rem',
                    }}
                  >
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Still Have Questions Contact Box */}
        <div
          className="faq-contact-card glass-panel"
          style={{
            marginTop: '2.5rem',
            padding: '1.5rem',
            borderRadius: '20px',
            textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(255, 240, 245, 0.9) 0%, rgba(240, 249, 255, 0.9) 100%)',
            border: '1.5px solid rgba(255, 209, 220, 0.8)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#BE123C', fontWeight: 700, fontSize: '1rem' }}>
            <Sparkles size={18} color="#E11D48" />
            <span>ยังมีข้อสงสัยหรือไม่แน่ใจว่าเหมาะกับผิวตัวเองไหม?</span>
          </div>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', maxWidth: '520px', margin: 0 }}>
            ทดลองทำแบบทดสอบวิเคราะห์ผิวเพื่อเลือกสูตรที่ใช่ หรือปรึกษาผู้เชี่ยวชาญด้านความงามของ Sora Pink ได้ฟรี
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '0.25rem' }}>
            {onOpenSkinQuiz && (
              <button
                onClick={onOpenSkinQuiz}
                className="btn btn-primary btn-sm"
                style={{ padding: '0.5rem 1.15rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Sparkles size={14} /> ทำแบบทดสอบวิเคราะห์ผิว (1 นาที)
              </button>
            )}
            <a
              href="mailto:contact@sorapink.beauty"
              className="btn btn-outline btn-sm"
              style={{ padding: '0.5rem 1.15rem', display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}
            >
              <MessageCircle size={14} /> แชทกับแอดมิน / สอบถามเพิ่มเติม
            </a>
          </div>
        </div>
      </div>

      <style>{`
        [data-theme="dark"] .faq-accordion-item {
          background: rgba(22, 27, 40, 0.85) !important;
          border-color: rgba(255, 255, 255, 0.1) !important;
        }
        [data-theme="dark"] .faq-contact-card {
          background: rgba(26, 32, 46, 0.95) !important;
          border-color: rgba(255, 180, 210, 0.25) !important;
        }
      `}</style>
    </section>
  );
};
