import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { VocabulariesService } from './vocabularies.service';
import { VocabulariesController } from './vocabularies.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vocabulary } from './entities/vocabulary.entity';
import iamConfig from '../config/iam.config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Vocabulary]),
    ConfigModule.forFeature(iamConfig),
  ],
  controllers: [VocabulariesController],
  providers: [VocabulariesService],
  exports: [VocabulariesService],
})
export class VocabulariesModule {}
