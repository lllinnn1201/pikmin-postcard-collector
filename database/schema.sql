-- =====================================================
-- 皮克敏明信片收藏館 - 最終整合腳本 (資料庫 + 儲存空間)
-- =====================================================

-- 1. 建立/更新基礎資料表 (Profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT, 
  avatar TEXT, 
  level INTEGER DEFAULT 1,
  title TEXT DEFAULT '新手探險家', 
  total_postcards INTEGER DEFAULT 0,
  total_distance_km DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(), 
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 建立/更新明信片資料表 (Postcards)
CREATE TABLE IF NOT EXISTS public.postcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(100) NOT NULL, 
  location VARCHAR(100) NOT NULL,
  country VARCHAR(50) NOT NULL, 
  image_url TEXT NOT NULL,
  description TEXT, 
  color VARCHAR(20), 
  is_special BOOLEAN DEFAULT FALSE,
  category VARCHAR(20) DEFAULT '探險',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 建立/更新使用者收集表 (User Postcards)
CREATE TABLE IF NOT EXISTS public.user_postcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  postcard_id UUID NOT NULL REFERENCES postcards(id) ON DELETE CASCADE,
  collected_date DATE DEFAULT CURRENT_DATE, 
  is_favorite BOOLEAN DEFAULT FALSE,
  sent_to VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(), 
  UNIQUE(user_id, postcard_id)
);

-- 4. 建立/更新好友表 (Friends)
CREATE TABLE IF NOT EXISTS public.friends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  friend_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  friend_name VARCHAR(100),
  friend_avatar TEXT,
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

-- 5. 建立/更新交換紀錄表 (Exchange Records)
CREATE TABLE IF NOT EXISTS public.exchange_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_name VARCHAR(100),
  postcard_id UUID NOT NULL REFERENCES postcards(id) ON DELETE CASCADE,
  sent_date TIMESTAMPTZ DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'delivered', 'claimed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. 強制補齊欄位與修正約束 (防止舊版本缺漏)
ALTER TABLE public.postcards ADD COLUMN IF NOT EXISTS category VARCHAR(20) DEFAULT '探險';
ALTER TABLE public.user_postcards ADD COLUMN IF NOT EXISTS sent_to VARCHAR(100);
ALTER TABLE public.friends ALTER COLUMN friend_id DROP NOT NULL;
ALTER TABLE public.friends ADD COLUMN IF NOT EXISTS friend_name VARCHAR(100);
ALTER TABLE public.friends ADD COLUMN IF NOT EXISTS friend_avatar TEXT;
ALTER TABLE public.exchange_records ALTER COLUMN receiver_id DROP NOT NULL;
ALTER TABLE public.exchange_records ADD COLUMN IF NOT EXISTS receiver_name VARCHAR(100);

-- 7. 建立儲存桶 (Storage Buckets)
INSERT INTO storage.buckets (id, name, public)
VALUES ('friend-avatars', 'friend-avatars', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public)
VALUES ('postcards', 'postcards', true)
ON CONFLICT (id) DO NOTHING;

-- 8. 啟用 RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.postcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_postcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exchange_records ENABLE ROW LEVEL SECURITY;

-- 9. 設定資料表安全政策 (RLS Policies)
-- Profiles: 所有人可見，本人可改
DROP POLICY IF EXISTS "所有人可讀取 profiles" ON public.profiles;
CREATE POLICY "所有人可讀取 profiles" ON public.profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "使用者可更新自己的 profile" ON public.profiles;
CREATE POLICY "使用者可更新自己的 profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Postcards: 所有人可讀，所有人可新增 (自定義明信片)
DROP POLICY IF EXISTS "所有人可讀取 postcards" ON public.postcards;
CREATE POLICY "所有人可讀取 postcards" ON public.postcards FOR SELECT USING (true);
DROP POLICY IF EXISTS "登入使用者可新增 postcards" ON public.postcards;
CREATE POLICY "登入使用者可新增 postcards" ON public.postcards FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- User Postcards & Friends: 僅限本人操作
DROP POLICY IF EXISTS "使用者可操作自己的 user_postcards" ON public.user_postcards;
CREATE POLICY "使用者可操作自己的 user_postcards" ON public.user_postcards FOR ALL USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "使用者可操作自己的 friends" ON public.friends;
CREATE POLICY "使用者可操作自己的 friends" ON public.friends FOR ALL USING (auth.uid() = user_id);

-- Exchange Records: 寄件者與收件者可見
DROP POLICY IF EXISTS "使用者可操作自己的 exchange_records" ON public.exchange_records;
CREATE POLICY "使用者可操作自己的 exchange_records" ON public.exchange_records FOR ALL USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- 10. 設定儲存空間安全政策 (Storage Policies)
-- 好友頭像 (friend-avatars)
DROP POLICY IF EXISTS "所有人可讀取好友頭像" ON storage.objects;
CREATE POLICY "所有人可讀取好友頭像" ON storage.objects FOR SELECT USING (bucket_id = 'friend-avatars');
DROP POLICY IF EXISTS "使用者可管理自己的好友頭像" ON storage.objects;
CREATE POLICY "使用者可管理自己的好友頭像" ON storage.objects FOR ALL USING (bucket_id = 'friend-avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
-- 明信片圖片 (postcards)
DROP POLICY IF EXISTS "所有人可讀取明信片圖片" ON storage.objects;
CREATE POLICY "所有人可讀取明信片圖片" ON storage.objects FOR SELECT USING (bucket_id = 'postcards');
DROP POLICY IF EXISTS "使用者可管理自己的明信片圖片" ON storage.objects;
CREATE POLICY "使用者可管理自己的明信片圖片" ON storage.objects FOR ALL USING (bucket_id = 'postcards' AND (storage.foldername(name))[1] = auth.uid()::text);

-- 11. 自動 Profile 觸發器
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- 建立新使用者時，自動從 meta_data 或 email 中提取資訊
  -- 如果 email 結尾是 @pikmin.internal，則去除該後綴作為初始用戶名
  INSERT INTO public.profiles (id, username, avatar)
  VALUES (
    NEW.id, 
    COALESCE(
      NEW.raw_user_meta_data->>'name', 
      CASE 
        WHEN NEW.email LIKE '%@pikmin.internal' THEN SPLIT_PART(NEW.email, '@', 1)
        ELSE NEW.email
      END,
      '新探險家'
    ), 
    COALESCE(NEW.raw_user_meta_data->>'avatar', 'https://via.placeholder.com/150')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
