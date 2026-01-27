<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 皮克敏明信片

一個使用 React + TypeScript + Vite 開發的前端應用程式，後端使用 Supabase 進行資料儲存與使用者認證。

## 技術棧

- **前端**: React 19 + TypeScript + Vite
- **後端**: Supabase（PostgreSQL + Auth）
- **樣式**: Tailwind CSS

## 專案結構

```
pikmin-postcard-collector/
├── App.tsx                    # 主應用程式元件
├── types.ts                   # TypeScript 型別定義
├── constants.ts               # Mock 資料（開發用）
├── lib/
│   └── supabase.ts           # Supabase 客戶端初始化
├── contexts/
│   └── AuthContext.tsx       # 認證狀態管理 Context
├── hooks/
│   ├── usePostcards.ts       # 明信片 CRUD Hook
│   ├── useFriends.ts         # 好友 CRUD Hook
│   ├── useExchangeRecords.ts # 交換紀錄 Hook
│   └── useProfile.ts         # 個人檔案 Hook
├── views/
│   ├── LoginView.tsx         # 登入頁面
│   ├── CollectionView.tsx    # 收藏館頁面
│   ├── DetailView.tsx        # 明信片詳情頁面
│   ├── SelectFriendView.tsx  # 選擇好友頁面
│   ├── RecordsView.tsx       # 寄送紀錄頁面
│   └── ProfileView.tsx       # 個人檔案頁面
├── components/
│   └── BottomNav.tsx         # 底部導覽列
└── database/
    ├── schema.sql            # 資料表結構腳本
    ├── policies.sql          # RLS 安全政策腳本
    └── seed.sql              # 初始資料腳本
```

## 快速開始

### 1. 安裝依賴

```bash
npm install
```

### 2. 設定 Supabase

1. 前往 [Supabase](https://supabase.com) 建立專案
2. 複製 `.env.example` 為 `.env.local`
3. 填入您的 Supabase 設定：

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. 建立資料庫

在 Supabase Dashboard > SQL Editor 中依序執行：

1. `database/schema.sql` - 建立資料表
2. `database/policies.sql` - 設定安全政策
3. `database/seed.sql` - 匯入初始資料（可選）

### 4. 執行開發伺服器

```bash
npm run dev
```

## 資料模型

### Postcard（明信片）
- id, title, location, country, imageUrl, date, description, color, isSpecial, isFavorite

### Friend（好友）
- id, name, lastActive, avatar, recentSent, isFavorite

### ExchangeRecord（交換紀錄）
- id, friendId, friendName, friendAvatar, date, postcardTitle, postcardImageUrl, type, status

## 功能特色

- ✅ 使用者認證（登入/註冊/登出）
- ✅ 明信片收藏瀏覽
- ✅ 明信片收藏功能
- ✅ 好友列表管理
- ✅ 明信片寄送紀錄
- ✅ 個人檔案頁面
- ✅ 響應式設計

## 開發說明

- 當 Supabase 尚未設定時，應用程式會自動使用 `constants.ts` 中的 Mock 資料
- 所有視圖元件都支援載入中狀態與錯誤處理
- 使用 Row Level Security (RLS) 確保資料安全
