import { registerAs } from '@nestjs/config';
import { z } from 'zod';

export const ElasticsearchConfigSchema = z.object({
  ELASTIC_USERNAME: z.string().min(1),
  ELASTIC_PASSWORD: z.string().min(1),
  ELASTIC_NODE_ENDPOINTS: z
    .string()
    .min(1)
    .refine(
      (val) => val.split(',').every((endpoint) => endpoint.trim().length > 0),
      { message: 'All endpoints must be non-empty' },
    ),
  ELASTIC_REJECT_UNAUTHORIZED: z.boolean(),
  ELASTIC_SECURE: z.boolean(),
});

export const CONFIG_ELASTICSEARCH_TOKEN = Symbol('app:config.elasticsearch');

export default registerAs(CONFIG_ELASTICSEARCH_TOKEN, () => ({
  ELASTIC_USERNAME: process.env.ELASTIC_USERNAME,
  ELASTIC_PASSWORD: process.env.ELASTIC_PASSWORD,
  ELASTIC_NODE_ENDPOINTS: process.env.ELASTIC_NODE_ENDPOINTS.split(',').map(
    (endpoint) => endpoint.trim(),
  ),
  ELASTIC_REJECT_UNAUTHORIZED: process.env.ELASTIC_REJECT_UNAUTHORIZED,
  ELASTIC_SECURE: process.env.ELASTIC_SECURE,
}));
