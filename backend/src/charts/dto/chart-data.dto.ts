export class ChartDataPointDto {
  date: string;
  cases: number;
  region: string;
}

export class ChartDataDto {
  data: ChartDataPointDto[];
}
