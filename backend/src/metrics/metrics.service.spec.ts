import { Test, TestingModule } from '@nestjs/testing';
import { MetricsService } from './metrics.service';
import { PrismaService } from '../database/prisma.service';

describe('MetricsService', () => {
  let service: MetricsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    sragCase: {
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MetricsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<MetricsService>(MetricsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDashboardMetrics', () => {
    it('should return dashboard metrics with all fields', async () => {
      // Mock para caseGrowthRate - 2 chamadas count
      mockPrismaService.sragCase.count
        .mockResolvedValueOnce(100) // current month
        .mockResolvedValueOnce(80) // previous month
        // Mock para mortalityRate - 2 chamadas count
        .mockResolvedValueOnce(500) // total cases
        .mockResolvedValueOnce(50) // death cases
        // Mock para icuOccupancyRate - 2 chamadas count
        .mockResolvedValueOnce(200) // hospitalized
        .mockResolvedValueOnce(80) // icu
        // Mock para vaccinationRate - 2 chamadas count
        .mockResolvedValueOnce(500) // total cases
        .mockResolvedValueOnce(350); // vaccinated

      const result = await service.getDashboardMetrics();

      expect(result).toBeDefined();
      expect(result.caseGrowthRate).toBeDefined();
      expect(result.mortalityRate).toBeDefined();
      expect(result.icuOccupancyRate).toBeDefined();
      expect(result.vaccinationRate).toBeDefined();

      // Verify caseGrowthRate calculation: (100-80)/80 * 100 = 25%
      expect(result.caseGrowthRate.value).toBe('+25.0%');
      expect(result.caseGrowthRate.context).toBe('vs mês anterior');

      // Verify mortalityRate calculation: 50/500 * 100 = 10%
      expect(result.mortalityRate.value).toBe('10.0%');
      expect(result.mortalityRate.context).toBe('casos com óbito');

      // Verify icuOccupancyRate calculation: 80/200 * 100 = 40%
      expect(result.icuOccupancyRate.value).toBe('40.0%');
      expect(result.icuOccupancyRate.context).toBe(
        'pacientes hospitalizados em UTI',
      );

      // Verify vaccinationRate calculation: 350/500 * 100 = 70%
      expect(result.vaccinationRate.value).toBe('70.0%');
      expect(result.vaccinationRate.context).toBe('dos casos com ao menos 1 dose');
    });

    it('should handle zero previous month cases (no growth)', async () => {
      mockPrismaService.sragCase.count
        .mockResolvedValueOnce(100) // current month
        .mockResolvedValueOnce(0) // previous month (zero)
        .mockResolvedValueOnce(500)
        .mockResolvedValueOnce(50)
        .mockResolvedValueOnce(200)
        .mockResolvedValueOnce(80)
        .mockResolvedValueOnce(500)
        .mockResolvedValueOnce(350);

      const result = await service.getDashboardMetrics();

      expect(result.caseGrowthRate.value).toBe('+0.0%');
    });

    it('should handle negative growth rate', async () => {
      mockPrismaService.sragCase.count
        .mockResolvedValueOnce(50) // current month
        .mockResolvedValueOnce(100) // previous month
        .mockResolvedValueOnce(500)
        .mockResolvedValueOnce(50)
        .mockResolvedValueOnce(200)
        .mockResolvedValueOnce(80)
        .mockResolvedValueOnce(500)
        .mockResolvedValueOnce(350);

      const result = await service.getDashboardMetrics();

      // (50-100)/100 * 100 = -50%
      expect(result.caseGrowthRate.value).toBe('-50.0%');
    });

    it('should handle zero total cases', async () => {
      mockPrismaService.sragCase.count
        .mockResolvedValueOnce(0) // current month
        .mockResolvedValueOnce(0) // previous month
        .mockResolvedValueOnce(0) // total cases
        .mockResolvedValueOnce(0) // death cases
        .mockResolvedValueOnce(0) // hospitalized
        .mockResolvedValueOnce(0) // icu
        .mockResolvedValueOnce(0) // total cases
        .mockResolvedValueOnce(0); // vaccinated

      const result = await service.getDashboardMetrics();

      expect(result.caseGrowthRate.value).toBe('+0.0%');
      expect(result.mortalityRate.value).toBe('0.0%');
      expect(result.icuOccupancyRate.value).toBe('0.0%');
      expect(result.vaccinationRate.value).toBe('0.0%');
    });
  });
});
