import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { createTestApp } from './utils/create-test-app';
import { setupTestDatabase } from './utils/test-database-setup';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  let postgresContainer: StartedPostgreSqlContainer;

  beforeAll(async () => {
    postgresContainer = await setupTestDatabase();
  });

  afterAll(async () => {
    await postgresContainer.stop();
  });

  beforeEach(async () => {
    app = await createTestApp();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    request(app.getHttpServer()).get('/').expect(200).expect('Hello World!');
  });
});
