import { registerAs } from '@nestjs/config';
import { z } from 'zod';

export const BullMQConfigSchema = z.object({
  REDIS_HOST: z.hostname(),
  REDIS_PORT: z.coerce.number().min(1).max(65535),
  REDIS_PASSWORD: z.string().min(1),
});

export const CONFIG_BULLMQ_TOKEN = Symbol('app:config.bullmq');

export default registerAs(CONFIG_BULLMQ_TOKEN, () => ({
  REDIS_HOST: process.env.REDIS_HOST,
  REDIS_PORT: process.env.REDIS_PORT,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,
}));
