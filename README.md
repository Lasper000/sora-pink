# 🌸 SORA PINK - E-Commerce Web Application

เว็บแอปพลิเคชัน E-Commerce สไตล์ **Modern Pastel Minimalist** (Pastel Pink `#FFD1DC` & Pastel Blue `#BFEFFF`) สำหรับขายเครื่องสำอาง (Cosmetics), สกินแคร์บำรุงผิวหน้า (Facial Skincare) และผลิตภัณฑ์ดูแลผิวกาย (Body & Personal Care) ครบวงจร

---

## 🌟 ฟีเจอร์เด่นของระบบ

- **Pastel Minimalist Theme**: ดีไซน์ละมุนตา เรียบหรู สะอาด และทันสมัย รองรับ Responsive ทุกหน้าจอ
- **Smart Beauty Filters**: ตัวกรองอัจฉริยะ ค้นหาตาม "สภาพผิว" (ผิวมัน, ผิวแห้ง, ผิวผสม, ผิวแพ้ง่าย) และ "ปัญหาผิว" (สิว, ชุ่มชื้น, กระจ่างใส, ริ้วรอย)
- **Product Detail & Reviews**: แกลเลอรีรูปภาพ, ส่วนผสมสำคัญ (Key Ingredients), วิธีใช้งาน (How to Use), ป้ายสต็อก, และระบบรีวิวให้คะแนนดาว
- **Interactive Shopping Cart & Checkout**: ปรับจำนวนสินค้าพร้อมคุมสต็อก, ระบบโค้ดส่วนลด (เช่น `SORA50`, `GLOW20`), ฟอร์มจัดส่ง และชำระเงินด้วย PromptPay QR / บัตรเครดิต / COD
- **User Profile & Tracking**: ติดตามสถานะออเดอร์ (รอชำระ, กำลังเตรียม, จัดส่งแล้ว, สำเร็จ) พร้อมเลขพัสดุคลิกคัดลอกได้ทันที
- **Admin Dashboard**: จัดการสินค้า (CRUD), อัปเดตสต็อก, ปรับสถานะคำสั่งซื้อ, บันทึกเลขพัสดุ และดูภาพรวมยอดขาย
- **Supabase Backend & PostgreSQL Schema**: สคริปต์ SQL ครบทั้ง 8 ตาราง, Trigger ตัดสต็อกสินค้าอัตโนมัติ, RLS Policies, และ Google OAuth

---

## 🚀 วิธีการรันโปรเจกต์ (Quick Start)

### 1. ติดตั้ง Dependencies
```bash
npm install
```

### 2. รัน Local Development Server
```bash
npm run dev
```
เปิดบราวเซอร์ที่: `http://localhost:5173/`

### 3. เชื่อมต่อ Supabase (ตัวเลือก)
1. นำไฟล์ `supabase_schema.sql` ไปรันใน **Supabase Dashboard > SQL Editor**
2. คัดลอก Project URL และ anon key มาใส่ในไฟล์ `.env`:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
*(หมายเหตุ: หากยังไม่ได้ระบุ Supabase API ระบบจะเปิดใช้งานใน **Demo Mode** ทันที พร้อมข้อมูลจำลองและสามารถทดสอบสั่งซื้อ ตัดสต็อก และเข้าใช้งาน Admin Dashboard ได้ครบทุกฟังก์ชัน)*

---

## 📁 โครงสร้างโปรเจกต์
```
d:\Sora Pink/
├── supabase_schema.sql           # สคริปต์ PostgreSQL DDL, RLS, Triggers และ Seed Data
├── .env.example                  # ตัวอย่างการตั้งค่า Environment Variables
├── src/
│   ├── index.css                 # Master Design System (Pastel tokens, Glassmorphism, Animations)
│   ├── types/index.ts            # TypeScript Interfaces สำหรับสินค้า ออเดอร์ รีวิว ตะกร้า
│   ├── lib/
│   │   ├── supabase.ts           # การเชื่อมต่อ Supabase Client และ Auth (Google OAuth & Email)
│   │   └── mockData.ts           # ข้อมูลสินค้าและหมวดหมู่เริ่มต้น
│   ├── services/api.ts           # Service API layer (สลับระหว่าง Supabase Live และ LocalStorage อัตโนมัติ)
│   ├── context/
│   │   ├── AuthContext.tsx       # จัดการสถานะผู้ใช้และสลับสิทธิ์ Admin / Customer
│   │   ├── CartContext.tsx       # จัดการตะกร้าสินค้า ตรวจสอบสต็อก และคูปองส่วนลด
│   │   └── WishlistContext.tsx   # จัดการรายการสินค้าที่ชื่นชอบ
│   ├── components/
│   │   ├── layout/               # Navbar (Glassmorphism), Footer
│   │   ├── home/                 # HeroBanner, CategoryGrid, FlashSale, SkinQuizModal
│   │   ├── product/              # ProductCard, ProductFilter, ProductDetailModal
│   │   ├── cart/                 # CartDrawer, CheckoutModal (PromptPay QR)
│   │   ├── user/                 # AuthModal (Google Login), UserProfileModal
│   │   ├── admin/                # AdminDashboard (Product CRUD, Orders & Tracking)
│   │   └── common/               # SupabaseGuideModal, Toast notifications
│   ├── App.tsx                   # Main Store Controller
│   └── main.tsx
```
