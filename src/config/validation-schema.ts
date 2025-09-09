import { z } from 'zod';
import { CoreConfigSchema } from './core.config';
import { IamConfigSchema } from './iam.config';

export const EnvironmentSchema = CoreConfigSchema.and(IamConfigSchema);

export type EnvironmentVariables = z.infer<typeof EnvironmentSchema>;
