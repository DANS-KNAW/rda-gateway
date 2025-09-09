import { z } from 'zod';
import { CoreConfigSchema } from './core.config';

export const EnvironmentSchema = CoreConfigSchema.required();

export type EnvironmentVariables = z.infer<typeof EnvironmentSchema>;
