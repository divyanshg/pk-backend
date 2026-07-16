export const ALLOWED_UPLOAD_FOLDERS = [
  'brands',
  'categories',
  'products',
] as const;

export type UploadFolder = (typeof ALLOWED_UPLOAD_FOLDERS)[number];

export const ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
] as const;

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
export const MAX_PRODUCT_UPLOAD_FILES = 10;
