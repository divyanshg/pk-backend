import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import type { Response } from 'express';

@Catch()
export class UploadsExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const uploadMessage = this.getUploadMessage(exception);

    if (uploadMessage) {
      return response.status(400).json({ message: uploadMessage });
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      return response
        .status(status)
        .json(typeof body === 'string' ? { message: body } : body);
    }

    throw exception;
  }

  private getUploadMessage(exception: unknown) {
    const error = exception as any;

    if (error?.code === 'LIMIT_FILE_SIZE') return 'File too large';
    if (error?.code === 'LIMIT_UNEXPECTED_FILE') return 'No file';

    if (exception instanceof BadRequestException) {
      const response = exception.getResponse() as any;
      const message =
        typeof response === 'string' ? response : response?.message;

      if (
        Array.isArray(message) &&
        message.some((item) => item.includes('File too large'))
      ) {
        return 'File too large';
      }

      if (
        message === 'Invalid folder' ||
        message === 'File too large' ||
        message === 'Unsupported type' ||
        message === 'No file'
      ) {
        return message;
      }
    }

    return null;
  }
}
