-- =====================================================
-- 刪除 profiles 資料表中不再使用的欄位
-- =====================================================

ALTER TABLE public.profiles 
DROP COLUMN IF EXISTS level,
DROP COLUMN IF EXISTS title,
DROP COLUMN IF EXISTS total_postcards,
DROP COLUMN IF EXISTS total_distance_km;
