import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ChartsService } from './charts.service';
import { ChartFiltersDto } from './dto/chart-filters.dto';
import { ChartDataDto } from './dto/chart-data.dto';

@ApiTags('charts')
@Controller('api/charts')
export class ChartsController {
  constructor(private readonly chartsService: ChartsService) {}

  @Get('cases')
  @ApiOperation({ summary: 'Get SRAG cases chart data' })
  @ApiResponse({
    status: 200,
    description: 'Chart data retrieved successfully',
    type: ChartDataDto,
  })
  async getCasesChartData(
    @Query() filters: ChartFiltersDto,
  ): Promise<ChartDataDto> {
    const data = await this.chartsService.getCasesChartData(filters);
    return { data };
  }

  @Get('states')
  @ApiOperation({ summary: 'Get all available states' })
  @ApiResponse({
    status: 200,
    description: 'List of all states retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        states: {
          type: 'array',
          items: { type: 'string' },
          example: ['SP', 'RJ', 'MG', 'RS'],
        },
      },
    },
  })
  async getAvailableStates(): Promise<{ states: string[] }> {
    const states = await this.chartsService.getAvailableStates();
    return { states };
  }
}
