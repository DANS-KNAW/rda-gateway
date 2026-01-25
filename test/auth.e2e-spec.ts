import { HttpExceptionBody, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { createTestApp } from './utils/create-test-app';
import { setupTestDatabase } from './utils/test-database-setup';
import { TEST_API_KEY, withApiKey } from './utils/authenticated-request';

describe('API Key Authentication (e2e)', () => {
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

  describe('Public routes', () => {
    it('GET / should be accessible without API key', async () => {
      await request(app.getHttpServer()).get('/').expect(200);
    });

    it('GET /annotator should be accessible without API key', async () => {
      const response = await request(app.getHttpServer()).get('/annotator');
      // Should not return 401 (unauthorized) - any other status is acceptable for this auth test
      expect(response.status).not.toBe(401);
    });

    it('GET /annotator/min-version should be accessible without API key', async () => {
      await request(app.getHttpServer())
        .get('/annotator/min-version')
        .expect(200);
    });

    it('GET /vocabularies should be accessible without API key', async () => {
      await request(app.getHttpServer()).get('/vocabularies').expect(404); // 404 because no vocabularies exist
    });
  });

  describe('Protected routes', () => {
    it('POST /vocabularies should return 401 without API key', async () => {
      const response = await request(app.getHttpServer())
        .post('/vocabularies')
        .send({
          subject_scheme: 'Test Scheme',
          scheme_uri: 'http://example.com/scheme',
          value_uri: 'http://example.com/value',
          value_scheme: 'Test Value Scheme',
          namespace: 'test-namespace',
        })
        .expect(401);

      const body = response.body as HttpExceptionBody;
      expect(body.message).toBe('API key is required');
    });

    it('POST /vocabularies should return 401 with invalid API key', async () => {
      const response = await request(app.getHttpServer())
        .post('/vocabularies')
        .set('X-API-Key', 'invalid-api-key')
        .send({
          subject_scheme: 'Test Scheme',
          scheme_uri: 'http://example.com/scheme',
          value_uri: 'http://example.com/value',
          value_scheme: 'Test Value Scheme',
          namespace: 'test-namespace',
        })
        .expect(401);

      const body = response.body as HttpExceptionBody;
      expect(body.message).toBe('Invalid API key');
    });

    it('POST /vocabularies should succeed with valid API key', async () => {
      const response = await withApiKey(
        request(app.getHttpServer()).post('/vocabularies'),
      )
        .send({
          subject_scheme: 'Auth Test Scheme',
          scheme_uri: 'http://example.com/scheme',
          value_uri: 'http://example.com/value',
          value_scheme: 'Test Value Scheme',
          namespace: 'test-namespace',
        })
        .expect(201);

      expect(response.body).toMatchObject({
        subject_scheme: 'Auth Test Scheme',
        scheme_uri: 'http://example.com/scheme',
        value_uri: 'http://example.com/value',
        value_scheme: 'Test Value Scheme',
        namespace: 'test-namespace',
      });
    });

    it('PATCH /vocabularies should return 401 without API key', async () => {
      const response = await request(app.getHttpServer())
        .patch('/vocabularies')
        .send({
          subject_scheme: 'Test Scheme',
          scheme_uri: 'http://example.com/scheme',
          value_uri: 'http://example.com/value',
          value_scheme: 'Test Value Scheme',
          namespace: 'test-namespace',
        })
        .expect(401);

      const body = response.body as HttpExceptionBody;
      expect(body.message).toBe('API key is required');
    });

    it('DELETE /vocabularies should return 401 without API key', async () => {
      const response = await request(app.getHttpServer())
        .delete('/vocabularies')
        .query({
          subject_scheme: 'Test Scheme',
          scheme_uri: 'http://example.com/scheme',
          value_uri: 'http://example.com/value',
          value_scheme: 'Test Value Scheme',
        })
        .expect(401);

      const body = response.body as HttpExceptionBody;
      expect(body.message).toBe('API key is required');
    });

    it('DELETE /vocabularies/archive should return 401 without API key', async () => {
      const response = await request(app.getHttpServer())
        .delete('/vocabularies/archive')
        .query({
          subject_scheme: 'Test Scheme',
          scheme_uri: 'http://example.com/scheme',
          value_uri: 'http://example.com/value',
          value_scheme: 'Test Value Scheme',
        })
        .expect(401);

      const body = response.body as HttpExceptionBody;
      expect(body.message).toBe('API key is required');
    });

    it('PATCH /vocabularies/restore should return 401 without API key', async () => {
      const response = await request(app.getHttpServer())
        .patch('/vocabularies/restore')
        .query({
          subject_scheme: 'Test Scheme',
          scheme_uri: 'http://example.com/scheme',
          value_uri: 'http://example.com/value',
          value_scheme: 'Test Value Scheme',
        })
        .expect(401);

      const body = response.body as HttpExceptionBody;
      expect(body.message).toBe('API key is required');
    });
  });

  describe('API key header case sensitivity', () => {
    it('should accept X-API-Key header (case-sensitive match)', async () => {
      await withApiKey(request(app.getHttpServer()).post('/vocabularies'))
        .send({
          subject_scheme: 'Case Test Scheme',
          scheme_uri: 'http://example.com/scheme',
          value_uri: 'http://example.com/value2',
          value_scheme: 'Test Value Scheme',
          namespace: 'test-namespace',
        })
        .expect(201);
    });

    it('should accept x-api-key header (lowercase)', async () => {
      await request(app.getHttpServer())
        .post('/vocabularies')
        .set('x-api-key', TEST_API_KEY)
        .send({
          subject_scheme: 'Lowercase Test Scheme',
          scheme_uri: 'http://example.com/scheme',
          value_uri: 'http://example.com/value3',
          value_scheme: 'Test Value Scheme',
          namespace: 'test-namespace',
        })
        .expect(201);
    });
  });
});
