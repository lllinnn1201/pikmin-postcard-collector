// 個人檔案 Hook
// 提供使用者個人資料的讀取與更新

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

// 個人檔案型別定義
export interface Profile {
    id: string;
    username: string;
    avatarUrl: string;
}

// 從資料庫行轉換為前端 Profile 型別
const mapRowToProfile = (row: any): Profile => ({
    id: row.id,
    username: row.username || '未命名使用者',
    avatarUrl: row.avatar || 'https://via.placeholder.com/100',
});

export const useProfile = () => {
    const { user, signOut } = useAuth(); // 取得當前使用者與登出方法
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 取得個人檔案
    const fetchProfile = useCallback(async () => {
        if (!user) {
            setProfile(null);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // 查詢 profiles 資料表
            const { data, error: fetchError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (fetchError) {
                // PGRST116 代表查無此資料 (JSON object not found)
                // 這通常發生在後端手動刪除了該列資料，但前端仍有 Session 的情況
                if (fetchError.code === 'PGRST116') {
                    console.warn('偵測到帳號存在但查無個人檔案資料，執行強制登出...');
                    await signOut();
                    return;
                }
                throw fetchError;
            }

            setProfile(mapRowToProfile(data));
        } catch (err: any) {
            setError(err.message);
            console.error('取得個人檔案失敗:', err);
        } finally {
            setLoading(false);
        }
    }, [user, signOut]);

    // 更新個人檔案
    const updateProfile = async (updates: Partial<{
        username: string;
        avatarUrl: string;
    }>) => {
        if (!user) return { error: '請先登入' };

        try {
            const updateData: Record<string, any> = {};
            if (updates.username !== undefined) updateData.username = updates.username;
            if (updates.avatarUrl !== undefined) updateData.avatar = updates.avatarUrl;

            const { error: updateError } = await supabase
                .from('profiles')
                .update(updateData)
                .eq('id', user.id);

            if (updateError) throw updateError;

            await fetchProfile();
            return { error: null };
        } catch (err: any) {
            console.error('更新個人檔案失敗:', err);
            return { error: err.message };
        }
    };

    // 取得使用者收集的明信片數量（即時計算）
    const fetchPostcardCount = useCallback(async () => {
        if (!user) return 0;

        try {
            const { count, error: countError } = await supabase
                .from('user_postcards')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id);

            if (countError) throw countError;
            return count || 0;
        } catch (err) {
            console.error('取得明信片數量失敗:', err);
            return 0;
        }
    }, [user]);

    // 初始載入
    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    return {
        profile,
        loading,
        error,
        fetchProfile,
        updateProfile,
        fetchPostcardCount,
    };
};
