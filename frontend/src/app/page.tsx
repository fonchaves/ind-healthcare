"use client";

import { useState, useEffect } from "react";
import { MetricsGrid } from "../components/dashboard/MetricsGrid";
import { ChartFilters } from "../components/dashboard/ChartFilters";
import { CasesChart } from "../components/dashboard/CasesChart";
import { metricsService, chartsService } from "../services/api";
import type { DashboardMetrics } from "../types/metrics";
import type {
  ChartFilters as ChartFiltersType,
  ChartDataPoint,
} from "../types/charts";

export default function Home() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [municipalities, setMunicipalities] = useState<Array<{ code: string; name: string }>>([]);
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [loadingChart, setLoadingChart] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<ChartFiltersType>({
    period: "monthly",
    groupBy: "state",
  });

  // Keep track of last selected state and municipality to restore when switching back
  const [lastSelectedState, setLastSelectedState] = useState<string | undefined>(undefined);
  const [lastSelectedMunicipality, setLastSelectedMunicipality] = useState<string | undefined>(undefined);

  // Custom handler for filter changes that preserves state/municipality selections
  const handleFiltersChange = (newFilters: ChartFiltersType) => {
    // Save selections when they change
    if (newFilters.state !== filters.state && newFilters.state) {
      setLastSelectedState(newFilters.state);
    }
    if (newFilters.municipality !== filters.municipality && newFilters.municipality) {
      setLastSelectedMunicipality(newFilters.municipality);
    }

    // If groupBy changed, restore the appropriate filter
    if (newFilters.groupBy !== filters.groupBy) {
      if (newFilters.groupBy === 'state') {
        // Switching to state grouping - restore last state
        newFilters.state = lastSelectedState;
        newFilters.municipality = undefined;
      } else {
        // Switching to municipality grouping - restore last municipality
        newFilters.municipality = lastSelectedMunicipality;
        newFilters.state = undefined;
      }
    }

    setFilters(newFilters);
  };

  // Fetch metrics
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoadingMetrics(true);
        const data = await metricsService.getDashboardMetrics();
        setMetrics(data);
      } catch (err) {
        console.error("Error fetching metrics:", err);
        setError("Erro ao carregar métricas");
      } finally {
        setLoadingMetrics(false);
      }
    };

    fetchMetrics();
  }, []);

  // Fetch chart data
  useEffect(() => {
    const fetchChartData = async () => {
      // Don't fetch if municipality grouping is selected without a municipality filter
      if (filters.groupBy === 'municipality' && !filters.municipality) {
        setChartData([]);
        setLoadingChart(false);
        return;
      }

      try {
        setLoadingChart(true);
        const data = await chartsService.getCasesChartData(filters);
        setChartData(data.data);
      } catch (err) {
        console.error("Error fetching chart data:", err);
        setError("Erro ao carregar dados do gráfico");
      } finally {
        setLoadingChart(false);
      }
    };

    fetchChartData();
  }, [filters]);

  // Fetch available states (independent of filters)
  useEffect(() => {
    const fetchStates = async () => {
      try {
        const availableStates = await chartsService.getAvailableStates();
        setStates(availableStates);
      } catch (err) {
        console.error("Error fetching states:", err);
      }
    };

    fetchStates();
  }, []);

  // Fetch available municipalities (independent of filters)
  useEffect(() => {
    const fetchMunicipalities = async () => {
      try {
        const availableMunicipalities = await chartsService.getAvailableMunicipalities();
        setMunicipalities(availableMunicipalities);
      } catch (err) {
        console.error("Error fetching municipalities:", err);
      }
    };

    fetchMunicipalities();
  }, []);

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
        <ChartFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          states={states}
          municipalities={municipalities}
        />

        {/* Show placeholder when municipality grouping is selected without filter */}
        {filters.groupBy === 'municipality' && !filters.municipality ? (
          <div className="bg-white rounded-lg shadow-md p-6 flex items-center justify-center h-96">
            <div className="text-center max-w-md">
              <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Selecione um município
              </h3>
              <p className="text-gray-600">
                Para visualizar o gráfico por município, por favor selecione um município específico acima.
                Há muitos municípios no Brasil para exibir todos simultaneamente de forma legível.
              </p>
            </div>
          </div>
        ) : (
          <CasesChart data={chartData} loading={loadingChart} />
        )}
      </main>

      <footer className="bg-white border-t mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-gray-600 text-sm">
          Dashboard de Monitoramento SRAG | Ind. Healthcare inc.
        </div>
      </footer>
    </div>
  );
}
