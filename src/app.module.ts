import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { EnvironmentSchema } from './config/validation-schema';
import coreConfig from './config/core.config';
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [coreConfig],
      skipProcessEnv: true,
      validatePredefined: true,
      ignoreEnvFile: false, // Might want to change to true once fully containerized
      validate: (env) => EnvironmentSchema.parse(env),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
