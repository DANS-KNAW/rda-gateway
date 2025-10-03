import { z } from 'zod';
import { CoreConfigSchema } from './core.config';
import { IamConfigSchema } from './iam.config';
import { DatabaseConfigSchema } from './database.config';
import { BullMQConfigSchema } from './bullmq.config';
import { ElasticsearchConfigSchema } from './elasticsearch.config';

export const EnvironmentSchema = CoreConfigSchema.and(IamConfigSchema)
  .and(DatabaseConfigSchema)
  .and(BullMQConfigSchema)
  .and(ElasticsearchConfigSchema);

export type EnvironmentVariables = z.infer<typeof EnvironmentSchema>;
