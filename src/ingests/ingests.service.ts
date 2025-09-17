import { Injectable, NotImplementedException } from '@nestjs/common';

@Injectable()
export class IngestsService {
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
