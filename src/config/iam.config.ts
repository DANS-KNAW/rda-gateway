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

    /**
     * Keycloak realm URL for JWT token validation.
     * Example: https://keycloak.example.com/realms/myrealm
     */
    KEYCLOAK_AUTH_URL: z.string().url().optional(),

    /**
     * API key for authenticating requests to protected endpoints.
     * Must be at least 32 characters long.
     */
    API_KEY: z.string().min(32).optional(),
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
  )
  .refine(
    (data) => {
      if (data.AUTH_STRATEGY === 'keycloak') {
        return data.KEYCLOAK_AUTH_URL !== undefined;
      }
      return true;
    },
    {
      message: "KEYCLOAK_AUTH_URL is required when AUTH_STRATEGY is 'keycloak'",
      path: ['KEYCLOAK_AUTH_URL'],
    },
  )
  .refine(
    (data) => {
      if (data.AUTH_STRATEGY !== 'none') {
        return data.API_KEY !== undefined;
      }
      return true;
    },
    {
      message: "API_KEY is required when AUTH_STRATEGY is not 'none'",
      path: ['API_KEY'],
    },
  );

export const CONFIG_IAM_TOKEN = Symbol('app:config.iam');

export default registerAs(CONFIG_IAM_TOKEN, () => ({
  AUTH_STRATEGY: process.env.AUTH_STRATEGY,
  API_KEY: process.env.API_KEY,
  KEYCLOAK_AUTH_URL: process.env.KEYCLOAK_AUTH_URL,
}));
