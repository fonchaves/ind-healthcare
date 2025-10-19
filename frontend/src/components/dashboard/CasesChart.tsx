'use client';

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { ChartDataPoint } from '../../types/charts';

interface CasesChartProps {
  data: ChartDataPoint[];
  loading?: boolean;
}

export function CasesChart({ data, loading }: CasesChartProps) {
  // Transform data to group by date with multiple regions as series
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Group by date
    const groupedByDate = data.reduce((acc, point) => {
      if (!acc[point.date]) {
        acc[point.date] = { date: point.date };
      }
      acc[point.date][point.region] = point.cases;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(groupedByDate);
  }, [data]);

  // Get unique regions for colors
  const regions = useMemo(() => {
    if (!data || data.length === 0) return [];
    return Array.from(new Set(data.map((d) => d.region)));
  }, [data]);

  // Color palette for different regions
  const colors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
    '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16',
  ];

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados...</p>
        </div>
      </div>
    );
  }

  if (!chartData || chartData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 flex items-center justify-center h-96">
        <p className="text-gray-600">Nenhum dado disponível para exibir</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        Evolução de Casos de SRAG ao Longo do Tempo
      </h3>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            angle={-45}
            textAnchor="end"
            height={80}
            tick={{ fontSize: 12 }}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          {regions.map((region, index) => (
            <Line
              key={region}
              type="monotone"
              dataKey={region}
              stroke={colors[index % colors.length]}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
