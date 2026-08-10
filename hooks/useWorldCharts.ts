import { useEffect, useMemo, useState } from 'react';

export interface WorldChartEntry {
  title: string;
  studioName: string;
  genre: string;
  chartQuality?: number;
  viewers: number;
  totalViewers?: number;
  weeksInCharts?: number;
}

const normalizeApiBaseUrl = (value: string): string => String(value || '').trim().replace(/\/$/, '');

const getApiBaseUrl = (): string => {
  const envUrl = (import.meta as any)?.env?.VITE_ONLINE_CORE_URL;
  if (typeof envUrl === 'string' && envUrl.trim().length > 0) {
    return normalizeApiBaseUrl(envUrl);
  }

  if (typeof window === 'undefined') {
    return 'http://localhost:8787';
  }

  const queryApi = normalizeApiBaseUrl(new URLSearchParams(window.location.search).get('api') || '');
  if (queryApi) {
    return queryApi;
  }

  const hostname = String(window.location.hostname || '').toLowerCase();
  const isIpv4Host = /^(?:\d{1,3}\.){3}\d{1,3}$/.test(hostname);
  const isIpv6Host = hostname.includes(':');

  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:8787';
  }

  if (isIpv4Host || isIpv6Host) {
    return normalizeApiBaseUrl(window.location.origin);
  }

  if (hostname.startsWith('api.')) {
    return normalizeApiBaseUrl(window.location.origin);
  }

  return `${window.location.protocol}//api.${window.location.host}`;
};

const toNumber = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const normalizeChartEntry = (entry: any): WorldChartEntry => ({
  title: String(entry?.title || '-'),
  studioName: String(entry?.studioName || '-'),
  genre: String(entry?.genre || 'Drama'),
  chartQuality: toNumber(entry?.chartQuality),
  viewers: toNumber(entry?.viewers),
  totalViewers: toNumber(entry?.totalViewers),
  weeksInCharts: toNumber(entry?.weeksInCharts),
});

export const useWorldCharts = () => {
  const [entries, setEntries] = useState<WorldChartEntry[]>([]);
  const [monthKey, setMonthKey] = useState<string | null>(null);
  const baseUrl = useMemo(() => getApiBaseUrl(), []);

  useEffect(() => {
    let cancelled = false;

    const loadLatest = async () => {
      try {
        const response = await fetch(`${baseUrl}/world/charts/latest`, { method: 'GET' });
        if (!response.ok || cancelled) {
          return;
        }

        const payload = await response.json().catch(() => ({}));
        const chart = payload?.chart || null;

        const raw = Array.isArray(chart?.topFilmsTop20)
          ? chart.topFilmsTop20
          : (Array.isArray(chart?.topFilms) ? chart.topFilms : []);

        if (cancelled) {
          return;
        }

        setEntries(raw.map(normalizeChartEntry));
        setMonthKey(chart?.monthKey || null);
      } catch {
        // Keep previous chart when endpoint is temporarily unavailable.
      }
    };

    void loadLatest();
    const intervalId = window.setInterval(loadLatest, 15_000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [baseUrl]);

  return { entries, monthKey };
};
