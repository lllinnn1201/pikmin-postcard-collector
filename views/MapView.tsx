
import React from 'react';
import { Postcard } from '../types';
import { MOCK_POSTCARDS } from '../constants';

interface MapViewProps {
  onBack: () => void;
  onSelectPostcard: (p: Postcard) => void;
}

const MapView: React.FC<MapViewProps> = ({ onBack, onSelectPostcard }) => {
  const mainPostcard = MOCK_POSTCARDS[0];

  return (
    <div className="relative h-screen w-full overflow-hidden flex flex-col">
      {/* Map Background */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center z-0" 
        style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuCE0TZ5AN0ImSy8dOqibnzO_Y9hliouXrYvcc4GBfNhbdIr8wcqdqpfCosAFppdyv1RobQ9dCayPT-bhjRFCw51oW5oYHXZuoQ9UNSfX_yLNH7HX5zcbXuG7ZB6VUl0oaiCwk86EkOxrDNu-XbVsbiYEBftYFqHujFO1uqDy5oJFGxLYK5uKrc_NP-yXpTXfirCrqDR_Wy03M3jMpxeNYDZVgclNThotK-sa0GIVN21I1O6DlAZmxw6Hwk-KaDJk3WgrhvdZ119V1bt')` }}
      >
        <div className="absolute inset-0 bg-black/5"></div>
      </div>

      {/* Map Content Overlay */}
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Search Header */}
        <div className="p-4 pt-10">
          <div className="flex flex-col gap-3 max-w-lg mx-auto">
            <div className="relative flex items-center w-full h-12 rounded-full shadow-soft bg-white dark:bg-slate-800 border border-transparent focus-within:border-primary transition-all px-4">
              <span className="material-symbols-outlined text-primary mr-2">search</span>
              <input 
                className="w-full bg-transparent border-none focus:ring-0 text-slate-800 dark:text-white placeholder-slate-400 text-base" 
                placeholder="搜尋地點..." 
              />
              <span className="material-symbols-outlined text-slate-400">tune</span>
            </div>
            <div className="flex gap-2 overflow-x-auto hide-scrollbar">
              {['全部', '稀有', '已寄送', '已收到'].map((label, idx) => (
                <button 
                  key={label}
                  className={`px-4 h-9 text-sm font-semibold rounded-full shadow-sm whitespace-nowrap ${idx === 0 ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-gray-100'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Floating Controls */}
        <div className="absolute right-4 bottom-52 flex flex-col gap-4 items-end">
          <div className="flex flex-col bg-white dark:bg-slate-800 rounded-2xl shadow-soft overflow-hidden border border-gray-100">
            <button className="p-3 hover:bg-gray-50 border-b border-gray-100 text-slate-700">
              <span className="material-symbols-outlined">add</span>
            </button>
            <button className="p-3 hover:bg-gray-50 text-slate-700">
              <span className="material-symbols-outlined">remove</span>
            </button>
          </div>
          <button className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-soft border border-gray-100 text-slate-700">
            <span className="material-symbols-outlined">my_location</span>
          </button>
        </div>

        {/* Central Pin */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer">
          <div className="mb-2 px-3 py-1 bg-white rounded-full shadow-md">
            <span className="text-xs font-bold text-slate-800">中央公園</span>
          </div>
          <div className="relative">
            <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-lg border-[3px] border-white">
              <span className="material-symbols-outlined text-[28px] text-slate-900 font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>local_florist</span>
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-4 h-4 bg-primary rotate-45 border-r-[3px] border-b-[3px] border-white"></div>
          </div>
        </div>

        {/* Postcard Preview Card */}
        <div className="mt-auto p-4 mb-24">
          <div className="bg-white dark:bg-slate-900 rounded-[24px] p-4 shadow-xl border border-gray-100 flex flex-col gap-4 animate-in slide-in-from-bottom-4">
            <div className="flex items-start gap-4">
              <div 
                onClick={() => onSelectPostcard(mainPostcard)}
                className="relative w-24 h-24 shrink-0 rounded-2xl overflow-hidden shadow-inner cursor-pointer"
              >
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${mainPostcard.imageUrl})` }}></div>
              </div>
              <div className="flex-1 min-w-0 flex flex-col gap-1 py-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{mainPostcard.title}</h3>
                    <p className="text-xs font-medium text-gray-500">{mainPostcard.country}{mainPostcard.location}</p>
                  </div>
                  <button onClick={onBack} className="text-gray-400 hover:text-gray-600">
                    <span className="material-symbols-outlined text-[20px]">close</span>
                  </button>
                </div>
                <div className="mt-auto flex items-center gap-1.5 p-1.5 bg-background-light dark:bg-slate-800 rounded-lg w-fit">
                  <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[12px] text-red-500">bug_report</span>
                  </div>
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-300 pr-1">由紅色皮克敏發現</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => onSelectPostcard(mainPostcard)} className="flex-1 h-12 bg-primary hover:bg-[#25d360] active:scale-95 transition-all rounded-xl flex items-center justify-center gap-2 text-slate-900 font-bold shadow-sm">
                <span className="material-symbols-outlined text-[20px]">send</span>
                <span>寄送給好友</span>
              </button>
              <button className="w-12 h-12 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-slate-800 text-slate-700 dark:text-white">
                <span className="material-symbols-outlined text-[22px]">favorite_border</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;
