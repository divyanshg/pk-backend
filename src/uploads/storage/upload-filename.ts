import { randomBytes } from 'crypto';
import path from 'path';
import type { UploadedImageFile } from '../upload.types';

const mimeExtensions: Record<string, { allowed: string[]; fallback: string }> =
  {
    'image/jpeg': { allowed: ['.jpg', '.jpeg'], fallback: '.jpg' },
    'image/png': { allowed: ['.png'], fallback: '.png' },
    'image/webp': { allowed: ['.webp'], fallback: '.webp' },
    'image/avif': { allowed: ['.avif'], fallback: '.avif' },
  };

export const generateUploadFilename = (file: UploadedImageFile) => {
  const ext = safeExtension(file);
  return `${Date.now()}-${randomBytes(12).toString('hex')}${ext}`;
};

const safeExtension = (file: UploadedImageFile) => {
  const clientExt = path.extname(file.originalname).toLowerCase();
  const allowed = mimeExtensions[file.mimetype];

  if (allowed?.allowed.includes(clientExt)) {
    return clientExt;
  }

  return allowed?.fallback ?? '.img';
};
