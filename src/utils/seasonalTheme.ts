// ============================================================================
// SORA PINK - AUTOMATED SEASONAL THEME ENGINE
// ============================================================================
// ระบบตรวจจับและเปิดใช้ธีมตามเทศกาลอัตโนมัติ:
// - แสดงผลอัตโนมัติก่อนวันเทศกาล 7 วัน (Festival Date - 7 Days)
// - ใช้งานตลอดช่วงเทศกาล
// - กลับสู่ธีมปกติโดยอัตโนมัติหลังจากผ่านวันเทศกาลไปแล้ว 7 วัน (Festival Date + 7 Days)
// ============================================================================

export interface FestivalEvent {
  id: string;
  name: string;
  emoji: string;
  // ช่วงวันที่หลักของเทศกาล (ปีปัจจุบัน)
  startMonth: number; // 1 - 12
  startDay: number;   // 1 - 31
  endMonth: number;   // 1 - 12
  endDay: number;     // 1 - 31
  daysBefore: number; // แสดงก่อนวันเทศกาล (ค่ามาตรฐาน: 7 วัน)
  daysAfter: number;  // ใช้งานต่อหลังจบเทศกาล (ค่ามาตรฐาน: 7 วัน)
  bodyClass: string;
  announcementText: string;
  promoCode?: string;
  promoDiscountText?: string;
}

export const FESTIVAL_CALENDAR: FestivalEvent[] = [
  {
    id: 'halloween',
    name: 'เทศกาลฮาโลวีน (Halloween Spooky Chic)',
    emoji: '🎃',
    // เทศกาลฮาโลวีน: วันที่ 26 - 31 ตุลาคม (เริ่มแสดงก่อน 7 วัน คือ 19 ตุลาคม จนถึงหลังเทศกาล 7 วัน คือ 7 พฤศจิกายน)
    startMonth: 10,
    startDay: 26,
    endMonth: 10,
    endDay: 31,
    daysBefore: 7,
    daysAfter: 7,
    bodyClass: 'spooky-theme',
    announcementText: 'HALLOWEEN GLOW: โค้ดลับ Trick or Treat หรือกรอก SPOOKY31 ลดทันที 31%',
    promoCode: 'SPOOKY31',
    promoDiscountText: 'ลด 31%',
  },
  {
    id: 'christmas',
    name: 'เทศกาลคริสต์มาสและปีใหม่ (Christmas & New Year Sparkle)',
    emoji: '🎄',
    // เทศกาลคริสต์มาสและปีใหม่: วันที่ 25 ธันวาคม - 1 มกราคม (เริ่ม 18 ธ.ค. ถึง 8 ม.ค.)
    startMonth: 12,
    startDay: 25,
    endMonth: 1,
    endDay: 1,
    daysBefore: 7,
    daysAfter: 7,
    bodyClass: 'christmas-theme',
    announcementText: 'MERRY CHRISTMAS & NEW YEAR: แจกของขวัญกล่องสุ่มคริสต์มาส ลดสูงสุด 30%',
    promoCode: 'XMAS30',
    promoDiscountText: 'ลด 30%',
  },
  {
    id: 'valentines',
    name: 'เทศกาลวาเลนไทน์ (Sweet Valentine Pink Love)',
    emoji: '💖',
    // วันวาเลนไทน์: วันที่ 14 กุมภาพันธ์ (เริ่ม 7 ก.พ. ถึง 21 ก.พ.)
    startMonth: 2,
    startDay: 14,
    endMonth: 2,
    endDay: 14,
    daysBefore: 7,
    daysAfter: 7,
    bodyClass: 'valentines-theme',
    announcementText: 'SWEET VALENTINE: เซ็ตของขวัญวาเลนไทน์คู่รัก ลด 25% ด้วยโค้ด LOVE25',
    promoCode: 'LOVE25',
    promoDiscountText: 'ลด 25%',
  },
  {
    id: 'songkran',
    name: 'เทศกาลสงกรานต์ (Songkran Water Glow Splash)',
    emoji: '💦',
    // วันสงกรานต์: วันที่ 13 - 15 เมษายน (เริ่ม 6 เม.ย. ถึง 22 เม.ย.)
    startMonth: 4,
    startDay: 13,
    endMonth: 4,
    endDay: 15,
    daysBefore: 7,
    daysAfter: 7,
    bodyClass: 'songkran-theme',
    announcementText: 'SONGKRAN FESTIVAL: สกินแคร์กันน้ำ SPF50+ ซื้อ 1 แถม 1 ต้อนรับสงกรานต์',
    promoCode: 'SONGKRAN',
    promoDiscountText: 'ส่งฟรี + แถมกันแดด',
  },
];

/**
 * ตรวจสอบว่า ณ วันเวลาปัจจุบัน มีธีมเทศกาลใดที่กำลัง Active ตามเงื่อนไข 7 วันก่อน-หลัง หรือไม่
 */
export const getActiveSeasonalFestival = (targetDate: Date = new Date()): FestivalEvent | null => {
  const currentYear = targetDate.getFullYear();
  const currentTimestamp = targetDate.getTime();

  for (const festival of FESTIVAL_CALENDAR) {
    // กำหนดวันเริ่มต้นและสิ้นสุดของเทศกาล
    let startYear = currentYear;
    let endYear = currentYear;

    // กรณีเทศกาลข้ามปี เช่น คริสต์มาส (ธ.ค.) ไป ปีใหม่ (ม.ค.)
    if (festival.endMonth < festival.startMonth) {
      if (targetDate.getMonth() + 1 <= festival.endMonth) {
        startYear = currentYear - 1;
      } else {
        endYear = currentYear + 1;
      }
    }

    const festivalStart = new Date(startYear, festival.startMonth - 1, festival.startDay, 0, 0, 0);
    const festivalEnd = new Date(endYear, festival.endMonth - 1, festival.endDay, 23, 59, 59);

    // คำนวณช่วงเวลาเริ่มแสดงผล (ก่อน 7 วัน) และสิ้นสุดแสดงผล (หลัง 7 วัน)
    const activeWindowStart = new Date(festivalStart);
    activeWindowStart.setDate(activeWindowStart.getDate() - festival.daysBefore);

    const activeWindowEnd = new Date(festivalEnd);
    activeWindowEnd.setDate(activeWindowEnd.getDate() + festival.daysAfter);

    if (currentTimestamp >= activeWindowStart.getTime() && currentTimestamp <= activeWindowEnd.getTime()) {
      return festival;
    }
  }

  // หากไม่อยู่ในช่วงเทศกาลใด จะกลับสู่ธีมปกติ
  return null;
};
