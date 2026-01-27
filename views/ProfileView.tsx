
// 個人檔案視圖元件
// 顯示使用者個人資料與成就

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useProfile } from '../hooks/useProfile';

// 元件 props 介面
interface ProfileViewProps {
  onBack: () => void;    // 返回上一頁
  onLogout?: () => void; // 登出回調
}

const ProfileView: React.FC<ProfileViewProps> = ({ onBack, onLogout }) => {
  // 取得認證與個人檔案資料
  const { signOut } = useAuth();
  const { profile, loading, fetchPostcardCount } = useProfile();

  // 設定選單顯示狀態
  const [showSettings, setShowSettings] = useState(false);

  // 明信片數量（即時取得）
  const [postcardCount, setPostcardCount] = useState(0);

  // 取得明信片數量
  useEffect(() => {
    fetchPostcardCount().then(count => setPostcardCount(count));
  }, [fetchPostcardCount]);

  // 處理登出
  const handleLogout = async () => {
    setShowSettings(false);
    await signOut();
    if (onLogout) {
      onLogout();
    }
  };

  // 預設資料（當 profile 尚未載入時使用）
  const displayProfile = profile || {
    username: "新使用者",
    avatarUrl: 'https://ui-avatars.com/api/?name=User&background=random',
    level: 1,
    title: '皮克敏收藏家',
    totalPostcards: 0,
    totalDistanceKm: 0,
  };

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark relative">
      {/* 頁首區域 */}
      <header className="p-6 pb-2">
        <div className="flex items-center justify-between mb-8">
          {/* 返回按鈕 */}
          <button onClick={onBack} className="size-10 rounded-full bg-white dark:bg-surface-dark shadow-sm flex items-center justify-center">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          {/* 標題 */}
          <h1 className="text-xl font-bold dark:text-white">個人檔案</h1>
          {/* 設定按鈕 */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="size-10 rounded-full bg-white dark:bg-surface-dark shadow-sm flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined">settings</span>
          </button>
        </div>

        {/* 設定下拉選單 */}
        {showSettings && (
          <>
            {/* 點擊背景關閉選單 */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowSettings(false)}
            />
            {/* 選單內容 */}
            <div className="absolute top-20 right-6 z-50 bg-white dark:bg-surface-dark rounded-2xl shadow-xl border border-gray-100 dark:border-white/10 overflow-hidden min-w-[180px]">
              {/* 帳號設定 */}
              <button className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-left">
                <span className="material-symbols-outlined text-[20px] text-gray-500">person</span>
                <span className="text-sm font-bold text-gray-700 dark:text-white">帳號設定</span>
              </button>
              {/* 通知設定 */}
              <button className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-left">
                <span className="material-symbols-outlined text-[20px] text-gray-500">notifications</span>
                <span className="text-sm font-bold text-gray-700 dark:text-white">通知設定</span>
              </button>
              {/* 隱私設定 */}
              <button className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-left">
                <span className="material-symbols-outlined text-[20px] text-gray-500">lock</span>
                <span className="text-sm font-bold text-gray-700 dark:text-white">隱私設定</span>
              </button>
              {/* 分隔線 */}
              <div className="h-px bg-gray-100 dark:bg-white/10 mx-3" />
              {/* 登出按鈕 */}
              <button
                onClick={handleLogout}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors text-left"
              >
                <span className="material-symbols-outlined text-[20px] text-red-500">logout</span>
                <span className="text-sm font-bold text-red-500">登出</span>
              </button>
            </div>
          </>
        )}

        {/* 使用者資訊區 */}
        <div className="flex flex-col items-center mb-8">
          {/* 頭像 */}
          <div className="relative mb-4">
            <div className="size-24 rounded-full border-4 border-primary p-1 bg-white">
              {loading ? (
                <div className="w-full h-full rounded-full bg-gray-200 animate-pulse" />
              ) : (
                <img
                  src={displayProfile.avatarUrl}
                  className="w-full h-full rounded-full object-cover"
                  alt="Profile"
                />
              )}
            </div>
            {/* 等級徽章 */}
            <div className="absolute bottom-0 right-0 size-8 bg-accent rounded-full border-4 border-white dark:border-background-dark flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[16px] text-gray-800 font-bold">star</span>
            </div>
          </div>
          {/* 使用者名稱與等級 */}
          <h2 className="text-2xl font-black text-text-main-light dark:text-white tracking-tight">
            {loading ? '載入中...' : displayProfile.username}
          </h2>
          <p className="text-primary font-bold">
            等級 {displayProfile.level} • {displayProfile.title}
          </p>
        </div>
      </header>

      {/* 統計資料區 */}
      <div className="px-6 grid grid-cols-2 gap-4 mb-8">
        {/* 明信片數量 */}
        <div className="bg-white dark:bg-surface-dark p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5">
          <span className="text-3xl font-black text-primary">
            {postcardCount > 0 ? postcardCount : displayProfile.totalPostcards}
          </span>
          <p className="text-xs font-bold text-text-sec-light uppercase tracking-wider mt-1">收集明信片</p>
        </div>
        {/* 步行距離 */}
        <div className="bg-white dark:bg-surface-dark p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5">
          <span className="text-3xl font-black text-accent">
            {displayProfile.totalDistanceKm.toLocaleString()}
          </span>
          <p className="text-xs font-bold text-text-sec-light uppercase tracking-wider mt-1">步行總數 (KM)</p>
        </div>
      </div>

      {/* 成就區域 */}
      <div className="px-6 space-y-4 pb-40">
        <h3 className="font-bold text-text-main-light dark:text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">emoji_events</span>
          最近成就
        </h3>

        <div className="space-y-3">
          {[
            { title: '環球旅行者', desc: '收集來自 5 個國家的明信片', icon: 'public', progress: 80 },
            { title: '皮克敏之友', desc: '與 10 位好友交換明信片', icon: 'favorite', progress: 100 },
            { title: '早鳥', desc: '在清晨收集 10 張明信片', icon: 'light_mode', progress: 45 }
          ].map((a, i) => (
            <div key={i} className="bg-white dark:bg-surface-dark p-4 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
              <div className="flex items-start gap-4 mb-2">
                {/* 成就圖示 */}
                <div className="size-10 rounded-xl bg-secondary dark:bg-primary/20 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">{a.icon}</span>
                </div>
                {/* 成就資訊 */}
                <div className="flex-1">
                  <h4 className="font-bold text-text-main-light dark:text-white text-sm">{a.title}</h4>
                  <p className="text-xs text-text-sec-light">{a.desc}</p>
                </div>
              </div>
              {/* 進度條 */}
              <div className="w-full h-2 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${a.progress}%` }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
