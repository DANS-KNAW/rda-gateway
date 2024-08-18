import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SeedingService } from './seeding.service';
import { CreateSeedingDto } from './dto/create-seeding.dto';
import { UpdateSeedingDto } from './dto/update-seeding.dto';

@Controller('seeding')
export class SeedingController {
  constructor(private readonly seedingService: SeedingService) {}

  @Post()
  create(@Body() createSeedingDto: CreateSeedingDto) {
    return this.seedingService.create(createSeedingDto);
  }
}
