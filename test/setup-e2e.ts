/**
 * The application validates the environment variables at startup,
 * so we ensure that the necessary variables are set here.
 *
 * This file is run before each test suite, as configured in jest-e2e.json.
 *
 * @TODO We might want to place the responsibility for setting the environment
 * variables in the CI/CD pipeline and the developer locally instead of here.
 */

// Mock nanoid since it's an ESM-only module that doesn't work with Jest's default transformer
jest.mock('nanoid', () => ({
  customAlphabet: jest.fn(() => () => 'MOCKID123456'),
}));

// Set base environment variables that are always needed
process.env.API_PORT = 3000;
process.env.NODE_ENV = 'development';
process.env.AUTH_STRATEGY = 'keycloak';
process.env.KEYCLOAK_CLIENT_ID = 'rda-auth';
process.env.API_KEY = 'test-api-key-for-e2e-testing-minimum-32-chars';
process.env.ANNOTATOR_MIN_VERSION = '1.0.0';

// Set placeholder database variables (will be overridden in tests)
process.env.DATABASE_HOST = 'localhost';
process.env.DATABASE_PORT = 5432;
process.env.DATABASE_USERNAME = 'test';
process.env.DATABASE_PASSWORD = 'test';
process.env.DATABASE_NAME = 'test';

// Set Elasticsearch variables
process.env.ELASTIC_USERNAME = 'elastic';
process.env.ELASTIC_PASSWORD = 'test';
process.env.ELASTIC_NODE_ENDPOINTS = 'http://localhost:9200';
process.env.ELASTIC_REJECT_UNAUTHORIZED = 'false';
process.env.ELASTIC_SECURE = 'false';
process.env.ELASTIC_ALIAS_NAME = 'annotations';
