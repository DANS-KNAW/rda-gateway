/**
 * @TODO Should find a better way to manage environment variables in tests.
 *
 * Since the application requires certain environment variables to be set,
 * we will define them here for the testing environment.
 *
 * Setting the variables before importing anything ensures that they are available
 * throughout to all modules and services.
 */
process.env.API_PORT = 3000;
process.env.NODE_ENV = 'production';
process.env.AUTH_STRATEGY = 'keycloak';
process.env.KEYCLOAK_CLIENT_ID = 'rda-auth';

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
});
