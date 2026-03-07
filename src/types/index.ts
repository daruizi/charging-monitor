// 单个设备/充电桩数据
export interface EquipmentData {
  // 设备基本信息
  equipmentCode?: string;
  equipmentName?: string;
  pileNumber?: string | number;
  pileId?: string | number;
  gunId?: string | number;
  gunNumber?: string | number;
  socketId?: string | number;
  socketNumber?: string | number;

  // 状态字段
  socketStatusName?: string;
  socketStatus?: string | number;
  status?: string | number;
  state?: string | number;
  occupyStatus?: string | number;
  chargingStatus?: string | number;
  runStatus?: string | number;

  // 故障/在线状态
  errorCode?: string | number;
  faultType?: string | number;
  faultCode?: string | number;
  online?: boolean;
  connectStatus?: string | number;

  // 充电相关信息
  power?: number;
  voltage?: number;
  current?: number;
  soc?: number;
  duration?: number;
  energy?: number;

  // 嵌套结构
  pileList?: EquipmentData[];
  gunList?: EquipmentData[];
  socketList?: EquipmentData[];
  children?: EquipmentData[];

  [key: string]: unknown;
}

// 充电桩状态常量
export const StationStatus = {
  IDLE: 'idle',
  CHARGING: 'charging',
  ERROR: 'error',
  OFFLINE: 'offline',
  UNKNOWN: 'unknown',
} as const;

export type StationStatusType = (typeof StationStatus)[keyof typeof StationStatus];

// 状态配置
export const STATUS_CONFIG: Record<StationStatusType, {
  label: string;
  color: string;
  bgColor: string;
  icon: string;
  description: string;
  cardBg: string;
  cardBorder: string;
  badgeClass: string;
  pulse: boolean;
}> = {
  [StationStatus.IDLE]: {
    label: '空闲',
    color: 'text-green-500',
    bgColor: 'bg-green-500',
    icon: '●',
    description: '可用',
    cardBg: 'bg-green-50',
    cardBorder: 'border-green-200',
    badgeClass: 'bg-green-200 text-green-700',
    pulse: false,
  },
  [StationStatus.CHARGING]: {
    label: '充电中',
    color: 'text-red-500',
    bgColor: 'bg-red-500',
    icon: '⚡',
    description: '占用',
    cardBg: 'bg-red-50',
    cardBorder: 'border-red-300',
    badgeClass: 'bg-red-200 text-red-700',
    pulse: true,
  },
  [StationStatus.ERROR]: {
    label: '故障',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500',
    icon: '!',
    description: '故障',
    cardBg: 'bg-yellow-50',
    cardBorder: 'border-yellow-300',
    badgeClass: 'bg-yellow-200 text-yellow-700',
    pulse: true,
  },
  [StationStatus.OFFLINE]: {
    label: '离线',
    color: 'text-gray-400',
    bgColor: 'bg-gray-400',
    icon: '○',
    description: '离线',
    cardBg: 'bg-gray-50',
    cardBorder: 'border-gray-200',
    badgeClass: 'bg-gray-200 text-gray-600',
    pulse: false,
  },
  [StationStatus.UNKNOWN]: {
    label: '未知',
    color: 'text-blue-400',
    bgColor: 'bg-blue-400',
    icon: '?',
    description: '未知',
    cardBg: 'bg-gray-50',
    cardBorder: 'border-gray-200',
    badgeClass: 'bg-gray-200 text-gray-600',
    pulse: false,
  },
};

// 充电站统计数据
export interface StationStats {
  total: number;
  idle: number;
  charging: number;
  error: number;
  offline: number;
}

// 充电站数据（hook 返回值）
export interface StationData {
  config: {
    id: string;
    name: string;
    equipmentCode: string;
  };
  piles: EquipmentData[];
  stats: StationStats;
  loading: boolean;
  error: string | null;
  lastUpdate: Date | null;
}