import { mkdir, unlink, writeFile } from 'fs/promises';
import path from 'path';
import { ConfigService } from '@nestjs/config';
import type { UploadFolder } from '../upload.constants';
import type { StoredUpload, UploadedImageFile } from '../upload.types';
import type { ImageStorageDriver } from './image-storage.driver';
import { generateUploadFilename } from './upload-filename';

export class LocalImageStorageDriver implements ImageStorageDriver {
  private readonly uploadsRoot = path.resolve(process.cwd(), 'uploads');

  constructor(private readonly configService: ConfigService) {}

  async save(
    file: UploadedImageFile,
    folder: UploadFolder,
  ): Promise<StoredUpload> {
    const folderPath = path.join(this.uploadsRoot, folder);
    await mkdir(folderPath, { recursive: true });

    const filename = generateUploadFilename(file);
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
