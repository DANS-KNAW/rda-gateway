import { EnvironmentSchema, EnvironmentVariables } from './validation-schema';

describe('Validation Schema', () => {
  let env: EnvironmentVariables;

  beforeEach(() => {
    env = {
      NODE_ENV: 'development',
      API_PORT: 3000,
      AUTH_STRATEGY: 'keycloak',
      KEYCLOAK_CLIENT_ID: 'rda-auth',
    };
  });

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

  it('Should reject invalid AUTH_STRATEGY values', () => {
    const result = EnvironmentSchema.safeParse({
      ...env,
      AUTH_STRATEGY: 'invalid_strategy',
    });

    expect(result.error).toBeDefined();
  });

  it('Should reject missing KEYCLOAK_CLIENT_ID when AUTH_STRATEGY is keycloak', () => {
    const { KEYCLOAK_CLIENT_ID, ...envWithoutClientId } = env;
    void KEYCLOAK_CLIENT_ID;

    const result = EnvironmentSchema.safeParse({
      ...envWithoutClientId,
    });

    expect(result.error).toBeDefined();
  });

  it('Should accept missing KEYCLOAK_CLIENT_ID when AUTH_STRATEGY is none', () => {
    const { KEYCLOAK_CLIENT_ID, ...envWithoutClientId } = env;
    void KEYCLOAK_CLIENT_ID;

    const result = EnvironmentSchema.safeParse({
      ...envWithoutClientId,
      AUTH_STRATEGY: 'none',
    });

    expect(result.error).toBeUndefined();
  });
});
