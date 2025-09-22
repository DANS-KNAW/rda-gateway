import { Module } from '@nestjs/common';
import { IngestsService } from './ingests.service';
import { IngestsController } from './ingests.controller';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigType } from '@nestjs/config';
import bullmqConfig from '../config/bullmq.config';
import { VOCABULARIES_INGESTION_QUEUE } from './constants/queue-names.constant';
import { VocabulariesModule } from '../vocabularies/vocabularies.module';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule.forFeature(bullmqConfig)],
      useFactory: (configuration: ConfigType<typeof bullmqConfig>) => ({
        connection: {
          host: configuration.REDIS_HOST,
          port: configuration.REDIS_PORT,
          password: configuration.REDIS_PASSWORD,
        },
      }),
      inject: [bullmqConfig.KEY],
    }),
    BullModule.registerQueue({
      name: VOCABULARIES_INGESTION_QUEUE,
    }),
    VocabulariesModule,
  ],
  controllers: [IngestsController],
  providers: [IngestsService],
})
export class IngestsModule {}
