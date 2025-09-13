import { Logger } from '@nestjs/common';
import { ExceptionHandler } from './exception-handler.decorator';

describe('Exception Handler Decorator', () => {
  let loggerErrorSpy: jest.SpyInstance;

  beforeAll(() => {
    loggerErrorSpy = jest.spyOn(Logger, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    loggerErrorSpy.mockRestore();
  });

  it('should throw exception if applied to non-method', () => {
    const descriptor: PropertyDescriptor = {
      value: 'not a function',
      writable: true,
      enumerable: true,
      configurable: true,
    };

    expect(() => ExceptionHandler({}, 'testProperty', descriptor)).toThrow(
      'HandleError should only be applied to methods',
    );
  });

  it('should return original method if no exception occurs', () => {
    class TestClass {
      @ExceptionHandler
      testMethod(value: string) {
        return `Hello, ${value}!`;
      }
    }

    const instance = new TestClass();
    const result = instance.testMethod('World');

    expect(result).toBe('Hello, World!');
  });

  it('should throw exception if exception occurs in method', () => {
    class TestClass {
      @ExceptionHandler
      testMethod() {
        throw new Error('Test error: RANDOM-CODE-12345');
      }
    }

    const instance = new TestClass();

    expect(() => instance.testMethod()).toThrow('An unexpected error occurred');
    expect(loggerErrorSpy).toHaveBeenCalledWith(
      new Error('Test error: RANDOM-CODE-12345'),
    );
    expect(loggerErrorSpy).toHaveBeenCalledTimes(1);
  });
  it('should return promise if exception occurs in async method', async () => {
    class TestClass {
      async testAsyncMethod() {
        throw new Error('Test error: RANDOM-CODE-12345');
        await Promise.resolve();
      }
    }
    const descriptor = Object.getOwnPropertyDescriptor(
      TestClass.prototype,
      'testAsyncMethod',
    )!;

    const decoratedDescriptor = ExceptionHandler(
      TestClass.prototype,
      'testAsyncMethod',
      descriptor,
    );

    const instance = new TestClass();
    /* eslint-disable 
      @typescript-eslint/no-unsafe-assignment,
      @typescript-eslint/no-unsafe-call,
      @typescript-eslint/no-unsafe-member-access
      -- @TODO read exception-handler code comment
    */
    const resultPromise = decoratedDescriptor.value.call(instance);

    expect(resultPromise).toBeInstanceOf(Promise);
    await expect(resultPromise).rejects.toThrow('An unexpected error occurred');

    expect(loggerErrorSpy).toHaveBeenCalledWith(
      new Error('Test error: RANDOM-CODE-12345'),
    );
    expect(loggerErrorSpy).toHaveBeenCalledTimes(2); // called method twice
  });
});
