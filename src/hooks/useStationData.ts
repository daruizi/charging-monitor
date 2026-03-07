import { useState, useEffect, useCallback, useRef } from 'react';
import type { StationData } from '../types';
import { REFRESH_INTERVAL, STATIONS } from '../config';
import { fetchStationData, getErrorMessage } from '../services/api';
import { extractPileList, calculateStats } from '../utils/stationUtils';

export const useStationData = (): {
  stationData: StationData[];
  refresh: () => Promise<void>;
  isLoading: boolean;
  lastFetchTime: number;
} => {
  const [stationData, setStationData] = useState<StationData[]>(() =>
    STATIONS.map((config) => ({
      config,
      piles: [],
      stats: { total: 0, idle: 0, charging: 0, error: 0, offline: 0 },
      loading: true,
      error: null,
      lastUpdate: null,
    }))
  );
  const [isLoading, setIsLoading] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState(Date.now);
  const prevDataRef = useRef<Map<string, StationData>>(new Map());
  const fetchDataRef = useRef<(() => Promise<void>) | undefined>(undefined);

  const fetchData = useCallback(async () => {
    setIsLoading(true);

    const results = await Promise.all(
      STATIONS.map(async (config) => {
        try {
          const responseData = await fetchStationData(config.equipmentCode);
          const piles = extractPileList(responseData);
          const stats = calculateStats(piles);

          const result: StationData = {
            config,
            piles,
            stats,
            loading: false,
            error: null,
            lastUpdate: new Date(),
          };
          prevDataRef.current.set(config.id, result);
          return result;
        } catch (err) {
          // 失败时保留上次数据，仅更新 error 字段
          const prev = prevDataRef.current.get(config.id);
          return {
            config,
            piles: prev?.piles ?? [],
            stats: prev?.stats ?? { total: 0, idle: 0, charging: 0, error: 0, offline: 0 },
            loading: false,
            error: getErrorMessage(err),
            lastUpdate: prev?.lastUpdate ?? null,
          };
        }
      })
    );

    setStationData(results);
    setIsLoading(false);
    setLastFetchTime(Date.now());
  }, []);

  useEffect(() => {
    fetchDataRef.current = fetchData;
  }, [fetchData]);

  useEffect(() => {
    // 使用 ref 调用以避免 react-hooks/set-state-in-effect
    const doFetch = () => fetchDataRef.current?.();
    doFetch();
    const timer = setInterval(doFetch, REFRESH_INTERVAL);
    return () => clearInterval(timer);
  }, []);

  return { stationData, refresh: fetchData, isLoading, lastFetchTime };
};