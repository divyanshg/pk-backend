import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  HttpCode,
  Post,
  UploadedFiles,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AdminGuard } from '../auth/guards/admin.guard';
import { ALLOWED_IMAGE_MIME_TYPES, MAX_UPLOAD_BYTES } from './upload.constants';
import type { UploadedImageFile } from './upload.types';
import { UploadsService } from './uploads.service';
import { UploadsExceptionFilter } from './uploads.exception-filter';

type UploadFileFields = {
  file?: UploadedImageFile[];
  files?: UploadedImageFile[];
  'files[]'?: UploadedImageFile[];
};

@ApiTags('uploads')
@Controller('admin/uploads')
@UseGuards(AdminGuard)
@ApiBearerAuth()
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post()
  @ApiOperation({ summary: 'Upload one or more images (admin)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['folder'],
      properties: {
        folder: { type: 'string', enum: ['brands', 'categories', 'products'] },
        file: { type: 'string', format: 'binary' },
        files: {
          type: 'array',
          minItems: 1,
          maxItems: 10,
          items: { type: 'string', format: 'binary' },
        },
      },
    },
  })
  @UseFilters(UploadsExceptionFilter)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'file', maxCount: 1 },
        { name: 'files', maxCount: 10 },
        { name: 'files[]', maxCount: 10 },
      ],
      {
        limits: { fileSize: MAX_UPLOAD_BYTES },
        fileFilter: (_req, file, callback) => {
          if (
            !(ALLOWED_IMAGE_MIME_TYPES as readonly string[]).includes(
              file.mimetype,
            )
          ) {
            callback(new BadRequestException('Unsupported type'), false);
            return;
          }

          callback(null, true);
        },
      },
    ),
  )
  upload(
    @UploadedFiles() uploadedFiles: UploadFileFields | undefined,
    @Body('folder') folder: string,
  ) {
    const files = [
      ...(uploadedFiles?.files ?? []),
      ...(uploadedFiles?.['files[]'] ?? []),
    ];

    if (files.length) {
      return this.uploadsService.uploadMany(files, folder);
    }

    return this.uploadsService.uploadSingle(uploadedFiles?.file?.[0], folder);
  }

  @Delete()
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete an uploaded image by public URL (admin)' })
  async remove(@Body('url') url: string) {
    await this.uploadsService.deleteByUrl(url);
  }
}
