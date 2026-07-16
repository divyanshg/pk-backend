import type { UploadFolder } from './upload.constants';

export type UploadedImageFile = {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
  size: number;
};

export type StoredUpload = {
  folder: UploadFolder;
  filename: string;
  url: string;
};
