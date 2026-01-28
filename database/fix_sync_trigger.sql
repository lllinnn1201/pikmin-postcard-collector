-- =====================================================
-- 皮克敏明信片收藏館 - 皮友名稱與頭像同步修飾腳本
-- 1. 支援同步更新 friend_name 與 friend_avatar
-- 2. 放寬 exchange_records 同步條件 (不論收件者是否已註冊)
-- =====================================================

CREATE OR REPLACE FUNCTION public.sync_friend_info_update()
RETURNS TRIGGER AS $$
BEGIN
  -- 當名稱或頭像發生變更時進行同步
  IF (OLD.friend_name IS DISTINCT FROM NEW.friend_name) OR 
     (OLD.friend_avatar IS DISTINCT FROM NEW.friend_avatar) THEN
    
    -- 1. 同步更新明信片標記 (user_postcards)
    UPDATE public.user_postcards
    SET sent_to = NEW.friend_name
    WHERE user_id = NEW.user_id AND sent_to = OLD.friend_name;
    
    -- 2. 同步更新交換紀錄 (exchange_records)
    -- 不論 receiver_id 是否為 NULL，只要 sender_id 符合且舊名稱匹配就更新
    -- 這確保了手動輸入或關聯的皮友名稱都能保持一致
    UPDATE public.exchange_records
    SET receiver_name = NEW.friend_name
    WHERE sender_id = NEW.user_id AND receiver_name = OLD.friend_name;

  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 重新綁定觸發器
DROP TRIGGER IF EXISTS on_friend_name_updated ON public.friends;
DROP TRIGGER IF EXISTS on_friend_info_updated ON public.friends;

CREATE TRIGGER on_friend_info_updated
  AFTER UPDATE OF friend_name, friend_avatar ON public.friends
  FOR EACH ROW EXECUTE FUNCTION public.sync_friend_info_update();
