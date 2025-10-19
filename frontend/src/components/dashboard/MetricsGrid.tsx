import { TrendingUp, Skull, Heart, Syringe } from 'lucide-react';
import type { DashboardMetrics } from '../../types/metrics';
import { MetricCard } from './MetricCard';

interface MetricsGridProps {
  metrics: DashboardMetrics;
}

export function MetricsGrid({ metrics }: MetricsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
      <MetricCard
        title="Taxa de Crescimento de Casos"
        metric={metrics.caseGrowthRate}
        icon={<TrendingUp className="w-6 h-6" />}
      />
      <MetricCard
        title="Taxa de Mortalidade"
        metric={metrics.mortalityRate}
        icon={<Skull className="w-6 h-6" />}
      />
      <MetricCard
        title="Taxa de Ocupação de UTI"
        metric={metrics.icuOccupancyRate}
        icon={<Heart className="w-6 h-6" />}
      />
      <MetricCard
        title="Taxa de Vacinação"
        metric={metrics.vaccinationRate}
        icon={<Syringe className="w-6 h-6" />}
      />
    </div>
  );
}
