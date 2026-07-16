import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import {
  ALLOWED_IMAGE_MIME_TYPES,
  ALLOWED_UPLOAD_FOLDERS,
  MAX_PRODUCT_UPLOAD_FILES,
  MAX_UPLOAD_BYTES,
  type UploadFolder,
} from './upload.constants';
import type { ImageStorageDriver } from './storage/image-storage.driver';
import { IMAGE_STORAGE_DRIVER } from './storage/image-storage.driver';
import type { UploadedImageFile } from './upload.types';

@Injectable()
export class UploadsService {
  constructor(
    @Inject(IMAGE_STORAGE_DRIVER)
    private readonly storageDriver: ImageStorageDriver,
  ) {}

  async uploadSingle(
    file: UploadedImageFile | undefined,
    folder: string | undefined,
  ) {
    const uploadFolder = this.parseFolder(folder);

    if (!file) {
      throw new BadRequestException('No file');
    }

    this.validateImage(file);
    const stored = await this.storageDriver.save(file, uploadFolder);
    return { url: stored.url };
  }

  async uploadMany(files: UploadedImageFile[], folder: string | undefined) {
    const uploadFolder = this.parseFolder(folder);

    if (!files.length) {
      throw new BadRequestException('No file');
    }

    if (files.length > MAX_PRODUCT_UPLOAD_FILES) {
      throw new BadRequestException('File too large');
    }

    files.forEach((file) => this.validateImage(file));
    const stored = await Promise.all(
      files.map((file) => this.storageDriver.save(file, uploadFolder)),
    );
    return { urls: stored.map((file) => file.url) };
  }

  async deleteByUrl(url: string | undefined) {
    if (url) {
      await this.storageDriver.deleteByUrl(url);
    }
  }

  private parseFolder(folder: string | undefined): UploadFolder {
    if (!folder || !ALLOWED_UPLOAD_FOLDERS.includes(folder as UploadFolder)) {
      throw new BadRequestException('Invalid folder');
    }

    return folder as UploadFolder;
  }

  private validateImage(file: UploadedImageFile) {
    if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.mimetype as any)) {
      throw new BadRequestException('Unsupported type');
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      throw new BadRequestException('File too large');
    }
  }
}
