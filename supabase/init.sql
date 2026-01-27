-- =====================================================
-- 皮克敏明信片收藏館 - 資料庫初始化腳本 (強力修正版)
-- 請在 Supabase Dashboard > SQL Editor 中執行此腳本
-- =====================================================

-- 1. 建立用戶表 (profiles)
-- 如果表已存在，確保欄位長度足夠
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT,  -- 改用 TEXT 避免長度限制
  avatar_url TEXT,  -- 修正為 avatar_url
  level INTEGER DEFAULT 1,
  title TEXT DEFAULT '新手探險家',
  total_postcards INTEGER DEFAULT 0,
  total_distance_km DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 建立明信片表 (postcards)
CREATE TABLE IF NOT EXISTS public.postcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(100) NOT NULL,
  location VARCHAR(100) NOT NULL,
  country VARCHAR(50) NOT NULL,
  image_url TEXT NOT NULL,
  description TEXT,
  color VARCHAR(20),
  is_special BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 建立使用者收集的明信片表
CREATE TABLE IF NOT EXISTS public.user_postcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  postcard_id UUID NOT NULL REFERENCES public.postcards(id) ON DELETE CASCADE,
  collected_date DATE DEFAULT CURRENT_DATE,
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, postcard_id)
);

-- 4. 建立好友表
CREATE TABLE IF NOT EXISTS public.friends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

-- 5. 建立交換紀錄表
CREATE TABLE IF NOT EXISTS public.exchange_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  postcard_id UUID NOT NULL REFERENCES public.postcards(id) ON DELETE CASCADE,
  sent_date TIMESTAMPTZ DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'delivered', 'claimed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 建立觸發器：新使用者註冊時自動建立 profile
-- =====================================================

-- 先清除舊的設定
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 建立強效版函數
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- 使用安全區塊，確保即使 Profile 建立失敗，也不會阻斷註冊
  BEGIN
    INSERT INTO public.profiles (id, username, avatar_url) -- 修正為 avatar_url
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'name', NEW.email, '新探險家'),
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCboh9WESKwZgvfzf33uSYeROw1bvUS-5NehHRBIjg0Ah2aZfOIqWADP8H0iLbWopRRk6yPavu340tgduA1V2_Ub1tkEVkkJRtCogugdqg0X-0_kAyRdNkSAVs2j8xVYvsx07IKKwdbwIy38HRuuQCPR7Xru-JB-0dllK9Gr4ybZ7ozkzoj4Ukejq63zxgZqoXtcNtOcWfCTD-oFpd-oXKea1EOr5Gj8aIv1yolOVs1mcmxjNWtpjT6h-fuSlLJaME2GR16v-t0C4Rw'
    );
  EXCEPTION WHEN OTHERS THEN
    -- 記錄錯誤（在 Postgres Log 中可以看到）
    RAISE WARNING '無法為使用者 % 建立 Profile: %', NEW.id, SQLERRM;
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 重新啟用觸發器
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 啟用 RLS 並設定政策
-- =====================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.postcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_postcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exchange_records ENABLE ROW LEVEL SECURITY;

-- 清除舊政策並重建
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "所有人可讀取 profiles" ON public.profiles;
    CREATE POLICY "所有人可讀取 profiles" ON public.profiles FOR SELECT USING (true);
    
    DROP POLICY IF EXISTS "使用者可更新自己的 profile" ON public.profiles;
    CREATE POLICY "使用者可更新自己的 profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

    DROP POLICY IF EXISTS "所有人可讀取 postcards" ON public.postcards;
    CREATE POLICY "所有人可讀取 postcards" ON public.postcards FOR SELECT USING (true);

    DROP POLICY IF EXISTS "使用者可讀取自己的 user_postcards" ON public.user_postcards;
    CREATE POLICY "使用者可讀取自己的 user_postcards" ON public.user_postcards FOR SELECT USING (auth.uid() = user_id);

    DROP POLICY IF EXISTS "使用者可新增自己的 user_postcards" ON public.user_postcards;
    CREATE POLICY "使用者可新增自己的 user_postcards" ON public.user_postcards FOR INSERT WITH CHECK (auth.uid() = user_id);

    DROP POLICY IF EXISTS "使用者可更新自己的 user_postcards" ON public.user_postcards;
    CREATE POLICY "使用者可更新自己的 user_postcards" ON public.user_postcards FOR UPDATE USING (auth.uid() = user_id);
END $$;

-- (其餘好友與交換紀錄政策比照辦理...)

-- =====================================================
-- 注意：預設明信片資料已移除，使用者可自行上傳
-- =====================================================
