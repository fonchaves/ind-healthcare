export class MetricDto {
  value: string;
  context: string;
}

export class DashboardMetricsDto {
  caseGrowthRate: MetricDto;
  mortalityRate: MetricDto;
  icuOccupancyRate: MetricDto;
  vaccinationRate: MetricDto;
}
