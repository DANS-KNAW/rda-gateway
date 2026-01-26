import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { EnvironmentSchema } from './config/validation-schema';
import coreConfig from './config/core.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VocabulariesModule } from './vocabularies/vocabularies.module';
import { IngestsModule } from './ingests/ingests.module';
import { KnowledgeBaseModule } from './knowledge-base/knowledge-base.module';
import databaseConfig from './config/database.config';
import elasticsearchConfig from './config/elasticsearch.config';
import iamConfig from './config/iam.config';
import { ScheduleModule } from '@nestjs/schedule';
import { HttpModule } from '@nestjs/axios';
import { IamModule } from './iam/iam.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [coreConfig, databaseConfig, elasticsearchConfig, iamConfig],
      skipProcessEnv: true,
      validatePredefined: true,
      ignoreEnvFile: false, // Might want to change to true once fully containerized
      validate: (env) => EnvironmentSchema.parse(env),
    }),
    TypeOrmModule.forRootAsync(databaseConfig.asProvider()),
    VocabulariesModule,
    IngestsModule,
    KnowledgeBaseModule,
    IamModule,
    HttpModule.register({ timeout: 5000 }),
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
