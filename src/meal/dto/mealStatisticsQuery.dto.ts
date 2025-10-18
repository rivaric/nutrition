import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNotEmpty } from 'class-validator';

export enum GroupBy {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
}

export class MealStatisticsQueryDto {
  @ApiProperty({
    description: 'Start date for statistics range (ISO 8601 format)',
    example: '2025-10-01',
    format: 'date',
  })
  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @ApiProperty({
    description: 'End date for statistics range (ISO 8601 format)',
    example: '2025-10-17',
    format: 'date',
  })
  @IsNotEmpty()
  @IsDateString()
  endDate: string;

  @ApiProperty({
    description: 'Grouping period for statistics',
    enum: GroupBy,
    example: GroupBy.DAY,
  })
  @IsNotEmpty()
  @IsEnum(GroupBy)
  groupBy: GroupBy;
}
