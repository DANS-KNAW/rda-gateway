import { IsString, IsNotEmpty, IsISO8601 } from 'class-validator';

export class CreateMetricDto {
  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsNotEmpty()
  version: string;

  @IsString()
  @IsNotEmpty()
  browser: string;

  @IsString()
  @IsNotEmpty()
  browserVersion: string;

  @IsString()
  @IsNotEmpty()
  os: string;

  @IsString()
  @IsNotEmpty()
  arch: string;

  @IsString()
  @IsNotEmpty()
  locale: string;

  @IsISO8601()
  @IsNotEmpty()
  timestamp: string;
}
