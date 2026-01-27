-- =====================================================
-- 皮克敏明信片 - 資料庫結構腳本
-- 請在 Supabase Dashboard > SQL Editor 中執行此腳本
-- =====================================================

-- 建立 profiles 表（使用者擴展資訊）
-- 與 Supabase Auth 的 users 表關聯
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,  -- 關聯 auth.users
  username VARCHAR(50),                                              -- 使用者名稱
  avatar TEXT,                                                       -- 頭像網址
  level INTEGER DEFAULT 1,                                           -- 等級
  title VARCHAR(50) DEFAULT '新手探險家',                            -- 稱號
  total_postcards INTEGER DEFAULT 0,                                 -- 收集明信片總數
  total_distance_km DECIMAL(10,2) DEFAULT 0,                        -- 步行總距離（公里）
  created_at TIMESTAMPTZ DEFAULT NOW(),                              -- 建立時間
  updated_at TIMESTAMPTZ DEFAULT NOW()                               -- 更新時間
);

-- 建立 postcards 表（明信片主資料）
-- 存放所有可用的明信片資料
CREATE TABLE IF NOT EXISTS postcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),  -- 明信片 ID
  title VARCHAR(100) NOT NULL,                    -- 標題
  location VARCHAR(100) NOT NULL,                 -- 地點
  country VARCHAR(50) NOT NULL,                   -- 國家
  image_url TEXT NOT NULL,                        -- 圖片網址
  description TEXT,                               -- 描述
  color VARCHAR(20),                              -- 顏色標籤
  is_special BOOLEAN DEFAULT FALSE,               -- 是否為特殊明信片
  category VARCHAR(20) DEFAULT '探險',           -- 分類（蘑菇、探險、花瓣）
  created_at TIMESTAMPTZ DEFAULT NOW()            -- 建立時間
);

-- 建立 user_postcards 表（使用者收集的明信片）
-- 關聯使用者與明信片的中間表
CREATE TABLE IF NOT EXISTS user_postcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),                           -- 紀錄 ID
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,         -- 使用者 ID
  postcard_id UUID NOT NULL REFERENCES postcards(id) ON DELETE CASCADE,    -- 明信片 ID
  collected_date DATE DEFAULT CURRENT_DATE,                                 -- 收集日期
  is_favorite BOOLEAN DEFAULT FALSE,                                        -- 是否為最愛
  sent_to VARCHAR(100),                                                     -- 寄送對象名稱
  created_at TIMESTAMPTZ DEFAULT NOW(),                                     -- 建立時間
  UNIQUE(user_id, postcard_id)                                              -- 確保不重複收集
);

-- 建立 friends 表（好友關係）
-- 儲存使用者之間的好友關係
CREATE TABLE IF NOT EXISTS friends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),                            -- 紀錄 ID
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,          -- 使用者 ID
  friend_id UUID REFERENCES profiles(id) ON DELETE CASCADE,                  -- 好友 ID (可為空，代表手動新增的皮友)
  friend_name VARCHAR(100),                                                  -- 手動新增的好友名稱
  friend_avatar TEXT,                                                        -- 手動新增的好友頭像
  is_favorite BOOLEAN DEFAULT FALSE,                                         -- 是否為最愛好友
  created_at TIMESTAMPTZ DEFAULT NOW(),                                      -- 建立時間
  UNIQUE(user_id, friend_id)                                                 -- 確保系統好友不重複
);

-- 建立 exchange_records 表（明信片交換紀錄）
-- 記錄使用者之間的明信片寄送
CREATE TABLE IF NOT EXISTS exchange_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),                            -- 紀錄 ID
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,        -- 寄件者 ID
  receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,              -- 收件者 ID (可為空)
  receiver_name VARCHAR(100),                                                -- 收件者名稱 (手動標註用)
  postcard_id UUID NOT NULL REFERENCES postcards(id) ON DELETE CASCADE,     -- 明信片 ID
  sent_date TIMESTAMPTZ DEFAULT NOW(),                                       -- 寄送時間
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'delivered', 'claimed')),  -- 狀態
  created_at TIMESTAMPTZ DEFAULT NOW()                                       -- 建立時間
);

-- =====================================================
-- 建立索引加速查詢
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_user_postcards_user_id ON user_postcards(user_id);
CREATE INDEX IF NOT EXISTS idx_user_postcards_postcard_id ON user_postcards(postcard_id);
CREATE INDEX IF NOT EXISTS idx_friends_user_id ON friends(user_id);
CREATE INDEX IF NOT EXISTS idx_exchange_records_sender_id ON exchange_records(sender_id);
CREATE INDEX IF NOT EXISTS idx_exchange_records_receiver_id ON exchange_records(receiver_id);

-- =====================================================
-- 建立觸發器：自動更新 profiles.updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 建立觸發器：新使用者註冊時自動建立 profile
-- =====================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username, avatar)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.raw_user_meta_data->>'avatar'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
