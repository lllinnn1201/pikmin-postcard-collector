
import React from 'react';

// 骨架屏組件
// 用於資料載入前的佔位，減少佈局跳動感
interface SkeletonProps {
    className?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({ className = "" }) => {
    return (
        <div className={`animate-pulse bg-slate-100 rounded-xl ${className}`}></div>
    );
};

// 明信片卡片的骨架屏
export const PostcardSkeleton: React.FC = () => {
    return (
        <div className="flex flex-col bg-white rounded-[24px] overflow-hidden shadow-card border border-gray-100">
            {/* 模擬圖片區域 */}
            <div className="aspect-[3/2] w-full bg-slate-50 animate-pulse"></div>

            {/* 模擬文字區域 */}
            <div className="p-3">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2" />
            </div>
        </div>
    );
};

export default Skeleton;
