/// <reference types="vite/client" />

// 定義 Vite 環境變數型別
// 讓 TypeScript 認識自訂的環境變數

interface ImportMetaEnv {
    readonly VITE_SUPABASE_URL: string;       // Supabase 專案 URL
    readonly VITE_SUPABASE_ANON_KEY: string;  // Supabase 匿名金鑰
    readonly GEMINI_API_KEY?: string;         // Gemini API 金鑰（可選）
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
