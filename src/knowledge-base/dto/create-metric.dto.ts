import { IsString, IsNotEmpty, IsISO8601 } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMetricDto {
  @ApiProperty({ description: 'Metric type' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({ description: 'Application version' })
  @IsString()
  @IsNotEmpty()
  version: string;

  @ApiProperty({ description: 'Browser name' })
  @IsString()
  @IsNotEmpty()
  browser: string;

  @ApiProperty({ description: 'Browser version' })
  @IsString()
  @IsNotEmpty()
  browserVersion: string;

  @ApiProperty({ description: 'Operating system' })
  @IsString()
  @IsNotEmpty()
  os: string;

  @ApiProperty({ description: 'System architecture' })
  @IsString()
  @IsNotEmpty()
  arch: string;

  @ApiProperty({ description: 'User locale' })
  @IsString()
  @IsNotEmpty()
  locale: string;

  @ApiProperty({ description: 'ISO8601 timestamp' })
  @IsISO8601()
  @IsNotEmpty()
  timestamp: string;
}
