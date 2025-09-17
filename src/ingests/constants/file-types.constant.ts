import { FileInfo } from '../types/file-info.type';
import { FileTypeEnum } from '../types/file-type.enum';

export const FILE_INFO: Record<FileTypeEnum, FileInfo> = {
  [FileTypeEnum.CSV]: { extension: 'csv', mimetype: 'text/csv' },
  [FileTypeEnum.TSV]: {
    extension: 'tsv',
    mimetype: 'text/tab-separated-values',
  },
  [FileTypeEnum.JSON]: { extension: 'json', mimetype: 'application/json' },
} as const;
