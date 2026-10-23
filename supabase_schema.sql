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
    'p1000000-0000-0000-0000-000000000001',
    'c1000000-0000-0000-0000-000000000002',
    'Sora Pink Cloud Hydrating Barrier Serum',
    'เซรั่มกู้ผิวสูตรพรีเมียม เติมความชุ่มชื้นล้ำลึก 8 มิติ ซ่อมแซมเกราะป้องกันผิวที่ถูกทำร้าย เนื้อสัมผัสบางเบาดุจปุยเมฆ ซึมไว ไม่เหนียวเหนอะหนะ ปลอบประโลมผิวอย่างอ่อนโยน',
    'Hyaluronic Acid 8D Complex, Ceramide NP, AP, EOP, Niacinamide 5%, Centella Asiatica Extract, Panthenol (Vitamin B5)',
    'หยดเซรั่ม 2-3 หยดลงบนฝ่ามือ ลูบไล้ให้ทั่วใบหน้าและลำคอเป็นประจำเช้า-เย็น ก่อนทามอยส์เจอไรเซอร์',
    ARRAY['ผิวแห้ง', 'ผิวผสม', 'ผิวแพ้ง่าย', 'ทุกสภาพผิว'],
    ARRAY['ความชุ่มชื้น', 'ริ้วรอย', 'กระชับรูขุมขน'],
    890.00,
    690.00,
    45,
    ARRAY['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1608248597359-5776d655f464?auto=format&fit=crop&w=800&q=80'],
    TRUE
),
(
    'p1000000-0000-0000-0000-000000000002',
    'c1000000-0000-0000-0000-000000000001',
    'Sora Velvet Dew Jelly Lip Tint (สี #03 Sakura Pink)',
    'ลิปทินท์เนื้อเจลลี่ฉ่ำวาว เม็ดสีชัดเจน สัมผัสเบาสบายปาก ให้ริมฝีปากดูอวบอิ่มสุขภาพดี ติดทนนานตลอดวันโดยไม่ทำให้ปากแห้งตึง อุดมด้วยวิตามินอีและน้ำมันโจโจ้บา',
    'Jojoba Seed Oil, Vitamin E, Shea Butter, Rosehip Seed Oil, Sodium Hyaluronate',
    'ทาลงบนริมฝีปากโดยตรงจากกึ่งกลางปากแล้วเกลี่ยออกสู่ขอบปาก สามารถทาซ้ำได้เพื่อเพิ่มความฉ่ำวาว',
    ARRAY['ทุกสภาพผิว'],
    ARRAY['ความชุ่มชื้น'],
    450.00,
    320.00,
    80,
    ARRAY['https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80'],
    TRUE
),
(
    'p1000000-0000-0000-0000-000000000003',
    'c1000000-0000-0000-0000-000000000002',
    'Pastel Glow Niacinamide + Zinc Clarity Solution',
    'เซรั่มลดรอยสิวและคุมมัน จัดการสิวอักเสบและกระชับรูขุมขน ปรับสีผิวให้แลดูกระจ่างใสสม่ำเสมอ ลดรอยดำรอยแดงจากสิวเห็นผลชัดเจนใน 14 วัน',
    'Niacinamide (Vitamin B3) 10%, Zinc PCA 1%, Tea Tree Leaf Extract, Salicylic Acid (BHA 0.5%), Allantoin',
    'ทาบำรุงทั่วใบหน้าตอนเช้าและก่อนนอน เหมาะสำหรับใช้เป็นขั้นตอนแรกของการบำรุงผิวหน้า',
    ARRAY['ผิวมัน', 'ผิวผสม', 'ผิวแพ้ง่าย'],
    ARRAY['สิว', 'ความกระจ่างใส', 'กระชับรูขุมขน'],
    650.00,
    490.00,
    30,
    ARRAY['https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=800&q=80'],
    TRUE
),
(
    'p1000000-0000-0000-0000-000000000004',
    'c1000000-0000-0000-0000-000000000003',
    'Silk Touch Peach & Rose Whipped Body Cream',
    'บอดี้ครีมเนื้อวิปนุ่มฟู มอบความชุ่มชื้นยาวนาน 48 ชั่วโมง ผสานสารสกัดพีชญี่ปุ่นและกุหลาบดามาสค์ กลิ่นหอมหวานละมุนติดทนนาน ผิวเนียนนุ่มเปล่งประกายดุจแพรไหม',
    'Japanese Peach Extract, Damask Rose Floral Water, Shea Butter 15%, Sweet Almond Oil, Collagen Peptide',
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
    'p1000000-0000-0000-0000-000000000005',
    'c1000000-0000-0000-0000-000000000001',
    'Aura Cushion Foundation SPF50+ PA++++ (#01 Vanilla Glow)',
    'คุชชั่นตลับชมพูพาสเทล มอบการปกปิดระดับ Medium to Full ให้งานผิวฉ่ำโกลว์เหมือนสาวเกาหลี คุมมันยาวนาน 12 ชั่วโมง ไม่ดรอประหว่างวัน พร้อมสารบำรุงและกันแดด',
    'Titanium Dioxide, Zinc Oxide, Madecassoside, Adenosine, Pearl Extract, Edelweiss Callus Culture Extract',
    'ใช้พัฟแตะเนื้อคุชชั่นในปริมาณที่พอเหมาะ แล้วค่อยๆ แตะเกลี่ยเบาๆ ให้ทั่วใบหน้าและลำคอ',
    ARRAY['ผิวมัน', 'ผิวผสม', 'ผิวแห้ง'],
    ARRAY['ความกระจ่างใส', 'ริ้วรอย'],
    790.00,
    590.00,
    25,
    ARRAY['https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80'],
    TRUE
),
(
    'p1000000-0000-0000-0000-000000000006',
    'c1000000-0000-0000-0000-000000000002',
    'Blue Calming Cica & Artemisia Soothing Gel',
    'เจลบำรุงผิวสูตรเย็นสีฟ้าพาสเทลจากธรรมชาติ ลดอาการระคายเคือง รอยแดง อาการแสบแดด ปลอบประโลมผิวบอบบางแพ้ง่าย ฟื้นฟูเกราะป้องกันผิวให้แข็งแรง',
    'Centella Asiatica (Cica) Extract 70%, Artemisia Capillaris Extract, Guaiazulene (สีฟ้าธรรมชาติ), Madecassic Acid',
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
    'p1000000-0000-0000-0000-000000000007',
    'c1000000-0000-0000-0000-000000000004',
    'Rose Romance Hair & Scalp Nourishing Elixir',
    'ออยล์เซรั่มบำรุงเส้นผมสูตรไม่เหนอะหนะ ฟื้นฟูผมแห้งเสียแตกปลายจากความร้อนและเคมี มอบผมเงางามนุ่มสลวยพร้อมกลิ่นหอมกุหลาบพาสเทลตลอด 24 ชั่วโมง',
    'Argan Kernel Oil, Camellia Seed Oil, Rose Essential Oil, Meadowfoam Seed Oil, Vitamin E',
    'ชโลม 1-2 ปั๊มลงบนเส้นผมที่หมาดหรือแห้ง โดยเน้นที่บริเวณปลายผม ไม่ต้องล้างออก',
    ARRAY['ทุกสภาพผิว'],
    ARRAY['ความชุ่มชื้น'],
    490.00,
    NULL,
    3, -- สินค้าใกล้หมด สำหรับแสดง Badge แจ้งเตือน
    ARRAY['https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=800&q=80'],
    TRUE
),
(
    'p1000000-0000-0000-0000-000000000008',
    'c1000000-0000-0000-0000-000000000001',
    'Soft Cloud Marshmallow Powder Blush (#02 Cotton Candy)',
    'บลัชออนเนื้อแป้งมาร์ชแมลโลว์ นุ่มละมุน เกลี่ยง่าย เบลอรูขุมขน ให้พวงแก้มอมชมพูระเรื่อเป็นธรรมชาติ สีชัด ติดทนนาน กันน้ำกันเหงื่อ',
    'Mica, Silica, Zinc Stearate, Caprylic/Capric Triglyceride, Prunus Amygdalus Dulcis (Sweet Almond) Oil',
    'ใช้แปรงหรือนิ้วมือแตะเนื้อบลัชออนเบาๆ แล้วปัดลงบนพวงแก้มตามต้องการ',
    ARRAY['ทุกสภาพผิว'],
    ARRAY['ความกระจ่างใส'],
    390.00,
    290.00,
    60,
    ARRAY['https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=800&q=80'],
    TRUE
)
ON CONFLICT (id) DO NOTHING;
