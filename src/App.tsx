import { STATIONS, REFRESH_INTERVAL } from './config';
import type { StationStats } from './types';
import StationCard from './components/StationCard';
import { useStationData } from './hooks/useStationData';
import { calculateTotalStats, formatTime, getEarliestUpdateTime } from './utils/stationUtils';
import './App.css';

function App() {
  const { stationData, countdown, refresh, isLoading } = useStationData();

  // 计算总统计
  const totalStats: StationStats = calculateTotalStats(stationData.map((s) => s.stats));

  // 获取最早更新时间
  const lastUpdateTime = getEarliestUpdateTime(stationData);

  // 计算进度条百分比
  const progressPercent = (countdown / (REFRESH_INTERVAL / 1000)) * 100;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 顶部导航栏 */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold">园区电动车充电桩监控</h1>
              <p className="text-blue-200 text-sm mt-1">共 {STATIONS.length} 个充电站 | {totalStats.total} 个桩位</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-blue-200">最后更新</div>
              <div className="text-lg font-mono">{formatTime(lastUpdateTime)}</div>
            </div>
          </div>
        </div>
      </header>

      {/* 主体内容 */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* 总体统计卡片 */}
        <div className="grid grid-cols-5 gap-3 mb-6">
          <div className="bg-white rounded-xl shadow-md p-4 text-center border-t-4 border-blue-500">
            <div className="text-gray-500 text-sm font-medium">总数</div>
            <div className="text-3xl font-bold text-gray-700 mt-1">{totalStats.total}</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 text-center border-t-4 border-green-500">
            <div className="text-gray-500 text-sm font-medium">空闲</div>
            <div className="text-3xl font-bold text-green-500 mt-1">{totalStats.idle}</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 text-center border-t-4 border-red-500">
            <div className="text-gray-500 text-sm font-medium">充电中</div>
            <div className="text-3xl font-bold text-red-500 mt-1">{totalStats.charging}</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 text-center border-t-4 border-yellow-500">
            <div className="text-gray-500 text-sm font-medium">故障</div>
            <div className="text-3xl font-bold text-yellow-500 mt-1">{totalStats.error}</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 text-center border-t-4 border-gray-400">
            <div className="text-gray-500 text-sm font-medium">离线</div>
            <div className="text-3xl font-bold text-gray-400 mt-1">{totalStats.offline}</div>
          </div>
        </div>

        {/* 刷新控制栏 */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="text-gray-600">
                <span className="text-gray-400">下次刷新:</span>
                <span className="font-bold text-blue-600 ml-2 text-lg">{countdown}秒</span>
              </div>
              <div className="w-48 h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-1000"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>
            <button
              onClick={refresh}
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

        {/* 各充电站卡片 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {stationData.map((station) => (
            <StationCard
              key={station.config.id}
              name={station.config.name}
              equipmentCode={station.config.equipmentCode}
              piles={station.piles}
              loading={station.loading}
              error={station.error}
              lastUpdate={station.lastUpdate}
            />
          ))}
        </div>
      </main>

      {/* 页脚 */}
      <footer className="bg-gray-800 text-gray-400 text-sm text-center py-4 mt-8">
        <p>数据每 {REFRESH_INTERVAL / 1000} 秒自动更新 | 园区充电桩监控系统 v2.0</p>
      </footer>
    </div>
  );
}

export default App;