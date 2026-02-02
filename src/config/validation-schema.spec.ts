import { EnvironmentSchema, EnvironmentVariables } from './validation-schema';

describe('Validation Schema', () => {
  let env: EnvironmentVariables;

  beforeEach(() => {
    env = {
      NODE_ENV: 'development',
      API_PORT: 3000,
      ANNOTATOR_MIN_VERSION: '1.0.0',

      AUTH_STRATEGY: 'keycloak',
      KEYCLOAK_CLIENT_ID: 'rda-auth',
      KEYCLOAK_AUTH_URL: 'https://keycloak.example.com/realms/rda',
      API_KEY: 'test-api-key-minimum-32-characters-long',

      DATABASE_HOST: 'localhost',
      DATABASE_PORT: 5432,
      DATABASE_USERNAME: 'postgres',
      DATABASE_PASSWORD: 'postgres',
      DATABASE_NAME: 'rda_gateway',

      ELASTIC_USERNAME: 'elastic',
      ELASTIC_PASSWORD: 'elasticpassword',
      ELASTIC_NODE_ENDPOINTS: 'http://localhost:9200',
      ELASTIC_REJECT_UNAUTHORIZED: 'false',
      ELASTIC_SECURE: 'false',
      ELASTIC_ALIAS_NAME: 'annotations',
    };
  });

  describe('Core', () => {
    it('should accept valid configuration', () => {
      const result = EnvironmentSchema.safeParse({
        ...env,
      });
      expect(result.error).toBeUndefined();
      expect(result.data).toEqual(env);
    });

    it('should reject invalid NODE_ENV values', () => {
      const result = EnvironmentSchema.safeParse({
        ...env,
        NODE_ENV: 'staging',
      });

      expect(result.error).toBeDefined();
    });

    it('should accept missing API_PORT with default', () => {
      const { API_PORT, ...envWithoutApiPort } = env;
      void API_PORT;

      const result = EnvironmentSchema.safeParse({
        ...envWithoutApiPort,
      });

      expect(result.error).toBeUndefined();
      // We set the type explicitly as it should be successful
      expect((result.data as EnvironmentVariables).API_PORT).toBe(3000);
    });

    it('should reject invalid API_PORT values', () => {
      const result = EnvironmentSchema.safeParse({
        ...env,
        API_PORT: 70000,
      });

      expect(result.error).toBeDefined();
    });
  });

  describe('IAM', () => {
    it('should reject invalid AUTH_STRATEGY values', () => {
      const result = EnvironmentSchema.safeParse({
        ...env,
        AUTH_STRATEGY: 'invalid_strategy',
      });

      expect(result.error).toBeDefined();
    });

    it('should reject missing KEYCLOAK_CLIENT_ID when AUTH_STRATEGY is keycloak', () => {
      const { KEYCLOAK_CLIENT_ID, ...envWithoutClientId } = env;
      void KEYCLOAK_CLIENT_ID;

      const result = EnvironmentSchema.safeParse({
        ...envWithoutClientId,
      });

      expect(result.error).toBeDefined();
    });

    it('should accept missing KEYCLOAK_CLIENT_ID when AUTH_STRATEGY is none', () => {
      const {
        KEYCLOAK_CLIENT_ID,
        KEYCLOAK_AUTH_URL,
        API_KEY,
        ...envWithoutOptionals
      } = env;
      void KEYCLOAK_CLIENT_ID;
      void KEYCLOAK_AUTH_URL;
      void API_KEY;

      const result = EnvironmentSchema.safeParse({
        ...envWithoutOptionals,
        AUTH_STRATEGY: 'none',
      });

      expect(result.error).toBeUndefined();
    });

    it('should reject missing KEYCLOAK_AUTH_URL when AUTH_STRATEGY is keycloak', () => {
      const { KEYCLOAK_AUTH_URL, ...envWithoutAuthUrl } = env;
      void KEYCLOAK_AUTH_URL;

      const result = EnvironmentSchema.safeParse({
        ...envWithoutAuthUrl,
      });

      expect(result.error).toBeDefined();
      expect(result.error?.issues[0].message).toBe(
        "KEYCLOAK_AUTH_URL is required when AUTH_STRATEGY is 'keycloak'",
      );
    });

    it('should reject missing API_KEY when AUTH_STRATEGY is keycloak', () => {
      const { API_KEY, ...envWithoutApiKey } = env;
      void API_KEY;

      const result = EnvironmentSchema.safeParse({
        ...envWithoutApiKey,
      });

      expect(result.error).toBeDefined();
      expect(result.error?.issues[0].message).toBe(
        "API_KEY is required when AUTH_STRATEGY is not 'none'",
      );
    });

    it('should accept missing API_KEY when AUTH_STRATEGY is none', () => {
      const {
        KEYCLOAK_CLIENT_ID,
        KEYCLOAK_AUTH_URL,
        API_KEY,
        ...envWithoutOptionals
      } = env;
      void KEYCLOAK_CLIENT_ID;
      void KEYCLOAK_AUTH_URL;
      void API_KEY;

      const result = EnvironmentSchema.safeParse({
        ...envWithoutOptionals,
        AUTH_STRATEGY: 'none',
      });

      expect(result.error).toBeUndefined();
    });

    it('should reject API_KEY shorter than 32 characters', () => {
      const result = EnvironmentSchema.safeParse({
        ...env,
        API_KEY: 'short-key',
      });

      expect(result.error).toBeDefined();
    });
  });

  describe('Database', () => {
    it('should reject missing database hostname', () => {
      const { DATABASE_HOST, ...envWithoutDbHost } = env;
      void DATABASE_HOST;

      const result = EnvironmentSchema.safeParse({
        ...envWithoutDbHost,
      });

      expect(result.error).toBeDefined();
    });

    it('should reject missing database port', () => {
      const { DATABASE_PORT, ...envWithoutDbPort } = env;
      void DATABASE_PORT;

      const result = EnvironmentSchema.safeParse({
        ...envWithoutDbPort,
      });

      expect(result.error).toBeDefined();
    });

    it('should reject invalid database port value', () => {
      const result = EnvironmentSchema.safeParse({
        ...env,
        DATABASE_PORT: 70000,
      });

      expect(result.error).toBeDefined();
    });

    it('should reject missing database username', () => {
      const { DATABASE_USERNAME, ...envWithoutDbUser } = env;
      void DATABASE_USERNAME;

      const result = EnvironmentSchema.safeParse({
        ...envWithoutDbUser,
      });

      expect(result.error).toBeDefined();
    });

    it('should reject empty database username', () => {
      const result = EnvironmentSchema.safeParse({
        ...env,
        DATABASE_USERNAME: '',
      });

      expect(result.error).toBeDefined();
    });

    it('should reject missing database password', () => {
      const { DATABASE_PASSWORD, ...envWithoutDbPass } = env;
      void DATABASE_PASSWORD;

      const result = EnvironmentSchema.safeParse({
        ...envWithoutDbPass,
      });

      expect(result.error).toBeDefined();
    });

    it('should reject empty database password', () => {
      const result = EnvironmentSchema.safeParse({
        ...env,
        DATABASE_PASSWORD: '',
      });

      expect(result.error).toBeDefined();
    });

    it('should reject missing database name', () => {
      const { DATABASE_NAME, ...envWithoutDbName } = env;
      void DATABASE_NAME;

      const result = EnvironmentSchema.safeParse({
        ...envWithoutDbName,
      });

      expect(result.error).toBeDefined();
    });

    it('should reject empty database name', () => {
      const result = EnvironmentSchema.safeParse({
        ...env,
        DATABASE_NAME: '',
      });

      expect(result.error).toBeDefined();
    });
  });
});
