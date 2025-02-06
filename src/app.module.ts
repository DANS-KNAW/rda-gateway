import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService, ConfigType } from '@nestjs/config';
import commonConfig from './config/common.config';
import validationSchema from './config/validation-schema';
import { ClientsModule, Transport } from '@nestjs/microservices';
import rmqConfig, { CONFIG_RMQ } from './config/rmq.config';
import { MSG_BROKER_TOKEN } from './constants';
import dbConfig, { CONFIG_DB } from './config/db.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnnotationsModule } from './annotations/annotations.module';
import { SeedingModule } from './seeding/seeding.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: false,
      envFilePath: ['.env.local', '.env.development', '.env.production'],
      ignoreEnvVars: false,
      load: [commonConfig, rmqConfig, dbConfig],
      validationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: true,
      },
    }),
    ClientsModule.registerAsync([
      {
        name: MSG_BROKER_TOKEN,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: async (configService: ConfigService) => {
          const config =
            configService.get<ConfigType<typeof rmqConfig>>(CONFIG_RMQ);

          return {
            transport: Transport.RMQ,
            options: {
              urls: [config.connectionUri],
            },
          };
        },
      },
    ]),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const config =
          configService.get<ConfigType<typeof dbConfig>>(CONFIG_DB);
        return {
          type: 'postgres',
          host: config.host,
          port: config.port,
          username: config.username,
          password: config.password,
          database: config.database,
          synchronize: config.synchronize,
          autoLoadEntities: true,
        };
      },
    }),
    SeedingModule,
    AnnotationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
