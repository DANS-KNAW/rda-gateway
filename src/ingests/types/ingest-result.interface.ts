import { ParseError } from './parse-error.interface';

export interface IngestResult {
  filename: string;
  success: number;
  failed: number;
  error?: string | ParseError[];
}
