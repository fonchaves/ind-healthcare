import { Test, TestingModule } from '@nestjs/testing';
import { ChartsService } from './charts.service';
import { PrismaService } from '../database/prisma.service';
import { PeriodType, GroupByType } from './dto/chart-filters.dto';

describe('ChartsService', () => {
  let service: ChartsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    sragCase: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChartsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ChartsService>(ChartsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getCasesChartData', () => {
    const mockCases = [
      {
        notificationDate: new Date('2024-01-15'),
        state: 'SP',
        municipality: '355030',
      },
      {
        notificationDate: new Date('2024-01-20'),
        state: 'SP',
        municipality: '355030',
      },
      {
        notificationDate: new Date('2024-01-25'),
        state: 'RJ',
        municipality: '330455',
      },
      {
        notificationDate: new Date('2024-02-10'),
        state: 'SP',
        municipality: '355030',
      },
    ];

    it('should return grouped data by state and monthly', async () => {
      mockPrismaService.sragCase.findMany.mockResolvedValue(mockCases);

      const result = await service.getCasesChartData({
        period: PeriodType.MONTHLY,
        groupBy: GroupByType.STATE,
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);

      // Should have 3 data points: SP-2024-01 (2 cases), RJ-2024-01 (1 case), SP-2024-02 (1 case)
      expect(result.length).toBe(3);

      // Find SP January data
      const spJan = result.find((d) => d.date === '2024-01' && d.region === 'SP');
      expect(spJan).toBeDefined();
      expect(spJan?.cases).toBe(2);

      // Find RJ January data
      const rjJan = result.find((d) => d.date === '2024-01' && d.region === 'RJ');
      expect(rjJan).toBeDefined();
      expect(rjJan?.cases).toBe(1);

      // Find SP February data
      const spFeb = result.find((d) => d.date === '2024-02' && d.region === 'SP');
      expect(spFeb).toBeDefined();
      expect(spFeb?.cases).toBe(1);
    });

    it('should filter by state when provided', async () => {
      const filteredCases = mockCases.filter((c) => c.state === 'SP');
      mockPrismaService.sragCase.findMany.mockResolvedValue(filteredCases);

      const result = await service.getCasesChartData({
        period: PeriodType.MONTHLY,
        groupBy: GroupByType.STATE,
        state: 'SP',
      });

      expect(mockPrismaService.sragCase.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { state: 'SP' },
        }),
      );

      // Should only have SP data
      expect(result.every((d) => d.region === 'SP')).toBe(true);
    });

    it('should group by municipality when specified', async () => {
      mockPrismaService.sragCase.findMany.mockResolvedValue(mockCases);

      const result = await service.getCasesChartData({
        period: PeriodType.MONTHLY,
        groupBy: GroupByType.MUNICIPALITY,
      });

      // Should group by municipality codes
      const municipalities = [...new Set(result.map((d) => d.region))];
      expect(municipalities).toContain('355030');
      expect(municipalities).toContain('330455');
    });

    it('should format dates daily when period is daily', async () => {
      mockPrismaService.sragCase.findMany.mockResolvedValue(mockCases);

      const result = await service.getCasesChartData({
        period: PeriodType.DAILY,
        groupBy: GroupByType.STATE,
      });

      // Dates should be in YYYY-MM-DD format
      const dailyDate = result[0]?.date;
      expect(dailyDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should format dates yearly when period is yearly', async () => {
      mockPrismaService.sragCase.findMany.mockResolvedValue(mockCases);

      const result = await service.getCasesChartData({
        period: PeriodType.YEARLY,
        groupBy: GroupByType.STATE,
      });

      // Dates should be in YYYY format
      const yearlyDate = result[0]?.date;
      expect(yearlyDate).toMatch(/^\d{4}$/);
    });

    it('should handle empty data', async () => {
      mockPrismaService.sragCase.findMany.mockResolvedValue([]);

      const result = await service.getCasesChartData({
        period: PeriodType.MONTHLY,
        groupBy: GroupByType.STATE,
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });

    it('should sort results by date', async () => {
      mockPrismaService.sragCase.findMany.mockResolvedValue(mockCases);

      const result = await service.getCasesChartData({
        period: PeriodType.MONTHLY,
        groupBy: GroupByType.STATE,
      });

      // Check if dates are sorted
      for (let i = 1; i < result.length; i++) {
        expect(result[i].date >= result[i - 1].date).toBe(true);
      }
    });

    it('should handle null municipality', async () => {
      const casesWithNull = [
        ...mockCases,
        {
          notificationDate: new Date('2024-01-15'),
          state: 'BA',
          municipality: null,
        },
      ];

      mockPrismaService.sragCase.findMany.mockResolvedValue(casesWithNull);

      const result = await service.getCasesChartData({
        period: PeriodType.MONTHLY,
        groupBy: GroupByType.MUNICIPALITY,
      });

      // Should have 'Unknown' for null municipalities
      const unknownMunic = result.find((d) => d.region === 'Unknown');
      expect(unknownMunic).toBeDefined();
    });
  });
});
