
import React, { useState } from 'react';
import { useFriends } from '../hooks/useFriends';

const FriendsView: React.FC = () => {
    const { friends, createFriend, deleteFriend, updateFriendName, updateFriendAvatar, resetFriendAvatar, toggleFavoriteFriend, loading: loadingFriends } = useFriends();
    const [uploadingAvatarId, setUploadingAvatarId] = useState<string | null>(null); // 正在上傳頭像的好友 ID
    const fileInputRef = React.useRef<HTMLInputElement>(null); // 檔案輸入元素參考
    const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null); // 選取中的好友 ID（用於頭像上傳）
    const [newFriendName, setNewFriendName] = useState('');
    const [searchTerm, setSearchTerm] = useState(''); // 搜尋字串狀態
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    // 分類標籤狀態（全部 / 我的最愛）
    const [filterTab, setFilterTab] = useState<'all' | 'favorites'>('all');
    // 刪除確認對話框狀態
    const [friendToDelete, setFriendToDelete] = useState<{ id: string; name: string } | null>(null);
    // 編輯對話框狀態
    const [friendToEdit, setFriendToEdit] = useState<{ id: string; name: string } | null>(null);
    const [editName, setEditName] = useState(''); // 編輯中的名稱

    // 計算重複名稱列表（用於分配不同顏色）
    const getDuplicateNames = () => {
        const nameCount: Record<string, number> = {}; // 名稱出現次數
        friends.forEach(f => {
            nameCount[f.name] = (nameCount[f.name] || 0) + 1; // 計算每個名稱出現次數
        });
        return Object.keys(nameCount).filter(name => nameCount[name] > 1); // 回傳出現超過一次的名稱
    };
    const duplicateNames = getDuplicateNames(); // 取得重複名稱列表

    // 根據名稱生成背景色（重複名稱時加入 friendId 確保不同顏色）
    const getAvatarColor = (name: string, friendId: string) => {
        // 使用對比強烈、色系差異大的顏色（避免相近色）
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

    // 取得名稱縮寫
    const getInitials = (name: string) => {
        return name.slice(0, 2).toUpperCase(); // 取前兩個字元並轉大寫
    };

    // 判斷是否為自訂頭像（非預設頭像）
    const isCustomAvatar = (avatar: string) => {
        return avatar && !avatar.includes('ui-avatars.com') && !avatar.includes('placeholder'); // 非預設頭像 URL
    };

    // 處理頭像上傳
    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]; // 取得選擇的檔案
        if (!file || !selectedFriendId) return; // 沒有檔案或沒有選擇好友則返回

        setUploadingAvatarId(selectedFriendId); // 設定上傳中狀態
        await updateFriendAvatar(selectedFriendId, file); // 上傳頭像
        setUploadingAvatarId(null); // 清除上傳中狀態
        setSelectedFriendId(null); // 清除選擇的好友
        e.target.value = ''; // 清空檔案輸入
    };

    // 點擊相機圖示觸發檔案選擇
    const handleCameraClick = (friendId: string) => {
        setSelectedFriendId(friendId); // 記錄要上傳頭像的好友
        fileInputRef.current?.click(); // 觸發檔案選擇對話框
    };

    const handleAddFriend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newFriendName.trim()) return;

        setLoading(true);
        setError(null);

        const result = await createFriend(newFriendName.trim());

        if (result.error) {
            setError(result.error);
        } else {
            setNewFriendName('');
        }
        setLoading(false);
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

    // 根據搜尋字串和分類過濾朋友列表，並按名稱排序
    const filteredFriends = friends
        .filter(friend => {
            // 先按分類過濾
            if (filterTab === 'favorites' && !friend.isFavorite) return false;
            // 再按搜尋字串過濾
            return friend.name.toLowerCase().includes(searchTerm.toLowerCase());
        })
        .sort((a, b) => compareName(a.name, b.name));

    return (
        <div className="flex flex-col h-full min-h-screen bg-[#f6f7f7] px-4 pt-10 pb-28">
            <header className="mb-6">
                <h1 className="text-2xl font-black text-slate-800 tracking-tight mb-1">皮友名單</h1>
                <p className="text-sm text-slate-400">管理你的皮友名單，隨時準備分享驚喜</p>
            </header>

            {/* 隱藏的檔案輸入 - 用於頭像上傳 */}
            <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
            />

            {/* 搜尋欄 - 與明信片列表樣式一致 */}
            <div className="mb-6">
                <div className="relative flex items-center w-full h-12 shadow-soft rounded-full bg-white border border-gray-100/50 focus-within:border-primary/50 transition-all overflow-hidden group">
                    <div className="absolute left-4 flex items-center justify-center text-primary/60">
                        <span className="material-symbols-outlined text-[22px]">search</span>
                    </div>
                    <input
                        className="w-full h-full bg-transparent border-none pl-12 pr-4 text-sm font-bold placeholder-slate-400 focus:ring-0 focus:outline-none"
                        placeholder="搜尋皮友名稱..."
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* 新增好友區 */}
            <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 mb-8">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 block px-1">新增皮友</label>
                <form onSubmit={handleAddFriend} className="flex gap-2">
                    <input
                        required
                        value={newFriendName}
                        onChange={(e) => setNewFriendName(e.target.value)}
                        placeholder="輸入皮友暱稱"
                        className="flex-1 px-4 py-3.5 bg-slate-50 border-none rounded-2xl text-slate-700 placeholder:text-slate-300 focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                    />
                    <button
                        disabled={loading}
                        type="submit"
                        className={`
              w-14 h-14 rounded-2xl transition-all duration-300 flex items-center justify-center
              ${loading
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                : 'bg-primary text-white shadow-lg active:scale-90'}
            `}
                    >
                        <span className="material-symbols-outlined font-bold">person_add</span>
                    </button>
                </form>
                {error && <p className="mt-2 text-red-500 text-xs font-bold px-1">{error}</p>}
            </div>

            {/* 皮友列表區 */}
            <div className="space-y-4">
                {/* 分類標籤 */}
                <div className="flex gap-2 mb-4">
                    <button
                        onClick={() => setFilterTab('all')}
                        className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${filterTab === 'all'
                            ? 'bg-primary text-white shadow-md'
                            : 'bg-white text-slate-500 hover:bg-slate-100'
                            }`}
                    >
                        全部 ({friends.length})
                    </button>
                    <button
                        onClick={() => setFilterTab('favorites')}
                        className={`px-4 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-1.5 ${filterTab === 'favorites'
                            ? 'bg-rose-500 text-white shadow-md'
                            : 'bg-white text-slate-500 hover:bg-slate-100'
                            }`}
                    >
                        <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: filterTab === 'favorites' ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
                        我的最愛 ({friends.filter(f => f.isFavorite).length})
                    </button>
                </div>

                <div className="flex items-center justify-between px-1 mb-2">
                    <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                        {searchTerm ? `搜尋結果 (${filteredFriends.length})` : filterTab === 'favorites' ? `我的最愛 (${filteredFriends.length})` : `目前名單 (${filteredFriends.length})`}
                    </h2>
                </div>

                {loadingFriends ? (
                    <div className="py-10 text-center">
                        <div className="material-symbols-outlined text-primary animate-spin text-3xl">refresh</div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {filteredFriends.map((friend) => (
                            <div
                                key={friend.id}
                                className="bg-white rounded-[28px] p-4 flex items-center gap-3 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-lg transition-all"
                            >
                                {/* 愛心按鈕 - 在頭像左邊 */}
                                <button
                                    onClick={() => toggleFavoriteFriend(friend.id)}
                                    className="w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90 shrink-0"
                                >
                                    <span
                                        className={`material-symbols-outlined text-[24px] transition-all ${friend.isFavorite
                                            ? 'text-rose-500'
                                            : 'text-slate-300 hover:text-rose-400'
                                            }`}
                                        style={{ fontVariationSettings: friend.isFavorite ? "'FILL' 1" : "'FILL' 0" }}
                                    >
                                        favorite
                                    </span>
                                </button>
                                {/* 統一風格頭像 - 含相機圖示 */}
                                <div className="relative shrink-0">
                                    {/* 頭像本體 */}
                                    {isCustomAvatar(friend.avatar) ? (
                                        // 自訂頭像：顯示上傳的圖片
                                        <div className="w-14 h-14 rounded-full border-2 border-white shadow-sm overflow-hidden">
                                            <img
                                                src={friend.avatar}
                                                alt={friend.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ) : (
                                        // 預設頭像：顯示名稱縮寫 + 顏色背景
                                        <div className={`w-14 h-14 rounded-full ${getAvatarColor(friend.name, friend.id)} border-2 border-white flex items-center justify-center shadow-sm`}>
                                            <span className="text-white font-black text-lg tracking-tighter">
                                                {getInitials(friend.name)}
                                            </span>
                                        </div>
                                    )}
                                    {/* 由於現在移至編輯彈窗，這裡不再顯示按鈕組合 */}

                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-lg font-black text-slate-800 leading-tight">{friend.name}</h3>
                                        {/* 編輯名稱按鈕 */}
                                        <button
                                            onClick={() => {
                                                setFriendToEdit({ id: friend.id, name: friend.name });
                                                setEditName(friend.name);
                                            }}
                                            className="w-7 h-7 rounded-full flex items-center justify-center text-slate-300 hover:text-primary hover:bg-primary/10 transition-all active:scale-90"
                                        >
                                            <span className="material-symbols-outlined text-[16px]">edit</span>
                                        </button>
                                    </div>
                                </div>
                                {/* 刪除按鈕 - 點擊後顯示確認對話框 */}
                                <button
                                    onClick={() => setFriendToDelete({ id: friend.id, name: friend.name })}
                                    className="w-10 h-10 rounded-full flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all active:scale-90"
                                >
                                    <span className="material-symbols-outlined text-[20px]">delete</span>
                                </button>
                            </div>
                        ))}

                        {filteredFriends.length === 0 && (
                            <div className="py-20 text-center">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-50">
                                    <span className="material-symbols-outlined text-slate-200 text-3xl">person</span>
                                </div>
                                <p className="text-slate-400 font-bold">還沒有皮友喔！</p>
                                <p className="text-xs text-slate-300">快在上方輸入名稱來新增皮友吧</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* 刪除確認對話框 */}
            {friendToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center pb-[10vh]">
                    {/* 背景遮罩 */}
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => setFriendToDelete(null)}
                    />
                    {/* 對話框內容 */}
                    <div className="relative bg-white rounded-3xl p-6 mx-6 shadow-2xl max-w-sm w-full animate-in zoom-in-95 duration-200">
                        {/* 圖示 */}
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="material-symbols-outlined text-red-500 text-3xl">person_remove</span>
                        </div>
                        {/* 標題 */}
                        <h3 className="text-xl font-black text-slate-800 text-center mb-2">
                            刪除皮友
                        </h3>
                        {/* 說明文字 */}
                        <p className="text-slate-500 text-center mb-6">
                            確定要刪除皮友「<span className="font-bold text-slate-700">{friendToDelete.name}</span>」嗎？
                        </p>
                        {/* 按鈕區 */}
                        <div className="flex gap-3">
                            {/* 取消按鈕 */}
                            <button
                                onClick={() => setFriendToDelete(null)}
                                className="flex-1 py-3 px-4 rounded-2xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-all active:scale-95"
                            >
                                取消
                            </button>
                            {/* 確定刪除按鈕 */}
                            <button
                                onClick={() => {
                                    deleteFriend(friendToDelete.id);
                                    setFriendToDelete(null);
                                }}
                                className="flex-1 py-3 px-4 rounded-2xl bg-red-500 text-white font-bold hover:bg-red-600 transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined text-[18px]">delete</span>
                                刪除
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 編輯皮友對話框 */}
            {friendToEdit && (
                <div className="fixed inset-0 z-50 flex items-center justify-center pb-[10vh]">
                    {/* 背景遮罩 */}
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => setFriendToEdit(null)}
                    />
                    {/* 對話框內容 */}
                    <div className="relative bg-white rounded-[40px] p-8 mx-6 shadow-2xl max-w-sm w-full animate-in zoom-in-95 duration-200">
                        {/* 標題與圖示 */}
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="material-symbols-outlined text-primary text-3xl">edit</span>
                            </div>
                            <h3 className="text-2xl font-black text-slate-800">
                                編輯皮友
                            </h3>
                        </div>

                        {/* 頭像編輯區域 */}
                        <div className="flex flex-col items-center mb-8">
                            <div className="relative group">
                                {friends.find(f => f.id === friendToEdit.id) && (
                                    <>
                                        {/* 頭像顯示 */}
                                        {isCustomAvatar(friends.find(f => f.id === friendToEdit.id)!.avatar) ? (
                                            <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-slate-100">
                                                <img
                                                    src={friends.find(f => f.id === friendToEdit.id)!.avatar}
                                                    alt={friendToEdit.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <div className={`w-32 h-32 rounded-full ${getAvatarColor(friendToEdit.name, friendToEdit.id)} border-4 border-white flex items-center justify-center shadow-xl`}>
                                                <span className="text-white font-black text-4xl tracking-tighter">
                                                    {getInitials(friendToEdit.name)}
                                                </span>
                                            </div>
                                        )}

                                        {/* 編輯按鈕組 */}
                                        <div className="absolute -bottom-2 flex gap-3 w-full justify-center">
                                            {/* 恢復預設按鈕 */}
                                            {isCustomAvatar(friends.find(f => f.id === friendToEdit.id)!.avatar) && (
                                                <button
                                                    onClick={() => resetFriendAvatar(friendToEdit.id)}
                                                    className="w-12 h-12 bg-white rounded-2xl shadow-lg border border-gray-100 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all active:scale-90"
                                                    title="恢復預設頭像"
                                                >
                                                    <span className="material-symbols-outlined text-[24px]">history</span>
                                                </button>
                                            )}
                                            {/* 相機按鈕 */}
                                            <button
                                                onClick={() => handleCameraClick(friendToEdit.id)}
                                                disabled={uploadingAvatarId === friendToEdit.id}
                                                className="w-12 h-12 bg-white rounded-2xl shadow-lg border border-gray-100 flex items-center justify-center text-slate-400 hover:text-primary hover:bg-primary/5 transition-all active:scale-90 disabled:opacity-50"
                                            >
                                                {uploadingAvatarId === friendToEdit.id ? (
                                                    <span className="material-symbols-outlined text-[24px] animate-spin">refresh</span>
                                                ) : (
                                                    <span className="material-symbols-outlined text-[24px]">photo_camera</span>
                                                )}
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* 名稱輸入框 */}
                        <div className="mb-8">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">皮友名稱</label>
                            <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                placeholder="輸入新名稱"
                                className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-slate-700 placeholder:text-slate-300 focus:ring-2 focus:ring-primary/20 transition-all font-bold text-lg"
                                autoFocus
                            />
                        </div>

                        {/* 按鈕區 */}
                        <div className="flex gap-4">
                            {/* 取消按鈕 */}
                            <button
                                onClick={() => setFriendToEdit(null)}
                                className="flex-1 py-4 px-4 rounded-2xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-all active:scale-95 text-base"
                            >
                                取消
                            </button>
                            {/* 確定修改按鈕 */}
                            <button
                                onClick={async () => {
                                    if (editName.trim()) {
                                        await updateFriendName(friendToEdit.id, editName.trim());
                                    }
                                    setFriendToEdit(null);
                                }}
                                disabled={!editName.trim()}
                                className="flex-1 py-4 px-4 rounded-2xl bg-primary text-white font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-base"
                            >
                                <span className="material-symbols-outlined text-[20px]">check</span>
                                確定
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FriendsView;
