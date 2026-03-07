import type { EquipmentData, StationStats, StationStatusType } from '../types';
import { StationStatus } from '../types';

/**
 * 从 API 响应中解析充电桩状态
 */
export const parseStatus = (equipment: EquipmentData): StationStatusType => {
  // 优先检查 socketStatusName 字段
  if (equipment.socketStatusName !== undefined && equipment.socketStatusName !== null) {
    const socketStatus = String(equipment.socketStatusName).toLowerCase().trim();

    if (['idle', 'free', 'available', '0', '空闲', '可用', '未连接', '待机'].includes(socketStatus)) {
      return StationStatus.IDLE;
    }
    if (['charging', 'busy', 'occupied', '1', '充电中', '占用', '2', '充电', '已连接', '准备充电', '忙碌'].includes(socketStatus)) {
      return StationStatus.CHARGING;
    }
    if (['error', 'fault', '3', '故障', '错误', '告警'].includes(socketStatus)) {
      return StationStatus.ERROR;
    }
    if (['offline', 'disconnected', '4', '离线', '断开'].includes(socketStatus)) {
      return StationStatus.OFFLINE;
    }
  }

  // 检查在线状态
  if (equipment.online === false) {
    return StationStatus.OFFLINE;
  }

  // 检查连接状态
  const connectStatus = equipment.connectStatus ?? equipment.status;
  if (connectStatus !== undefined && connectStatus !== null) {
    const statusStr = String(connectStatus).toLowerCase();
    if (['offline', 'disconnected', '4', '离线'].includes(statusStr)) {
      return StationStatus.OFFLINE;
    }
  }

  // 检查故障状态
  const errorCode = equipment.errorCode ?? equipment.faultType ?? equipment.faultCode;
  if (errorCode !== undefined && errorCode !== null) {
    if (errorCode !== 0 && errorCode !== '0' && errorCode !== '') {
      return StationStatus.ERROR;
    }
  }

  // 检查状态字段
  const statusValue =
    equipment.runStatus ??
    equipment.chargingStatus ??
    equipment.occupyStatus ??
    equipment.state ??
    equipment.status;

  if (statusValue !== undefined && statusValue !== null) {
    const statusStr = String(statusValue).toLowerCase();

    if (['idle', 'free', 'available', '0', '空闲', '可用', '未连接'].includes(statusStr)) {
      return StationStatus.IDLE;
    }
    if (['charging', 'busy', 'occupied', '1', '充电中', '占用', '2', '充电'].includes(statusStr)) {
      return StationStatus.CHARGING;
    }
    if (['error', 'fault', '3', '故障', '错误'].includes(statusStr)) {
      return StationStatus.ERROR;
    }
    if (['offline', 'disconnected', '4', '离线'].includes(statusStr)) {
      return StationStatus.OFFLINE;
    }
  }

  // 检查充电功率
  if (equipment.power !== undefined && equipment.power !== null && equipment.power > 0) {
    return StationStatus.CHARGING;
  }

  // 检查电流
  if (equipment.current !== undefined && equipment.current !== null && equipment.current > 0) {
    return StationStatus.CHARGING;
  }

  return StationStatus.UNKNOWN;
};

/**
 * 从 API 响应中提取充电桩数据
 */
export const extractPileList = (responseData: unknown): EquipmentData[] => {
  let piles: EquipmentData[] = [];

  if (!responseData) {
    return piles;
  }

  const data = responseData as Record<string, unknown>;

  // 尝试多种可能的数据结构
  const socketListFields = ['socketList', 'socketInfo', 'gunList', 'gunInfo'];

  // 情况 1: 直接查找 socketList 字段
  for (const field of socketListFields) {
    if (data[field] && Array.isArray(data[field])) {
      piles = data[field] as EquipmentData[];
      break;
    }
  }

  // 情况 2: data 是数组
  if (piles.length === 0 && data.data && Array.isArray(data.data)) {
    piles = data.data as EquipmentData[];
  }

  // 情况 3: data 是对象，包含列表字段
  if (piles.length === 0 && data.data && typeof data.data === 'object') {
    const innerData = data.data as Record<string, unknown>;
    for (const field of socketListFields) {
      if (innerData[field] && Array.isArray(innerData[field])) {
        piles = innerData[field] as EquipmentData[];
        break;
      }
    }
    if (piles.length === 0) {
      const listFields = ['pileList', 'pileInfo', 'children', 'list'];
      for (const field of listFields) {
        if (innerData[field] && Array.isArray(innerData[field])) {
          piles = innerData[field] as EquipmentData[];
          break;
        }
      }
    }
  }

  // 情况 4: result 字段
  if (piles.length === 0 && data.result) {
    if (Array.isArray(data.result)) {
      piles = data.result as EquipmentData[];
    } else if (typeof data.result === 'object') {
      const result = data.result as Record<string, unknown>;
      for (const field of socketListFields) {
        if (result[field] && Array.isArray(result[field])) {
          piles = result[field] as EquipmentData[];
          break;
        }
      }
    }
  }

  // 情况 5: 响应本身就是数组
  if (piles.length === 0 && Array.isArray(responseData)) {
    piles = responseData as EquipmentData[];
  }

  // 确保每个桩都有编号，并缓存状态解析结果
  piles = piles.map((item, index) => {
    const enriched = {
      ...item,
      pileNumber: item.pileNumber ?? item.gunNumber ?? item.socketNumber ?? item.pileId ?? item.gunId ?? item.socketId ?? (index + 1),
    };
    // 缓存 parseStatus 结果，避免重复解析
    (enriched as Record<string, unknown>)._parsedStatus = parseStatus(enriched);
    return enriched;
  });

  return piles;
};

/**
 * 计算统计信息
 */
export const calculateStats = (piles: EquipmentData[]): StationStats => {
  const stats: StationStats = { total: piles.length, idle: 0, charging: 0, error: 0, offline: 0 };

  for (const eq of piles) {
    const status = ((eq as Record<string, unknown>)._parsedStatus as StationStatusType | undefined) ?? parseStatus(eq);
    switch (status) {
      case StationStatus.IDLE:
        stats.idle++;
        break;
      case StationStatus.CHARGING:
        stats.charging++;
        break;
      case StationStatus.ERROR:
        stats.error++;
        break;
      case StationStatus.OFFLINE:
        stats.offline++;
        break;
      default:
        stats.offline++;
        break;
    }
  }

  return stats;
};

/**
 * 汇总多个充电站统计
 */
export const calculateTotalStats = (statsList: StationStats[]): StationStats => {
  return statsList.reduce(
    (acc, stat) => ({
      total: acc.total + stat.total,
      idle: acc.idle + stat.idle,
      charging: acc.charging + stat.charging,
      error: acc.error + stat.error,
      offline: acc.offline + stat.offline,
    }),
    { total: 0, idle: 0, charging: 0, error: 0, offline: 0 }
  );
};

/**
 * 格式化功率
 */
export const formatPower = (power?: number): string => {
  if (power === undefined || power === null || power === 0) return '--';
  return `${power.toFixed(1)} kW`;
};

/**
 * 格式化电量
 */
export const formatEnergy = (energy?: number): string => {
  if (energy === undefined || energy === null || energy === 0) return '--';
  return `${energy.toFixed(2)} kWh`;
};

/**
 * 格式化时间
 */
export const formatTime = (date: Date | null): string => {
  if (!date) return '--:--:--';
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

/**
 * 获取最早的更新时间
 */
export const getEarliestUpdateTime = (stationData: { lastUpdate: Date | null }[]): Date | null => {
  return stationData.reduce<Date | null>((acc, s) => {
    if (!s.lastUpdate) return acc;
    if (!acc) return s.lastUpdate;
    return s.lastUpdate < acc ? s.lastUpdate : acc;
  }, null);
};