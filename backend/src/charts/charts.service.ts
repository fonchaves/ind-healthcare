import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import {
  ChartFiltersDto,
  PeriodType,
  GroupByType,
} from './dto/chart-filters.dto';
import { ChartDataPointDto } from './dto/chart-data.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ChartsService {
  private readonly logger = new Logger(ChartsService.name);

  constructor(private prisma: PrismaService) {}

  async getCasesChartData(
    filters: ChartFiltersDto,
  ): Promise<ChartDataPointDto[]> {
    this.logger.log(
      `Fetching chart data with filters: ${JSON.stringify(filters)}`,
    );

    // Build where clause for filters
    const whereClause: Prisma.SragCaseWhereInput = {};
    if (filters.state) {
      whereClause.state = filters.state;
    }
    if (filters.municipality) {
      whereClause.municipality = filters.municipality;
    }

    // Fetch all cases with filters
    const cases = await this.prisma.sragCase.findMany({
      where: whereClause,
      select: {
        notificationDate: true,
        state: true,
        municipalityName: true,
      },
      orderBy: {
        notificationDate: 'asc',
      },
    });

    // Group and aggregate data based on period and groupBy
    const groupedData = this.groupAndAggregateData(
      cases,
      filters.period || PeriodType.MONTHLY,
      filters.groupBy || GroupByType.STATE,
    );

    return groupedData;
  }

  private groupAndAggregateData(
    cases: Array<{
      notificationDate: Date;
      state: string;
      municipalityName: string | null;
    }>,
    period: PeriodType,
    groupBy: GroupByType,
  ): ChartDataPointDto[] {
    const aggregated = new Map<string, number>();

    for (const caseData of cases) {
      const dateKey = this.formatDateByPeriod(
        caseData.notificationDate,
        period,
      );
      const regionKey =
        groupBy === GroupByType.STATE
          ? caseData.state
          : caseData.municipalityName || 'Unknown';

      const key = `${dateKey}|${regionKey}`;
      aggregated.set(key, (aggregated.get(key) || 0) + 1);
    }

    // Convert map to array
    const result: ChartDataPointDto[] = [];
    for (const [key, count] of aggregated.entries()) {
      const [date, region] = key.split('|');
      result.push({
        date,
        cases: count,
        region,
      });
    }

    // Sort by date
    result.sort((a, b) => a.date.localeCompare(b.date));

    return result;
  }

  async getAvailableStates(): Promise<string[]> {
    this.logger.log('Fetching all available states');

    const states = await this.prisma.sragCase.findMany({
      select: {
        state: true,
      },
      distinct: ['state'],
      orderBy: {
        state: 'asc',
      },
    });

    return states.map((s) => s.state);
  }

  private formatDateByPeriod(date: Date, period: PeriodType): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    switch (period) {
      case PeriodType.DAILY:
        return `${year}-${month}-${day}`;
      case PeriodType.MONTHLY:
        return `${year}-${month}`;
      case PeriodType.YEARLY:
        return `${year}`;
      default:
        return `${year}-${month}`;
    }
  }
}
