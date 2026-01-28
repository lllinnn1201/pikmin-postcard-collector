import React, { useState } from 'react';
import { Postcard } from '../types';
import { usePostcards } from '../hooks/usePostcards';
import { useAuth } from '../contexts/AuthContext';
import { useFriends } from '../hooks/useFriends';

interface DetailViewProps {
  postcard: Postcard;
  onBack: () => void;
  onSend: () => void;
}

const DetailView: React.FC<DetailViewProps> = ({ postcard, onBack, onSend }) => {
  const { user } = useAuth();
  const { updatePostcardSentTo, updatePostcard } = usePostcards();
  const { friends } = useFriends();

  // 使用本地狀態來管理顯示資料，確保編輯後能即時更新 UI
  const [displayPostcard, setDisplayPostcard] = useState<Postcard>(postcard);

  // 當 props // postcard 改變時同步更新本地狀態
  React.useEffect(() => {
    setDisplayPostcard(postcard);
  }, [postcard]);

  const [recipientName, setRecipientName] = useState('');          // 收件人姓名輸入
  const [isSaving, setIsSaving] = useState(false);                  // 儲存中狀態
  const [showSuggestions, setShowSuggestions] = useState(false);    // 顯示皮友建議選單
  const [validationError, setValidationError] = useState('');       // 驗證錯誤訊息

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

  // 判斷是否為自訂頭像（非預設頭像）
  const isCustomAvatar = (avatar: string) => {
    return avatar && !avatar.includes('ui-avatars.com') && !avatar.includes('placeholder'); // 非預設頭像 URL
  };

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

  // 根據輸入過濾好友建議，並按名稱排序
  const suggestedFriends = friends
    .filter(friend =>
      recipientName.trim() !== '' &&
      friend.name.toLowerCase().includes(recipientName.toLowerCase())
    )
    .sort((a, b) => compareName(a.name, b.name));

  // 處理儲存寄送對象
  const handleSaveRecipient = async () => {
    // 清除之前的錯誤訊息
    setValidationError('');
    // 檢查是否有輸入
    if (!recipientName.trim()) return;
    // 驗證收件人是否在好友列表中（忽略大小寫）
    const matchedFriend = friends.find(
      (f) => f.name.toLowerCase() === recipientName.trim().toLowerCase()
    );
    // 若不在皮友列表中，顯示錯誤訊息並阻止儲存
    if (!matchedFriend) {
      setValidationError('此皮友尚未新增，請先至「皮友」頁面新增皮友後再寄送。');
      return;
    }
    // 開始儲存流程
    setIsSaving(true);
    const { error } = await updatePostcardSentTo(postcard.id, recipientName.trim());
    if (error) {
      alert('儲存失敗：' + error);
    } else {
      // 本地同步更新物件狀態，讓 UI 即時切換為已寄送
      setDisplayPostcard(prev => ({ ...prev, sentTo: recipientName.trim() }));
    }
    setIsSaving(false);
    setShowSuggestions(false); // 儲存後隱藏建議
  };

  // 取得顯示名稱的首字母
  const getInitials = (name: string) => {
    return name.slice(0, 2).toUpperCase();
  };


  // 編輯模式狀態
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: '',
    country: '',
    location: '',
  });

  const handleStartEdit = () => {
    setEditData({
      title: displayPostcard.title,
      country: displayPostcard.country,
      location: displayPostcard.location,
    });
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    setIsSaving(true);
    const { error } = await updatePostcard(postcard.id, {
      title: editData.title,
      country: editData.country,
      location: editData.location
    });

    if (error) {
      alert('更新失敗：' + error);
    } else {
      // 更新本地顯示資料
      setDisplayPostcard(prev => ({
        ...prev,
        title: editData.title,
        country: editData.country,
        location: editData.location
      }));
      setIsEditing(false);
    }
    setIsSaving(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col overflow-x-hidden">
      {/* Background Decorative Icons */}
      <div className="absolute top-24 -left-6 text-primary/10 rotate-[-15deg] pointer-events-none">
        <span className="material-symbols-outlined" style={{ fontSize: '120px', fontVariationSettings: "'FILL' 1" }}>eco</span>
      </div>
      <div className="absolute bottom-32 -right-8 text-primary/10 rotate-[25deg] pointer-events-none">
        <span className="material-symbols-outlined" style={{ fontSize: '140px' }}>potted_plant</span>
      </div>

      <header className="relative z-20 flex items-center justify-between p-4 pb-2">
        <button
          onClick={onBack}
          className="flex size-10 items-center justify-center rounded-full bg-white/80 dark:bg-black/20 hover:bg-gray-100 shadow-sm transition-all"
        >
          <span className="material-symbols-outlined">arrow_back_ios_new</span>
        </button>
        <h2 className="text-lg font-extrabold leading-tight tracking-tight flex-1 text-center pr-10 text-text-main-light dark:text-white">明信片回憶</h2>
      </header>

      <div className="flex-1 flex flex-col items-center justify-start pt-6 pb-80 px-6 relative z-10">
        <div className="relative group w-full max-w-sm mb-8">
          <div className="relative bg-white p-3 pb-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-xl transform transition-transform hover:rotate-1 hover:scale-[1.02] border border-gray-100/50">
            <div className="w-full aspect-[3/2] bg-gray-200 rounded-lg overflow-hidden relative">
              <div
                className="w-full h-full bg-cover bg-center"
                style={{ backgroundImage: `url(${displayPostcard.imageUrl})` }}
              />
            </div>
            <div className="mt-4 px-1 flex justify-between items-center opacity-60">
              <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Pikmin Bloom Card</span>
              <span className="material-symbols-outlined text-gray-300 text-lg">local_florist</span>
            </div>
          </div>
        </div>

        <div className="w-full max-w-sm flex flex-col items-center text-center space-y-4">
          {isEditing ? (
            <div className="w-full bg-white/50 dark:bg-black/20 p-4 rounded-2xl border border-primary/20 space-y-3">
              <div className="space-y-1 text-left">
                <label className="text-[10px] uppercase font-bold text-primary tracking-wider">標題</label>
                <input
                  type="text"
                  value={editData.title}
                  onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white/80 dark:bg-black/40 outline-none text-lg font-bold text-center text-text-main-light dark:text-white"
                  placeholder="輸入標題"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1 text-left">
                  <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">國家</label>
                  <input
                    type="text"
                    value={editData.country}
                    onChange={(e) => setEditData(prev => ({ ...prev, country: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white/80 dark:bg-black/40 outline-none text-sm font-bold text-center text-gray-600 dark:text-gray-300"
                    placeholder="國家"
                  />
                </div>
                <div className="space-y-1 text-left">
                  <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">地點</label>
                  <input
                    type="text"
                    value={editData.location}
                    onChange={(e) => setEditData(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white/80 dark:bg-black/40 outline-none text-sm font-bold text-center text-gray-600 dark:text-gray-300"
                    placeholder="地點"
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-center pt-2">
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-1.5 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-600 font-bold text-sm transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={isSaving}
                  className="px-4 py-1.5 rounded-lg bg-primary hover:bg-primary-dark text-white font-bold text-sm transition-colors flex items-center gap-1"
                >
                  {isSaving ? <span className="material-symbols-outlined animate-spin text-sm">sync</span> : <span className="material-symbols-outlined text-sm">check</span>}
                  儲存
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="relative group/edit">
                <h1 className="text-2xl font-extrabold text-text-main-light dark:text-white tracking-tight leading-tight">
                  {displayPostcard.title}
                </h1>
                <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mt-1 mb-1">
                  {displayPostcard.country} {displayPostcard.location}
                </p>
                <button
                  onClick={handleStartEdit}
                  className="absolute -right-8 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-gray-300 hover:text-primary hover:bg-primary/10 transition-all"
                  title="編輯資訊"
                >
                  <span className="material-symbols-outlined text-[18px]">edit</span>
                </button>
              </div>
            </>
          )}

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/20 text-green-900 dark:text-green-100 text-sm font-bold shadow-sm border border-primary/10">
            <span className="material-symbols-outlined text-[18px]">calendar_today</span>
            <span>收集日期：{displayPostcard.date}</span>
          </div>

          <div className="w-full bg-white/60 dark:bg-black/20 backdrop-blur-sm rounded-xl p-5 border border-white/40 dark:border-white/5 shadow-sm mt-2">
            <div className="flex gap-3 items-start">
              <span className="material-symbols-outlined text-primary mt-1">format_quote</span>
              <p className="text-base text-gray-600 dark:text-gray-300 font-medium leading-relaxed text-left">
                {displayPostcard.description} 這是一份很棒的旅行紀念。
              </p>
            </div>
          </div>

          <div className="w-full pt-4 text-left">
            <div className="flex items-center gap-3 mb-3 pl-1">
              <h3 className="text-xs font-bold text-green-800/60 dark:text-green-200/60 uppercase tracking-widest">寄送紀錄</h3>
              <div className="h-px flex-1 bg-green-800/10 dark:bg-white/10 rounded-full"></div>
            </div>

            <div className="bg-[#fcfdf6] dark:bg-[#1a2e20] border border-green-800/10 dark:border-green-800/30 rounded-2xl p-4 shadow-sm relative overflow-visible">
              <div className="space-y-3 relative z-10">
                {/* 顯示已寄送清單 */}
                {displayPostcard.sentTo && displayPostcard.sentTo.length > 0 && (
                  <div className="space-y-2">
                    {displayPostcard.sentTo.map((name, index) => (
                      <div key={`${name}-${index}`} className="flex items-center justify-between p-2.5 rounded-xl bg-white/50 dark:bg-black/20 hover:bg-white transition-colors border border-transparent">
                        <div className="flex items-center gap-3">
                          {(() => {
                            const matchedFriend = friends.find(f => f.name === name);
                            if (matchedFriend && isCustomAvatar(matchedFriend.avatar)) {
                              return (
                                <div className="w-10 h-10 rounded-full border-2 border-white shadow-sm overflow-hidden shrink-0">
                                  <img src={matchedFriend.avatar} alt={name} className="w-full h-full object-cover" />
                                </div>
                              );
                            }
                            const avatarColor = matchedFriend ? getAvatarColor(name, matchedFriend.id) : 'bg-slate-400';
                            return (
                              <div className={`w-10 h-10 rounded-full ${avatarColor} border-2 border-white flex items-center justify-center font-bold text-xs text-white`}>
                                {getInitials(name)}
                              </div>
                            );
                          })()}
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-text-main-light dark:text-white">{name}</span>
                            <span className="text-[10px] text-gray-400">已成功寄送給此皮友</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-green-50 text-green-600 border border-green-100">
                            <span className="text-[10px] font-bold uppercase">SENT</span>
                            <span className="material-symbols-outlined text-[16px]">check_circle</span>
                          </div>
                          <button
                            onClick={async () => {
                              const newSentTo = displayPostcard.sentTo?.filter((_, i) => i !== index) || [];
                              const { error } = await updatePostcardSentTo(postcard.id, newSentTo.length > 0 ? newSentTo : null);
                              if (error) {
                                alert('刪除失敗：' + error);
                              } else {
                                setDisplayPostcard(prev => ({ ...prev, sentTo: newSentTo.length > 0 ? newSentTo : undefined }));
                              }
                            }}
                            className="size-8 flex items-center justify-center rounded-lg bg-red-50 hover:bg-red-100 text-red-500 border border-red-100 transition-colors active:scale-95"
                            title="刪除紀錄"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 輸入框區域：始終顯示或點擊 + 號顯示 */}
                <div className="flex flex-col gap-3 pt-2">
                  {validationError && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700">
                      <span className="material-symbols-outlined text-lg">error</span>
                      <p className="text-xs font-medium">{validationError}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[11px] text-gray-500 font-medium">
                      {displayPostcard.sentTo && displayPostcard.sentTo.length > 0 ? '繼續新增收件人：' : '尚未有寄送紀錄，你可以手動標註收件人：'}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={recipientName}
                        onChange={(e) => {
                          setRecipientName(e.target.value);
                          setShowSuggestions(true);
                          setValidationError('');
                        }}
                        onFocus={() => setShowSuggestions(true)}
                        placeholder="輸入收件人姓名..."
                        disabled={isSaving}
                        className="w-full h-10 px-4 bg-white/80 dark:bg-black/20 border border-green-800/10 dark:border-green-800/30 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all font-medium"
                      />

                      {showSuggestions && suggestedFriends.length > 0 && (
                        <div className="absolute z-[110] left-0 right-0 top-full mt-1 bg-white dark:bg-[#1a2e20] border border-green-800/10 dark:border-green-800/30 rounded-xl shadow-lg max-h-52 overflow-y-auto overflow-x-hidden animate-in fade-in slide-in-from-top-1 duration-200">
                          {suggestedFriends.map(friend => (
                            <button
                              key={friend.id}
                              onClick={() => {
                                setRecipientName(friend.name);
                                setShowSuggestions(false);
                              }}
                              type="button"
                              className="w-full flex items-center gap-3 p-3 hover:bg-primary/10 transition-colors text-left border-b border-green-800/5 last:border-0"
                            >
                              {isCustomAvatar(friend.avatar) ? (
                                <div className="w-10 h-10 rounded-full border-2 border-white shadow-sm overflow-hidden shrink-0">
                                  <img src={friend.avatar} alt={friend.name} className="w-full h-full object-cover" />
                                </div>
                              ) : (
                                <div className={`w-10 h-10 rounded-full ${getAvatarColor(friend.name, friend.id)} border-2 border-white flex items-center justify-center shadow-sm shrink-0`}>
                                  <span className="text-white font-black text-xs tracking-tighter">
                                    {getInitials(friend.name)}
                                  </span>
                                </div>
                              )}
                              <div className="flex flex-col">
                                <span className="text-sm font-bold text-text-main-light dark:text-white truncate">{friend.name}</span>
                                {friend.isFavorite && <span className="text-[9px] text-primary font-bold uppercase">最愛皮友</span>}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                      {showSuggestions && suggestedFriends.length > 0 && (
                        <div className="fixed inset-0 z-40" onClick={() => setShowSuggestions(false)} />
                      )}
                    </div>
                    <button
                      onClick={async () => {
                        setValidationError('');
                        if (!recipientName.trim()) return;
                        const matchedFriend = friends.find(f => f.name.toLowerCase() === recipientName.trim().toLowerCase());
                        if (!matchedFriend) {
                          setValidationError('此皮友尚未新增，請先至「皮友」頁面新增皮友後再寄送。');
                          return;
                        }

                        // 檢查是否已在清單中
                        if (displayPostcard.sentTo?.includes(matchedFriend.name)) {
                          setValidationError('此皮友已在寄送清單中。');
                          return;
                        }

                        setIsSaving(true);
                        const newSentTo = [...(displayPostcard.sentTo || []), matchedFriend.name];
                        const { error } = await updatePostcardSentTo(postcard.id, newSentTo);
                        if (error) {
                          alert('儲存失敗：' + error);
                        } else {
                          setDisplayPostcard(prev => ({ ...prev, sentTo: newSentTo }));
                          setRecipientName(''); // 清空輸入框
                        }
                        setIsSaving(false);
                        setShowSuggestions(false);

                        // 強制重置 iOS Zoom
                        if (document.activeElement instanceof HTMLElement) {
                          document.activeElement.blur();
                        }
                        const viewport = document.querySelector('meta[name="viewport"]');
                        if (viewport) {
                          const originalContent = viewport.getAttribute('content');
                          if (originalContent) {
                            // 強制重置 iOS Zoom: 加入 user-scalable=0 增加強制性
                            viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0');
                            // 延長至 300ms 確保瀏覽器有足夠時間重繪
                            setTimeout(() => {
                              viewport.setAttribute('content', originalContent);
                            }, 300);
                          }
                        }
                      }}
                      disabled={isSaving || !recipientName.trim()}
                      className="px-4 bg-primary text-white text-xs font-bold rounded-xl shadow-sm hover:shadow-md active:scale-95 transition-all disabled:opacity-50 flex items-center gap-1"
                    >
                      {isSaving ? (
                        <span className="animate-spin material-symbols-outlined text-sm">sync</span>
                      ) : (
                        <span className="material-symbols-outlined text-sm">add</span>
                      )}
                      新增
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 w-full max-w-md bg-gradient-to-t from-background-light via-background-light to-transparent dark:from-background-dark dark:via-background-dark pb-6 pt-12 px-6 z-30">
        <button
          onClick={onSend}
          className="w-full relative overflow-hidden group flex items-center justify-center gap-3 bg-primary hover:bg-[#25d660] active:scale-[0.98] transition-all duration-200 text-white h-14 rounded-2xl shadow-lg shadow-primary/30"
        >
          <span className="material-symbols-outlined relative z-10">send</span>
          <span className="text-lg font-bold tracking-wide relative z-10">寄送給皮友</span>
        </button>
      </div>
    </div>
  );
};

export default DetailView;
