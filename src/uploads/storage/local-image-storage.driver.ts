import { randomBytes } from 'crypto';
import { mkdir, unlink, writeFile } from 'fs/promises';
import path from 'path';
import { ConfigService } from '@nestjs/config';
import type { UploadFolder } from '../upload.constants';
import type { StoredUpload, UploadedImageFile } from '../upload.types';
import type { ImageStorageDriver } from './image-storage.driver';

const mimeExtensions: Record<string, { allowed: string[]; fallback: string }> =
  {
    'image/jpeg': { allowed: ['.jpg', '.jpeg'], fallback: '.jpg' },
    'image/png': { allowed: ['.png'], fallback: '.png' },
    'image/webp': { allowed: ['.webp'], fallback: '.webp' },
    'image/avif': { allowed: ['.avif'], fallback: '.avif' },
  };

export class LocalImageStorageDriver implements ImageStorageDriver {
  private readonly uploadsRoot = path.resolve(process.cwd(), 'uploads');

  constructor(private readonly configService: ConfigService) {}

  async save(
    file: UploadedImageFile,
    folder: UploadFolder,
  ): Promise<StoredUpload> {
    const folderPath = path.join(this.uploadsRoot, folder);
    await mkdir(folderPath, { recursive: true });

    const filename = this.generateFilename(file);
    await writeFile(path.join(folderPath, filename), file.buffer);

    return {
      folder,
      filename,
      url: `${this.publicBaseUrl}/uploads/${folder}/${filename}`,
    };
  }

  async deleteByUrl(url: string): Promise<void> {
    let pathname: string;

    try {
      pathname = new URL(url).pathname;
    } catch {
      return;
    }

    if (!pathname.startsWith('/uploads/')) return;

    const relativeUploadPath = decodeURIComponent(
      pathname.replace(/^\/uploads\//, ''),
    );
    const filePath = path.resolve(this.uploadsRoot, relativeUploadPath);

    if (!this.isPathInsideUploads(filePath)) return;

    try {
      await unlink(filePath);
    } catch (error: any) {
      if (error?.code !== 'ENOENT') throw error;
    }
  }

  private generateFilename(file: UploadedImageFile) {
    const ext = this.safeExtension(file);
    return `${Date.now()}-${randomBytes(12).toString('hex')}${ext}`;
  }

  private safeExtension(file: UploadedImageFile) {
    const clientExt = path.extname(file.originalname).toLowerCase();
    const allowed = mimeExtensions[file.mimetype];

    if (allowed?.allowed.includes(clientExt)) {
      return clientExt;
    }

    return allowed?.fallback ?? '.img';
  }

  private get publicBaseUrl() {
    const baseUrl =
      this.configService.get<string>('PUBLIC_BASE_URL') ??
      `http://localhost:${this.configService.get<string>('PORT') ?? 3000}`;

    return baseUrl.replace(/\/+$/, '');
  }

  private isPathInsideUploads(filePath: string) {
    const relative = path.relative(this.uploadsRoot, filePath);
    return (
      relative !== '' &&
      !relative.startsWith('..') &&
      !path.isAbsolute(relative)
    );
  }
}
