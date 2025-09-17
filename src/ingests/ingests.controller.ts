import { Controller } from '@nestjs/common';
import { IngestsService } from './ingests.service';

@Controller('ingests')
export class IngestsController {
  constructor(private readonly ingestsService: IngestsService) {}
}
