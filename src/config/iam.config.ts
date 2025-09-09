import { registerAs } from '@nestjs/config';
import { z } from 'zod';

export const IamConfigSchema = z
  .object({
    /**
     * Strategy to use for authentication and authorization.
     *
     * @note none is not valid but will be kept for local testing.
     */
    AUTH_STRATEGY: z.enum(['keycloak', 'none']),

    KEYCLOAK_CLIENT_ID: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.AUTH_STRATEGY === 'keycloak') {
        return data.KEYCLOAK_CLIENT_ID !== undefined;
      }
      return true;
    },
    {
      message:
        "KEYCLOAK_CLIENT_ID is required when AUTH_STRATEGY is 'keycloak'",
      path: ['KEYCLOAK_CLIENT_ID'],
    },
  );

export const CONFIG_IAM_TOKEN = Symbol('app:config.iam');

export default registerAs(CONFIG_IAM_TOKEN, () => ({
  AUTH_STRATEGY: process.env.AUTH_STRATEGY,
}));
