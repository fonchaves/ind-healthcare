export type PeriodType = 'daily' | 'monthly' | 'yearly';
export type GroupByType = 'state' | 'municipality';

export interface ChartDataPoint {
  date: string;
  cases: number;
  region: string;
}

export interface ChartFilters {
  period?: PeriodType;
  groupBy?: GroupByType;
  state?: string;
  municipality?: string;
}

export interface ChartData {
  data: ChartDataPoint[];
}
