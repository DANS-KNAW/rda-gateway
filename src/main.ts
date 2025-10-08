import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService, ConfigType } from '@nestjs/config';
import coreConfig, { CONFIG_CORE_TOKEN } from './config/core.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const config =
    configService.getOrThrow<ConfigType<typeof coreConfig>>(CONFIG_CORE_TOKEN);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      enableDebugMessages: config.NODE_ENV === 'development',
    }),
  );

  app.enableCors();

  await app.listen(config.API_PORT);
}

bootstrap().catch((err) => {
  console.error('Error starting the application:', err);
  process.exit(1);
});
