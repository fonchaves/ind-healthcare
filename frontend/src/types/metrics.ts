export interface Metric {
  value: string;
  context: string;
}

export interface DashboardMetrics {
  caseGrowthRate: Metric;
  mortalityRate: Metric;
  icuOccupancyRate: Metric;
  vaccinationRate: Metric;
}
