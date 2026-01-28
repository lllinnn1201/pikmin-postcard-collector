
// 明信片視圖元件
// 顯示使用者收集的明信片列表

import React, { useState } from 'react';
import { Postcard } from '../types';
import { usePostcards } from '../hooks/usePostcards';
import { PostcardSkeleton } from '../components/Skeleton';
import Loading from '../components/Loading';

// 明信片元件的 props 介面
interface CollectionViewProps {
  onSelectPostcard: (p: Postcard) => void; // 選擇明信片回調
}

const CollectionView: React.FC<CollectionViewProps> = ({
  onSelectPostcard
}) => {
  // 從 hook 取得明信片資料
  const { postcards: apiPostcards, loading, error, toggleFavorite, deletePostcard } = usePostcards();

  // 本地狀態，用於處理 Mock 資料與即時 UI 反饋
  const [localPostcards, setLocalPostcards] = React.useState<Postcard[]>([]);

  // 監聽 API 資料變化並同步到本地狀態
  React.useEffect(() => {
    // 同步 API 抓取的資料
    setLocalPostcards(apiPostcards);
  }, [apiPostcards]);

  // 分類篩選狀態
  const [filter, setFilter] = useState('全部');

  // 搜尋字串狀態
  const [searchTerm, setSearchTerm] = useState('');

  // 刪除確認對話框狀態（儲存要刪除的明信片資訊）
  const [postcardToDelete, setPostcardToDelete] = useState<{ id: string; title: string; imageUrl: string } | null>(null);

  // 判斷字元類型：中文、英文、特殊符號
  const getCharType = (char: string): number => {
    if (/[\u4e00-\u9fff]/.test(char)) return 0; // 中文優先
    if (/[a-zA-Z]/.test(char)) return 1; // 英文次之
    return 2; // 特殊符號最後
  };

  // 名稱排序比較函式（中文筆畫、英文 A~Z、特殊符號）
  const compareName = (a: string, b: string): number => {
    const typeA = getCharType(a.charAt(0));
    const typeB = getCharType(b.charAt(0));
    // 先按類型排序
    if (typeA !== typeB) return typeA - typeB;
    // 同類型則使用 localeCompare（中文會按筆畫排序）
    return a.localeCompare(b, 'zh-Hant-TW', { sensitivity: 'base' });
  };

  // 處理收藏切換
  const handleToggleFavorite = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // 阻止進入詳情頁面

    // 立即進行樂觀更新 (Optimistic Update)
    setLocalPostcards(prev =>
      prev.map(p => p.id === id ? { ...p, isFavorite: !p.isFavorite } : p)
    );

    // 同步到資料庫
    toggleFavorite(id);
  };

  // 處理刪除明信片（開啟確認對話框）
  const handleDeletePostcard = (e: React.MouseEvent, postcard: Postcard) => {
    e.preventDefault();
    e.stopPropagation(); // 阻止進入詳情頁面
    // 設定要刪除的明信片，觸發對話框顯示
    setPostcardToDelete({ id: postcard.id, title: postcard.title, imageUrl: postcard.imageUrl });
  };

  // 執行刪除明信片
  const confirmDeletePostcard = async () => {
    if (!postcardToDelete) return;
    // 樂觀更新 UI
    setLocalPostcards(prev => prev.filter(p => p.id !== postcardToDelete.id));
    // 關閉對話框
    setPostcardToDelete(null);
    // 執行實際刪除
    const { error: deleteError } = await deletePostcard(postcardToDelete.id);
    if (deleteError) {
      alert('刪除失敗：' + deleteError);
    }
  };


  // 篩選與排序明信片 (使用本地狀態進行篩選)
  const filteredPostcards = localPostcards
    .filter(p => {
      // 分類篩選
      let matchFilter = true;
      if (filter === '我的最愛') {
        matchFilter = p.isFavorite || false;
      } else if (filter !== '全部') {
        matchFilter = p.category === filter || (filter === '花瓣' && p.isSpecial);
      }

      // 搜尋關鍵字過濾 (標題、地點、國家)
      const matchSearch = searchTerm.trim() === '' ||
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.country.toLowerCase().includes(searchTerm.toLowerCase());

      return matchFilter && matchSearch;
    })
    .sort((a, b) => compareName(a.title, b.title)); // 按標題進行筆畫排序

  // 分類選項
  // 分類選項：全部、我的最愛、蘑菇、探險、花瓣
  const categories = ['全部', '我的最愛', '蘑菇', '探險', '花瓣', '快照'];

  return (
    <div className="flex flex-col h-full min-h-screen">
      {/* 頁首區域 */}
      <header className="px-4 pt-10 mb-6">
        <h1 className="text-2xl font-black text-slate-800 tracking-tight mb-1">我的明信片</h1>
        <p className="text-sm text-slate-400">瀏覽並管理你收集的所有皮克敏明信片</p>
      </header>

      {/* 搜尋欄 */}
      <div className="px-4 pb-2">
        <div className="relative flex items-center w-full h-12 shadow-soft rounded-full bg-white dark:bg-white/5 border border-gray-100/50 focus-within:border-primary/50 transition-all overflow-hidden group">
          <div className="absolute left-4 flex items-center justify-center text-primary/60">
            <span className="material-symbols-outlined text-[22px]">search</span>
          </div>
          <input
            className="w-full h-full bg-transparent border-none pl-12 pr-4 text-sm font-bold placeholder-slate-400 focus:ring-0 focus:outline-none dark:text-white"
            placeholder="搜尋標題、國家、地點..."
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* 分類篩選標籤 */}
      <div className="px-4 py-4 overflow-x-auto hide-scrollbar">
        <div className="flex gap-3 min-w-max">
          {categories.map((label) => (
            <button
              key={label}
              onClick={() => setFilter(label)}
              className={`relative flex items-center justify-center px-5 h-[44px] rounded-full transition-all active:scale-95 border-2 ${filter === label
                ? 'bg-primary border-primary text-[#0a2f16] shadow-md font-black'
                : 'bg-white border-[#E2F6E7] text-slate-500 font-bold'
                }`}
            >
              <span className="text-[14px] whitespace-nowrap">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 載入中狀態 - 使用 Skeleton Screen */}
      {loading && (
        <div className="px-4 pt-2 grid grid-cols-2 gap-4 pb-28">
          {[...Array(6)].map((_, i) => (
            <PostcardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* 錯誤訊息 */}
      {error && (
        <div className="mx-4 mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* 明信片網格 */}
      {!loading && (
        <div className="px-4 pt-2 grid grid-cols-2 gap-4 pb-28">
          {filteredPostcards.map((p) => (
            <div
              key={p.id}
              onClick={() => {
                // 點擊明信片進入詳情

                onSelectPostcard(p);
              }}
              className="group relative flex flex-col bg-white rounded-[24px] overflow-hidden shadow-card border border-gray-100 hover:shadow-lg transition-all duration-300 cursor-pointer active:scale-95"
            >
              {/* 明信片圖片容器 - 3:2 橫式比例完整顯示明信片 */}
              <div className="relative aspect-[3/2] w-full bg-gray-50 overflow-hidden">
                {/* 明信片圖片 */}
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                  style={{ backgroundImage: `url(${p.imageUrl})` }}
                />
              </div>

              {/* 操作按鈕 (層級最高，放在容器外但卡片內) */}
              <div className="absolute top-2.5 inset-x-2.5 flex justify-between items-start pointer-events-none z-[60]">
                {/* 收藏按鈕 (左上角) */}
                <button
                  onClick={(e) => {
                    // 收藏點擊

                    handleToggleFavorite(e, p.id);
                  }}
                  className="size-10 bg-white/95 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg active:scale-75 transition-all pointer-events-auto group/fav"
                >
                  <span className={`material-symbols-outlined text-[20px] transition-colors ${p.isFavorite ? 'text-pink-500 font-bold' : 'text-gray-300 group-hover/fav:text-pink-200'}`} style={{ fontVariationSettings: p.isFavorite ? "'FILL' 1" : "" }}>
                    favorite
                  </span>
                </button>

                {/* 刪除按鈕 (右上角) - 點擊後顯示確認對話框 */}
                <button
                  onClick={(e) => handleDeletePostcard(e, p)}
                  className="flex items-center gap-1 size-10 bg-white/95 backdrop-blur-md rounded-full shadow-lg active:scale-75 transition-all pointer-events-auto z-[70] hover:bg-red-50 justify-center"
                >
                  <span className="material-symbols-outlined text-[20px] text-gray-300 hover:text-red-400 transition-colors">
                    delete
                  </span>
                </button>
              </div>

              {/* 明信片資訊 */}
              <div className="p-3">
                <h3 className="font-black text-text-main-light text-sm leading-tight mb-1 truncate">{p.title}</h3>
                <div className="flex items-center text-[11px] font-bold text-text-sec-light">
                  <span className="material-symbols-outlined text-[12px] mr-1">location_on</span>
                  {p.country} {p.location}
                </div>
              </div>
            </div>
          ))}

          {/* 無明信片時顯示 */}
          {filteredPostcards.length === 0 && !loading && (
            <div className="col-span-2 flex flex-col items-center justify-center py-16">
              <span className="material-symbols-outlined text-[48px] text-slate-200 mb-4">mail</span>
              <p className="text-slate-400 font-medium">還沒有明信片</p>
              <p className="text-sm text-slate-300">開始探索收集明信片吧！</p>
            </div>
          )}
        </div>
      )}

      {/* 刪除確認對話框 */}
      {postcardToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          {/* 背景遮罩 */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setPostcardToDelete(null)}
          />
          {/* 對話框內容 */}
          <div className="relative bg-white rounded-3xl p-6 mx-6 shadow-2xl max-w-sm w-full animate-in zoom-in-95 duration-200">
            {/* 明信片預覽 */}
            <div className="w-20 h-24 mx-auto mb-4 rounded-xl overflow-hidden shadow-lg border-2 border-white">
              <div
                className="w-full h-full bg-cover bg-center"
                style={{ backgroundImage: `url(${postcardToDelete.imageUrl})` }}
              />
            </div>
            {/* 標題 */}
            <h3 className="text-xl font-black text-slate-800 text-center mb-2">
              刪除明信片
            </h3>
            {/* 說明文字 */}
            <p className="text-slate-500 text-center mb-6">
              確定要刪除「<span className="font-bold text-slate-700">{postcardToDelete.title}</span>」嗎？
              <br />
              <span className="text-xs text-slate-400">此操作無法復原</span>
            </p>
            {/* 按鈕區 */}
            <div className="flex gap-3">
              {/* 取消按鈕 */}
              <button
                onClick={() => setPostcardToDelete(null)}
                className="flex-1 py-3 px-4 rounded-2xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-all active:scale-95"
              >
                取消
              </button>
              {/* 確定刪除按鈕 */}
              <button
                onClick={confirmDeletePostcard}
                className="flex-1 py-3 px-4 rounded-2xl bg-red-500 text-white font-bold hover:bg-red-600 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">delete</span>
                刪除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectionView;
