-- =====================================================
-- 修正：當朋友名稱變更時，自動同步更新紀錄中的名稱
-- 請在 Supabase SQL Editor 中執行此腳本
-- =====================================================

-- 1. 處理朋友名稱變更的觸發器函數
CREATE OR REPLACE FUNCTION public.sync_friend_name_update()
RETURNS TRIGGER AS $$
BEGIN
  -- 只有在名稱真的有變動，且是同一個使用者的朋友時才更新
  IF (OLD.friend_name IS DISTINCT FROM NEW.friend_name) AND (OLD.user_id = NEW.user_id) THEN
    
    -- 1.1 同步更新 user_postcards 表中的 sent_to (我的明信片)
    UPDATE public.user_postcards
    SET sent_to = NEW.friend_name
    WHERE user_id = NEW.user_id 
      AND sent_to = OLD.friend_name;
      
    -- 1.2 同步更新 exchange_records 表中的 receiver_name (手動紀錄)
    -- 注意：正式紀錄 (有 receiver_id) 是看 profile，所以這裡主要影響手動紀錄
    UPDATE public.exchange_records
    SET receiver_name = NEW.friend_name
    WHERE sender_id = NEW.user_id 
      AND receiver_name = OLD.friend_name
      AND receiver_id IS NULL; -- 僅針對手動紀錄
      
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. 建立觸發器
DROP TRIGGER IF EXISTS on_friend_name_updated ON public.friends;
CREATE TRIGGER on_friend_name_updated
  AFTER UPDATE OF friend_name ON public.friends
  FOR EACH ROW EXECUTE FUNCTION sync_friend_name_update();

-- 3. 補充說明：由於 exchange_records 對於手動紀錄沒有存 friend_id
-- 如果兩個朋友名稱剛好一樣（雖然不建議，但可能發生），這會導致兩人的紀錄都被更新。
-- 在 schema 演進前，這是目前最穩定的同步方式。
