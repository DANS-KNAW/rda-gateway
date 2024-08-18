import { Injectable } from '@nestjs/common';
import { CreateSeedingDto } from './dto/create-seeding.dto';
import { UpdateSeedingDto } from './dto/update-seeding.dto';

@Injectable()
export class SeedingService {
  create(createSeedingDto: CreateSeedingDto) {
    return 'This action adds a new seeding';
  }

  findAll() {
    return `This action returns all seeding`;
  }

  findOne(id: number) {
    return `This action returns a #${id} seeding`;
  }

  update(id: number, updateSeedingDto: UpdateSeedingDto) {
    return `This action updates a #${id} seeding`;
  }

  remove(id: number) {
    return `This action removes a #${id} seeding`;
  }
}
