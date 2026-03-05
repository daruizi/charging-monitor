import axios from 'axios';
import type { EquipmentData } from '../types';
import { API_CONFIG } from '../config';

export const fetchStationData = async (equipmentCode: string): Promise<EquipmentData[]> => {
  const response = await axios.get(API_CONFIG.BASE_URL, {
    params: { equipmentCode },
    timeout: API_CONFIG.TIMEOUT,
  });
  return response.data;
};

export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    if (error.code === 'ECONNABORTED') {
      return '请求超时，请检查网络连接';
    }
    if (error.response) {
      return `请求失败：${error.response.status} ${error.response.statusText}`;
    }
    if (error.request) {
      return '网络错误，请检查连接';
    }
    return `错误：${error.message}`;
  }
  return '发生未知错误';
};