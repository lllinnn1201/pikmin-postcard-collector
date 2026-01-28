
import React from 'react';

// 統一的載入動畫元件
// 提供全螢幕或是容器內的載入樣式
interface LoadingProps {
    fullScreen?: boolean;
    message?: string;
    size?: 'sm' | 'md' | 'lg';
}

const Loading: React.FC<LoadingProps> = ({
    fullScreen = false,
    message = '載入中...',
    size = 'md'
}) => {
    // 根據尺寸決定大小
    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-12 h-12',
        lg: 'w-16 h-16'
    };

    const containerClasses = fullScreen
        ? "fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background-light/80 backdrop-blur-sm"
        : "flex flex-col items-center justify-center py-12 w-full";

    return (
        <div className={containerClasses}>
            <div className="relative">
                {/* 皮克敏風格的綠色圓圈動畫 */}
                <div className={`${sizeClasses[size]} border-4 border-secondary rounded-full`}></div>
                <div className={`${sizeClasses[size]} border-4 border-primary border-t-transparent rounded-full animate-spin absolute top-0 left-0`}></div>
            </div>
            {message && (
                <p className="mt-4 text-text-sec-light font-bold text-sm tracking-wide animate-pulse">
                    {message}
                </p>
            )}
        </div>
    );
};

export default Loading;
