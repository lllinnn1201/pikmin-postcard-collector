
import React from 'react';
import { ViewState } from '../types';

interface BottomNavProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentView, onNavigate }) => {
  // 新增標籤：上傳與朋友
  const navItems: { label: string, icon: string, view: ViewState }[] = [
    { label: '上傳', icon: 'add_circle', view: 'upload' },
    { label: '明信片', icon: 'style', view: 'collection' },
    { label: '皮友', icon: 'group', view: 'friends' },
    { label: '紀錄', icon: 'calendar_month', view: 'records' }
  ];

  // 判斷目前是否為活躍的導覽項
  const getIsActive = (view: ViewState) => {
    if (view === 'collection') {
      return currentView === 'collection' || currentView === 'detail' || currentView === 'selectFriend';
    }
    return currentView === view;
  };

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-[100] bg-white pt-2 pb-6 px-4 rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.08)] border-t border-gray-50/50">
      <div className="flex items-center justify-around w-full h-14">
        {navItems.map((item) => {
          const active = getIsActive(item.view);
          return (
            <button
              key={item.view}
              onClick={() => onNavigate(item.view)}
              className="relative flex flex-col items-center justify-center flex-1 h-full transition-all duration-300"
            >
              <div className={`
                flex items-center justify-center rounded-2xl transition-all duration-300 mb-1
                ${active
                  ? 'bg-primary/10 text-primary px-3 py-1.5'
                  : 'text-slate-400'}
              `}>
                <span className={`material-symbols-outlined ${active ? 'text-[26px]' : 'text-24px'}`} style={{ fontVariationSettings: active ? "'FILL' 1" : "" }}>
                  {item.icon}
                </span>
              </div>

              <span className={`
                text-[10px] font-black transition-all duration-300
                ${active ? 'text-primary opacity-100' : 'text-slate-400 opacity-60'}
              `}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
