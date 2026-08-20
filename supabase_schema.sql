-- ===================================================================
-- SUPABASE POSTGRESQL SCHEMA FOR THACO AUTO SALES & QUOTATION PORTAL
-- Tables: B20Customer, B20Vehicle, B20Quotation, B20Deposit
-- ===================================================================

-- 1. BẢNG B20Customer (Quản lý thông tin khách hàng)
CREATE TABLE IF NOT EXISTS public."B20Customer" (
    "CustomerID" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "CustomerCode" TEXT UNIQUE,
    "FullName" TEXT NOT NULL,
    "Phone" TEXT NOT NULL,
    "Email" TEXT,
    "Province" TEXT DEFAULT 'TP. Hồ Chí Minh',
    "Address" TEXT,
    "SalesConsultant" TEXT,
    "Status" TEXT DEFAULT 'Quan tâm', -- 'Quan tâm', 'Đã nhận báo giá', 'Đã cọc 20Tr'
    "CreatedAt" TIMESTAMPTZ DEFAULT now()
);

-- 2. BẢNG B20Vehicle (Danh mục các dòng xe & giá bán THACO)
CREATE TABLE IF NOT EXISTS public."B20Vehicle" (
    "VehicleID" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "VehicleCode" TEXT UNIQUE NOT NULL, -- 'mazda-cx5', 'kia-carnival', 'peugeot-408'
    "Brand" TEXT NOT NULL,              -- 'Mazda', 'Kia', 'Peugeot', 'BMW'
    "ModelName" TEXT NOT NULL,          -- 'Mazda CX-5 2.0L Premium Active'
    "Segment" TEXT,                     -- 'C-SUV 5 Chỗ'
    "Engine" TEXT,                      -- 'SkyActiv-G 2.0L'
    "Seats" INT DEFAULT 5,
    "ListPrice" NUMERIC(18, 0) NOT NULL,
    "DefaultDiscount" NUMERIC(18, 0) DEFAULT 0,
    "Warranty" TEXT DEFAULT '5 năm hoặc 150.000 km',
    "Colors" JSONB DEFAULT '[]'::jsonb,
    "ImageExterior" TEXT,
    "ImageInterior" TEXT,
    "RealPhotos" JSONB DEFAULT '[]'::jsonb,
    "IsActive" BOOLEAN DEFAULT true,
    "CreatedAt" TIMESTAMPTZ DEFAULT now()
);

-- 3. BẢNG B20Quotation (Quản lý các bản báo giá trực tuyến)
CREATE TABLE IF NOT EXISTS public."B20Quotation" (
    "QuoteID" TEXT PRIMARY KEY,         -- 'BG-202601'
    "CustomerID" UUID REFERENCES public."B20Customer"("CustomerID") ON DELETE SET NULL,
    "VehicleID" UUID REFERENCES public."B20Vehicle"("VehicleID") ON DELETE SET NULL,
    "CustomerName" TEXT NOT NULL,
    "CustomerPhone" TEXT NOT NULL,
    "CarName" TEXT NOT NULL,
    "ColorName" TEXT,
    "Province" TEXT,
    "ListPrice" NUMERIC(18, 0) NOT NULL,
    "DiscountAmount" NUMERIC(18, 0) DEFAULT 0,
    "InvoicePrice" NUMERIC(18, 0) NOT NULL,
    "TotalOnTheRoad" NUMERIC(18, 0) NOT NULL,
    "DepositAmount" NUMERIC(18, 0) DEFAULT 20000000,
    "DepositStatus" TEXT DEFAULT 'sent', -- 'sent', 'viewed', 'deposit_received'
    "SalesName" TEXT,
    "SalesPhone" TEXT,
    "Showroom" TEXT,
    "CreatedAt" TIMESTAMPTZ DEFAULT now(),
    "DepositedAt" TIMESTAMPTZ
);

-- 4. BẬT ROW LEVEL SECURITY (RLS) & CẤP QUYỀN TRUY CẬP AN TOÀN CHO WEB
ALTER TABLE public."B20Customer" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."B20Vehicle" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."B20Quotation" ENABLE ROW LEVEL SECURITY;

-- Cho phép đọc / ghi dữ liệu công khai từ Web App (Public Anon Key)
CREATE POLICY "Public Read B20Vehicle" ON public."B20Vehicle" FOR SELECT USING (true);
CREATE POLICY "Public Insert/Update B20Vehicle" ON public."B20Vehicle" FOR ALL USING (true);

CREATE POLICY "Public Read B20Customer" ON public."B20Customer" FOR SELECT USING (true);
CREATE POLICY "Public Insert/Update B20Customer" ON public."B20Customer" FOR ALL USING (true);

CREATE POLICY "Public Read B20Quotation" ON public."B20Quotation" FOR SELECT USING (true);
CREATE POLICY "Public Insert/Update B20Quotation" ON public."B20Quotation" FOR ALL USING (true);

-- 5. CHÈN DỮ LIỆU XE MẪU BAN ĐẦU
INSERT INTO public."B20Vehicle" ("VehicleCode", "Brand", "ModelName", "Segment", "Engine", "Seats", "ListPrice", "DefaultDiscount", "Warranty", "ImageExterior", "ImageInterior", "Colors")
VALUES 
(
  'mazda-cx5', 
  'Mazda', 
  'Mazda CX-5 2.0L Premium Active', 
  'C-SUV 5 Chỗ', 
  'SkyActiv-G 2.0L (154 Hp / 200 Nm)', 
  5, 
  829000000, 
  30000000, 
  '5 năm hoặc 150.000 km', 
  'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80',
  '[{"id":"soul-red","name":"Đỏ Pha Lê (Soul Red)","hex":"#b31010","extraFee":8000000},{"id":"snowflake-white","name":"Trắng Ngọc Trai","hex":"#f3f4f6","extraFee":4000000}]'::jsonb
),
(
  'kia-carnival', 
  'Kia', 
  'Kia Carnival 2.2D Signature (7 Chỗ)', 
  'SUV Đô Thị Cỡ Lớn', 
  'Smartstream D2.2L Diesel (199 Hp)', 
  7, 
  1389000000, 
  20000000, 
  '5 năm không giới hạn km', 
  'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80',
  '[{"id":"aurora-black","name":"Đen Ánh Kim","hex":"#18181b","extraFee":0},{"id":"glacier-white","name":"Trắng Tuyết","hex":"#fafafa","extraFee":0}]'::jsonb
),
(
  'peugeot-408', 
  'Peugeot', 
  'Peugeot 408 GT 1.6L Turbo', 
  'C-SUV Coupe', 
  '1.6L Turbo PureTech (218 Hp)', 
  5, 
  1269000000, 
  25000000, 
  '5 năm chính hãng', 
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80',
  '[{"id":"obsidian-black","name":"Đen Obsidian","hex":"#09090b","extraFee":0},{"id":"elixir-red","name":"Đỏ Elixir","hex":"#991b1b","extraFee":5000000}]'::jsonb
)
ON CONFLICT ("VehicleCode") DO NOTHING;
