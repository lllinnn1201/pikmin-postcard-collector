
// 寄送紀錄視圖元件
// 顯示使用者的明信片寄送紀錄
// 與皮友名單連動：每位好友都會顯示，即使沒有收過明信片也顯示 0 張

import React from 'react';
import { useExchangeRecords, GroupedRecord } from '../hooks/useExchangeRecords';
import { useFriends } from '../hooks/useFriends';

const RecordsView: React.FC = () => {
  // 從 hook 取得交換紀錄與好友名單
  const { groupedRecords: apiGroupedRecords, loading: recordsLoading, error } = useExchangeRecords();
  const { friends, loading: friendsLoading } = useFriends();
  const [searchTerm, setSearchTerm] = React.useState(''); // 搜尋字串狀態
  // 分類標籤狀態（全部 / 我的最愛）
  const [filterTab, setFilterTab] = React.useState<'all' | 'favorites'>('all');

  // 判斷字元類型：中文、英文、特殊符號
  const getCharType = (char: string): number => {
    if (/[\u4e00-\u9fff]/.test(char)) return 0; // 中文優先
    if (/[a-zA-Z]/.test(char)) return 1; // 英文次之
    return 2; // 特殊符號最後
  };

  // 名稱排序比較函式（中文筆畫、英文 A~Z、特殊符號）
  const compareName = React.useCallback((a: string, b: string): number => {
    const typeA = getCharType(a.charAt(0));
    const typeB = getCharType(b.charAt(0));
    // 先按類型排序
    if (typeA !== typeB) return typeA - typeB;
    // 同類型則使用 localeCompare（中文會按筆畫排序）
    return a.localeCompare(b, 'zh-Hant-TW', { sensitivity: 'base' });
  }, []);

  // 載入狀態：任一資料尚未載入完成
  const loading = recordsLoading || friendsLoading;

  // 計算重複名稱列表（用於分配不同顏色）
  const getDuplicateNames = () => {
    const nameCount: Record<string, number> = {}; // 名稱出現次數
    friends.forEach(f => {
      nameCount[f.name] = (nameCount[f.name] || 0) + 1; // 計算每個名稱出現次數
    });
    return Object.keys(nameCount).filter(name => nameCount[name] > 1); // 回傳出現超過一次的名稱
  };
  const duplicateNames = getDuplicateNames(); // 取得重複名稱列表

  // 根據名稱生成背景色（與 FriendsView 一致，重複名稱時加入 friendId）
  const getAvatarColor = (name: string, friendId: string) => {
    // 使用對比強烈、色系差異大的顏色（與其他視圖一致）
    const colors = [
      'bg-sky-500',     // 天藍
      'bg-rose-500',    // 玫紅
      'bg-emerald-500', // 翠綠
      'bg-amber-500',   // 琥珀
      'bg-violet-500',  // 紫羅蘭
      'bg-orange-500',  // 橘色
      'bg-teal-500',    // 青色
      'bg-pink-500',    // 粉紅
      'bg-lime-500',    // 萊姆綠
      'bg-indigo-500',  // 靛藍
    ];
    // 如果名稱重複，使用 名稱 + friendId 計算 hash
    const hashSource = duplicateNames.includes(name) ? name + friendId : name;
    let hash = 0;
    for (let i = 0; i < hashSource.length; i++) {
      hash = hashSource.charCodeAt(i) + ((hash << 5) - hash); // 計算 hash 值
    }
    return colors[Math.abs(hash) % colors.length]; // 根據 hash 選擇顏色
  };

  // 取得名稱縮寫（與 FriendsView 一致）
  const getInitials = (name: string) => {
    return name.slice(0, 2).toUpperCase(); // 取前兩個字元並轉大寫
  };

  // 判斷是否為自訂頭像（非預設頭像）
  const isCustomAvatar = (avatar: string) => {
    return avatar && !avatar.includes('ui-avatars.com') && !avatar.includes('placeholder'); // 非預設頭像 URL
  };

  // 將好友名單與寄送紀錄合併，確保每位好友都會顯示
  const mergedRecords: GroupedRecord[] = React.useMemo(() => {
    // 建立好友 ID 對應寄送紀錄的 Map
    const recordsByIdMap = new Map<string, GroupedRecord>();
    // 建立好友名稱對應寄送紀錄的 Map（用於匹配手動標註的 sent_to）
    const recordsByNameMap = new Map<string, GroupedRecord>();

    apiGroupedRecords.forEach(record => {
      recordsByIdMap.set(record.friendId, record);
      recordsByNameMap.set(record.friendName, record);
    });

    // 遍歷所有好友，建立合併後的紀錄（只顯示好友名單中的人）
    const result: GroupedRecord[] = friends.map(friend => {
      // 先用 ID 匹配（正式紀錄）
      let existingRecord = recordsByIdMap.get(friend.id);
      // 若沒匹配到，再用名稱匹配（手動標註的 sent_to 紀錄）
      if (!existingRecord) {
        existingRecord = recordsByNameMap.get(friend.name);
      }
      // 如果該好友有寄送紀錄，使用紀錄中的資料，但保持好友的 ID 和收藏狀態
      if (existingRecord) {
        // 對明信片進行筆畫排序
        const sortedPostcards = [...existingRecord.postcards].sort((a, b) => compareName(a.title, b.title));

        return {
          ...existingRecord,
          friendId: friend.id, // 使用好友的真正 ID
          friendName: friend.name, // 使用好友的真正名稱
          friendAvatar: friend.avatar,
          postcards: sortedPostcards, // 使用排序後的清單
          isFavorite: friend.isFavorite, // 保留收藏狀態
        };
      }
      // 若無紀錄，建立空的群組（0 張明信片）
      return {
        friendId: friend.id,
        friendName: friend.name,
        friendAvatar: friend.avatar,
        postcards: [], // 無明信片紀錄
        isFavorite: friend.isFavorite, // 保留收藏狀態
      };
    });

    return result;
  }, [friends, apiGroupedRecords, compareName]); // 加入 compareName 到依賴項

  // 根據搜尋字串和分類過濾分組紀錄 (按好友名稱搜尋)，並按名稱排序
  const filteredRecords = mergedRecords
    .filter(group => {
      // 先按分類過濾
      if (filterTab === 'favorites' && !group.isFavorite) return false;
      // 再按搜尋字串過濾
      return group.friendName.toLowerCase().includes(searchTerm.toLowerCase());
    })
    .sort((a, b) => compareName(a.friendName, b.friendName));

  return (
    <div className="flex flex-col h-full min-h-screen bg-[#f6f7f7] px-4 pt-10 pb-28">
      {/* 頁面標題區 */}
      <header className="mb-6">
        <h1 className="text-2xl font-black text-slate-800 tracking-tight mb-1">寄送紀錄</h1>
        <p className="text-sm text-slate-400">查看每位皮友收過的明信片，避免重複寄送</p>
      </header>

      {/* 搜尋欄 - 與其他頁面樣式一致 */}
      <div className="mb-8">
        <div className="relative flex items-center w-full h-12 shadow-soft rounded-full bg-white border border-gray-100/50 focus-within:border-primary/50 transition-all overflow-hidden group">
          <div className="absolute left-4 flex items-center justify-center text-primary/60">
            <span className="material-symbols-outlined text-[22px]">search</span>
          </div>
          <input
            className="w-full h-full bg-transparent border-none pl-12 pr-4 text-base font-bold placeholder-text-sec-light/50 focus:ring-0 focus:outline-none text-slate-700"
            placeholder="搜尋皮友名稱..."
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* 載入中狀態 */}
      {loading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <span className="material-symbols-outlined text-4xl text-primary animate-pulse">history</span>
            <p className="text-text-sec-light font-medium">載入紀錄中...</p>
          </div>
        </div>
      )}

      {/* 錯誤訊息 */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* 皮友紀錄列表 */}
      {!loading && (
        <div className="space-y-10">
          {/* 分類標籤 */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilterTab('all')}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${filterTab === 'all'
                ? 'bg-primary text-white shadow-md'
                : 'bg-white text-slate-500 hover:bg-slate-100'
                }`}
            >
              全部 ({mergedRecords.length})
            </button>
            <button
              onClick={() => setFilterTab('favorites')}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-1.5 ${filterTab === 'favorites'
                ? 'bg-rose-500 text-white shadow-md'
                : 'bg-white text-slate-500 hover:bg-slate-100'
                }`}
            >
              <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: filterTab === 'favorites' ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
              我的最愛 ({mergedRecords.filter(g => g.isFavorite).length})
            </button>
          </div>

          {filteredRecords.map((group) => (
            <div key={group.friendId} className="flex flex-col gap-4">
              {/* 皮友資訊區 - 固定在上方 */}
              <div className="flex items-center gap-3 px-4">
                {/* 皮友頭像 - 使用純色背景 + 縮寫文字（與 FriendsView 一致） */}
                {isCustomAvatar(group.friendAvatar) ? (
                  // 自訂頭像：顯示上傳的圖片
                  <div className="w-[42px] h-[42px] rounded-full border-2 border-white shadow-sm overflow-hidden shrink-0">
                    <img
                      src={group.friendAvatar}
                      alt={group.friendName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  // 預設頭像：顯示名稱縮寫 + 顏色背景
                  <div className={`w-[42px] h-[42px] rounded-full ${getAvatarColor(group.friendName, group.friendId)} border-2 border-white flex items-center justify-center shadow-sm shrink-0`}>
                    <span className="text-white font-black text-base tracking-tighter">
                      {getInitials(group.friendName)}
                    </span>
                  </div>
                )}
                {/* 皮友名稱與統計 */}
                <div className="flex-1">
                  <h3 className="text-lg font-black text-slate-800 tracking-tight leading-tight">{group.friendName}</h3>
                  <p className="text-xs font-medium text-slate-400">
                    已收到 <span className="text-primary font-bold">{group.postcards.length}</span> 張明信片
                  </p>
                </div>
              </div>

              {/* 明信片水平捲動清單（如果有明信片才顯示） */}
              {group.postcards.length > 0 ? (
                <div
                  className="flex gap-4 overflow-x-auto no-scrollbar -mx-4 pb-4 snap-x snap-mandatory"
                >
                  {/* 左側間距元件 (16px gap + 16px spacer = 32px) */}
                  <div className="flex-none w-4 snap-start" aria-hidden="true" />

                  {group.postcards.map((postcard) => (
                    <div
                      key={postcard.id}
                      className="flex-none w-[220px] snap-start group bg-white rounded-[24px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-500 cursor-pointer active:scale-[0.98]"
                    >
                      {/* 明信片大圖 */}
                      <div className="relative aspect-[4/3] w-full overflow-hidden">
                        <div
                          className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-700 ease-out"
                          style={{ backgroundImage: `url(${postcard.imageUrl})` }}
                        />
                        {/* 已收到浮動標籤 */}
                        <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 bg-white/90 backdrop-blur-md rounded-full shadow-sm">
                          <span className="material-symbols-outlined text-[14px] text-primary font-bold">check_circle</span>
                          <span className="text-[10px] font-black text-primary tracking-wider uppercase">已收到</span>
                        </div>
                      </div>

                      {/* 卡片內容區 */}
                      <div className="p-4">
                        <div className="flex flex-col gap-1">
                          <h4 className="text-base font-black text-slate-800 tracking-tight leading-snug group-hover:text-primary transition-colors duration-300 truncate">
                            {postcard.title}
                          </h4>
                          <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px] text-slate-300">calendar_today</span>
                            <p className="text-xs font-bold text-slate-400 tracking-wide uppercase">{postcard.date}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {/* 右側間距元件 (16px gap + 16px spacer = 32px) */}
                  <div className="flex-none w-4 snap-end" aria-hidden="true" />
                </div>
              ) : (
                // 沒有明信片時顯示「尚未寄送」提示
                <div className="flex items-center gap-3 py-3 px-4 bg-white/50 rounded-2xl border border-dashed border-slate-200">
                  <span className="material-symbols-outlined text-slate-300 text-xl">mail</span>
                  <p className="text-sm text-slate-400">尚未寄送任何明信片給這位皮友</p>
                </div>
              )}
            </div>
          ))}

          {/* 無紀錄時顯示 */}
          {filteredRecords.length === 0 && (
            <div className="text-center py-24">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                <span className="material-symbols-outlined text-[40px] text-slate-200">search</span>
              </div>
              <p className="text-slate-400 text-lg font-black tracking-tight">{searchTerm ? '找不到相關紀錄' : '還沒有寄送紀錄'}</p>
              <p className="text-sm text-slate-300 mt-1">{searchTerm ? '請嘗試不同的搜尋關鍵字' : '開始分享明信片給皮友吧！'}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RecordsView;
