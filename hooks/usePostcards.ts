// 明信片資料 Hook
// 提供明信片的 CRUD 操作

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Postcard } from '../types';

// 從資料庫行轉換為前端 Postcard 型別
const mapRowToPostcard = (row: any, userPostcardRow?: any): Postcard => ({
    id: row.id,
    title: row.title,
    location: row.location,
    country: row.country,
    imageUrl: row.image_url,
    date: userPostcardRow?.collected_date
        ? new Date(userPostcardRow.collected_date).toLocaleDateString('zh-TW', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
        : '',
    description: row.description || '',
    color: row.color || '#3b82f6',
    isSpecial: row.is_special || false,
    isFavorite: userPostcardRow?.is_favorite || false,
    sentTo: userPostcardRow?.sent_to || undefined, // 從資料庫讀取寄送對象
    category: row.category || '探險', // 讀取分類
});

export const usePostcards = () => {
    const { user } = useAuth();                              // 取得當前使用者
    const [postcards, setPostcards] = useState<Postcard[]>([]); // 明信片列表
    const [loading, setLoading] = useState(true);            // 載入中狀態
    const [error, setError] = useState<string | null>(null); // 錯誤訊息

    // 取得使用者收集的明信片
    const fetchPostcards = useCallback(async () => {
        if (!user) {
            setPostcards([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // 查詢使用者收集的明信片，並關聯明信片主資料
            const { data, error: fetchError } = await supabase
                .from('user_postcards')
                .select(`
          id,
          collected_date,
          is_favorite,
          sent_to,
          postcards (
            id,
            title,
            location,
            country,
            image_url,
            description,
            color,
            is_special,
            category
          )
        `)
                .eq('user_id', user.id)
                .order('collected_date', { ascending: false });

            if (fetchError) throw fetchError;

            // 轉換資料格式
            const mappedPostcards = (data || []).map((row: any) =>
                mapRowToPostcard(row.postcards, row)
            );

            setPostcards(mappedPostcards);
        } catch (err: any) {
            setError(err.message);
            console.error('取得明信片失敗:', err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    // 切換收藏狀態
    const toggleFavorite = async (postcardId: string) => {
        if (!user) return;

        // 找到當前明信片
        const postcard = postcards.find(p => p.id === postcardId);
        if (!postcard) return;

        // 樂觀更新 UI
        setPostcards(prev =>
            prev.map(p =>
                p.id === postcardId ? { ...p, isFavorite: !p.isFavorite } : p
            )
        );

        try {
            // 更新資料庫
            const { error: updateError } = await supabase
                .from('user_postcards')
                .update({ is_favorite: !postcard.isFavorite })
                .eq('user_id', user.id)
                .eq('postcard_id', postcardId);

            if (updateError) throw updateError;
        } catch (err: any) {
            // 回滾更新
            setPostcards(prev =>
                prev.map(p =>
                    p.id === postcardId ? { ...p, isFavorite: postcard.isFavorite } : p
                )
            );
            console.error('更新收藏狀態失敗:', err);
        }
    };

    // 收集新明信片
    const collectPostcard = async (postcardId: string) => {
        if (!user) return { error: '請先登入' };

        try {
            const { error: insertError } = await supabase
                .from('user_postcards')
                .insert({
                    user_id: user.id,
                    postcard_id: postcardId,
                    collected_date: new Date().toISOString().split('T')[0],
                });

            if (insertError) throw insertError;

            await fetchPostcards();
            return { error: null };
        } catch (err: any) {
            console.error('收集明信片失敗:', err);
            return { error: err.message };
        }
    };

    // 上傳圖片到 Supabase Storage
    const uploadImage = async (file: File) => {
        if (!user) return { data: null, error: '請先登入' };

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}/${Math.random()}.${fileExt}`;
            const filePath = `postcards/${fileName}`;

            // 上傳檔案
            const { error: uploadError } = await supabase.storage
                .from('postcards')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // 取得公開網址
            const { data: { publicUrl } } = supabase.storage
                .from('postcards')
                .getPublicUrl(filePath);

            return { data: publicUrl, error: null };
        } catch (err: any) {
            console.error('圖片上傳失敗:', err);
            return { data: null, error: err.message };
        }
    };

    // 手動新增明信片（上傳）
    const addPostcard = async (data: {
        title: string;
        location: string;
        country: string;
        imageUrl: string;
        description: string;
        color: string;
        collectedDate: string;
        category: string;
        isSpecial?: boolean;
    }) => {
        if (!user) return { error: '請先登入' };

        try {
            // 1. 先在明信片主表建立資料
            const { data: postcardData, error: postcardError } = await supabase
                .from('postcards')
                .insert({
                    title: data.title,
                    location: data.location,
                    country: data.country,
                    image_url: data.imageUrl,
                    description: data.description,
                    color: data.color,
                    category: data.category,
                    is_special: data.isSpecial || false,
                })
                .select()
                .single();

            if (postcardError) throw postcardError;

            // 2. 在使用者收集表建立關聯
            const { error: userPostcardError } = await supabase
                .from('user_postcards')
                .insert({
                    user_id: user.id,
                    postcard_id: postcardData.id,
                    collected_date: data.collectedDate,
                });

            if (userPostcardError) throw userPostcardError;

            await fetchPostcards();
            return { error: null };
        } catch (err: any) {
            console.error('新增明信片失敗:', err);
            return { error: err.message };
        }
    };

    // 更新或清除寄送紀錄（傳入 null 可清除）
    const updatePostcardSentTo = async (postcardId: string, sentTo: string | null) => {
        if (!user) return { error: '請先登入' };

        // 樂觀更新 UI（null 代表清除）
        setPostcards(prev =>
            prev.map(p =>
                p.id === postcardId ? { ...p, sentTo: sentTo || undefined } : p
            )
        );

        try {
            // 更新資料庫中的寄送紀錄
            const { error: updateError } = await supabase
                .from('user_postcards')
                .update({ sent_to: sentTo })
                .eq('user_id', user.id)
                .eq('postcard_id', postcardId);

            if (updateError) throw updateError;

            // 寄送紀錄已更新至資料庫

            return { error: null };
        } catch (err: any) {
            console.error('更新寄送紀錄失敗:', err);
            return { error: err.message };
        }
    };

    // 刪除明信片（同時刪除 user_postcards 關聯與 postcards 主表）
    const deletePostcard = async (postcardId: string) => {
        if (!user) return { error: '請先登入' };

        try {
            // 1. 從 postcards 主表刪除明信片記錄
            // 注意：由於資料庫設有 ON DELETE CASCADE，這會自動刪除 user_postcards 中的關聯
            // 我們必須先刪除主表（或只刪除主表），因為 RLS 政策依賴 user_postcards 來驗證擁有權
            // 如果先刪除了 user_postcards，就會導致無法驗證擁有權而無法刪除 postcards
            const { error: deletePostcardError } = await supabase
                .from('postcards')
                .delete()
                .eq('id', postcardId);

            if (deletePostcardError) throw deletePostcardError;

            // 本地 UI 同步更新
            setPostcards(prev => prev.filter(p => p.id !== postcardId));

            return { error: null };
        } catch (err: any) {
            console.error('刪除明信片失敗:', err);
            return { error: err.message };
        }
    };

    // 初始載入
    useEffect(() => {
        fetchPostcards();
    }, [fetchPostcards]);

    return {
        postcards,
        loading,
        error,
        fetchPostcards,
        toggleFavorite,
        collectPostcard,
        uploadImage,
        addPostcard,
        updatePostcardSentTo,
        deletePostcard,
    };
};
