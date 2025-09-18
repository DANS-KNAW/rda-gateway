/**
 * The application validates the environment variables at startup,
 * so we ensure that the necessary variables are set here.
 *
 * This file is run before each test suite, as configured in jest-e2e.json.
 *
 * @TODO We might want to place the responsibility for setting the environment
 * variables in the CI/CD pipeline and the developer locally instead of here.
 */

// Set base environment variables that are always needed
process.env.API_PORT = 3000;
process.env.NODE_ENV = 'development';
process.env.AUTH_STRATEGY = 'keycloak';
process.env.KEYCLOAK_CLIENT_ID = 'rda-auth';

// Set placeholder database variables (will be overridden in tests)
process.env.DATABASE_HOST = 'localhost';
process.env.DATABASE_PORT = 5432;
process.env.DATABASE_USERNAME = 'test';
process.env.DATABASE_PASSWORD = 'test';
process.env.DATABASE_NAME = 'test';

process.env.REDIS_HOST = 'localhost';
process.env.REDIS_PORT = 6379;
process.env.REDIS_PASSWORD = 'test';
