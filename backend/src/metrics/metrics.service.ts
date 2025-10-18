import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { DashboardMetricsDto } from './dto/dashboard-metrics.dto';

@Injectable()
export class MetricsService {
  private readonly logger = new Logger(MetricsService.name);

  constructor(private prisma: PrismaService) {}

  async getDashboardMetrics(): Promise<DashboardMetricsDto> {
    this.logger.log('Calculating dashboard metrics...');

    const [caseGrowthRate, mortalityRate, icuOccupancyRate, vaccinationRate] =
      await Promise.all([
        this.calculateCaseGrowthRate(),
        this.calculateMortalityRate(),
        this.calculateIcuOccupancyRate(),
        this.calculateVaccinationRate(),
      ]);

    return {
      caseGrowthRate,
      mortalityRate,
      icuOccupancyRate,
      vaccinationRate,
    };
  }

  private async calculateCaseGrowthRate() {
    // Get cases from current month and previous month
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonthStart = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1,
    );

    const [currentMonthCases, previousMonthCases] = await Promise.all([
      this.prisma.sragCase.count({
        where: {
          notificationDate: {
            gte: currentMonthStart,
          },
        },
      }),
      this.prisma.sragCase.count({
        where: {
          notificationDate: {
            gte: previousMonthStart,
            lt: currentMonthStart,
          },
        },
      }),
    ]);

    const growthRate =
      previousMonthCases > 0
        ? ((currentMonthCases - previousMonthCases) / previousMonthCases) * 100
        : 0;

    const sign = growthRate >= 0 ? '+' : '';
    return {
      value: `${sign}${growthRate.toFixed(1)}%`,
      context: 'vs mês anterior',
    };
  }

  private async calculateMortalityRate() {
    const [totalCases, deathCases] = await Promise.all([
      this.prisma.sragCase.count(),
      this.prisma.sragCase.count({
        where: {
          evolution: '2', // 2 = Óbito
        },
      }),
    ]);

    const rate = totalCases > 0 ? (deathCases / totalCases) * 100 : 0;

    return {
      value: `${rate.toFixed(1)}%`,
      context: 'casos com óbito',
    };
  }

  private async calculateIcuOccupancyRate() {
    const [hospitalizedCases, icuCases] = await Promise.all([
      this.prisma.sragCase.count({
        where: {
          hospitalized: true,
        },
      }),
      this.prisma.sragCase.count({
        where: {
          icu: true,
        },
      }),
    ]);

    const rate =
      hospitalizedCases > 0 ? (icuCases / hospitalizedCases) * 100 : 0;

    return {
      value: `${rate.toFixed(1)}%`,
      context: 'pacientes hospitalizados em UTI',
    };
  }

  private async calculateVaccinationRate() {
    const [totalCases, vaccinatedCases] = await Promise.all([
      this.prisma.sragCase.count(),
      this.prisma.sragCase.count({
        where: {
          vaccinated: true,
        },
      }),
    ]);

    const rate = totalCases > 0 ? (vaccinatedCases / totalCases) * 100 : 0;

    return {
      value: `${rate.toFixed(1)}%`,
      context: 'dos casos com ao menos 1 dose',
    };
  }
}
