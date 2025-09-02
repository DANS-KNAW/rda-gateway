import { registerAs } from '@nestjs/config';
import { z } from 'zod';

export const CoreConfigSchema = z.object({
  /**
   * The environment the application is running in.
   */
  NODE_ENV: z.enum(['development', 'production']),

  /**
   * The port this application will be running on.
   */
  API_PORT: z.coerce.number().min(1024).max(65535).default(3000),
});

export const CONFIG_CORE_TOKEN = Symbol('app:config.core');

export default registerAs(
  CONFIG_CORE_TOKEN,
  (): z.infer<typeof CoreConfigSchema> => ({
    NODE_ENV: process.env.NODE_ENV,
    API_PORT: process.env.API_PORT,
  }),
);
