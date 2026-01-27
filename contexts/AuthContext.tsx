// 認證狀態管理 Context
// 提供使用者認證狀態與登入/登出方法

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

// 認證 Context 型別定義
interface AuthContextType {
    user: User | null;           // 當前使用者
    session: Session | null;     // 當前 Session
    loading: boolean;            // 載入中狀態
    signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;  // 登入
    signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>;  // 註冊
    signOut: () => Promise<void>;  // 登出
}

// 建立 Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider 元件 props
interface AuthProviderProps {
    children: ReactNode;
}

// AuthProvider 元件：包裝整個應用程式，提供認證狀態
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);        // 使用者狀態
    const [session, setSession] = useState<Session | null>(null); // Session 狀態
    const [loading, setLoading] = useState(true);               // 載入中狀態

    // 初始化時檢查現有 Session
    useEffect(() => {
        // 取得當前 Session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // 監聽認證狀態變化
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // 清理訂閱
        return () => subscription.unsubscribe();
    }, []);

    // 電子郵件登入
    const signIn = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return { error };
    };

    // 電子郵件註冊
    const signUp = async (email: string, password: string) => {
        const { error } = await supabase.auth.signUp({ email, password });
        return { error };
    };

    // 登出
    const signOut = async () => {
        await supabase.auth.signOut();
    };

    // 提供 Context 值
    const value = {
        user,
        session,
        loading,
        signIn,
        signUp,
        signOut,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// useAuth Hook：方便取用認證狀態
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
