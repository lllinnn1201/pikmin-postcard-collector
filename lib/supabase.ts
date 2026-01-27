// Supabase 客戶端初始化
// 此檔案負責建立與 Supabase 後端的連線

import { createClient } from '@supabase/supabase-js';

// 從環境變數取得 Supabase 設定
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 建立 Supabase 客戶端實例
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
