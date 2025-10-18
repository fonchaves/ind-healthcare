import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum PeriodType {
  DAILY = 'daily',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

export enum GroupByType {
  STATE = 'state',
  MUNICIPALITY = 'municipality',
}

export class ChartFiltersDto {
  @ApiProperty({
    enum: PeriodType,
    default: PeriodType.MONTHLY,
    required: false,
  })
  @IsOptional()
  @IsEnum(PeriodType)
  period?: PeriodType = PeriodType.MONTHLY;

  @ApiProperty({
    enum: GroupByType,
    default: GroupByType.STATE,
    required: false,
  })
  @IsOptional()
  @IsEnum(GroupByType)
  groupBy?: GroupByType = GroupByType.STATE;

  @ApiProperty({
    required: false,
    description: 'Filter by state (e.g., SP, RJ)',
  })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty({ required: false, description: 'Filter by municipality code' })
  @IsOptional()
  @IsString()
  municipality?: string;
}
