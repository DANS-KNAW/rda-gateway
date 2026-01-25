import { Test } from 'supertest';

export const TEST_API_KEY = 'test-api-key-for-e2e-testing-minimum-32-chars';

export function withApiKey(request: Test): Test {
  return request.set('X-API-Key', TEST_API_KEY);
}
