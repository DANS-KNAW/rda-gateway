import { CSVRecord } from './csv-record.type';

export interface ParseError {
  record: CSVRecord;
  error: string;
}
