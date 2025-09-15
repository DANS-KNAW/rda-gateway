import {
  ConflictException,
  HttpException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { DatabaseError } from 'pg';

/**
 * Classifies and handles errors in a standardized way.
 *
 * - If the error is an instance of `HttpException`, it is re-thrown as is,
 *   assuming it has already been handled appropriately.
 * - For any other unknown error, it logs the error and throws a generic
 *   `InternalServerErrorException`.
 *
 * - If any other specific error it will be defined here.
 *
 * NOTE: This function is ONLY intended for classifying errors and should not
 * be used for any failure handling that requires additional context.
 *
 * @param error - The error object to classify and handle.
 * @throws HttpException - If the error is an instance of `HttpException`.
 * @throws InternalServerErrorException - For not implemented errors or unknown errors.
 */
export function ErrorClassifier(error: unknown): never {
  // We make the optimistic assumption that any HttpException based errors
  // have already been handled appropriately and can be re-thrown as is.
  if (error instanceof HttpException) {
    throw error;
  }

  if (error instanceof QueryFailedError) {
    // We should be using PostgreSQL, so we can safely cast to DatabaseError
    const pgError = error.driverError as DatabaseError;
    if (pgError.code === '23505') {
      // 23505 is the PostgreSQL error code for unique violations
      throw new ConflictException(
        'Duplicate key value violates unique constraint',
      );
    }
  }

  // Any unknown error will be logged and re-thrown as a generic.
  Logger.error(error);
  throw new InternalServerErrorException('An unexpected error occurred');
}
