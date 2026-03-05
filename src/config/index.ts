// API 配置
export const API_CONFIG = {
  BASE_URL: 'https://api.dingdingzn.com/uapp/charging/order/equipment',
  TIMEOUT: 10000,
} as const;

// 刷新间隔配置（毫秒）
export const REFRESH_INTERVAL = 20000;

// 充电站配置
export const STATIONS = [
  { id: 'station1', name: 'A6门充电站', equipmentCode: '26450360', location: '阿里巴巴北京朝阳科技园A6门附近' },
  { id: 'station2', name: 'B3门充电站', equipmentCode: '26450315', location: '阿里巴巴北京朝阳科技园B3门附近' },
  { id: 'station3', name: 'B6门充电站', equipmentCode: '26450343', location: '阿里巴巴北京朝阳科技园B6门附近' },
  { id: 'station4', name: 'C8门充电站', equipmentCode: '26450344', location: '阿里巴巴北京朝阳科技园C8门附近' },
] as const;

export type StationConfig = typeof STATIONS[number];