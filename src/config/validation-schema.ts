import { z } from 'zod';
import { CoreConfigSchema } from './core.config';
import { IamConfigSchema } from './iam.config';
import { DatabaseConfigSchema } from './database.config';

export const EnvironmentSchema =
  CoreConfigSchema.and(IamConfigSchema).and(DatabaseConfigSchema);

export type EnvironmentVariables = z.infer<typeof EnvironmentSchema>;
