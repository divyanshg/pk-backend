import type { UploadFolder } from '../upload.constants';
import type { StoredUpload, UploadedImageFile } from '../upload.types';

export const IMAGE_STORAGE_DRIVER = Symbol('IMAGE_STORAGE_DRIVER');

export interface ImageStorageDriver {
  save(file: UploadedImageFile, folder: UploadFolder): Promise<StoredUpload>;
  deleteByUrl(url: string): Promise<void>;
}
