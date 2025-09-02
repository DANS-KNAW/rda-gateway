import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { EnvironmentSchema } from './config/validation-schema';
@Module({
  imports: [
    ConfigModule.forRoot({ validate: (env) => EnvironmentSchema.parse(env) }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
