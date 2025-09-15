import { HttpExceptionBody, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { createTestApp } from './utils/create-test-app';
import { setupTestDatabase } from './utils/test-database-setup';

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
    expect(body.message).toBe('Duplicate key value violates unique constraint');
  });
});
