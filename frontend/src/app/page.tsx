'use client';

import { useState, useEffect, useMemo } from 'react';
import { MetricsGrid } from '../components/dashboard/MetricsGrid';
import { ChartFilters } from '../components/dashboard/ChartFilters';
import { CasesChart } from '../components/dashboard/CasesChart';
import { metricsService, chartsService } from '../services/api';
import type { DashboardMetrics } from '../types/metrics';
import type { ChartFilters as ChartFiltersType, ChartDataPoint } from '../types/charts';

export default function Home() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [loadingChart, setLoadingChart] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<ChartFiltersType>({
    period: 'monthly',
    groupBy: 'state',
  });

  // Extract unique states from chart data
  const states = useMemo(() => {
    if (!chartData || chartData.length === 0) return [];
    return Array.from(new Set(chartData.map((d) => d.region))).sort();
  }, [chartData]);

  // Fetch metrics
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoadingMetrics(true);
        const data = await metricsService.getDashboardMetrics();
        setMetrics(data);
      } catch (err) {
        console.error('Error fetching metrics:', err);
        setError('Erro ao carregar métricas');
      } finally {
        setLoadingMetrics(false);
      }
    };

    fetchMetrics();
  }, []);

  // Fetch chart data
  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setLoadingChart(true);
        const data = await chartsService.getCasesChartData(filters);
        setChartData(data.data);
      } catch (err) {
        console.error('Error fetching chart data:', err);
        setError('Erro ao carregar dados do gráfico');
      } finally {
        setLoadingChart(false);
      }
    };

    fetchChartData();
  }, [filters]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard de Monitoramento SRAG
          </h1>
          <p className="text-gray-600 mt-2">
            Sistema de Monitoramento de Síndrome Respiratória Aguda Grave
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Metrics Section */}
        {loadingMetrics ? (
          <div className="flex justify-center items-center h-48 mb-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : metrics ? (
          <MetricsGrid metrics={metrics} />
        ) : null}

        {/* Chart Section */}
        <ChartFilters filters={filters} onFiltersChange={setFilters} states={states} />
        <CasesChart data={chartData} loading={loadingChart} />
      </main>

      <footer className="bg-white border-t mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-gray-600 text-sm">
          Dashboard de Monitoramento SRAG | Desafio Indicium Healthcare
        </div>
      </footer>
    </div>
  );
}
