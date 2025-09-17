import { HttpExceptionBody, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { createTestApp } from './utils/create-test-app';
import { setupTestDatabase } from './utils/test-database-setup';
import { Vocabulary } from 'src/vocabularies/entities/vocabulary.entity';

describe('VocabulariesController (e2e)', () => {
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

  describe('/vocabularies (POST)', () => {
    it('/vocabularies (POST)', async () => {
      const response = await request(app.getHttpServer())
        .post('/vocabularies')
        .send({
          subject_scheme: 'Test Scheme',
          scheme_uri: 'http://example.com/scheme',
          value_uri: 'http://example.com/value',
          additional_metadata: { key: 'value' },
        })
        .expect(201);

      expect(response).toBeDefined();
      expect(response.body).toMatchObject({
        subject_scheme: 'Test Scheme',
        scheme_uri: 'http://example.com/scheme',
        value_uri: 'http://example.com/value',
        additional_metadata: { key: 'value' },
        deleted_at: null,
      });
      expect(response.body).toHaveProperty('created_at');
      expect(response.body).toHaveProperty('updated_at');
    });

    it('/vocabularies (POST) - validation error', async () => {
      const response = await request(app.getHttpServer())
        .post('/vocabularies')
        .send({
          subject_scheme: '', // Invalid: empty string
          scheme_uri: 'not-a-valid-uri', // Invalid URI
          // Missing value_uri
          additional_metadata: 'should-be-an-object', // Invalid: should be an object
        })
        .expect(400);

      const body = response.body as HttpExceptionBody;

      expect(body).toBeDefined();
      expect(body.message).toContain('subject_scheme should not be empty');
      // expect(body.message).toContain('scheme_uri must be an URI');
      expect(body.message).toContain('value_uri should not be empty');
      expect(body.message).toContain('additional_metadata must be an object');
    });

    it('/vocabularies (POST) - duplicate entry', async () => {
      // The previous test already created this entry.
      const response = await request(app.getHttpServer())
        .post('/vocabularies')
        .send({
          subject_scheme: 'Test Scheme',
          scheme_uri: 'http://example.com/scheme',
          value_uri: 'http://example.com/value',
          additional_metadata: { key: 'value' },
        })
        .expect(409);

      const body = response.body as HttpExceptionBody;

      expect(body).toBeDefined();
      expect(body.message).toBe(
        'Duplicate key value violates unique constraint',
      );
    });
  });

  describe('/vocabularies (GET)', () => {
    it('/vocabularies (GET)', async () => {
      await request(app.getHttpServer())
        .post('/vocabularies')
        .send({
          subject_scheme: 'Test Another Scheme',
          scheme_uri: 'http://example.com/scheme',
          value_uri: 'http://example.com/value',
          additional_metadata: { key: 'value' },
        })
        .expect(201);

      const response = await request(app.getHttpServer())
        .get('/vocabularies')
        .expect(200);

      const body = response.body as Vocabulary[];

      expect(response).toBeDefined();
      expect(body).toBeDefined();
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBe(2);
      expect(body[0]).toMatchObject({
        subject_scheme: 'Test Scheme',
        scheme_uri: 'http://example.com/scheme',
        value_uri: 'http://example.com/value',
        additional_metadata: { key: 'value' },
        deleted_at: null,
      });
      expect(body[0]).toHaveProperty('created_at');
      expect(body[0]).toHaveProperty('updated_at');
    });

    it('/vocabularies (GET) - with filters', async () => {
      const response = await request(app.getHttpServer())
        .get('/vocabularies')
        .query({
          subject_scheme: 'Test Another Scheme',
          scheme_uri: 'http://example.com/scheme',
          value_uri: 'http://example.com/value',
          amount: 1,
          offset: undefined,
        })
        .expect(200);

      const body = response.body as Vocabulary[];

      expect(response).toBeDefined();
      expect(body).toBeDefined();
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBe(1);
      expect(body[0]).toMatchObject({
        subject_scheme: 'Test Another Scheme',
        scheme_uri: 'http://example.com/scheme',
        value_uri: 'http://example.com/value',
        additional_metadata: { key: 'value' },
        deleted_at: null,
      });
      expect(body[0]).toHaveProperty('created_at');
      expect(body[0]).toHaveProperty('updated_at');
    });

    it('/vocabularies (GET) - no results', async () => {
      const response = await request(app.getHttpServer())
        .get('/vocabularies')
        .query({
          subject_scheme: 'Nonexistent Scheme',
        })
        .expect(404);

      const body = response.body as HttpExceptionBody;

      expect(body).toBeDefined();
      expect(body.error).toBe('Not Found');
      expect(body.message).toBe('No vocabularies found');
      expect(body.statusCode).toBe(404);
    });

    it('/vocabularies (GET) - invalid query params', async () => {
      const response = await request(app.getHttpServer())
        .get('/vocabularies')
        .query({
          amount: 51,
          offset: 'not-a-number',
        })
        .expect(400);

      const body = response.body as HttpExceptionBody;

      expect(body).toBeDefined();
      expect(body.message).toContain('amount must not be greater than 50');
      expect(body.message).toContain('offset must be a positive number');
      expect(body.message).toContain('offset must be an integer number');
    });
  });

  describe('/vocabularies (PATCH)', () => {
    it('/vocabularies (PATCH)', async () => {
      const response = await request(app.getHttpServer())
        .patch('/vocabularies')
        .send({
          subject_scheme: 'Test Scheme',
          scheme_uri: 'http://example.com/scheme',
          value_uri: 'http://example.com/value',
          additional_metadata: { key: 'newValue' },
        })
        .expect(200);

      const body = response.body as Vocabulary;

      expect(response).toBeDefined();
      expect(body).toBeDefined();
      expect(body).toMatchObject({
        subject_scheme: 'Test Scheme',
        scheme_uri: 'http://example.com/scheme',
        value_uri: 'http://example.com/value',
        additional_metadata: { key: 'newValue' },
        deleted_at: null,
      });
      expect(body).toHaveProperty('created_at');
      expect(body).toHaveProperty('updated_at');
    });

    it('/vocabularies (PATCH) - validation error', async () => {
      const response = await request(app.getHttpServer())
        .patch('/vocabularies')
        .send({
          subject_scheme: '', // Invalid: empty string
          scheme_uri: 'not-a-valid-uri', // Invalid URI
          // Missing value_uri
          additional_metadata: 'should-be-an-object', // Invalid: should be an object
        })
        .expect(400);

      const body = response.body as HttpExceptionBody;
      expect(body).toBeDefined();
      expect(body.message).toContain('subject_scheme should not be empty');
      // expect(body.message).toContain('scheme_uri must be an URI');
      expect(body.message).toContain('value_uri should not be empty');
      expect(body.message).toContain('additional_metadata must be an object');
    });

    it('/vocabularies (PATCH) - nonexistent vocabulary', async () => {
      const response = await request(app.getHttpServer())
        .patch('/vocabularies')
        .send({
          subject_scheme: 'Nonexistent Scheme',
          scheme_uri: 'http://example.com/scheme',
          value_uri: 'http://example.com/value',
          additional_metadata: { key: 'value' },
        })
        .expect(404);

      const body = response.body as HttpExceptionBody;
      expect(body).toBeDefined();
      expect(body.message).toBe('No vocabularies found');
    });
  });

  describe('/vocabularies/archive (DELETE)', () => {
    it('/vocabularies/archive (DELETE)', async () => {
      const archiveResponse = await request(app.getHttpServer())
        .delete('/vocabularies/archive')
        .query({
          subject_scheme: 'Test Scheme',
          scheme_uri: 'http://example.com/scheme',
          value_uri: 'http://example.com/value',
        })
        .expect(204);

      const findResponse = await request(app.getHttpServer())
        .get('/vocabularies')
        .query({
          subject_scheme: 'Test Scheme',
          scheme_uri: 'http://example.com/scheme',
          value_uri: 'http://example.com/value',
          amount: 1,
          offset: undefined,
          deleted: true,
        })
        .expect(200);

      const body = findResponse.body as Vocabulary[];

      expect(findResponse).toBeDefined();
      expect(body).toBeDefined();
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBe(1);
      expect(body[0]).toMatchObject({
        subject_scheme: 'Test Scheme',
        scheme_uri: 'http://example.com/scheme',
        value_uri: 'http://example.com/value',
        additional_metadata: { key: 'newValue' },
      });
      expect(body[0].deleted_at).not.toBeNull();
      expect(body[0]).toHaveProperty('updated_at');
      expect(body[0]).toHaveProperty('created_at');
      expect(archiveResponse).toBeDefined();
      expect(archiveResponse.body).toEqual({});
    });

    it('/vocabularies/archive (DELETE) - already archived', async () => {
      const response = await request(app.getHttpServer())
        .delete('/vocabularies/archive')
        .query({
          subject_scheme: 'Test Scheme',
          scheme_uri: 'http://example.com/scheme',
          value_uri: 'http://example.com/value',
        })
        .expect(400);

      const body = response.body as HttpExceptionBody;
      expect(body).toBeDefined();
      expect(body.message).toBe('Vocabulary is already archived');
    });

    it('/vocabularies/archive (DELETE) - nonexistent vocabulary', async () => {
      const response = await request(app.getHttpServer())
        .delete('/vocabularies/archive')
        .query({
          subject_scheme: 'Nonexistent Scheme',
          scheme_uri: 'http://example.com/scheme',
          value_uri: 'http://example.com/value',
        })
        .expect(404);

      const body = response.body as HttpExceptionBody;
      expect(body).toBeDefined();
      expect(body.message).toBe('No vocabularies found');
    });

    it('/vocabularies/archive (DELETE) - validation error', async () => {
      const response = await request(app.getHttpServer())
        .delete('/vocabularies/archive')
        .query({
          subject_scheme: '', // Invalid: empty string
          scheme_uri: 'not-a-valid-uri', // Invalid URI
          // Missing value_uri
        })
        .expect(400);

      const body = response.body as HttpExceptionBody;
      expect(body).toBeDefined();
      expect(body.message).toContain('subject_scheme should not be empty');
      // expect(body.message).toContain('scheme_uri must be an URI');
      expect(body.message).toContain('value_uri should not be empty');
    });
  });

  describe('/vocabularies/restore (PATCH)', () => {
    it('/vocabularies/restore (PATCH)', async () => {
      const restoreResponse = await request(app.getHttpServer())
        .patch('/vocabularies/restore')
        .query({
          subject_scheme: 'Test Scheme',
          scheme_uri: 'http://example.com/scheme',
          value_uri: 'http://example.com/value',
        })
        .expect(204);

      const findResponse = await request(app.getHttpServer())
        .get('/vocabularies')
        .query({
          subject_scheme: 'Test Scheme',
          scheme_uri: 'http://example.com/scheme',
          value_uri: 'http://example.com/value',
          amount: 1,
          offset: undefined,
          deleted: false,
        })
        .expect(200);

      const body = findResponse.body as Vocabulary[];

      expect(findResponse).toBeDefined();
      expect(body).toBeDefined();
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBe(1);
      expect(body[0]).toMatchObject({
        subject_scheme: 'Test Scheme',
        scheme_uri: 'http://example.com/scheme',
        value_uri: 'http://example.com/value',
        additional_metadata: { key: 'newValue' },
      });
      expect(body[0].deleted_at).toBeNull();
      expect(body[0]).toHaveProperty('updated_at');
      expect(body[0]).toHaveProperty('created_at');
      expect(restoreResponse).toBeDefined();
      expect(restoreResponse.body).toEqual({});
    });

    it('/vocabularies/restore (PATCH) - not archived', async () => {
      const response = await request(app.getHttpServer())
        .patch('/vocabularies/restore')
        .query({
          subject_scheme: 'Test Scheme',
          scheme_uri: 'http://example.com/scheme',
          value_uri: 'http://example.com/value',
        })
        .expect(400);

      const body = response.body as HttpExceptionBody;
      expect(body).toBeDefined();
      expect(body.message).toBe('Vocabulary is not archived');
    });

    it('/vocabularies/restore (PATCH) - nonexistent vocabulary', async () => {
      const response = await request(app.getHttpServer())
        .patch('/vocabularies/restore')
        .query({
          subject_scheme: 'Nonexistent Scheme',
          scheme_uri: 'http://example.com/scheme',
          value_uri: 'http://example.com/value',
        })
        .expect(404);

      const body = response.body as HttpExceptionBody;
      expect(body).toBeDefined();
      expect(body.message).toBe('No vocabularies found');
    });

    it('/vocabularies/restore (PATCH) - validation error', async () => {
      const response = await request(app.getHttpServer())
        .patch('/vocabularies/restore')
        .query({
          subject_scheme: '', // Invalid: empty string
          scheme_uri: 'not-a-valid-uri', // Invalid URI
          // Missing value_uri
        })
        .expect(400);

      const body = response.body as HttpExceptionBody;
      expect(body).toBeDefined();
      expect(body.message).toContain('subject_scheme should not be empty');
      // expect(body.message).toContain('scheme_uri must be an URI');
      expect(body.message).toContain('value_uri should not be empty');
    });
  });
});
