-- ============================================================================
-- SORA PINK BEAUTY E-COMMERCE - SUPABASE POSTGRESQL SCHEMA & CONFIGURATION
-- ============================================================================
-- โครงสร้างฐานข้อมูล ระบบยืนยันตัวตน Row Level Security (RLS) และ Trigger ตัดสต็อก
-- สำหรับร้านค้าเครื่องสำอาง สกินแคร์ และผลิตภัณฑ์ดูแลผิวครบวงจร Sora Pink
-- ============================================================================

-- เปิดส่วนขยาย UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1. ตาราง categories (หมวดหมู่สินค้า)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 2. ตาราง profiles (ข้อมูลผู้ใช้งาน เชื่อมกับ auth.users)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(150),
    avatar_url TEXT,
    phone VARCHAR(30),
    address TEXT,
    role VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 3. ตาราง products (สินค้า)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    ingredients TEXT,
    how_to_use TEXT,
    skin_types TEXT[] DEFAULT '{}', -- e.g. ARRAY['ผิวมัน', 'ผิวแห้ง', 'ผิวผสม', 'ผิวแพ้ง่าย', 'ทุกสภาพผิว']
    skin_concerns TEXT[] DEFAULT '{}', -- e.g. ARRAY['สิว', 'ความกระจ่างใส', 'ริ้วรอย', 'ความชุ่มชื้น', 'กระชับรูขุมขน']
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    discount_price DECIMAL(10, 2) CHECK (discount_price IS NULL OR (discount_price >= 0 AND discount_price < price)),
    stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    images TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 4. ตาราง cart_items (ตะกร้าสินค้าของผู้ใช้)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- ----------------------------------------------------------------------------
-- 5. ตาราง orders (ข้อมูลใบสั่งซื้อ)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    total_amount DECIMAL(10, 2) NOT NULL CHECK (total_amount >= 0),
    discount_amount DECIMAL(10, 2) DEFAULT 0.00,
    shipping_fee DECIMAL(10, 2) DEFAULT 0.00,
    shipping_address JSONB NOT NULL, -- { fullName, phone, address, province, postalCode }
    payment_method VARCHAR(50) DEFAULT 'promptpay', -- promptpay, credit_card, cod, bank_transfer
    payment_status VARCHAR(30) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    order_status VARCHAR(30) DEFAULT 'pending' CHECK (order_status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
    tracking_number VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 6. ตาราง order_items (รายการสินค้าในแต่ละออเดอร์)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price_at_purchase DECIMAL(10, 2) NOT NULL CHECK (price_at_purchase >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 7. ตาราง reviews (รีวิวและคะแนนดาวจากลูกค้า)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, user_id)
);

-- ----------------------------------------------------------------------------
-- 8. ตาราง wishlists (รายการสินค้าที่ชื่นชอบ)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.wishlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- ============================================================================
-- ฟังก์ชัน & TRIGGERS
-- ============================================================================

-- 1. ฟังก์ชันสร้าง Profile อัตโนมัติเมื่อมี User สมัครใหม่ (ทั้ง Google OAuth และ Email)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.email),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', ''),
        'customer'
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. ฟังก์ชันตัดสต็อกสินค้าอัตโนมัติเมื่อมีการสั่งซื้อ (Stock Deduction)
CREATE OR REPLACE FUNCTION public.deduct_product_stock_on_order()
RETURNS TRIGGER AS $$
DECLARE
    current_stock INTEGER;
BEGIN
    -- ตรวจสอบจำนวนสต็อกคงเหลือ
    SELECT stock_quantity INTO current_stock
    FROM public.products
    WHERE id = NEW.product_id
    FOR UPDATE;

    IF current_stock IS NULL THEN
        RAISE EXCEPTION 'Product with ID % does not exist', NEW.product_id;
    END IF;

    IF current_stock < NEW.quantity THEN
        RAISE EXCEPTION 'สินค้าคงเหลือไม่เพียงพอ (คงเหลือ %, ต้องการ %)', current_stock, NEW.quantity;
    END IF;

    -- ลดจำนวนสต็อกสินค้า
    UPDATE public.products
    SET stock_quantity = stock_quantity - NEW.quantity,
        updated_at = NOW()
    WHERE id = NEW.product_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_deduct_stock ON public.order_items;
CREATE TRIGGER trigger_deduct_stock
    AFTER INSERT ON public.order_items
    FOR EACH ROW EXECUTE FUNCTION public.deduct_product_stock_on_order();

-- 3. อัปเดต updated_at อัตโนมัติ
CREATE OR REPLACE FUNCTION public.update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_products_timestamp BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();
CREATE TRIGGER update_orders_timestamp BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();
CREATE TRIGGER update_profiles_timestamp BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

-- Helper Function ตรวจสอบ Admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- --- Categories RLS ---
CREATE POLICY "Categories are readable by everyone" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins can insert categories" ON public.categories FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update categories" ON public.categories FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete categories" ON public.categories FOR DELETE USING (public.is_admin());

-- --- Profiles RLS ---
CREATE POLICY "Profiles are viewable by owner or admin" ON public.profiles FOR SELECT USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- --- Products RLS ---
CREATE POLICY "Active products are readable by everyone" ON public.products FOR SELECT USING (is_active = true OR public.is_admin());
CREATE POLICY "Admins can insert products" ON public.products FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update products" ON public.products FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete products" ON public.products FOR DELETE USING (public.is_admin());

-- --- Cart Items RLS ---
CREATE POLICY "Users can view own cart items" ON public.cart_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own cart items" ON public.cart_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own cart items" ON public.cart_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own cart items" ON public.cart_items FOR DELETE USING (auth.uid() = user_id);

-- --- Orders RLS ---
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Users can create own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can update orders" ON public.orders FOR UPDATE USING (public.is_admin());

-- --- Order Items RLS ---
CREATE POLICY "Users can view own order items" ON public.order_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND (orders.user_id = auth.uid() OR public.is_admin()))
);
CREATE POLICY "Users can insert own order items" ON public.order_items FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);

-- --- Reviews RLS ---
CREATE POLICY "Reviews are readable by everyone" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reviews" ON public.reviews FOR DELETE USING (auth.uid() = user_id OR public.is_admin());

-- --- Wishlists RLS ---
CREATE POLICY "Users can view own wishlists" ON public.wishlists FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert into own wishlist" ON public.wishlists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove from own wishlist" ON public.wishlists FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- SUPABASE STORAGE CONFIGURATION
-- ============================================================================
-- หมายเหตุ: สร้างบัคเก็ต 'product-images' และ 'avatars' ในหน้า Supabase Storage
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('product-images', 'product-images', true),
    ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Policies สำหรับ Storage
CREATE POLICY "Public Read for product-images" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Admins Upload for product-images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images' AND public.is_admin());

CREATE POLICY "Public Read for avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users Upload own avatar" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);

-- ============================================================================
-- SEED DATA (ข้อมูลเริ่มต้นสำหรับทดสอบ)
-- ============================================================================

-- เพิ่มหมวดหมู่สินค้า 4 กลุ่มหลัก
INSERT INTO public.categories (id, name, slug, description, image_url) VALUES
('c1000000-0000-0000-0000-000000000001', 'เครื่องสำอาง (Cosmetics)', 'cosmetics', 'เมคอัพ ลิปสติก บลัชออน คุชชั่น และแป้งผสมรองพื้น ให้ลุคผิวสวยฉ่ำโกลว์สไตล์เกาหลี', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80'),
('c1000000-0000-0000-0000-000000000002', 'ดูแลผิวหน้า (Facial Skincare)', 'facial-skincare', 'เซรั่ม มอยส์เจอไรเซอร์ โทนเนอร์ และครีมกันแดด ฟื้นบำรุงลึกถึงชั้นผิว', 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80'),
('c1000000-0000-0000-0000-000000000003', 'ดูแลผิวกาย (Body & Personal Care)', 'body-care', 'โลชั่นผิวกาย เจลอาบน้ำน้ำหอม สครับผิว และครีมทามือ ให้ผิวนุ่มเนียนกลิ่นหอมละมุน', 'https://images.unsplash.com/photo-1608248597359-5776d655f464?auto=format&fit=crop&w=600&q=80'),
('c1000000-0000-0000-0000-000000000004', 'ดูแลเส้นผมและอื่นๆ (Hair & Wellness)', 'hair-wellness', 'เซรั่มบำรุงผม ทรีตเมนต์ และผลิตภัณฑ์สปาเพื่อการผ่อนคลายอย่างสมบูรณ์แบบ', 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80')
ON CONFLICT (id) DO NOTHING;

-- เพิ่มสินค้าตัวอย่างที่มีข้อมูลครบครัน
INSERT INTO public.products (id, category_id, name, description, ingredients, how_to_use, skin_types, skin_concerns, price, discount_price, stock_quantity, images, is_active) VALUES
(
    'a1000000-0000-0000-0000-000000000001',
    'c1000000-0000-0000-0000-000000000002',
    'Sora Pink Cloud Hydrating Barrier Serum',
    'เซรั่มกู้ผิวสูตรพรีเมียม เติมความชุ่มชื้นล้ำลึก 8 มิติ ซ่อมแซมเกราะป้องกันผิวที่ถูกทำร้าย เนื้อสัมผัสบางเบาดุจปุยเมฆ ซึมไว ไม่เหนียวเหนอะหนะ ปลอบประโลมผิวอย่างอ่อนโยน ช่วยให้ผิวหน้าแลดูอิ่มฟู ฉ่ำวาว เปล่งปลั่งมีออร่าตลอดวัน',
    'Hyaluronic Acid 8D Complex, Ceramide NP, AP, EOP, Niacinamide 5%, Centella Asiatica Extract, Panthenol (Vitamin B5), Madecassoside',
    'หยดเซรั่ม 2-3 หยดลงบนฝ่ามือ ลูบไล้ให้ทั่วใบหน้าและลำคอเป็นประจำทุกเช้า-เย็น ก่อนทามอยส์เจอไรเซอร์',
    ARRAY['ผิวแห้ง', 'ผิวผสม', 'ผิวแพ้ง่าย', 'ทุกสภาพผิว'],
    ARRAY['ความชุ่มชื้น', 'ริ้วรอย', 'กระชับรูขุมขน'],
    890.00,
    690.00,
    45,
    ARRAY['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80'],
    TRUE
),
(
    'a1000000-0000-0000-0000-000000000002',
    'c1000000-0000-0000-0000-000000000001',
    'Sora Velvet Dew Jelly Lip Tint (สี #03 Sakura Pink)',
    'ลิปทินท์เนื้อเจลลี่ฉ่ำวาว เม็ดสีชัดเจน สัมผัสเบาสบายปาก ให้ริมฝีปากดูอวบอิ่มสุขภาพดี ติดทนนานตลอดวันโดยไม่ทำให้ปากแห้งตึง อุดมด้วยสารสกัดธรรมชาติจากโจโจ้บาออยล์และวิตามินอี ให้ริมฝีปากนุ่มชุ่มชื่นแลดูน่าจุ๊บ',
    'Jojoba Seed Oil, Vitamin E, Shea Butter, Rosehip Seed Oil, Sodium Hyaluronate, Tocopheryl Acetate',
    'ทาลงบนริมฝีปากโดยตรงจากกึ่งกลางปากแล้วเกลี่ยออกสู่ขอบปาก สามารถทาซ้ำได้เพื่อเพิ่มความฉ่ำวาวหรือไล่ระดับสีแบบ Ombre',
    ARRAY['ทุกสภาพผิว'],
    ARRAY['ความชุ่มชื้น'],
    450.00,
    320.00,
    80,
    ARRAY['https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80'],
    TRUE
),
(
    'a1000000-0000-0000-0000-000000000003',
    'c1000000-0000-0000-0000-000000000002',
    'Pastel Glow Niacinamide + Zinc Clarity Solution',
    'เซรั่มลดรอยสิวและคุมมัน จัดการสิวอักเสบ สิวผด และกระชับรูขุมขนอย่างมีประสิทธิภาพ ปรับสีผิวให้แลดูกระจ่างใสสม่ำเสมอ ลดรอยดำรอยแดงจากสิวเห็นผลชัดเจนใน 14 วัน ปราศจากแอลกอฮอล์และน้ำหอม อ่อนโยนต่อผิวเป็นสิวง่าย',
    'Niacinamide (Vitamin B3) 10%, Zinc PCA 1%, Tea Tree Leaf Extract, Salicylic Acid (BHA 0.5%), Allantoin, Hyaluronic Acid',
    'ทาบำรุงทั่วใบหน้าตอนเช้าและก่อนนอน เหมาะสำหรับใช้เป็นขั้นตอนแรกของการบำรุงผิวหน้า',
    ARRAY['ผิวมัน', 'ผิวผสม', 'ผิวแพ้ง่าย'],
    ARRAY['สิว', 'ความกระจ่างใส', 'กระชับรูขุมขน'],
    650.00,
    490.00,
    32,
    ARRAY['https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=800&q=80'],
    TRUE
),
(
    'a1000000-0000-0000-0000-000000000004',
    'c1000000-0000-0000-0000-000000000003',
    'Silk Touch Peach & Rose Whipped Body Cream',
    'บอดี้ครีมเนื้อวิปนุ่มฟู มอบความชุ่มชื้นยาวนาน 48 ชั่วโมง ผสานสารสกัดพีชญี่ปุ่นและกุหลาบดามาสค์ กลิ่นหอมหวานละมุนติดทนนาน ผิวเนียนนุ่มเปล่งประกายดุจแพรไหม ซึมไว ไม่เหนอะหนะเสื้อผ้า',
    'Japanese Peach Extract, Damask Rose Floral Water, Shea Butter 15%, Sweet Almond Oil, Collagen Peptide, Vitamin E',
    'ลูบไล้ให้ทั่วผิวกายเป็นประจำทุกวันหลังอาบน้ำ หรือเมื่อรู้สึกว่าผิวแห้งขาดความชุ่มชื้น',
    ARRAY['ทุกสภาพผิว', 'ผิวแห้ง'],
    ARRAY['ความชุ่มชื้น', 'ความกระจ่างใส'],
    520.00,
    390.00,
    50,
    ARRAY['https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80'],
    TRUE
),
(
    'a1000000-0000-0000-0000-000000000005',
    'c1000000-0000-0000-0000-000000000001',
    'Aura Cushion Foundation SPF50+ PA++++ (#01 Vanilla Glow)',
    'คุชชั่นตลับชมพูพาสเทล มอบการปกปิดระดับ Medium to Full ให้งานผิวฉ่ำโกลว์เหมือนสาวเกาหลี คุมมันยาวนาน 12 ชั่วโมง ไม่ดรอประหว่างวัน พร้อมสารบำรุงและกันแดดปกป้องผิวจากแสงแดดและมลภาวะ',
    'Titanium Dioxide, Zinc Oxide, Madecassoside, Adenosine, Pearl Extract, Edelweiss Callus Culture Extract, Niacinamide',
    'ใช้พัฟแตะเนื้อคุชชั่นในปริมาณที่พอเหมาะ แล้วค่อยๆ แตะเกลี่ยเบาๆ ให้ทั่วใบหน้าและลำคอ',
    ARRAY['ผิวมัน', 'ผิวผสม', 'ผิวแห้ง'],
    ARRAY['ความกระจ่างใส', 'ริ้วรอย'],
    790.00,
    590.00,
    22,
    ARRAY['https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80'],
    TRUE
),
(
    'a1000000-0000-0000-0000-000000000006',
    'c1000000-0000-0000-0000-000000000002',
    'Blue Calming Cica & Artemisia Soothing Gel',
    'เจลบำรุงผิวสูตรเย็นสีฟ้าพาสเทลจากธรรมชาติ ลดอาการระคายเคือง รอยแดง อาการแสบแดด ปลอบประโลมผิวบอบบางแพ้ง่าย ฟื้นฟูเกราะป้องกันผิวให้แข็งแรง เหมาะอย่างยิ่งสำหรับวันที่ผิวอ่อนล้า',
    'Centella Asiatica (Cica) Extract 70%, Artemisia Capillaris Extract, Guaiazulene (สีฟ้าธรรมชาติ), Madecassic Acid, Asiatic Acid',
    'ทาเจลในปริมาณหนาเล็กน้อยเป็น Sleeping Mask ข้ามคืน หรือทาบำรุงบางๆ ก่อนแต่งหน้า',
    ARRAY['ผิวแพ้ง่าย', 'ผิวมัน', 'ผิวผสม'],
    ARRAY['สิว', 'ความชุ่มชื้น'],
    580.00,
    420.00,
    18,
    ARRAY['https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80'],
    TRUE
),
(
    'a1000000-0000-0000-0000-000000000007',
    'c1000000-0000-0000-0000-000000000004',
    'Rose Romance Hair & Scalp Nourishing Elixir',
    'ออยล์เซรั่มบำรุงเส้นผมสูตรไม่เหนอะหนะ ฟื้นฟูผมแห้งเสียแตกปลายจากความร้อนและเคมี มอบผมเงางามนุ่มสลวยพร้อมกลิ่นหอมกุหลาบพาสเทลตลอด 24 ชั่วโมง',
    'Argan Kernel Oil, Camellia Seed Oil, Rose Essential Oil, Meadowfoam Seed Oil, Vitamin E, Keratin Hydrolyzed',
    'ชโลม 1-2 ปั๊มลงบนเส้นผมที่หมาดหรือแห้ง โดยเน้นที่บริเวณปลายผม ไม่ต้องล้างออก',
    ARRAY['ทุกสภาพผิว'],
    ARRAY['ความชุ่มชื้น'],
    490.00,
    NULL,
    4,
    ARRAY['https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=800&q=80'],
    TRUE
),
(
    'a1000000-0000-0000-0000-000000000008',
    'c1000000-0000-0000-0000-000000000001',
    'Soft Cloud Marshmallow Powder Blush (#02 Cotton Candy)',
    'บลัชออนเนื้อแป้งมาร์ชแมลโลว์ นุ่มละมุน เกลี่ยง่าย เบลอรูขุมขน ให้พวงแก้มอมชมพูระเรื่อเป็นธรรมชาติ สีชัด ติดทนนาน กันน้ำกันเหงื่อ ไม่เป็นคราบระหว่างวัน',
    'Mica, Silica, Zinc Stearate, Caprylic/Capric Triglyceride, Prunus Amygdalus Dulcis (Sweet Almond) Oil, Macadamia Seed Oil',
    'ใช้แปรงหรือนิ้วมือแตะเนื้อบลัชออนเบาๆ แล้วปัดลงบนพวงแก้มตามทรงที่ต้องการ',
    ARRAY['ทุกสภาพผิว'],
    ARRAY['ความกระจ่างใส'],
    390.00,
    290.00,
    65,
    ARRAY['https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=800&q=80'],
    TRUE
),
(
    'a1000000-0000-0000-0000-000000000009',
    'c1000000-0000-0000-0000-000000000001',
    '[Spooky Edition] Sora Velvet Dew Tint (#06 Blood Cherry Glow)',
    'ลิปทินท์รุ่นพิเศษต้อนรับเทศกาลฮาโลวีน สีแดงเชอร์รี่ดำมนต์สะกด ให้ริมฝีปากดูเย้ายวน ฉ่ำวาว ลึกลับน่าค้นหา เนื้อสัมผัสเจลลี่นุ่มบางเบา ติดทนนานตลอดคืนฮาโลวีน ผสานสารสกัดแบล็คเบอร์รี่และวิตามินอี',
    'Blackberry Seed Oil, Vitamin E, Shea Butter, Rosehip Seed Oil, Sodium Hyaluronate, Red Wine Extract',
    'ทาลงบนริมฝีปากเพื่อลุค Vampire Glam หรือแตะเบาๆ ด้านในปากเพื่อฟินิชระเรื่อแบบ Blood Berry Ombre',
    ARRAY['ทุกสภาพผิว'],
    ARRAY['ความชุ่มชื้น', 'ความกระจ่างใส'],
    490.00,
    338.00,
    31,
    ARRAY['/images/products/blood_cherry_lip_tint.jpg'],
    TRUE
),
(
    'a1000000-0000-0000-0000-000000000010',
    'c1000000-0000-0000-0000-000000000002',
    '[Spooky Edition] Magic Pumpkin Enzyme Glow Sleeping Mask',
    'สลีปปิ้งมาสก์ฟักทองมนต์วิเศษสูตรลิมิเต็ด ผลัดเซลล์ผิวอย่างอ่อนโยนข้ามคืนด้วยเอนไซม์ฟักทองธรรมชาติ 15% และ Honey Bioferment ตื่นมารับผิวฉ่ำโกลว์ เนียนนุ่มดุจเสกคาถา ลดความหมองคล้ำทันใจ',
    'Pumpkin Fruit Ferment Filtrate 15%, Honey Extract, Niacinamide 5%, Sodium Hyaluronate 8D, Cinnamon Bark Extract, Ceramide NP',
    'ทาหนาๆ ทั่วใบหน้าก่อนนอนโดยไม่ต้องล้างออก สัปดาห์ละ 2-3 ครั้ง เพื่อผิวเปล่งประกายฉ่ำเงา',
    ARRAY['ทุกสภาพผิว', 'ผิวแพ้ง่าย'],
    ARRAY['ความกระจ่างใส', 'ริ้วรอย', 'กระชับรูขุมขน'],
    750.00,
    518.00,
    25,
    ARRAY['/images/products/pumpkin_sleeping_mask.jpg'],
    TRUE
),
(
    'a1000000-0000-0000-0000-000000000011',
    'c1000000-0000-0000-0000-000000000001',
    'Glass Shine Plumping Lip Gloss (#01 Crystal Peach)',
    'ลิปกลอสเนื้อแก้วฉ่ำวาวสูตรพิเศษ มอบสัมผัสเย็นสดชื่น ให้ริมฝีปากดูอวบอิ่มเปล่งประกายดุจกระจกใส ไม่เหนียวเหนอะหนะ บำรุงล้ำลึกด้วยไฮยาลูรอนและเปปไทด์ เติมเต็มร่องปากให้เนียนเรียบทันที',
    'Peptide Complex, Hyaluronic Acid Spheres, Vitamin E, Jojoba Oil, Menthol Cooling Essence',
    'ทาเดี่ยวๆ เพื่อลุคริมฝีปากฉ่ำน้ำระเรื่อ หรือทาทับลิปสติกแท่งโปรดเพื่อเพิ่มมิติความเงาวาวระดับ Glass Skin',
    ARRAY['ทุกสภาพผิว'],
    ARRAY['ความชุ่มชื้น', 'ริ้วรอย'],
    380.00,
    280.00,
    60,
    ARRAY['https://images.unsplash.com/photo-1576426863848-c21f53c60b19?auto=format&fit=crop&w=800&q=80'],
    TRUE
),
(
    'a1000000-0000-0000-0000-000000000012',
    'c1000000-0000-0000-0000-000000000001',
    'Silky Ultra-Fine Translucent Loose Powder',
    'แป้งฝุ่นคุมมันสูตรโปร่งแสง เนื้อเนียนละเอียดระดับไมโคร เบลอรูขุมขนและริ้วรอยให้ผิวดูนวลละมุนดุจใส่ฟิลเตอร์ คุมมันยาวนาน 14 ชั่วโมง ไม่เป็นคราบขาว ไม่ดรอป ใช้ได้กับทุกเฉดสีผิว',
    'Micro-Silica, Silk Powder, Calamine Powder, Rosa Damascena Extract, Tocopherol',
    'ใช้พัฟกำมะหยี่หรือแปรงแตะแป้งเบาๆ เกลี่ยให้ทั่วใบหน้าหลังจากลงรองพื้นหรือคุชชั่นเพื่อเซ็ตผิวให้แมตต์สวย',
    ARRAY['ผิวมัน', 'ผิวผสม', 'ทุกสภาพผิว'],
    ARRAY['กระชับรูขุมขน'],
    490.00,
    350.00,
    42,
    ARRAY['/images/products/loose_powder.jpg'],
    TRUE
),
(
    'a1000000-0000-0000-0000-000000000013',
    'c1000000-0000-0000-0000-000000000001',
    'Feather Brow Slim Auto Pencil (#02 Milk Tea Brown)',
    'ดินสอเขียนคิ้วหัวสลิมทรงรี 1.5 มม. วาดโครงและเส้นขนคิ้วได้คมชัดเป็นธรรมชาติ เม็ดสีแน่นแต่เขียนง่าย นุ่มละมุนไม่บาดผิว กันน้ำกันเหงื่อ ติดทนนานเช้าจรดค่ำ พร้อมแปรงสปูลี่จัดแต่งทรงคิ้วในตัว',
    'Hydrogenated Soybean Oil, Carnauba Wax, Zinc Stearate, Camellia Japonica Seed Oil, Vitamin E',
    'หมุนไส้ดินสอขึ้นมาเพียง 1-2 มม. วาดโครงและระบายตามแนวขนคิ้ว จากนั้นใช้แปรงสปูลี่เกลี่ยเบาๆ ให้ดูฟุ้งเป็นธรรมชาติ',
    ARRAY['ทุกสภาพผิว'],
    ARRAY['ความชุ่มชื้น'],
    290.00,
    NULL,
    70,
    ARRAY['/images/products/eyebrow_pencil.jpg'],
    TRUE
),
(
    'a1000000-0000-0000-0000-000000000014',
    'c1000000-0000-0000-0000-000000000001',
    'Pastel Dream 9-Color Eyeshadow Palette (#Rose Garden)',
    'พาเลตต์อายแชโดว์ 9 หลุม โทนชมพูกุหลาบและชานมละมุน รวมเนื้อสัมผัสแมตต์ ชิมเมอร์เนื้อเนียน และกลิตเตอร์เปล่งประกาย เม็ดสีชัด เบลนด์ง่าย ไม่ร่วงหล่นเป็นผงใต้ตา ครีเอทได้ทุกลุคตั้งแต่ Every Day Look จนถึงปาร์ตี้วิบวับ',
    'Mica, Synthetic Fluorphlogopite, Talc, Dimethicone, Squalane, Rosa Centifolia Flower Extract',
    'ใช้นิ้วมือหรือแปรงแต่งตาแตะสีแมตต์เกลี่ยทั่วเปลือกตา แล้วแตะกลิตเตอร์ตรงกึ่งกลางเปลือกตาและหัวตาเพื่อเพิ่มมิติสดใส',
    ARRAY['ทุกสภาพผิว'],
    ARRAY['ความกระจ่างใส'],
    690.00,
    520.00,
    35,
    ARRAY['https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=800&q=80'],
    TRUE
),
(
    'a1000000-0000-0000-0000-000000000015',
    'c1000000-0000-0000-0000-000000000002',
    'Centella Gentle Calming Bubble Cleanser',
    'มูสโฟมล้างหน้าสูตรฟองนุ่มละเอียด อุดมด้วยสารสกัดใบบัวบกบริสุทธิ์ ค่า pH 5.5 ใกล้เคียงกับผิว ทำความสะอาดสิ่งสกปรกและคราบฝุ่น PM2.5 ได้หมดจดโดยไม่ทำลายเกราะป้องกันผิว ล้างแล้วผิวนุ่ม ไม่แห้งตึง เหมาะสำหรับผิวเป็นสิวและผิวแพ้ง่าย',
    'Centella Asiatica Extract 50,000 ppm, Tea Tree Water, Amino Acid Surfactants, Panthenol, Ceramide NP, Allantoin',
    'กดหัวปั๊ม 1-2 ครั้งเพื่อให้ได้ฟองมูสนุ่ม นวดวนเบาๆ ให้ทั่วใบหน้าที่เปียก แล้วล้างออกด้วยน้ำสะอาด',
    ARRAY['ผิวแพ้ง่าย', 'ผิวมัน', 'ผิวผสม', 'ทุกสภาพผิว'],
    ARRAY['สิว', 'กระชับรูขุมขน'],
    420.00,
    320.00,
    58,
    ARRAY['https://images.unsplash.com/photo-1558244402-286dd748c593?auto=format&fit=crop&w=800&q=80'],
    TRUE
),
(
    'a1000000-0000-0000-0000-000000000016',
    'c1000000-0000-0000-0000-000000000002',
    'Rose Petal Hydrating Glow Essence Toner',
    'เอสเซนส์โทนเนอร์น้ำตบกลีบกุหลาบออร์แกนิก ปลุกผิวที่อ่อนล้าให้ชุ่มชื้น เปล่งปลั่ง มีชีวิตชีวา ปรับสมดุลผิวหลังล้างหน้า พร้อมเตรียมผิวให้พร้อมรับการบำรุงในขั้นตอนต่อไป กลิ่นหอมผ่อนคลายจากน้ำมันกุหลาบธรรมชาติ ไร้แอลกอฮอล์',
    'Organic Damask Rose Floral Water 85%, Niacinamide 2%, Hyaluronic Acid 5D, Centella Extract, Witch Hazel Extract',
    'หยดลงบนสำลีแล้วเช็ดเบาๆ ทั่วใบหน้า หรือเทลงบนฝ่ามือแล้วตบเบาๆ ให้ทั่วใบหน้าและลำคอเช้า-เย็น',
    ARRAY['ทุกสภาพผิว', 'ผิวแห้ง', 'ผิวผสม'],
    ARRAY['ความชุ่มชื้น', 'ความกระจ่างใส'],
    590.00,
    450.00,
    40,
    ARRAY['https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?auto=format&fit=crop&w=800&q=80'],
    TRUE
),
(
    'a1000000-0000-0000-0000-000000000017',
    'c1000000-0000-0000-0000-000000000002',
    'Ceramide Deep Barrier Defense Cream',
    'ครีมมอยส์เจอไรเซอร์สูตรเข้มข้น ฟื้นบำรุงเกราะป้องกันผิวที่แห้งแตกและระคายเคือง ล็อคความชุ่มชื้นยาวนาน 72 ชั่วโมง ด้วยเซราไมด์บริสุทธิ์ 5 ชนิด ผสานไขมันจำเป็นตามธรรมชาติ เนื้อครีมเนียนนุ่มซึมซาบไว ไม่เหนียวเหนอะหนะ',
    '5-Ceramide Complex (EOP, NS, NP, AS, AP), Cholesterol, Fatty Acids, Phytosphingosine, Squalane, Oat Kernel Extract',
    'ทาบำรุงทั่วใบหน้าและลำคอเป็นขั้นตอนสุดท้ายของการบำรุงผิว ทั้งตอนเช้าและก่อนนอน',
    ARRAY['ผิวแห้ง', 'ผิวแพ้ง่าย', 'ผิวผสม'],
    ARRAY['ความชุ่มชื้น', 'ริ้วรอย'],
    750.00,
    580.00,
    36,
    ARRAY['https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&w=800&q=80'],
    TRUE
),
(
    'a1000000-0000-0000-0000-000000000018',
    'c1000000-0000-0000-0000-000000000002',
    'Aqua UV Airy Sunscreen Gel SPF50+ PA++++',
    'กันแดดเนื้อเจลน้ำ สัมผัสบางเบาดุจน้ำ ซึมซาบลงสู่ผิวทันทีที่ทา ไม่ทิ้งคราบขาว ไม่เหนียวเหนอะหนะ ปกป้องผิวขั้นสุดจากรังสี UVA/UVB และแสงสีฟ้า พร้อมบำรุงให้ผิวแลดูฉ่ำน้ำมีออร่าตลอดวัน ไม่รบกวนเมคอัพ',
    'UV Filters Complex, Hyaluronic Acid, Niacinamide, Green Tea Extract, Chamomile Flower Extract',
    'ทาทั่วใบหน้าและลำคอเป็นประจำทุกเช้า ก่อนออกแดด 15-20 นาที สามารถทาทับเมคอัพระหว่างวันได้',
    ARRAY['ทุกสภาพผิว', 'ผิวมัน', 'ผิวผสม', 'ผิวแพ้ง่าย'],
    ARRAY['ความกระจ่างใส', 'ริ้วรอย'],
    620.00,
    460.00,
    65,
    ARRAY['https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=800&q=80'],
    TRUE
),
(
    'a1000000-0000-0000-0000-000000000019',
    'c1000000-0000-0000-0000-000000000003',
    'Sakura Blossom Brightening Milky Body Wash',
    'ครีมอาบน้ำน้ำนมฟองนุ่มละมุน ผสานสารสกัดจากดอกซากุระญี่ปุ่นและน้ำนมฮอกไกโด ทำความสะอาดผิวกายอย่างอ่อนโยน ช่วยผลัดเซลล์ผิวหมองคล้ำ ให้ผิวดูกระจ่างใสนุ่มลื่นดุจแพรไหม กลิ่นหอมหวานติดผิวยาวนานตลอดวัน',
    'Hokkaido Milk Protein, Cherry Blossom Extract, Vitamin B3, Arbutin, Glycerin, Olive Fruit Oil',
    'เทครีมอาบน้ำลงบนฝ่ามือหรือฟองน้ำ ลูบไล้ให้เกิดฟองนุ่มทั่วผิวกาย แล้วล้างออกด้วยน้ำสะอาด',
    ARRAY['ทุกสภาพผิว', 'ผิวแห้ง'],
    ARRAY['ความกระจ่างใส', 'ความชุ่มชื้น'],
    390.00,
    290.00,
    52,
    ARRAY['/images/products/sakura_body_wash.jpg'],
    TRUE
),
(
    'a1000000-0000-0000-0000-000000000020',
    'c1000000-0000-0000-0000-000000000003',
    'Niacinamide 10% Glow Serum Body Lotion',
    'บอดี้โลชั่นเนื้อเซรั่มเข้มข้น ซึมไวใน 10 วินาที ไม่เหนียวเหนอะหนะผิว อัดแน่นด้วยไนอะซินาไมด์ 10% และกลูต้าไธโอน ช่วยปรับสีผิวให้สม่ำเสมอ ลดเลือนรอยดำจากรอยยุงกัดและแสงแดด ให้ผิวกายเปล่งประกายออร่า',
    'Niacinamide 10%, Glutathione, Vitamin C Derivative, Shea Butter Extract, Sodium Hyaluronate',
    'ลูบไล้ทั่วเรือนร่างเป็นประจำทุกเช้าและก่อนนอน โดยเฉพาะบริเวณที่หมองคล้ำ เช่น หัวเข่า ข้อศอก และลำคอ',
    ARRAY['ทุกสภาพผิว', 'ผิวผสม'],
    ARRAY['ความกระจ่างใส', 'ริ้วรอย'],
    480.00,
    360.00,
    44,
    ARRAY['https://images.unsplash.com/photo-1599305090598-fe179d501227?auto=format&fit=crop&w=800&q=80'],
    TRUE
),
(
    'a1000000-0000-0000-0000-000000000021',
    'c1000000-0000-0000-0000-000000000003',
    'Brown Sugar & Peach Exfoliating Body Scrub',
    'สครับขัดผิวกายสูตรน้ำตาลทรายแดงออร์แกนิก เม็ดสครับละเอียดกลมมนไม่บาดผิว ผสานน้ำมันโจโจ้บาและสารสกัดพีชฉ่ำน้ำ ขจัดเซลล์ผิวที่ตายแล้วอย่างอ่อนโยน เผยผิวใหม่ที่เนียนนุ่มน่าสัมผัส หอมกลิ่นพีชสดชื่น',
    'Organic Brown Sugar, Peach Fruit Extract, Jojoba Seed Oil, Sweet Almond Oil, Vitamin E',
    'นวดวนสครับเบาๆ บนผิวกายที่เปียก เน้นบริเวณข้อศอก หัวเข่า และส้นเท้า ทิ้งไว้ 3 นาทีแล้วล้างออกด้วยน้ำอุ่น สัปดาห์ละ 2 ครั้ง',
    ARRAY['ทุกสภาพผิว', 'ผิวแห้ง'],
    ARRAY['ความชุ่มชื้น', 'ความกระจ่างใส'],
    450.00,
    340.00,
    38,
    ARRAY['/images/products/peach_sugar_scrub.jpg'],
    TRUE
),
(
    'a1000000-0000-0000-0000-000000000022',
    'c1000000-0000-0000-0000-000000000003',
    'Pastel Dream Floral Petal Hair & Body Mist',
    'สเปรย์น้ำหอมฉีดผิวกายและเส้นผม มอบกลิ่นหอมหวานละมุนมีระดับสไตล์ลูกคุณหนู ผสานสารสกัดดอกฟรีเซีย กุหลาบสีชมพู และไวท์มัสก์ มีมอยส์เจอไรเซอร์ช่วยให้ผิวนุ่มชุ่มชื้น ไม่ทิ้งคราบบนเสื้อผ้า',
    'Natural Alcohol, Rosa Damascena Flower Water, Freesia Extract, White Musk Essence, Panthenol, Glycerin',
    'ฉีดพรมทั่วเรือนร่างและเส้นผมหลังอาบน้ำ หรือพกพาฉีดระหว่างวันเพื่อเติมความสดชื่นมั่นใจ',
    ARRAY['ทุกสภาพผิว'],
    ARRAY['ความชุ่มชื้น'],
    350.00,
    NULL,
    60,
    ARRAY['/images/products/floral_body_mist.jpg'],
    TRUE
),
(
    'a1000000-0000-0000-0000-000000000023',
    'c1000000-0000-0000-0000-000000000003',
    'Deep Moisture Rose Butter Hand & Nail Cream',
    'ครีมบำรุงมือและเล็บสูตรพรีเมียม ฟื้นบำรุงผิวมือที่แห้งกร้านจากแอลกอฮอล์ล้างมือและอากาศแห้ง อุดมด้วยเชียบัตเตอร์ 20% และเคราตินธรรมชาติ บำรุงจมูกเล็บไม่ให้ลอกฉีก ซึมไว ไม่เหนอะฝ่ามือ กลิ่นหอมกุหลาบละมุน',
    'Shea Butter 20%, Rosehip Seed Oil, Hydrolyzed Keratin, Vitamin E, Allantoin',
    'ลูบไล้ให้ทั่วมือและบริเวณจมูกเล็บได้บ่อยตามต้องการ หรือทาก่อนนอนเพื่อฟื้นฟูผิวมืออย่างล้ำลึก',
    ARRAY['ทุกสภาพผิว', 'ผิวแห้ง'],
    ARRAY['ความชุ่มชื้น', 'ริ้วรอย'],
    280.00,
    199.00,
    75,
    ARRAY['https://images.unsplash.com/photo-1629198688000-71f23e745b6e?auto=format&fit=crop&w=800&q=80'],
    TRUE
),
(
    'a1000000-0000-0000-0000-000000000024',
    'c1000000-0000-0000-0000-000000000003',
    'Soothing Aloe Vera 99% Pure Cooling Body Gel',
    'เจลว่านหางจระเข้ออร์แกนิกเข้มข้น 99% ปราศจากแอลกอฮอล์และพาราเบน มอบสัมผัสเย็นสดชื่น ปลอบประโลมผิวไหม้แดด ผดผื่น และลดอาการระคายเคือง เติมน้ำให้ผิวเปล่งปลั่ง สดชื่น เหมาะสำหรับใช้หลังออกแดดหรือเล่นกีฬา',
    'Aloe Barbadensis Leaf Juice 99%, Centella Asiatica Extract, Sodium Hyaluronate, Camellia Sinensis Leaf Extract',
    'ทาบำรุงผิวกายและผิวหน้าได้บ่อยตามต้องการ หรือแช่ตู้เย็นก่อนนำมาทาเพื่อเพิ่มความสดชื่นขั้นสุด',
    ARRAY['ทุกสภาพผิว', 'ผิวแพ้ง่าย', 'ผิวมัน'],
    ARRAY['ความชุ่มชื้น', 'สิว'],
    320.00,
    240.00,
    48,
    ARRAY['https://images.unsplash.com/photo-1532413992378-f169ac26fff0?auto=format&fit=crop&w=800&q=80'],
    TRUE
),
(
    'a1000000-0000-0000-0000-000000000025',
    'c1000000-0000-0000-0000-000000000003',
    'Golden Glow French Vanilla Shimmer Body Oil',
    'ดรายออยล์บำรุงผิวกายเนื้อบางเบา ผสานชิมเมอร์สีทองและพิงค์โกลด์ขนาดไมโคร มอบผิวโกลว์สวยเล่นแสงดุจต้องแสงแดดชายหาด พร้อมสารบำรุงจากน้ำมันอาร์แกนและคาเมลเลีย บำรุงผิวให้นุ่มชุ่มชื้น กลิ่นวานิลลาคาราเมลหวานเย้ายวน',
    'Argania Spinosa Kernel Oil, Camellia Oleifera Seed Oil, Golden & Pink Mica Pearls, Vanilla Tahitensis Extract, Vitamin E',
    'เขย่าขวดก่อนใช้ หยดและลูบไล้ทั่วเรือนร่าง ไหล่ และไหปลาร้า เพื่อผิวประกายโกลว์สวย',
    ARRAY['ผิวแห้ง', 'ผิวผสม', 'ทุกสภาพผิว'],
    ARRAY['ความชุ่มชื้น', 'ความกระจ่างใส'],
    590.00,
    440.00,
    30,
    ARRAY['/images/products/vanilla_shimmer_oil.jpg'],
    TRUE
),
(
    'a1000000-0000-0000-0000-000000000026',
    'c1000000-0000-0000-0000-000000000004',
    'Rosemary & Biotin Scalp Revitalizing Shampoo',
    'แชมพูสูตรสมุนไพรพรีเมียมโรสแมรี่และไบโอติน ฟื้นบำรุงรากผมให้แข็งแรง ลดการขาดหลุดร่วงของเส้นผม คุมความมันบนหนังศีรษะ ปราศจากซิลิโคนและซัลเฟต ฟองนุ่ม ล้างออกง่าย ให้เส้นผมมีวอลลุ่ม พลิ้วสลวยอย่างเป็นธรรมชาติ',
    'Rosemary Leaf Extract 10,000 ppm, Biotin, Salicylic Acid, Panthenol, Peppermint Oil, Niacinamide',
    'ชโลมแชมพูลงบนเส้นผมและหนังศีรษะที่เปียก นวดวนเบาๆ 1-2 นาทีเพื่อให้สารอาหารซึมลึก แล้วล้างออกด้วยน้ำสะอาด',
    ARRAY['ทุกสภาพผิว', 'ผิวมัน'],
    ARRAY['กระชับรูขุมขน'],
    550.00,
    420.00,
    40,
    ARRAY['/images/products/rosemary_shampoo.jpg'],
    TRUE
),
(
    'a1000000-0000-0000-0000-000000000027',
    'c1000000-0000-0000-0000-000000000004',
    'Keratin Deep Repair Gloss Hair Mask',
    'ทรีตเมนต์มาสก์กู้ผมเสียเร่งด่วน ผสานเคราตินไฮโดรไลซ์และน้ำมันอาร์แกนเข้มข้น ฟื้นฟูเกล็ดผมที่ถูกทำร้ายจากการย้อม ดัด หรือความร้อน ให้เส้นผมนุ่มลื่นดุจทำสปาซาลอน เงางาม ไม่พันกัน เห็นผลตั้งแต่ครั้งแรกที่ใช้',
    'Hydrolyzed Keratin, Hydrolyzed Collagen, Argania Spinosa Kernel Oil, Camellia Seed Oil, Amino Acid Complex',
    'หลังสระผม ชโลมมาสก์ให้ทั่วเส้นผมตั้งแต่กลางจรดปลายผม ทิ้งไว้ 3-5 นาที แล้วล้างออกด้วยน้ำสะอาด สัปดาห์ละ 1-2 ครั้ง',
    ARRAY['ทุกสภาพผิว'],
    ARRAY['ความชุ่มชื้น'],
    620.00,
    480.00,
    35,
    ARRAY['https://images.unsplash.com/photo-1503236823255-94609f598e71?auto=format&fit=crop&w=800&q=80'],
    TRUE
),
(
    'a1000000-0000-0000-0000-000000000028',
    'c1000000-0000-0000-0000-000000000004',
    'Himalayan Pink Salt Scalp Purifying Scrub',
    'สครับเกลือหิมาลายันสีชมพูบริสุทธิ์ ดีท็อกซ์ทำความสะอาดหนังศีรษะ ขจัดคราบสารเคมีตกค้าง ความมันส่วนเกิน และสะเก็ดรังแคอย่างล้ำลึก กระตุ้นการไหลเวียนโลหิต ให้ความรู้สึกสดชื่นโล่งสบายหนังศีรษะ',
    'Himalayan Pink Rock Salt, Tea Tree Leaf Oil, Menthol, Centella Asiatica Extract, Salicylic Acid',
    'แบ่งช่อผมและทาสครับลงบนหนังศีรษะที่เปียก นวดวนเบาๆ ให้ทั่ว 2-3 นาที แล้วล้างออกด้วยน้ำสะอาดก่อนสระผมตามปกติ สัปดาห์ละ 1 ครั้ง',
    ARRAY['ผิวมัน', 'ผิวผสม', 'ทุกสภาพผิว'],
    ARRAY['กระชับรูขุมขน', 'สิว'],
    490.00,
    380.00,
    28,
    ARRAY['/images/products/pink_salt_scalp_scrub.jpg'],
    TRUE
),
(
    'a1000000-0000-0000-0000-000000000029',
    'c1000000-0000-0000-0000-000000000004',
    'Silky Camellia Heat Protection & Gloss Mist',
    'สเปรย์น้ำนมบำรุงเส้นผม ปกป้องเส้นผมจากความร้อนของไดร์และเครื่องหนีบผมได้สูงสุด 230°C เคลือบปิดเกล็ดผม ป้องกันผมชี้ฟูและแสงแดด UV มอบประกายเงางาม นุ่มลื่นหวีง่าย กลิ่นหอมดอกคามิเลียอ่อนหวาน',
    'Camellia Japonica Seed Oil, Silk Amino Acids, Vitamin B5, Thermal Defense Polymers',
    'ฉีดพ่นลงบนผมที่หมาดหรือแห้งก่อนใช้อุปกรณ์ทำความร้อน โดยเว้นระยะห่างประมาณ 15 ซม. ไม่ต้องล้างออก',
    ARRAY['ทุกสภาพผิว'],
    ARRAY['ความชุ่มชื้น'],
    420.00,
    310.00,
    55,
    ARRAY['https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=800&q=80'],
    TRUE
),
(
    'a1000000-0000-0000-0000-000000000030',
    'c1000000-0000-0000-0000-000000000004',
    'Lavender & French Chamomile Sweet Dreams Pillow Mist',
    'สเปรย์อโรมาผ่อนคลายสำหรับฉีดหมอนและเครื่องนอน ผสานน้ำมันหอมระเหยบริสุทธิ์จากดอกลาเวนเดอร์ฝรั่งเศสและคาโมมายล์ ช่วยคลายความเครียดสะสม ให้ความรู้สึกสงบ หลับสบายและหลับสนิทตลอดคืน ปลอดภัย ไร้สารเคมีระคายเคือง',
    'French Lavender Essential Oil, Roman Chamomile Oil, Bergamot Oil, Bergapten-free, Pure Distilled Water',
    'ฉีดพ่นลงบนหมอน ผ้าห่ม หรือบรรยากาศในห้องนอน 2-3 ครั้ง ก่อนเข้านอนประมาณ 5-10 นาที',
    ARRAY['ทุกสภาพผิว'],
    ARRAY['ความชุ่มชื้น'],
    380.00,
    290.00,
    50,
    ARRAY['/images/products/lavender_pillow_mist.jpg'],
    TRUE
),
(
    'a1000000-0000-0000-0000-000000000031',
    'c1000000-0000-0000-0000-000000000004',
    'Botanical Rose & Epsom Bath Salts Spa Soak',
    'เกลือแช่ตัวสปาสูตรผ่อนคลายกล้ามเนื้อ ผสานเกลือเอปซอมบริสุทธิ์และกลีบกุหลาบอบแห้ง ช่วยขับสารพิษ คลายความเมื่อยล้า บำรุงผิวให้นุ่มเนียน เปล่งปลั่ง มอบประสบการณ์ทำสปาชั้นเลิศในบ้านคุณ',
    'Pure Magnesium Sulfate (Epsom Salt), Pink Himalayan Salt, Dried Rose Petals, Jojoba Oil, Rose Geranium Essential Oil',
    'เทเกลือสปา 1-2 กำมือลงในอ่างน้ำอุ่น คนให้ละลาย แล้วลงแช่ตัวผ่อนคลาย 15-20 นาที',
    ARRAY['ทุกสภาพผิว'],
    ARRAY['ความชุ่มชื้น', 'ความกระจ่างใส'],
    450.00,
    350.00,
    32,
    ARRAY['https://images.unsplash.com/photo-1556228852-80b6e5eeff06?auto=format&fit=crop&w=800&q=80'],
    TRUE
),
(
    'a1000000-0000-0000-0000-000000000032',
    'c1000000-0000-0000-0000-000000000004',
    '[Spooky Edition] Midnight Blackberry Bath Bomb & Body Soak',
    'บาธบอมบ์สูตรพิเศษรุ่นฮาโลวีน เปลี่ยนน้ำในอ่างให้กลายเป็นสีม่วงมิดไนท์ประกายดาว กลิ่นหอมหวานลึกลับของแบล็คเบอร์รี่และวานิลลา มอบฟองนุ่มละมุนพร้อมบำรุงผิวให้เนียนนุ่ม ชุ่มชื้นยาวนานตลอดคืน',
    'Sodium Bicarbonate, Citric Acid, Blackberry Seed Oil, Shea Butter, Coconut Oil, Cosmetic Grade Purple Mica',
    'หย่อนบาธบอมบ์ลงในอ่างน้ำอุ่น ชมความสวยงามของการละลายตัวและฟองนุ่ม จากนั้นลงแช่ตัว 15-20 นาทีแล้วล้างออกด้วยน้ำสะอาด',
    ARRAY['ทุกสภาพผิว'],
    ARRAY['ความชุ่มชื้น'],
    290.00,
    199.00,
    24,
    ARRAY['/images/products/blackberry_bath_bomb.jpg'],
    TRUE
)
ON CONFLICT (id) DO NOTHING;
