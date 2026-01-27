
import React, { useState, useRef } from 'react';
import { usePostcards } from '../hooks/usePostcards';

const UploadView: React.FC = () => {
    const { addPostcard, uploadImage } = usePostcards();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

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
            // 1. 上傳圖片到 Storage
            const uploadResult = await uploadImage(selectedFile);
            if (uploadResult.error) throw new Error(uploadResult.error);
            if (!uploadResult.data) throw new Error('圖片上傳失敗，未取得網址');

            // 2. 儲存明信片資料
            const result = await addPostcard({
                ...formData,
                imageUrl: uploadResult.data,
                isSpecial: formData.category === '花瓣', // 如果是花瓣，則設為特殊
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
              relative aspect-[4/3] w-full bg-slate-50 rounded-2xl overflow-hidden border-2 border-dashed transition-all cursor-pointer
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
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 block px-1">明信片標題</label>
                            <input
                                required
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="例如：臺北101"
                                className="w-full px-4 py-3.5 bg-slate-50 border-none rounded-2xl text-slate-700 placeholder:text-slate-300 focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 block px-1">國家</label>
                                <input
                                    name="country"
                                    value={formData.country}
                                    onChange={handleChange}
                                    placeholder="國家名稱（選填）"
                                    className="w-full px-4 py-3.5 bg-slate-50 border-none rounded-2xl text-slate-700 placeholder:text-slate-300 focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 block px-1">地點</label>
                                <input
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    placeholder="地點名稱（選填）"
                                    className="w-full px-4 py-3.5 bg-slate-50 border-none rounded-2xl text-slate-700 placeholder:text-slate-300 focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                                />
                            </div>
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
                            <p className="text-green-600 text-xs font-bold leading-relaxed">成功加入收藏箱！</p>
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
