import { Module } from '@nestjs/common';
import { IngestsService } from './ingests.service';
import { IngestsController } from './ingests.controller';

@Module({
  controllers: [IngestsController],
  providers: [IngestsService],
})
export class IngestsModule {}
