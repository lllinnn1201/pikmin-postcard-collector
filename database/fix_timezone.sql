-- =====================================================
-- 皮克敏明信片收藏館 - 時區修正腳本
-- 執行此腳本可將資料庫時區設定為台北時間 (UTC+8)
-- 這會影響 Dashboard 顯示、SQL 查詢結果以及 DEFAULT CURRENT_DATE
-- =====================================================

-- 1. 將資料庫時區設定為台北時間 (UTC+8)
ALTER DATABASE postgres SET timezone TO 'Asia/Taipei';

-- 2. 設定 postgres 角色的時區（立即生效於 Dashboard）
ALTER ROLE postgres SET timezone TO 'Asia/Taipei';

-- 3. 驗證當前時間
-- 執行後請確認 current_time_with_timezone 的字尾應為 +08
SELECT 
    now() as current_time_with_timezone, 
    current_date as db_current_date,
    current_setting('timezone') as current_timezone_setting;
