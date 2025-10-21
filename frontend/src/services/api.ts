import axios from 'axios';
import type { DashboardMetrics } from '../types/metrics';
import type { ChartData, ChartFilters } from '../types/charts';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const metricsService = {
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const response = await api.get<DashboardMetrics>('/api/metrics/dashboard');
    return response.data;
  },
};

export const chartsService = {
  async getCasesChartData(filters: ChartFilters): Promise<ChartData> {
    const params = new URLSearchParams();

    if (filters.period) params.append('period', filters.period);
    if (filters.groupBy) params.append('groupBy', filters.groupBy);
    if (filters.state) params.append('state', filters.state);
    if (filters.municipality) params.append('municipality', filters.municipality);

    const response = await api.get<ChartData>(`/api/charts/cases?${params.toString()}`);
    return response.data;
  },

  async getAvailableStates(): Promise<string[]> {
    const response = await api.get<{ states: string[] }>('/api/charts/states');
    return response.data.states;
  },

  async getAvailableMunicipalities(): Promise<Array<{ code: string; name: string }>> {
    const response = await api.get<{ municipalities: Array<{ code: string; name: string }> }>('/api/charts/municipalities');
    return response.data.municipalities;
  },
};

export default api;
