import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ApiKeyGuard } from './api-key.guard';

describe('ApiKeyGuard', () => {
  let guard: ApiKeyGuard;
  let reflector: Reflector;
  let mockExecutionContext: ExecutionContext;

  const createMockContext = (apiKey?: string): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: apiKey ? { 'x-api-key': apiKey } : {},
        }),
      }),
      getHandler: () => jest.fn(),
      getClass: () => jest.fn(),
    } as unknown as ExecutionContext;
  };

  beforeEach(() => {
    reflector = new Reflector();
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
  });

  describe('when AUTH_STRATEGY is none', () => {
    beforeEach(() => {
      guard = new ApiKeyGuard(reflector, {
        AUTH_STRATEGY: 'none',
        API_KEY: undefined,
      });
    });

    it('should allow access without API key', () => {
      mockExecutionContext = createMockContext();
      expect(guard.canActivate(mockExecutionContext)).toBe(true);
    });
  });

  describe('when AUTH_STRATEGY is keycloak', () => {
    const validApiKey = 'valid-api-key-that-is-at-least-32-characters';

    beforeEach(() => {
      guard = new ApiKeyGuard(reflector, {
        AUTH_STRATEGY: 'keycloak',
        API_KEY: validApiKey,
      });
    });

    it('should allow access to public routes', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);
      mockExecutionContext = createMockContext();
      expect(guard.canActivate(mockExecutionContext)).toBe(true);
    });

    it('should throw UnauthorizedException when no API key is provided', () => {
      mockExecutionContext = createMockContext();
      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        UnauthorizedException,
      );
      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        'API key is required',
      );
    });

    it('should throw UnauthorizedException when invalid API key is provided', () => {
      mockExecutionContext = createMockContext('invalid-api-key');
      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        UnauthorizedException,
      );
      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        'Invalid API key',
      );
    });

    it('should allow access when valid API key is provided', () => {
      mockExecutionContext = createMockContext(validApiKey);
      expect(guard.canActivate(mockExecutionContext)).toBe(true);
    });
  });

  describe('reflector behavior', () => {
    const validApiKey = 'valid-api-key-that-is-at-least-32-characters';
    let getAllAndOverrideSpy: jest.SpyInstance;

    beforeEach(() => {
      guard = new ApiKeyGuard(reflector, {
        AUTH_STRATEGY: 'keycloak',
        API_KEY: validApiKey,
      });
      getAllAndOverrideSpy = jest.spyOn(reflector, 'getAllAndOverride');
    });

    it('should check both handler and class for public metadata', () => {
      const mockHandler = jest.fn();
      const mockClass = jest.fn();

      mockExecutionContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            headers: { 'x-api-key': validApiKey },
          }),
        }),
        getHandler: () => mockHandler,
        getClass: () => mockClass,
      } as unknown as ExecutionContext;

      guard.canActivate(mockExecutionContext);

      expect(getAllAndOverrideSpy).toHaveBeenCalledWith('isPublic', [
        mockHandler,
        mockClass,
      ]);
    });
  });
});
