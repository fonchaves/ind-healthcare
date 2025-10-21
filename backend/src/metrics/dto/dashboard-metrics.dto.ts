import { ApiProperty } from '@nestjs/swagger';

export class MetricDto {
  @ApiProperty({
    description: 'Metric value',
    example: '2.5%',
  })
  value: string;

  @ApiProperty({
    description: 'Context or label for the metric',
    example: 'Compared to previous week',
  })
  context: string;
}

export class DashboardMetricsDto {
  @ApiProperty({
    description: 'Case growth rate metric',
    type: MetricDto,
  })
  caseGrowthRate: MetricDto;

  @ApiProperty({
    description: 'Mortality rate metric',
    type: MetricDto,
  })
  mortalityRate: MetricDto;

  @ApiProperty({
    description: 'ICU occupancy rate metric',
    type: MetricDto,
  })
  icuOccupancyRate: MetricDto;

  @ApiProperty({
    description: 'Vaccination rate metric',
    type: MetricDto,
  })
  vaccinationRate: MetricDto;
}
