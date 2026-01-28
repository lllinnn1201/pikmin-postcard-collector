
import React, { useState, useRef } from 'react';
import { usePostcards } from '../hooks/usePostcards';
import { useFriends } from '../hooks/useFriends';

const UploadView: React.FC = () => {
    const { addPostcard, uploadImage } = usePostcards();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // 好友相關狀態
    const { friends } = useFriends();
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [searchTerm, setSearchTerm] = useState(''); // 搜尋關鍵字
    const [selectedFriends, setSelectedFriends] = useState<string[]>([]); // 已選擇的皮友

    const [formData, setFormData] = useState({
        title: '',
        location: '',
        country: '',
        category: '蘑菇', // 預設改為蘑菇
        description: '',
        color: '#ed6c00',
        collectedDate: new Date().toISOString().split('T')[0],
    });

    // 處理檔案選擇
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            // 建立本地預覽連結
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            setSuccess(false);
            setError(null);
        }
    };

    // 觸發隱藏的檔案選擇器
    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile) {
            setError('請選擇一張明信片圖片');
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            // 1. 驗證好友是否存在 (若輸入框有文字但未點選)
            let finalFriends = [...selectedFriends];
            if (searchTerm.trim()) {
                const matchedFriend = friends.find(
                    (f) => f.name.toLowerCase() === searchTerm.trim().toLowerCase()
                );
                if (!matchedFriend) {
                    setError('此皮友尚未新增，請先至「皮友」頁面新增皮友後再寄送。');
                    setLoading(false);
                    return;
                }
                // 如果在名單中但不在已選清單，則加入
                if (!finalFriends.includes(matchedFriend.name)) {
                    finalFriends.push(matchedFriend.name);
                }
            }

            // 2. 上傳圖片到 Storage
            const uploadResult = await uploadImage(selectedFile);
            if (uploadResult.error) throw new Error(uploadResult.error);
            if (!uploadResult.data) throw new Error('圖片上傳失敗，未取得網址');

            // 3. 儲存明信片資料
            const result = await addPostcard({
                ...formData,
                imageUrl: uploadResult.data,
                isSpecial: formData.category === '花瓣', // 如果是花瓣，則設為特殊
                sentTo: finalFriends.length > 0 ? finalFriends : undefined, // 存入多位寄送者
                description: `${formData.category} - ${formData.description}` // 將分類存入描述開頭
            });

            if (result.error) {
                throw new Error(result.error);
            } else {
                setSuccess(true);
                // 清空表單，並將標題重置為空，由 placeholder 顯示「臺北101」
                setFormData({
                    title: '',
                    location: '',
                    country: '',
                    category: '蘑菇',
                    description: '',
                    color: '#ed6c00',
                    collectedDate: new Date().toISOString().split('T')[0],
                });
                setSelectedFriends([]);
                setSearchTerm('');
                setSelectedFile(null);
                setPreviewUrl(null);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // 加入好友到選擇列表
    const addFriend = (name: string) => {
        if (!selectedFriends.includes(name)) {
            setSelectedFriends(prev => [...prev, name]);
        }
        setSearchTerm('');
        setShowSuggestions(false);
    };

    // 從選擇列表移除好友
    const removeFriend = (name: string) => {
        setSelectedFriends(prev => prev.filter(n => n !== name));
    };

    // --- 好友頭像同步邏輯 (與 DetailView 一致) ---
    // 取得重複名稱列表（用於分配不同顏色）
    const getDuplicateNames = () => {
        const nameCount: Record<string, number> = {};
        friends.forEach(f => {
            nameCount[f.name] = (nameCount[f.name] || 0) + 1;
        });
        return Object.keys(nameCount).filter(name => nameCount[name] > 1);
    };
    const duplicateNames = getDuplicateNames();

    // 根據名稱生成背景色
    const getAvatarColor = (name: string, friendId: string) => {
        const colors = [
            'bg-sky-500', 'bg-rose-500', 'bg-emerald-500', 'bg-amber-500', 'bg-violet-500',
            'bg-orange-500', 'bg-teal-500', 'bg-pink-500', 'bg-lime-500', 'bg-indigo-500',
        ];
        const hashSource = duplicateNames.includes(name) ? name + friendId : name;
        let hash = 0;
        for (let i = 0; i < hashSource.length; i++) {
            hash = hashSource.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    };

    // 判斷是否為自訂頭像
    const isCustomAvatar = (avatar: string) => {
        return avatar && !avatar.includes('ui-avatars.com') && !avatar.includes('placeholder');
    };

    // 取得顯示名稱的首字母
    const getInitials = (name: string) => {
        return name.slice(0, 2).toUpperCase();
    };
    // ---------------------------------------

    return (
        <div className="flex flex-col h-full min-h-screen bg-[#f6f7f7] px-4 pt-10 pb-28">
            <header className="mb-6">
                <h1 className="text-2xl font-black text-slate-800 tracking-tight mb-1">上傳明信片</h1>
                <p className="text-sm text-slate-400">從相簿挑選新收集的明信片</p>
            </header>

            <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100">
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* 隱藏的 Input */}
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                    />

                    {/* 圖片上傳/預覽區 */}
                    <div
                        onClick={triggerFileInput}
                        className={`
              relative aspect-[3/2] w-full bg-slate-50 rounded-2xl overflow-hidden border-2 border-dashed transition-all cursor-pointer
              ${previewUrl ? 'border-primary/30' : 'border-slate-200 hover:border-primary/50'}
              flex items-center justify-center group
            `}
                    >
                        {previewUrl ? (
                            <>
                                <img src={previewUrl} alt="預覽" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <span className="text-white font-black text-sm bg-black/40 px-4 py-2 rounded-full backdrop-blur-sm">點擊更換圖片</span>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center gap-3 text-slate-400 group-hover:text-primary transition-colors">
                                <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center">
                                    <span className="material-symbols-outlined text-3xl">add_a_photo</span>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-black">點擊開啟相簿</p>
                                    <p className="text-[10px] font-bold opacity-60 mt-0.5 uppercase tracking-tighter">支援 JPG, PNG 格式</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 block px-1">標題 (選填)</label>
                            <input
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="例如：臺北101"
                                className="w-full px-4 py-3.5 bg-slate-50 border-none rounded-2xl text-slate-700 placeholder:text-slate-300 focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 block px-1">國家 (選填)</label>
                                <input
                                    name="country"
                                    value={formData.country}
                                    onChange={handleChange}
                                    placeholder="國家名稱"
                                    className="w-full px-4 py-3.5 bg-slate-50 border-none rounded-2xl text-slate-700 placeholder:text-slate-300 focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 block px-1">地點 (選填)</label>
                                <input
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    placeholder="地點名稱"
                                    className="w-full px-4 py-3.5 bg-slate-50 border-none rounded-2xl text-slate-700 placeholder:text-slate-300 focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                                />
                            </div>
                        </div>

                        <div className="relative">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 block px-1">寄送皮友 (選填)</label>

                            {/* 已選擇的皮友列表 */}
                            {selectedFriends.length > 0 && (
                                <div className="space-y-3 mb-4">
                                    {selectedFriends.map(name => {
                                        const friend = friends.find(f => f.name === name);
                                        const initials = friend ? getInitials(friend.name) : name.slice(0, 2).toUpperCase();
                                        const avatarColor = friend ? getAvatarColor(friend.name, friend.id) : 'bg-gray-400';

                                        return (
                                            <div key={name} className="flex items-center justify-between p-3 bg-white rounded-2xl border border-slate-100 shadow-sm">
                                                <div className="flex items-center gap-3">
                                                    {friend && isCustomAvatar(friend.avatar) ? (
                                                        <div className="w-12 h-12 rounded-full border-2 border-slate-50 shadow-sm overflow-hidden shrink-0">
                                                            <img src={friend.avatar} alt={friend.name} className="w-full h-full object-cover" />
                                                        </div>
                                                    ) : (
                                                        <div className={`w-12 h-12 rounded-full ${avatarColor} border-2 border-white flex items-center justify-center shadow-sm shrink-0`}>
                                                            <span className="text-white font-black text-sm tracking-tighter">
                                                                {initials}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <div>
                                                        <h3 className="font-bold text-slate-700 text-sm">{name}</h3>
                                                        <p className="text-xs text-primary font-bold mt-0.5">預計寄送</p>
                                                    </div>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => removeFriend(name)}
                                                    className="w-10 h-10 flex items-center justify-center rounded-full text-slate-200 hover:bg-red-50 hover:text-red-500 transition-all active:scale-95"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">delete</span>
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            <input
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setShowSuggestions(true);
                                }}
                                onFocus={() => setShowSuggestions(true)}
                                placeholder={selectedFriends.length > 0 ? "新增皮友名稱" : "皮友名稱"}
                                className="w-full px-4 py-3.5 bg-slate-50 border-none rounded-2xl text-slate-700 placeholder:text-slate-300 focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                            />

                            {/* 好友建議選單 */}
                            {showSuggestions && searchTerm && friends.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()) && !selectedFriends.includes(f.name)).length > 0 && (
                                <div className="absolute z-[110] left-0 right-0 top-full mt-1 bg-white border border-slate-100 rounded-2xl shadow-xl max-h-48 overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-200">
                                    {friends
                                        .filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()) && !selectedFriends.includes(f.name))
                                        .map(friend => (
                                            <div
                                                key={friend.id}
                                                onClick={() => addFriend(friend.name)}
                                                className="flex items-center gap-3 p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0"
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
                                                <span className="text-sm font-bold text-slate-700">{friend.name}</span>
                                            </div>
                                        ))
                                    }
                                </div>
                            )}

                            {/* 點擊外部隱藏建議 */}
                            {showSuggestions && <div className="fixed inset-0 z-40" onClick={() => setShowSuggestions(false)} />}
                        </div>

                        <div>
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 block px-1">明信片分類</label>
                            <div className="flex gap-4 px-1">
                                {['蘑菇', '探險', '花瓣'].map((cat) => (
                                    <div
                                        key={cat}
                                        onClick={() => setFormData(prev => ({ ...prev, category: cat }))}
                                        className="flex items-center gap-3 cursor-pointer group"
                                    >
                                        <div className={`
                                            w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
                                            ${formData.category === cat
                                                ? 'border-primary bg-primary'
                                                : 'border-slate-300 bg-white group-hover:border-primary/50'}
                                        `}>
                                            <div className={`
                                                w-2.5 h-2.5 rounded-full bg-white transition-all
                                                ${formData.category === cat ? 'scale-100' : 'scale-0'}
                                            `} />
                                        </div>
                                        <span className={`text-sm font-black transition-colors ${formData.category === cat ? 'text-primary' : 'text-slate-500'}`}>
                                            {cat}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 block px-1">收集日期</label>
                            <input
                                required
                                type="date"
                                name="collectedDate"
                                value={formData.collectedDate}
                                onChange={handleChange}
                                className="w-full px-4 py-3.5 bg-slate-50 border-none rounded-2xl text-slate-700 focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 rounded-2xl border border-red-100 flex items-start gap-2">
                            <span className="material-symbols-outlined text-red-500 text-sm mt-0.5">error</span>
                            <p className="text-red-500 text-xs font-bold leading-relaxed flex-1">{error}</p>
                        </div>
                    )}

                    {success && (
                        <div className="p-4 bg-green-50 rounded-2xl border border-green-100 flex items-center gap-2">
                            <span className="material-symbols-outlined text-green-500 text-sm">check_circle</span>
                            <p className="text-green-600 text-xs font-bold leading-relaxed">成功加入我的明信片！</p>
                        </div>
                    )}

                    <button
                        disabled={loading}
                        type="submit"
                        className={`
              w-full py-4 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2
              ${loading
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                : 'bg-primary text-white shadow-[0_8px_30px_rgba(237,108,0,0.3)] hover:shadow-[0_12px_40px_rgba(237,108,0,0.4)] active:scale-[0.98]'}
            `}
                    >
                        <span className="material-symbols-outlined font-bold">{loading ? 'sync' : 'cloud_upload'}</span>
                        <span className="font-black tracking-widest uppercase">{loading ? '正在上傳圖片...' : '確認上傳明信片'}</span>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UploadView;
