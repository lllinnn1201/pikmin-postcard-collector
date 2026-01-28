import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { Postcard } from '../types';

// 定義 Context 型別
interface PostcardContextType {
    postcards: Postcard[];
    loading: boolean;
    error: string | null;
    fetchPostcards: () => Promise<void>;
    toggleFavorite: (postcardId: string) => Promise<void>;
    collectPostcard: (postcardId: string) => Promise<{ error: string | null }>;
    uploadImage: (file: File) => Promise<{ data: string | null, error: string | null }>;
    addPostcard: (data: {
        title: string;
        location: string;
        country: string;
        imageUrl: string;
        description: string;
        color: string;
        collectedDate: string;
        category: string;
        isSpecial?: boolean;
        sentTo?: string;
    }) => Promise<{ error: string | null }>;
    updatePostcardSentTo: (postcardId: string, sentTo: string | null) => Promise<{ error: string | null }>;
    updatePostcard: (postcardId: string, updates: {
        title?: string;
        location?: string;
        country?: string;
        description?: string;
        date?: string;
    }) => Promise<{ error: string | null }>;
    deletePostcard: (postcardId: string) => Promise<{ error: string | null }>;
}

const PostcardContext = createContext<PostcardContextType | undefined>(undefined);

// 資料轉換函數
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
    sentTo: userPostcardRow?.sent_to || undefined,
    category: row.category || '探險',
});

export const PostcardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [postcards, setPostcards] = useState<Postcard[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPostcards = useCallback(async () => {
        if (!user) {
            setPostcards([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

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

    const toggleFavorite = async (postcardId: string) => {
        if (!user) return;
        const postcard = postcards.find(p => p.id === postcardId);
        if (!postcard) return;

        setPostcards(prev =>
            prev.map(p =>
                p.id === postcardId ? { ...p, isFavorite: !p.isFavorite } : p
            )
        );

        try {
            const { error: updateError } = await supabase
                .from('user_postcards')
                .update({ is_favorite: !postcard.isFavorite })
                .eq('user_id', user.id)
                .eq('postcard_id', postcardId);

            if (updateError) throw updateError;
        } catch (err: any) {
            setPostcards(prev =>
                prev.map(p =>
                    p.id === postcardId ? { ...p, isFavorite: postcard.isFavorite } : p
                )
            );
            console.error('更新收藏狀態失敗:', err);
        }
    };

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

    const uploadImage = async (file: File) => {
        if (!user) return { data: null, error: '請先登入' };
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}/${Math.random()}.${fileExt}`;
            const filePath = `postcards/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('postcards')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('postcards')
                .getPublicUrl(filePath);

            return { data: publicUrl, error: null };
        } catch (err: any) {
            console.error('圖片上傳失敗:', err);
            return { data: null, error: err.message };
        }
    };

    const addPostcard = async (data: any) => {
        if (!user) return { error: '請先登入' };
        try {
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

            const { error: userPostcardError } = await supabase
                .from('user_postcards')
                .insert({
                    user_id: user.id,
                    postcard_id: postcardData.id,
                    collected_date: data.collectedDate,
                    sent_to: data.sentTo || null,
                });

            if (userPostcardError) throw userPostcardError;
            await fetchPostcards();
            return { error: null };
        } catch (err: any) {
            console.error('新增明信片失敗:', err);
            return { error: err.message };
        }
    };

    const updatePostcardSentTo = async (postcardId: string, sentTo: string | null) => {
        if (!user) return { error: '請先登入' };
        setPostcards(prev =>
            prev.map(p =>
                p.id === postcardId ? { ...p, sentTo: sentTo || undefined } : p
            )
        );
        try {
            const { error: updateError } = await supabase
                .from('user_postcards')
                .update({ sent_to: sentTo })
                .eq('user_id', user.id)
                .eq('postcard_id', postcardId);
            if (updateError) throw updateError;
            return { error: null };
        } catch (err: any) {
            console.error('更新寄送紀錄失敗:', err);
            await fetchPostcards();
            return { error: err.message };
        }
    };

    const updatePostcard = async (postcardId: string, updates: any) => {
        if (!user) return { error: '請先登入' };
        setPostcards(prev =>
            prev.map(p =>
                p.id === postcardId ? { ...p, ...updates } : p
            )
        );
        try {
            const postcardUpdates: any = {};
            if (updates.title !== undefined) postcardUpdates.title = updates.title;
            if (updates.location !== undefined) postcardUpdates.location = updates.location;
            if (updates.country !== undefined) postcardUpdates.country = updates.country;
            if (updates.description !== undefined) postcardUpdates.description = updates.description;

            if (Object.keys(postcardUpdates).length > 0) {
                const { error: updateMainError } = await supabase
                    .from('postcards')
                    .update(postcardUpdates)
                    .eq('id', postcardId);
                if (updateMainError) throw updateMainError;
            }

            if (updates.date !== undefined) {
                const { error: updateUserError } = await supabase
                    .from('user_postcards')
                    .update({ collected_date: updates.date })
                    .eq('user_id', user.id)
                    .eq('postcard_id', postcardId);
                if (updateUserError) throw updateUserError;
            }
            return { error: null };
        } catch (err: any) {
            console.error('更新明信片失敗:', err);
            await fetchPostcards();
            return { error: err.message };
        }
    };

    const deletePostcard = async (postcardId: string) => {
        if (!user) return { error: '請先登入' };
        try {
            const { error: deletePostcardError } = await supabase
                .from('postcards')
                .delete()
                .eq('id', postcardId);

            if (deletePostcardError) throw deletePostcardError;
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

    return (
        <PostcardContext.Provider value={{
            postcards,
            loading,
            error,
            fetchPostcards,
            toggleFavorite,
            collectPostcard,
            uploadImage,
            addPostcard,
            updatePostcardSentTo,
            updatePostcard,
            deletePostcard
        }}>
            {children}
        </PostcardContext.Provider>
    );
};

export const usePostcardsContext = () => {
    const context = useContext(PostcardContext);
    if (!context) {
        throw new Error('usePostcardsContext must be used within a PostcardProvider');
    }
    return context;
};
