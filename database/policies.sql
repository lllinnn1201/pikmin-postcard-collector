-- =====================================================
-- 皮克敏明信片收藏館 - Row Level Security 政策
-- 請在執行 schema.sql 後執行此腳本
-- =====================================================

-- 啟用 RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE postcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_postcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE exchange_records ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- profiles 表政策
-- =====================================================

-- 使用者可以讀取所有 profile（用於顯示好友資訊）
CREATE POLICY "所有人可讀取 profiles"
  ON profiles FOR SELECT
  USING (true);

-- 使用者只能更新自己的 profile
CREATE POLICY "使用者可更新自己的 profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- =====================================================
-- postcards 表政策
-- =====================================================

-- 所有人可讀取明信片主資料
CREATE POLICY "所有人可讀取 postcards"
  ON postcards FOR SELECT
  USING (true);

-- =====================================================
-- user_postcards 表政策
-- =====================================================

-- 使用者可讀取自己收集的明信片
CREATE POLICY "使用者可讀取自己的 user_postcards"
  ON user_postcards FOR SELECT
  USING (auth.uid() = user_id);

-- 使用者可新增自己的明信片收集紀錄
CREATE POLICY "使用者可新增自己的 user_postcards"
  ON user_postcards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 使用者可更新自己的明信片收集紀錄
CREATE POLICY "使用者可更新自己的 user_postcards"
  ON user_postcards FOR UPDATE
  USING (auth.uid() = user_id);

-- =====================================================
-- friends 表政策
-- =====================================================

-- 使用者可讀取與自己相關的好友關係
CREATE POLICY "使用者可讀取自己的 friends"
  ON friends FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- 使用者可新增好友
CREATE POLICY "使用者可新增 friends"
  ON friends FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 使用者可更新自己的好友設定
CREATE POLICY "使用者可更新自己的 friends"
  ON friends FOR UPDATE
  USING (auth.uid() = user_id);

-- 使用者可刪除自己的好友
CREATE POLICY "使用者可刪除自己的 friends"
  ON friends FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- exchange_records 表政策
-- =====================================================

-- 使用者可讀取與自己相關的交換紀錄
CREATE POLICY "使用者可讀取自己的 exchange_records"
  ON exchange_records FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- 使用者可新增寄送紀錄
CREATE POLICY "使用者可新增 exchange_records"
  ON exchange_records FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- 收件者可更新紀錄狀態（例如標記為已領取）
CREATE POLICY "收件者可更新 exchange_records 狀態"
  ON exchange_records FOR UPDATE
  USING (auth.uid() = receiver_id);
