
// 選擇皮友視圖元件
// 選擇要寄送明信片的皮友

import React from 'react';
import { useFriends } from '../hooks/useFriends';
import { MOCK_FRIENDS } from '../constants';

// 元件 props 介面
interface SelectFriendViewProps {
  onBack: () => void;    // 返回上一頁
  onSent: () => void;    // 寄送完成回調
}

const SelectFriendView: React.FC<SelectFriendViewProps> = ({ onBack, onSent }) => {
  // 從 hook 取得皮友資料
  const { friends: apiFriends, loading, error } = useFriends();

  // 如果 API 尚未返回資料，使用 Mock 資料作為備援
  const friends = apiFriends.length > 0 ? apiFriends : MOCK_FRIENDS;

  // 處理寄送（TODO: 整合 useExchangeRecords.sendPostcard）
  const handleSend = () => {
    // 未來這裡會呼叫 sendPostcard(friendId, postcardId)
    onSent();
  };

  // 判斷字元類型：中文/日文漢字、英文、日文假名、韓文諺文、其他
  const getCharType = (char: string): number => {
    if (/[\u4e00-\u9fff]/.test(char)) return 0; // 中文/日文漢字優先
    if (/[a-zA-Z]/.test(char)) return 1; // 英文次之
    if (/[\u3040-\u30ff]/.test(char)) return 2; // 日文假名第三
    if (/[\uac00-\ud7af\u1100-\u11ff\u3130-\u318f]/.test(char)) return 3; // 韓文諺文第四
    return 4; // 特殊符號最後
  };

  // 名稱排序比較函式（按類型、語系習慣排序）
  const compareName = (a: string, b: string): number => {
    const typeA = getCharType(a.charAt(0));
    const typeB = getCharType(b.charAt(0));
    // 先按類型排序
    if (typeA !== typeB) return typeA - typeB;
    // 同類型則使用 localeCompare（中文會按筆畫排序）
    return a.localeCompare(b, 'zh-Hant-TW', { sensitivity: 'base' });
  };

  // 排序後的皮友列表
  const sortedFriends = [...friends].sort((a, b) => compareName(a.name, b.name));

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark">
      {/* 頁首區域 */}
      <div className="sticky top-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-gray-100 dark:border-white/5">
        <div className="flex items-center p-4 justify-between w-full">
          {/* 返回按鈕 */}
          <button
            onClick={onBack}
            className="text-text-main-light dark:text-text-main-dark hover:bg-black/5 rounded-full p-2 transition-colors flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-2xl">arrow_back</span>
          </button>
          {/* 標題 */}
          <h2 className="text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-10">選擇寄送皮友</h2>
        </div>
      </div>

      {/* 主要內容區 */}
      <main className="flex-1 px-4 pb-20 overflow-y-auto no-scrollbar">
        {/* 搜尋欄 */}
        <div className="py-4">
          <div className="flex w-full h-12 rounded-xl bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 overflow-hidden items-center px-4 shadow-sm">
            <span className="material-symbols-outlined text-text-sec-light">search</span>
            <input
              className="flex-1 bg-transparent border-none text-base placeholder:text-text-sec-light dark:text-white focus:ring-0"
              placeholder="搜尋姓名..."
            />
          </div>
        </div>

        {/* 篩選標籤 */}
        <div className="flex gap-2 pb-4 overflow-x-auto hide-scrollbar">
          <button className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full bg-primary text-white px-5 shadow-sm active:scale-95 transition-transform">
            <span className="material-symbols-outlined text-sm">favorite</span>
            <span className="text-sm font-semibold">我的最愛</span>
          </button>
          <button className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 px-5 text-text-main-light dark:text-white text-sm font-medium">
            最近
          </button>
          <button className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 px-5 text-text-main-light dark:text-white text-sm font-medium">
            字母順序
          </button>
        </div>

        {/* 區段標題 */}
        <div className="flex items-center gap-2 pb-3 pt-2">
          <span className="material-symbols-outlined text-text-sec-light text-lg">history</span>
          <p className="text-text-sec-light text-sm font-semibold uppercase tracking-wider">最近活躍</p>
        </div>

        {/* 載入中狀態 */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="flex flex-col items-center gap-3">
              <span className="material-symbols-outlined text-3xl text-primary animate-pulse">group</span>
              <p className="text-text-sec-light text-sm">載入皮友列表中...</p>
            </div>
          </div>
        )}

        {/* 錯誤訊息 */}
        {error && (
          <div className="mx-4 mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* 皮友列表 */}
        {!loading && (
          <div className="flex flex-col gap-4">
            {sortedFriends.map((friend) => (
              <div
                key={friend.id}
                className="group bg-white dark:bg-surface-dark rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-white/5 transition-all hover:shadow-md"
              >
                {/* 皮友資訊區 */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    {/* 皮友頭像 */}
                    <div className="relative">
                      <div
                        className="bg-center bg-no-repeat bg-cover rounded-full h-12 w-12 border-2 border-primary"
                        style={{ backgroundImage: `url(${friend.avatar})` }}
                      />
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-primary rounded-full border-2 border-white dark:border-surface-dark"></div>
                    </div>
                    {/* 皮友名稱 */}
                    <div>
                      <h3 className="text-text-main-light dark:text-white text-base font-bold leading-tight">{friend.name}</h3>
                      <p className="text-text-sec-light dark:text-text-sec-dark text-xs font-medium">{friend.lastActive}</p>
                    </div>
                  </div>
                  {/* 選擇按鈕 */}
                  <button
                    onClick={handleSend}
                    className={`${friend.isFavorite ? 'bg-primary text-white' : 'border border-primary text-primary'} text-sm font-bold px-4 py-2 rounded-xl transition-all shadow-sm active:scale-95 flex items-center gap-1`}
                  >
                    選擇 {friend.isFavorite && <span className="material-symbols-outlined text-sm">arrow_forward</span>}
                  </button>
                </div>

                {/* 最近寄送區 */}
                <div className="bg-background-light dark:bg-background-dark rounded-xl p-3">
                  <p className="text-text-sec-light dark:text-text-sec-dark text-xs font-medium mb-2 flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">mail</span> 最近寄送:
                  </p>
                  <div className="flex gap-2 overflow-x-auto hide-scrollbar">
                    {friend.recentSent.length > 0 ? (
                      friend.recentSent.map((img, i) => (
                        <div key={i} className="shrink-0 relative w-16 h-16 rounded-lg overflow-hidden group/img">
                          <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${img})` }}></div>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center w-full py-4 text-center">
                        <span className="material-symbols-outlined text-text-sec-light/50 text-xl">eco</span>
                        <p className="text-text-sec-light text-[10px]">最近沒有寄送明信片。</p>
                      </div>
                    )}
                    {friend.recentSent.length > 0 && (
                      <div className="shrink-0 relative w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
                        <span className="material-symbols-outlined text-gray-400 text-lg">add_a_photo</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 列表結尾 */}
        <div className="flex items-center justify-center py-6">
          <p className="text-text-sec-light text-sm">這就是你的所有皮友了！</p>
        </div>
      </main>

      {/* 新增皮友按鈕 */}
      <button className="fixed bottom-6 right-6 h-14 w-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-transform z-40">
        <span className="material-symbols-outlined text-2xl">person_add</span>
      </button>
    </div>
  );
};

export default SelectFriendView;
