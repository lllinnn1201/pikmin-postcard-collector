
// 主應用程式元件
// 包含路由邏輯與整體應用程式結構

import React, { useState, useEffect } from 'react';
import { ViewState, Postcard } from './types';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginView from './views/LoginView';
import CollectionView from './views/CollectionView';
import DetailView from './views/DetailView';
import SelectFriendView from './views/SelectFriendView';
import RecordsView from './views/RecordsView';
import UploadView from './views/UploadView';
import FriendsView from './views/FriendsView';
import BottomNav from './components/BottomNav';

// 主要應用程式內容（需在 AuthProvider 內部使用）
const AppContent: React.FC = () => {
  // 取得認證狀態
  const { user, loading } = useAuth();

  // 當前視圖狀態
  const [currentView, setCurrentView] = useState<ViewState>('login');

  // 選中的明信片（用於詳情頁）
  const [selectedPostcard, setSelectedPostcard] = useState<Postcard | null>(null);

  // 監聽認證狀態變化，自動導向
  useEffect(() => {
    if (!loading) {
      // 若已登入但在登入頁，則導向收藏頁
      if (user && currentView === 'login') {
        setCurrentView('collection');
      }
      // 若未登入但不在登入頁，則導向登入頁
      if (!user && currentView !== 'login') {
        setCurrentView('login');
      }
    }
  }, [user, loading, currentView]);

  // 導覽函數
  const navigateTo = (view: ViewState, postcard?: Postcard) => {
    if (postcard) setSelectedPostcard(postcard);
    setCurrentView(view);
  };

  // 顯示載入中畫面
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined text-6xl text-primary animate-pulse">
            local_florist
          </span>
          <p className="text-text-sec-light font-medium">載入中...</p>
        </div>
      </div>
    );
  }

  // 渲染當前視圖
  const renderView = () => {
    switch (currentView) {
      case 'login':
        // 登入成功後由 useEffect 自動導向
        return <LoginView onLogin={() => navigateTo('collection')} />;
      case 'collection':
        return (
          <CollectionView
            onSelectPostcard={(p) => navigateTo('detail', p)}
          />
        );
      case 'detail':
        return selectedPostcard ? (
          <DetailView
            postcard={selectedPostcard}
            onBack={() => navigateTo('collection')}
            onSend={() => navigateTo('selectFriend')}
          />
        ) : (
          <CollectionView
            onSelectPostcard={(p) => navigateTo('detail', p)}
          />
        );
      case 'selectFriend':
        return <SelectFriendView onBack={() => navigateTo('detail')} onSent={() => navigateTo('collection')} />;
      case 'records':
        return <RecordsView />;
      case 'upload':
        return <UploadView />;
      case 'friends':
        return <FriendsView />;
      default:
        return <LoginView onLogin={() => navigateTo('collection')} />;
    }
  };

  // 登入頁面不顯示導覽列
  const showNav = currentView !== 'login';

  return (
    <div className="min-h-screen max-w-md mx-auto relative flex flex-col shadow-2xl overflow-hidden bg-background-light border-x border-gray-100 font-sans">
      <div className="fixed inset-0 bg-pattern pointer-events-none z-0"></div>

      <main className="flex-1 z-10 overflow-y-auto no-scrollbar relative">
        {renderView()}
      </main>

      {showNav && (
        <BottomNav
          currentView={currentView}
          onNavigate={navigateTo}
        />
      )}
    </div>
  );
};

// 主應用程式元件（包裝 AuthProvider）
const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
