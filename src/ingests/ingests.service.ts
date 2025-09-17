import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger, NotImplementedException } from '@nestjs/common';
import { VOCABULARIES_INGESTION_QUEUE } from './constants/queue-names.constant';
import { Queue } from 'bullmq';

@Injectable()
export class IngestsService {
  private readonly logger = new Logger(IngestsService.name);

  constructor(
    @InjectQueue(VOCABULARIES_INGESTION_QUEUE)
    private readonly vocabulariesIngestionQueue: Queue,
  ) {}

  validateDumpFile() {
    throw new NotImplementedException();
  }

  preprocessDumpFile() {
    throw new NotImplementedException();
  }

  ingestVocabularies() {
    throw new NotImplementedException();
  }
}
