import { useMemo } from 'react';
import type { EquipmentData } from '../types';
import { StationStatus, STATUS_CONFIG } from '../types';
import { parseStatus, formatPower, formatEnergy, formatTime, calculateStats } from '../utils/stationUtils';

interface StationCardProps {
  name: string;
  equipmentCode: string;
  piles: EquipmentData[];
  loading: boolean;
  error: string | null;
  lastUpdate: Date | null;
}

const StationCard: React.FC<StationCardProps> = ({
  name,
  equipmentCode,
  piles,
  loading,
  error,
  lastUpdate,
}) => {
  const stats = useMemo(() => calculateStats(piles), [piles]);

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      {/* 头部 */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-bold text-lg">{name}</h3>
            <p className="text-blue-200 text-xs">设备编号：{equipmentCode} | 共 {stats.total} 个桩位</p>
          </div>
          <div className="text-right text-white text-xs">
            <div className="text-blue-200">更新时间</div>
            <div className="font-mono">{formatTime(lastUpdate)}</div>
          </div>
        </div>
      </div>

      {/* 统计条 */}
      <div className="grid grid-cols-5 gap-2 px-4 py-2 bg-gray-50 border-b">
        <div className="text-center">
          <div className="text-gray-500 text-xs">总数</div>
          <div className="font-bold text-gray-700">{stats.total}</div>
        </div>
        <div className="text-center">
          <div className="text-gray-500 text-xs">空闲</div>
          <div className="font-bold text-green-500">{stats.idle}</div>
        </div>
        <div className="text-center">
          <div className="text-gray-500 text-xs">充电中</div>
          <div className="font-bold text-red-500">{stats.charging}</div>
        </div>
        <div className="text-center">
          <div className="text-gray-500 text-xs">故障</div>
          <div className="font-bold text-yellow-500">{stats.error}</div>
        </div>
        <div className="text-center">
          <div className="text-gray-500 text-xs">离线</div>
          <div className="font-bold text-gray-400">{stats.offline}</div>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-3 mx-4 my-2 rounded text-sm text-red-700">
          ⚠️ {error}
        </div>
      )}

      {/* 加载状态 */}
      {loading && piles.length === 0 && (
        <div className="flex items-center justify-center py-8">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* 桩位网格 */}
      {piles.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 p-4">
          {piles.map((equipment, index) => {
            const status = parseStatus(equipment);
            const config = STATUS_CONFIG[status];

            return (
              <div
                key={equipment.pileNumber || equipment.pileId || index}
                className={`relative rounded-lg border-2 p-3 transition-all duration-200 hover:shadow-md ${
                  status === StationStatus.CHARGING
                    ? 'bg-red-50 border-red-300'
                    : status === StationStatus.ERROR
                    ? 'bg-yellow-50 border-yellow-300'
                    : status === StationStatus.OFFLINE
                    ? 'bg-gray-50 border-gray-200'
                    : 'bg-green-50 border-green-200'
                }`}
              >
                {/* 状态指示点 */}
                <div className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full ${config.bgColor} animate-pulse`}></div>

                {/* 桩位编号 */}
                <div className="text-center mb-2">
                  <span className="text-gray-400 text-xs">桩位</span>
                  <div className="text-lg font-bold text-gray-700">
                    #{String(equipment.pileNumber).padStart(2, '0')}
                  </div>
                </div>

                {/* 状态 */}
                <div className="flex flex-col items-center">
                  <span className={`text-2xl ${config.color}`}>{config.icon}</span>
                  <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full mt-1 ${
                    status === StationStatus.IDLE ? 'bg-green-200 text-green-700' :
                    status === StationStatus.CHARGING ? 'bg-red-200 text-red-700' :
                    status === StationStatus.ERROR ? 'bg-yellow-200 text-yellow-700' :
                    'bg-gray-200 text-gray-600'
                  }`}>
                    {config.label}
                  </span>
                </div>

                {/* 充电信息 */}
                <div className="text-center mt-2 space-y-0.5 text-xs">
                  {equipment.power !== undefined && equipment.power !== null && equipment.power > 0 && (
                    <div className="text-gray-500">
                      功率: <span className="font-mono text-gray-600">{formatPower(equipment.power)}</span>
                    </div>
                  )}
                  {equipment.energy !== undefined && equipment.energy !== null && equipment.energy > 0 && (
                    <div className="text-gray-500">
                      电量: <span className="font-mono text-gray-600">{formatEnergy(equipment.energy)}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StationCard;