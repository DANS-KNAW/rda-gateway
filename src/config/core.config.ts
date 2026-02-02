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

  /**
   * Application version. Auto-detected from package.json when running via pnpm.
   * Set explicitly via APP_VERSION env var in production Docker builds.
   */
  APP_VERSION: z.string().default('unknown'),

  /**
   * Application name. Auto-detected from package.json when running via pnpm.
   * Set explicitly via APP_NAME env var in production Docker builds.
   */
  APP_NAME: z.string().default('rda-gateway'),
});

export const CONFIG_CORE_TOKEN = Symbol('app:config.core');

export default registerAs(
  CONFIG_CORE_TOKEN,
  (): z.infer<typeof CoreConfigSchema> => ({
    NODE_ENV: process.env.NODE_ENV,
    API_PORT: process.env.API_PORT,
    ANNOTATOR_MIN_VERSION: process.env.ANNOTATOR_MIN_VERSION,
    APP_VERSION:
      process.env.APP_VERSION ?? process.env.npm_package_version ?? BUILD_VERSION,
    APP_NAME:
      process.env.APP_NAME ?? process.env.npm_package_name ?? BUILD_NAME,
  }),
);
