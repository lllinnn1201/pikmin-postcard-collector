
// 登入視圖元件
// 提供使用者登入與註冊功能

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

// 元件 props 介面
interface LoginViewProps {
  onLogin: () => void;  // 登入成功回調（用於相容舊介面）
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  // 取得認證方法
  const { signIn, signUp } = useAuth();

  // 表單狀態
  const [username, setUsername] = useState('');      // 帳號名稱
  const [password, setPassword] = useState('');     // 密碼
  const [isLoading, setIsLoading] = useState(false); // 載入中狀態
  const [error, setError] = useState<string | null>(null); // 錯誤訊息
  const [isSignUp, setIsSignUp] = useState(false);  // 是否為註冊模式

  // 處理表單提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // 根據模式執行登入或註冊
      const { error: authError } = isSignUp
        ? await signUp(username, password)
        : await signIn(username, password);

      if (authError) {
        // 轉換錯誤訊息為中文
        if (authError.message.includes('Invalid login credentials')) {
          setError('帳號名稱或密碼錯誤');
        } else if (authError.message.includes('Email not confirmed')) {
          setError('帳號尚未啟用');
        } else if (authError.message.includes('User already registered') || authError.message.includes('Signup disabled')) {
          setError('此帳號名稱已被使用');
        } else if (authError.message.includes('rate limit') || authError.message.includes('Too many requests')) {
          setError(isSignUp ? '註冊嘗試次數過多，請稍後再試' : '登入嘗試次數過多，請稍後再試');
        } else {
          setError(authError.message);
        }
      } else {
        // 登入/註冊成功
        if (isSignUp) {
          setError('註冊成功！現在您可以使用此帳號登入了。');
          setIsSignUp(false); // 註冊成功後切換至登入模式
        } else {
          onLogin();  // 觸發登入成功回調
        }
      }
    } catch (err: any) {
      setError('發生未知錯誤，請稍後再試');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* 背景圖片包裝 */}
      <div className="absolute inset-0 z-0">
        <div
          className="h-full w-full bg-cover bg-center bg-no-repeat opacity-90 blur-sm scale-110"
          style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuCzc84RmOpcFBMiLch0llCFoczqs-dSbRN1s3vu1wmq0kd_d4zJQKAXaQj4KCUmBfChk6qg_GO7X6qy-Zr9Feji3rryLJXcSa7a6PCGXBlvcBMXK6t-KoUtRxZsokehXGPg3gawHRmsp7ClRpxiVHuT4d0Ao0oMAmM_dAILNHJWY5e9I0KuZcnwwZxkMGwekaN6XTmr7jnIdPjM4HNp0smemEYhUhuy1XW6SKvLY7dwZqkwCWBF---qQC_YEuu1_UrJM1OwWqWHQ1yY')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-white/10 to-primary/10 dark:from-black/50 dark:via-black/40 dark:to-black/60"></div>
      </div>

      {/* 登入卡片 */}
      <div className="relative z-10 w-full max-w-[420px] rounded-2xl bg-white/95 dark:bg-[#1A1A1A]/95 shadow-xl backdrop-blur-md p-6 pt-10">
        {/* 花朵圖示 */}
        <div className="absolute -top-8 left-1/2 -translate-x-1/2">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white dark:bg-zinc-800 shadow-md ring-4 ring-primary/20">
            <span className="material-symbols-outlined text-4xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
              local_florist
            </span>
          </div>
        </div>

        {/* 標題區 */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-text-main-light dark:text-white pb-2">
            {isSignUp ? '建立帳號' : '歡迎回來！'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            {isSignUp ? '開始收集你的明信片旅程' : '準備好整理你的明信片了嗎？'}
          </p>
        </div>

        {/* 錯誤訊息 */}
        {error && (
          <div className={`mb-4 p-3 rounded-xl text-sm font-medium ${error.includes('成功')
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
            {error}
          </div>
        )}

        {/* 登入表單 */}
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {/* 帳號名稱欄位 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-main-light dark:text-slate-200 pl-1">帳號名稱</label>
            <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 dark:bg-zinc-800 dark:border-zinc-700 focus-within:ring-2 focus-within:ring-primary/20 px-4">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="flex-1 py-3 bg-transparent border-none focus:ring-0 text-text-main-light dark:text-white placeholder:text-slate-400"
                placeholder="輸入您的帳號名稱"
                required
                disabled={isLoading}
              />
              <span className="material-symbols-outlined text-primary text-[20px]">person</span>
            </div>
          </div>

          {/* 密碼欄位 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-main-light dark:text-slate-200 pl-1">密碼</label>
            <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 dark:bg-zinc-800 dark:border-zinc-700 focus-within:ring-2 focus-within:ring-primary/20 px-4">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex-1 py-3 bg-transparent border-none focus:ring-0 text-text-main-light dark:text-white placeholder:text-slate-400"
                placeholder={isSignUp ? '設定您的密碼（至少6字元）' : '輸入您的密碼'}
                required
                minLength={6}
                disabled={isLoading}
              />
              <span className="material-symbols-outlined text-slate-400 text-[20px]">lock</span>
            </div>
          </div>

          {/* 忘記密碼連結（僅登入模式） */}
          {!isSignUp && (
            <div className="flex justify-end">
              <button type="button" className="text-xs font-medium text-slate-500 hover:text-primary dark:text-slate-400">
                忘記密碼？
              </button>
            </div>
          )}

          {/* 提交按鈕 */}
          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-[#0a2f16] shadow-lg shadow-primary/30 font-bold text-lg active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                <span>處理中...</span>
              </>
            ) : (
              <>
                <span>{isSignUp ? '註冊' : '登入'}</span>
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </>
            )}
          </button>
        </form>

        {/* 分隔線 */}
        <div className="relative my-6 flex items-center">
          <div className="flex-grow border-t border-slate-200 dark:border-zinc-700"></div>
          <span className="mx-4 text-xs text-slate-400">
            {isSignUp ? '或' : '或使用其他方式'}
          </span>
          <div className="flex-grow border-t border-slate-200 dark:border-zinc-700"></div>
        </div>

        {/* 切換登入/註冊模式 */}
        <div className="mt-4 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {isSignUp ? '已經有帳號？' : '還沒有帳號？'}
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
              }}
              className="font-bold text-primary hover:underline ml-1"
            >
              {isSignUp ? '立即登入' : '立即註冊'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
