import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { EnvironmentSchema } from './config/validation-schema';
import coreConfig from './config/core.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VocabulariesModule } from './vocabularies/vocabularies.module';
import { IngestsModule } from './ingests/ingests.module';
import databaseConfig from './config/database.config';
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [coreConfig, databaseConfig],
      skipProcessEnv: true,
      validatePredefined: true,
      ignoreEnvFile: false, // Might want to change to true once fully containerized
      validate: (env) => EnvironmentSchema.parse(env),
    }),
    TypeOrmModule.forRootAsync(databaseConfig.asProvider()),
    VocabulariesModule,
    IngestsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
