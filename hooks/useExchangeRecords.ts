// 交換紀錄 Hook
// 提供明信片寄送紀錄的讀取與操作

import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { ExchangeRecord } from '../types';

// 按好友分組的紀錄介面（與 RecordsView 相容）
export interface GroupedRecord {
    friendId: string;
    friendName: string;
    friendAvatar: string;
    postcards: {
        id: string;
        title: string;
        imageUrl: string;
        date: string;
    }[];
    isFavorite?: boolean; // 好友收藏狀態（可選）
}

// 從資料庫行轉換為前端 ExchangeRecord 型別
const mapRowToExchangeRecord = (row: any, userId: string): ExchangeRecord => {
    const isSender = row.sender_id === userId;
    return {
        id: row.id,
        friendId: isSender ? row.receiver_profile.id : row.sender_profile.id,
        friendName: isSender ? row.receiver_profile.username : row.sender_profile.username,
        friendAvatar: isSender ? row.receiver_profile.avatar : row.sender_profile.avatar,
        date: new Date(row.sent_date).toLocaleDateString('zh-TW', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }),
        postcardTitle: row.postcards.title,
        postcardImageUrl: row.postcards.image_url,
        type: isSender ? 'sent' : 'received',
        status: row.status as 'pending' | 'delivered' | 'claimed',
    };
};

export const useExchangeRecords = () => {
    const { user } = useAuth();
    const [records, setRecords] = useState<ExchangeRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 取得交換紀錄
    const fetchRecords = useCallback(async () => {
        if (!user) {
            setRecords([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // 查詢與當前使用者相關的交換紀錄
            const { data, error: fetchError } = await supabase
                .from('exchange_records')
                .select(`
                    id,
                    sender_id,
                    receiver_id,
                    sent_date,
                    status,
                    postcards (
                        id,
                        title,
                        image_url
                    ),
                    sender_profile:profiles!exchange_records_sender_id_fkey (
                        id,
                        username,
                        avatar
                    ),
                    receiver_profile:profiles!exchange_records_receiver_id_fkey (
                        id,
                        username,
                        avatar
                    )
                `)
                .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
                .order('sent_date', { ascending: false });

            if (fetchError) throw fetchError;

            // --- 整合手動標註的紀錄 (user_postcards.sent_to) ---
            const { data: manualData, error: manualError } = await supabase
                .from('user_postcards')
                .select(`
                    id,
                    sent_to,
                    collected_date,
                    postcards (
                        id,
                        title,
                        image_url
                    )
                `)
                .eq('user_id', user.id)
                .not('sent_to', 'is', null);

            if (manualError) throw manualError;

            // 轉換正式紀錄
            const formalRecords = (data || []).map((row: any) =>
                mapRowToExchangeRecord(row, user.id)
            );

            // 轉換手動標註紀錄為 ExchangeRecord 格式
            const manualRecords: ExchangeRecord[] = (manualData || []).map((row: any) => ({
                id: row.id,
                friendId: `manual-${row.sent_to}`, // 使用名稱作為虛擬 ID
                friendName: row.sent_to,
                friendAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(row.sent_to)}&background=7dd3fc&color=fff&bold=true`, // 使用簡潔的縮寫頭像
                date: new Date(row.collected_date).toLocaleDateString('zh-TW', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                }),
                postcardTitle: row.postcards.title,
                postcardImageUrl: row.postcards.image_url,
                type: 'sent',
                status: 'delivered',
            }));

            // 合併並排序
            setRecords([...formalRecords, ...manualRecords].sort((a, b) =>
                new Date(b.date).getTime() - new Date(a.date).getTime()
            ));
        } catch (err: any) {
            setError(err.message);
            console.error('取得交換紀錄失敗:', err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    // 按好友分組的紀錄（僅顯示寄出的）
    const groupedRecords = useMemo((): GroupedRecord[] => {
        const groups: Record<string, GroupedRecord> = {};

        records
            .filter(r => r.type === 'sent')
            .forEach(record => {
                if (!groups[record.friendId]) {
                    groups[record.friendId] = {
                        friendId: record.friendId,
                        friendName: record.friendName,
                        friendAvatar: record.friendAvatar,
                        postcards: [],
                    };
                }
                groups[record.friendId].postcards.push({
                    id: record.id,
                    title: record.postcardTitle,
                    imageUrl: record.postcardImageUrl,
                    date: record.date,
                });
            });

        return Object.values(groups);
    }, [records]);

    // 寄送明信片
    const sendPostcard = async (receiverId: string, postcardId: string) => {
        if (!user) return { error: '請先登入' };

        try {
            const { error: insertError } = await supabase
                .from('exchange_records')
                .insert({
                    sender_id: user.id,
                    receiver_id: receiverId,
                    postcard_id: postcardId,
                    status: 'pending',
                });

            if (insertError) throw insertError;
            await fetchRecords();
            return { error: null };
        } catch (err: any) {
            console.error('寄送明信片失敗:', err);
            return { error: err.message };
        }
    };

    // 初始載入
    useEffect(() => {
        fetchRecords();
    }, [fetchRecords]);

    return {
        records,
        groupedRecords,
        loading,
        error,
        fetchRecords,
        sendPostcard,
    };
};
