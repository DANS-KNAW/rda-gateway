import { EnvironmentSchema, EnvironmentVariables } from './validation-schema';

describe('Validation Schema', () => {
  let env: EnvironmentVariables;

  beforeEach(() => {
    env = {
      NODE_ENV: 'development',
      API_PORT: 3000,
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
});
