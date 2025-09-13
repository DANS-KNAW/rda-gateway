import {
  ForbiddenException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ErrorClassifier } from './error-classifier';

describe('error-classifier', () => {
  let loggerErrorSpy: jest.SpyInstance;

  beforeAll(() => {
    loggerErrorSpy = jest.spyOn(Logger, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    loggerErrorSpy.mockRestore();
  });

  it('should pass through HttpExceptions', () => {
    // We use ForbiddenException to also test that Exception subclasses are passed through.
    const httpException = new ForbiddenException('test exception');

    expect(() => ErrorClassifier(httpException)).toThrow(httpException);
    expect(() => ErrorClassifier(httpException)).toThrow('test exception');

    expect(loggerErrorSpy).not.toHaveBeenCalled();
  });

  it('should log and throw InternalServerErrorException for unknown errors', () => {
    const unknownError = new Error('Unknown error occurred');

    expect(() => ErrorClassifier(unknownError)).toThrow(
      InternalServerErrorException,
    );
    expect(() => ErrorClassifier(unknownError)).toThrow(
      'An unexpected error occurred',
    );

    expect(loggerErrorSpy).toHaveBeenCalledWith(unknownError);
    expect(loggerErrorSpy).toHaveBeenCalledTimes(2); // called method twice
  });
});
