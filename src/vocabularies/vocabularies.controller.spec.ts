import { Test, TestingModule } from '@nestjs/testing';
import { VocabulariesController } from './vocabularies.controller';
import { VocabulariesService } from './vocabularies.service';

describe('VocabulariesController', () => {
  let controller: VocabulariesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VocabulariesController],
      providers: [VocabulariesService],
    }).compile();

    controller = module.get<VocabulariesController>(VocabulariesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
