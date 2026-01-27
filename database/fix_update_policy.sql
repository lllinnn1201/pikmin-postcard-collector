-- =====================================================
-- 修正：新增允許使用者更新明信片的 RLS 政策
-- 請在 Supabase SQL Editor 中執行此腳本
-- =====================================================

-- 1. 先移除舊的政策（如果有）以避免衝突
DROP POLICY IF EXISTS "使用者可更新自己的 postcards" ON postcards;

-- 2. 建立新政策
-- 允許使用者更新自己已收集的明信片 (透過 user_postcards 表檢查擁有權)
CREATE POLICY "使用者可更新自己的 postcards"
  ON postcards FOR UPDATE
  USING (
    id IN (
      SELECT postcard_id 
      FROM user_postcards 
      WHERE user_id = auth.uid()
    )
  );
