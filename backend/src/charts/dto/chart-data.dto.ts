import { ApiProperty } from '@nestjs/swagger';

export class ChartDataPointDto {
  @ApiProperty({
    description: 'Date of the chart data point',
    example: '2025-10-21',
  })
  date: string;

  @ApiProperty({
    description: 'Number of cases',
    example: 123,
  })
  cases: number;

  @ApiProperty({
    description: 'Region (state or city) for the chart data point',
    example: 'SP',
  })
  region: string;
}

export class ChartDataDto {
  @ApiProperty({
    type: [ChartDataPointDto],
    description: 'Chart data points',
  })
  data: ChartDataPointDto[];
}
