import { registerAs } from '@nestjs/config';
import { z } from 'zod';
import { BUILD_VERSION, BUILD_NAME } from '../build-info';

export const CoreConfigSchema = z.object({
  /**
   * The environment the application is running in.
   */
  NODE_ENV: z.enum(['development', 'production']),

  /**
   * The port this application will be running on.
   */
  API_PORT: z.coerce.number().min(1024).max(65535).default(3000),

  /**
   * Minimum required version of the annotator service.
   */
  ANNOTATOR_MIN_VERSION: z.string().min(1),
});

/**
 * Full config type including build-time values not subject to env validation.
 */
type CoreConfig = z.infer<typeof CoreConfigSchema> & {
  APP_VERSION: string;
  APP_NAME: string;
};

export const CONFIG_CORE_TOKEN = Symbol('app:config.core');

export default registerAs(
  CONFIG_CORE_TOKEN,
  (): CoreConfig => ({
    NODE_ENV: process.env.NODE_ENV,
    API_PORT: process.env.API_PORT,
    ANNOTATOR_MIN_VERSION: process.env.ANNOTATOR_MIN_VERSION,
    APP_VERSION:
      process.env.APP_VERSION ??
      process.env.npm_package_version ??
      BUILD_VERSION,
    APP_NAME:
      process.env.APP_NAME ?? process.env.npm_package_name ?? BUILD_NAME,
  }),
);
