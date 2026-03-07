import { useState, useEffect } from 'react';
import { REFRESH_INTERVAL } from '../config';

interface RefreshCountdownProps {
  onRefresh: () => Promise<void>;
  isLoading: boolean;
}

const REFRESH_INTERVAL_SECONDS = REFRESH_INTERVAL / 1000;

const RefreshCountdown: React.FC<RefreshCountdownProps> = ({ onRefresh, isLoading }) => {
  const [countdown, setCountdown] = useState<number>(REFRESH_INTERVAL_SECONDS);

  // 当外部的 isLoading 变为 true 时 (例如刚拉取完数据), 重置倒计时
  useEffect(() => {
    if (!isLoading) {
      setCountdown(REFRESH_INTERVAL_SECONDS);
    }
  }, [isLoading]);

  useEffect(() => {
    // 只有在非 isLoading 状态下才倒数
    if (isLoading) return;
    
    const countdownTimer = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? REFRESH_INTERVAL_SECONDS : prev - 1));
    }, 1000);
    return () => clearInterval(countdownTimer);
  }, [isLoading]);

  const progressPercent = (countdown / REFRESH_INTERVAL_SECONDS) * 100;

  return (
    <div className="bg-white rounded-xl shadow-md p-4 mb-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="text-gray-600">
            <span className="text-gray-400">下次刷新:</span>
            <span className="font-bold text-blue-600 ml-2 text-lg">{countdown}秒</span>
          </div>
          <div className="w-48 h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all ${
                countdown === REFRESH_INTERVAL_SECONDS ? 'duration-0' : 'duration-1000'
              }`}
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
        <button
          onClick={() => {
            setCountdown(REFRESH_INTERVAL_SECONDS); // 立即重置 UI 避免显示 0 秒
            onRefresh();
          }}
          disabled={isLoading}
          className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium rounded-lg transition-all shadow-md hover:shadow-lg disabled:shadow-none"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>刷新中...</span>
            </>
          ) : (
            <>
              <span>🔄</span>
              <span>立即刷新</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default RefreshCountdown;
