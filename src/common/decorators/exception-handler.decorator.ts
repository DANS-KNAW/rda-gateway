/* eslint-disable 
   @typescript-eslint/no-unsafe-assignment,
   @typescript-eslint/no-unsafe-call,
   @typescript-eslint/no-unsafe-member-access,
   @typescript-eslint/no-unsafe-return
   -- @TODO: Since we are using any for error handling, we need to disable these rules.
   -- It would be better to find a more type-safe way to handle errors.
*/
import { ErrorClassifier } from '../utils/error-classifier';

/**
 * Method decorator that wraps the target method with a try-catch block to handle exceptions.
 * If the method is asynchronous it returns a Promise that catches errors.
 * All caught errors are passed to the `ErrorClassifier` function for centralized error handling.
 *
 * @param _target - The prototype of the class. (unused)
 * @param _propertyKey - The name of the method being decorated. (unused)
 * @param descriptor - The property descriptor for the method.
 * @throws {Error} If applied to a non-method property.q
 * @returns The modified property descriptor with error handling logic.
 *
 */
export function ExceptionHandler(
  _target: object,
  _propertyKey: string | symbol,
  descriptor: PropertyDescriptor,
) {
  if (typeof descriptor.value !== 'function') {
    throw new Error('HandleError should only be applied to methods');
  }

  const originalMethod = descriptor.value;

  descriptor.value = function (...args: any[]) {
    try {
      const result = originalMethod.apply(this, args);

      // Check if the descriptor value is asynchronous and catch errors in the Promise chain.
      if (result && typeof result.then === 'function') {
        return result.catch((error: any) => {
          ErrorClassifier(error);
        });
      }

      // Return the original method's result if no exception occurs.
      return result;
    } catch (error) {
      ErrorClassifier(error);
    }
  };

  return descriptor;
}
