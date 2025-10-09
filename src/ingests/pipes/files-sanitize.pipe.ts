import {
  ArgumentMetadata,
  BadRequestException,
  PipeTransform,
} from '@nestjs/common';
import { FILE_INFO } from '../constants/file-types.constant';

export class FilesSanitizePipe implements PipeTransform {
  private readonly minFileSize = 3; // bytes
  private readonly maxFileSize = 100 * 1024 * 1024; // 100 MB
  private readonly maxFileCount = 50;

  transform(value: Express.Multer.File[], metadata: ArgumentMetadata) {
    if (!value || value.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    if (value.length > this.maxFileCount) {
      throw new BadRequestException(
        `Too many files. Maximum allowed: ${this.maxFileCount}`,
      );
    }

    const getFileTypeByExtension = (filename: string) => {
      const ext = filename.split('.').pop()?.toLowerCase();
      return Object.entries(FILE_INFO).find(
        ([_, info]) => info.extension === ext,
      )?.[0];
    };

    const getFileTypeByMimeType = (mimetype: string) => {
      return Object.entries(FILE_INFO).find(
        ([_, info]) => info.mimetype === mimetype,
      )?.[0];
    };

    /**
     * We validate each file on the following criteria:
     * - Size (min and max)
     * - Filename (not empty, length, dangerous characters, reserved names)
     * - MIME type (not empty, valid)
     * - Buffer (not empty, size matches)
     * - Extension (valid and matches MIME type)
     * - No null bytes in filename
     */
    for (const file of value) {
      if (file.size < this.minFileSize) {
        throw new BadRequestException(
          `File ${file.originalname} is too small. Minimum size is ${this.minFileSize} bytes.`,
        );
      }

      if (file.size > this.maxFileSize) {
        throw new BadRequestException(
          `File ${file.originalname} is too large. Maximum size is ${this.maxFileSize} bytes.`,
        );
      }

      if (!file.originalname || file.originalname.trim() === '') {
        throw new BadRequestException('File must have a valid filename');
      }

      if (file.originalname.length > 255) {
        throw new BadRequestException(
          `Filename ${file.originalname} is too long. Maximum length is 255 characters.`,
        );
      }

      const dangerousChars = /[<>:"/\\|?*\x00-\x1f]/;
      const reservedNames = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(\.|$)/i;
      if (
        dangerousChars.test(file.originalname) ||
        reservedNames.test(file.originalname)
      ) {
        throw new BadRequestException(
          `Filename ${file.originalname} contains invalid characters.`,
        );
      }

      if (!file.buffer || file.buffer.length === 0) {
        throw new BadRequestException(
          `File ${file.originalname} appears to be empty or corrupted.`,
        );
      }

      if (file.size !== file.buffer.length) {
        throw new BadRequestException(
          `File ${file.originalname} size mismatch. Possible corruption.`,
        );
      }

      if (file.originalname.includes('\0')) {
        throw new BadRequestException(
          `Filename ${file.originalname} contains null bytes.`,
        );
      }

      if (!file.mimetype || file.mimetype.trim() === '') {
        throw new BadRequestException(
          `File ${file.originalname} has no MIME type.`,
        );
      }

      const fileTypeByExtension = getFileTypeByExtension(file.originalname);
      const fileTypeByMimeType = getFileTypeByMimeType(file.mimetype);

      if (!fileTypeByExtension) {
        throw new BadRequestException(
          `File ${file.originalname} has an unsupported extension.`,
        );
      }

      if (!fileTypeByMimeType) {
        throw new BadRequestException(
          `File ${file.originalname} has an unsupported MIME type.`,
        );
      }

      if (fileTypeByExtension !== fileTypeByMimeType) {
        throw new BadRequestException(
          `File ${file.originalname} has mismatched extension and MIME type. Extension suggests ${fileTypeByExtension} but MIME type suggests ${fileTypeByMimeType}.`,
        );
      }
    }

    return value;
  }
}
