import { useState, useEffect, useCallback } from 'react';
import type { StationData } from '../types';
import { REFRESH_INTERVAL, STATIONS } from '../config';
import { fetchStationData, getErrorMessage } from '../services/api';
import { extractPileList, calculateStats } from '../utils/stationUtils';

const REFRESH_INTERVAL_SECONDS = REFRESH_INTERVAL / 1000;

export const useStationData = (): {
  stationData: StationData[];
  countdown: number;
  refresh: () => Promise<void>;
  isLoading: boolean;
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
  const [countdown, setCountdown] = useState<number>(REFRESH_INTERVAL_SECONDS);

  const fetchData = useCallback(async () => {
    const results = await Promise.all(
      STATIONS.map(async (config) => {
        try {
          const responseData = await fetchStationData(config.equipmentCode);
          const piles = extractPileList(responseData);
          const stats = calculateStats(piles);

          return {
            config,
            piles,
            stats,
            loading: false,
            error: null,
            lastUpdate: new Date(),
          };
        } catch (err) {
          return {
            config,
            piles: [],
            stats: { total: 0, idle: 0, charging: 0, error: 0, offline: 0 },
            loading: false,
            error: getErrorMessage(err),
            lastUpdate: new Date(),
          };
        }
      })
    );

    setStationData(results);
    setCountdown(REFRESH_INTERVAL_SECONDS);
  }, []);

  useEffect(() => {
    fetchData();
    const timer = setInterval(fetchData, REFRESH_INTERVAL);
    return () => clearInterval(timer);
  }, [fetchData]);

  useEffect(() => {
    const countdownTimer = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? REFRESH_INTERVAL_SECONDS : prev - 1));
    }, 1000);
    return () => clearInterval(countdownTimer);
  }, []);

  const isLoading = stationData.some((s) => s.loading);

  return { stationData, countdown, refresh: fetchData, isLoading };
};