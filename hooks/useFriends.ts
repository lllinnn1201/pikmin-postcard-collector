// 皮友資料 Hook
// 提供皮友列表的讀取與操作

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { usePostcards } from './usePostcards';
import { useExchangeRecords } from './useExchangeRecords';
import { Friend } from '../types';

// 從資料庫行轉換為前端 Friend 型別
const mapRowToFriend = (row: any): Friend => {
    // 優先使用系統 Profile（如果是系統內的小皮友）
    if (row.friend_profile) {
        return {
            id: row.id, // 關鍵：使用關係紀錄的 ID
            name: row.friend_profile.username || '未命名使用者',
            lastActive: '最近活躍',
            avatar: row.friend_profile.avatar || 'https://via.placeholder.com/100',
            recentSent: [],
            isFavorite: row.is_favorite || false,
        };
    }
    // 若無 Profile，則使用手動新增的資訊（皮友）
    return {
        id: row.id,
        name: row.friend_name || '未命名皮友',
        lastActive: '皮友', // 統一顯示為皮友
        avatar: row.friend_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(row.friend_name || 'P')}&background=random&color=fff`,
        recentSent: [],
        isFavorite: row.is_favorite || false,
    };
};

export const useFriends = () => {
    const { user } = useAuth();                            // 取得當前使用者
    const { fetchPostcards } = usePostcards();             // 取得明信片刷新函式
    const { fetchRecords } = useExchangeRecords();         // 取得紀錄刷新函式
    const [friends, setFriends] = useState<Friend[]>([]);  // 皮友列表
    const [loading, setLoading] = useState(true);          // 載入中狀態
    const [error, setError] = useState<string | null>(null); // 錯誤訊息

    // 取得皮友列表
    const fetchFriends = useCallback(async () => {
        if (!user) {
            setFriends([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // 查詢皮友關係，並關聯皮友的 profile
            const { data, error: fetchError } = await supabase
                .from('friends')
                .select(`
          id,
          is_favorite,
          friend_name,
          friend_avatar,
          friend_profile:profiles!friends_friend_id_fkey (
            id,
            username,
            avatar
          )
        `)
                .eq('user_id', user.id);

            if (fetchError) throw fetchError;

            // 取得每位皮友最近收到的明信片
            const friendsWithRecent = await Promise.all(
                (data || []).map(async (row: any) => {
                    const friend = mapRowToFriend(row);

                    // 查詢最近寄給這位皮友的明信片
                    const { data: recentData } = await supabase
                        .from('exchange_records')
                        .select(`
              postcards (
                image_url
              )
            `)
                        .eq('sender_id', user.id)
                        .eq('receiver_id', friend.id)
                        .order('sent_date', { ascending: false })
                        .limit(3);

                    friend.recentSent = (recentData || [])
                        .map((r: any) => r.postcards?.image_url)
                        .filter(Boolean);

                    return friend;
                })
            );

            setFriends(friendsWithRecent);
        } catch (err: any) {
            setError(err.message);
            console.error('取得皮友列表失敗:', err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    // 切換皮友收藏狀態
    const toggleFavoriteFriend = async (friendId: string) => {
        if (!user) return;

        const friend = friends.find(f => f.id === friendId);
        if (!friend) return;

        // 樂觀更新 UI
        setFriends(prev =>
            prev.map(f =>
                f.id === friendId ? { ...f, isFavorite: !f.isFavorite } : f
            )
        );

        try {
            // 使用記錄的 id 欄位（不是 friend_id）來更新收藏狀態
            const { error: updateError } = await supabase
                .from('friends')
                .update({ is_favorite: !friend.isFavorite })
                .eq('user_id', user.id)
                .eq('id', friendId);

            if (updateError) throw updateError;
        } catch (err: any) {
            // 回滾更新
            setFriends(prev =>
                prev.map(f =>
                    f.id === friendId ? { ...f, isFavorite: friend.isFavorite } : f
                )
            );
            console.error('更新皮友收藏狀態失敗:', err);
        }
    };

    // 手動建立皮友（皮友）
    const createFriend = async (name: string) => {
        if (!user) return { error: '請先登入' };

        try {
            // 直接在 friends 表插入手動皮友資料，不需關聯到 profiles (friend_id 可為 null)
            const { error: friendError } = await supabase
                .from('friends')
                .insert({
                    user_id: user.id,
                    friend_name: name,
                    friend_avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=7dd3fc&color=fff&bold=true`
                });

            if (friendError) throw friendError;

            await fetchFriends();
            return { error: null };
        } catch (err: any) {
            console.error('建立皮友失敗:', err);
            return { error: err.message };
        }
    };

    // 刪除皮友
    const deleteFriend = async (friendId: string) => {
        if (!user) return { error: '請先登入' };

        try {
            const { error: deleteError } = await supabase
                .from('friends')
                .delete()
                .eq('user_id', user.id)
                .eq('id', friendId); // 這裡使用規律的 ID 刪除

            if (deleteError) throw deleteError;

            await fetchFriends();
            return { error: null };
        } catch (err: any) {
            console.error('刪除皮友失敗:', err);
            return { error: err.message };
        }
    };

    // 更新皮友名稱
    const updateFriendName = async (friendId: string, newName: string) => {
        if (!user) return { error: '請先登入' };
        if (!newName.trim()) return { error: '名稱不能為空' };

        // 樂觀更新 UI
        setFriends(prev =>
            prev.map(f =>
                f.id === friendId ? { ...f, name: newName.trim() } : f
            )
        );

        try {
            const { error: updateError } = await supabase
                .from('friends')
                .update({ friend_name: newName.trim() })
                .eq('user_id', user.id)
                .eq('id', friendId);

            if (updateError) throw updateError;

            // 更新成功後，刷新明信片與交換紀錄，確保各頁面名稱同步顯示
            fetchPostcards();
            fetchRecords();

            return { error: null };
        } catch (err: any) {
            // 回滾更新：重新取得資料
            await fetchFriends();
            console.error('更新皮友名稱失敗:', err);
            return { error: err.message };
        }
    };

    // 更新皮友頭像
    const updateFriendAvatar = async (friendId: string, file: File) => {
        if (!user) return { error: '請先登入' }; // 檢查登入狀態

        try {
            // 產生唯一的檔案名稱（使用時間戳 + 隨機數）
            const fileExt = file.name.split('.').pop(); // 取得副檔名
            const fileName = `${user.id}/${friendId}_${Date.now()}.${fileExt}`; // 組合檔案路徑

            // 上傳圖片至 Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('friend-avatars') // Storage bucket 名稱
                .upload(fileName, file, {
                    cacheControl: '3600', // 快取 1 小時
                    upsert: true, // 如果檔案已存在則覆蓋
                });

            if (uploadError) throw uploadError; // 上傳失敗時拋出錯誤

            // 取得圖片公開 URL
            const { data: publicUrlData } = supabase.storage
                .from('friend-avatars')
                .getPublicUrl(fileName);

            const avatarUrl = publicUrlData.publicUrl; // 取得公開 URL

            // 樂觀更新 UI
            setFriends(prev =>
                prev.map(f =>
                    f.id === friendId ? { ...f, avatar: avatarUrl } : f
                )
            );

            // 更新資料庫中的頭像欄位
            const { error: updateError } = await supabase
                .from('friends')
                .update({ friend_avatar: avatarUrl })
                .eq('user_id', user.id)
                .eq('id', friendId);

            if (updateError) throw updateError; // 更新失敗時拋出錯誤

            // 更新成功後，刷新明信片與交換紀錄，確保各頁面頭像同步顯示
            fetchPostcards();
            fetchRecords();

            return { error: null }; // 成功
        } catch (err: any) {
            // 回滾更新：重新取得資料
            await fetchFriends();
            console.error('更新皮友頭像失敗:', err);
            return { error: err.message }; // 回傳錯誤訊息
        }
    };

    // 恢復預設頭像
    const resetFriendAvatar = async (friendId: string) => {
        if (!user) return { error: '請先登入' }; // 檢查登入狀態

        try {
            // 取得目前皮友的資料，用於生成預設頭像（如果需要的話）
            const friend = friends.find(f => f.id === friendId);
            if (!friend) throw new Error('找不到該皮友');

            // 產預設頭像 URL (ui-avatars)
            const defaultAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(friend.name)}&background=7dd3fc&color=fff&bold=true`;

            // 樂觀更新 UI
            setFriends(prev =>
                prev.map(f =>
                    f.id === friendId ? { ...f, avatar: defaultAvatarUrl } : f
                )
            );

            // 更新資料庫中的頭像欄位為 NULL
            const { error: updateError } = await supabase
                .from('friends')
                .update({ friend_avatar: null })
                .eq('user_id', user.id)
                .eq('id', friendId);

            if (updateError) throw updateError; // 更新失敗時拋出錯誤

            return { error: null }; // 成功
        } catch (err: any) {
            // 回滾更新：重新取得資料
            await fetchFriends();
            console.error('恢復預設頭像失敗:', err);
            return { error: err.message }; // 回傳錯誤訊息
        }
    };

    // 初始載入
    useEffect(() => {
        fetchFriends();
    }, [fetchFriends]);

    return {
        friends,
        loading,
        error,
        fetchFriends,
        toggleFavoriteFriend,
        addFriend: createFriend, // 將舊的 addFriend 映射到新的 createFriend 以維持相容性或修復 lint
        createFriend,
        deleteFriend,
        updateFriendName,
        updateFriendAvatar, // 新增：更新好友頭像
        resetFriendAvatar, // 新增：恢復預設頭像
    };
};
