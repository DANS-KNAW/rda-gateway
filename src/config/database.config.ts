import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { z } from 'zod';

export const DatabaseConfigSchema = z.object({
  DATABASE_HOST: z.hostname(),
  DATABASE_PORT: z.coerce.number().min(1).max(65535),
  DATABASE_USERNAME: z.string().min(1),
  DATABASE_PASSWORD: z.string().min(1),
  DATABASE_NAME: z.string().min(1),
});

export const CONFIG_DATABASE_TOKEN = Symbol('app:config.database');

export default registerAs(
  CONFIG_DATABASE_TOKEN,
  (): TypeOrmModuleOptions => ({
    type: 'postgres',
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    autoLoadEntities: true,
    // Synchronize is true only in development, false otherwise (never in production).
    // synchronize: process.env.NODE_ENV === 'development',
    synchronize: false,
    /**
     * @TODO Migrations should be created after the first version of the entities is done.
     */
  }),
);
