import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';

export async function setupTestDatabase() {
  const container: StartedPostgreSqlContainer = await new PostgreSqlContainer(
    'postgres:17-alpine',
  ).start();

  /**
   * We set the environment variables to the generated container values here.
   * TypeORM will read these when trying to connect to the database.
   */
  process.env.DATABASE_HOST = container.getHost();
  process.env.DATABASE_PORT = container.getMappedPort(5432);
  process.env.DATABASE_USERNAME = container.getUsername();
  process.env.DATABASE_PASSWORD = container.getPassword();
  process.env.DATABASE_NAME = container.getDatabase();

  return container;
}
