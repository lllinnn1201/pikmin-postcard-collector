
export interface Postcard {
  id: string;
  title: string;
  location: string;
  country: string;
  imageUrl: string;
  date: string;
  description: string;
  color: string;
  isSpecial?: boolean;
  isFavorite?: boolean;
  sentTo?: string; // 寄送對象名稱
  category: string; // 分類（蘑菇、探險、花瓣）
}

export interface Friend {
  id: string;
  name: string;
  lastActive: string;
  avatar: string;
  recentSent: string[];
  isFavorite: boolean;
}

export interface ExchangeRecord {
  id: string;
  friendId: string;
  friendName: string;
  friendAvatar: string;
  date: string;
  postcardTitle: string;
  postcardImageUrl: string;
  type: 'sent' | 'received';
  status: 'claimed' | 'delivered' | 'pending';
}

// 頁面狀態類型定義
export type ViewState = 'login' | 'collection' | 'detail' | 'selectFriend' | 'records' | 'upload' | 'friends';
