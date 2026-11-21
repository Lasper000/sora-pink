import React from 'react';
import { X, ShieldCheck, Truck, FileText } from 'lucide-react';

export type PolicyTopic = 'privacy' | 'shipping' | 'terms';

interface PolicyModalProps {
  topic: PolicyTopic | null;
  onClose: () => void;
  onSwitchTopic: (topic: PolicyTopic) => void;
}

export const PolicyModal: React.FC<PolicyModalProps> = ({ topic, onClose, onSwitchTopic }) => {
  if (!topic) return null;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1200 }}>
      <div
        className="modal-content policy-modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '640px', padding: '1.75rem', borderRadius: '24px' }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1rem',
            paddingBottom: '0.85rem',
            borderBottom: '1px solid rgba(222, 83, 119, 0.16)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            {topic === 'privacy' ? (
              <ShieldCheck size={22} color="#C73D62" />
            ) : topic === 'shipping' ? (
              <Truck size={22} color="#C73D62" />
            ) : (
              <FileText size={22} color="#C73D62" />
            )}
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {topic === 'privacy'
                ? 'นโยบายความเป็นส่วนตัว (PDPA)'
                : topic === 'shipping'
                ? 'เงื่อนไขการจัดส่งและเปลี่ยนคืนสินค้า'
                : 'ข้อกำหนดและเงื่อนไขการใช้งาน'}
            </h3>
          </div>
          <button onClick={onClose} className="btn-icon btn-ghost" aria-label="ปิดหน้าต่าง">
            <X size={20} />
          </button>
        </div>

        {/* Topic Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          <button
            type="button"
            onClick={() => onSwitchTopic('privacy')}
            className={`btn btn-sm ${topic === 'privacy' ? 'btn-primary' : 'btn-outline'}`}
            style={{ borderRadius: '9999px' }}
          >
            นโยบาย PDPA
          </button>
          <button
            type="button"
            onClick={() => onSwitchTopic('shipping')}
            className={`btn btn-sm ${topic === 'shipping' ? 'btn-primary' : 'btn-outline'}`}
            style={{ borderRadius: '9999px' }}
          >
            การจัดส่ง & เปลี่ยนคืน
          </button>
          <button
            type="button"
            onClick={() => onSwitchTopic('terms')}
            className={`btn btn-sm ${topic === 'terms' ? 'btn-primary' : 'btn-outline'}`}
            style={{ borderRadius: '9999px' }}
          >
            เงื่อนไขการใช้งาน
          </button>
        </div>

        <div style={{ fontSize: '0.88rem', lineHeight: 1.75, color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {topic === 'privacy' && (
            <>
              <p style={{ margin: 0 }}>
                <strong>SORA PINK</strong> ให้ความสำคัญกับการคุ้มครองข้อมูลส่วนบุคคลของลูกค้าตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA)
              </p>
              <p style={{ margin: 0 }}>
                <strong>1. ข้อมูลที่เราจัดเก็บ:</strong> ชื่อ-นามสกุล, อีเมล, เบอร์โทรศัพท์, ที่อยู่จัดส่ง และหลักฐานการโอนเงิน เพื่อใช้ดำเนินการจัดส่งสินค้า ยืนยันการชำระเงิน และแจ้งสถานะพัสดุเท่านั้น
              </p>
              <p style={{ margin: 0 }}>
                <strong>2. การรักษาความปลอดภัย:</strong> ข้อมูลคำสั่งซื้อและสลิปโอนเงินถูกจำกัดสิทธิ์ด้วย Row-Level Security (RLS) และ Signed Access URL ให้เข้าถึงได้เฉพาะเจ้าของบัญชีและผู้ดูแลระบบเท่านั้น ไม่มีการเผยแพร่หรือจำหน่ายข้อมูลให้บุคคลภายนอก
              </p>
              <p style={{ margin: 0 }}>
                <strong>3. สิทธิของเจ้าของข้อมูล:</strong> คุณสามารถแก้ไขข้อมูลส่วนตัวได้ในหน้าโปรไฟล์ หรือแจ้งขอลบบัญชีและข้อมูลส่วนบุคคลได้ทางอีเมล <a href="mailto:concierge@sorapink.th" style={{ color: '#C73D62' }}>concierge@sorapink.th</a>
              </p>
            </>
          )}

          {topic === 'shipping' && (
            <>
              <p style={{ margin: 0 }}>
                <strong>1. การจัดส่งสินค้า:</strong> ตัดรอบจัดส่งทุกวันเวลา 14:00 น. ผ่านขนส่งด่วน Flash Express / Kerry Express ระยะเวลาถึงปลายทาง 1-2 วันทำการในกรุงเทพฯ และ 2-3 วันทำการในต่างจังหวัด
              </p>
              <p style={{ margin: 0 }}>
                <strong>2. สิทธิ์ส่งฟรี:</strong> จัดส่งฟรีทุกคำสั่งซื้อเมื่อมียอดรวมสินค้าตั้งแต่ ฿500 ขึ้นไป (หากต่ำกว่า ฿500 ค่าจัดส่งเหมาจ่าย ฿50)
              </p>
              <p style={{ margin: 0 }}>
                <strong>3. นโยบายการเปลี่ยนและคืนสินค้า (7 วัน):</strong> หากได้รับสินค้าชำรุด ผิดรุ่น ผิดเฉดสี หรือไม่ตรงตามคำสั่งซื้อ กรุณาถ่ายวิดีโอขณะเปิดกล่องพัสดุและแจ้งทีมงานภายใน 7 วันหลังได้รับสินค้า ร้านยินดีเปลี่ยนสินค้าชิ้นใหม่หรือคืนเงินเต็มจำนวนโดยไม่มีค่าใช้จ่ายเพิ่ม
              </p>
              <p style={{ margin: 0 }}>
                <strong>4. การยกเลิกคำสั่งซื้อ:</strong> ลูกค้าสามารถกดยกเลิกคำสั่งซื้อได้ด้วยตนเองในหน้าประวัติการสั่งซื้อขณะที่สถานะยังเป็น “รอตรวจสอบและยืนยัน”
              </p>
            </>
          )}

          {topic === 'terms' && (
            <>
              <p style={{ margin: 0 }}>
                <strong>1. การยืนยันคำสั่งซื้อ:</strong> คำสั่งซื้อทุกช่องทาง (PromptPay / บัตร / COD) จะเข้าสู่กระบวนการตรวจสอบยอดเงินและสต็อกโดยแอดมินก่อนดำเนินการจัดเตรียมสินค้า
              </p>
              <p style={{ margin: 0 }}>
                <strong>2. การใช้โค้ดส่วนลดและโปรโมชัน:</strong> โค้ดส่วนลดแต่ละรหัสมีเงื่อนไขยอดซื้อขั้นต่ำ วันหมดอายุ และจำกัดจำนวนสิทธิ์ตามที่ระบุในศูนย์รวมคูปอง ขอสงวนสิทธิ์ 1 โค้ดต่อ 1 คำสั่งซื้อ
              </p>
              <p style={{ margin: 0 }}>
                <strong>3. การรับประกันสินค้าแท้ 100%:</strong> สินค้าทุกชิ้นของ SORA PINK ผ่านมาตรฐาน อย. และ Dermatologist Tested หากพบอาการแพ้สามารถติดต่อผู้เชี่ยวชาญผ่านช่องทาง Beauty Concierge ได้ทุกวันเวลา 09:00 - 20:00 น.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
