import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import type { UploadFolder } from '../upload.constants';
import type { StoredUpload, UploadedImageFile } from '../upload.types';
import type { ImageStorageDriver } from './image-storage.driver';
import { generateUploadFilename } from './upload-filename';

export class S3ImageStorageDriver implements ImageStorageDriver {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly region: string;
  private readonly publicBaseUrl?: string;
  private readonly usePublicReadAcl: boolean;

  constructor(private readonly configService: ConfigService) {
    this.region = this.requireConfig('AWS_REGION');
    this.bucket = this.requireConfig('AWS_S3_BUCKET');
    this.publicBaseUrl = this.configService
      .get<string>('AWS_S3_PUBLIC_BASE_URL')
      ?.replace(/\/+$/, '');
    this.usePublicReadAcl =
      this.configService.get<string>('AWS_S3_PUBLIC_READ_ACL') === 'true';

    this.client = new S3Client({
      region: this.region,
      endpoint: this.configService.get<string>('AWS_S3_ENDPOINT'),
      forcePathStyle:
        this.configService.get<string>('AWS_S3_FORCE_PATH_STYLE') === 'true',
    });
  }

  async save(
    file: UploadedImageFile,
    folder: UploadFolder,
  ): Promise<StoredUpload> {
    const filename = generateUploadFilename(file);
    const key = this.toUploadKey(folder, filename);

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        CacheControl: 'public, max-age=31536000, immutable',
        ...(this.usePublicReadAcl ? { ACL: 'public-read' as const } : {}),
      }),
    );

    return {
      folder,
      filename,
      url: this.publicUrlForKey(key),
    };
  }

  async deleteByUrl(url: string): Promise<void> {
    const key = this.keyFromUrl(url);

    if (!key?.startsWith('uploads/')) return;

    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
  }

  private toUploadKey(folder: UploadFolder, filename: string) {
    return `uploads/${folder}/${filename}`;
  }

  private publicUrlForKey(key: string) {
    if (this.publicBaseUrl) {
      return `${this.publicBaseUrl}/${key}`;
    }

    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
  }

  private keyFromUrl(url: string) {
    let parsedUrl: URL;

    try {
      parsedUrl = new URL(url);
    } catch {
      return null;
    }

    if (this.publicBaseUrl && url.startsWith(`${this.publicBaseUrl}/`)) {
      return decodeURIComponent(url.slice(this.publicBaseUrl.length + 1));
    }

    const virtualHostedHost = `${this.bucket}.s3.${this.region}.amazonaws.com`;
    if (parsedUrl.hostname === virtualHostedHost) {
      return decodeURIComponent(parsedUrl.pathname.replace(/^\/+/, ''));
    }

    const regionalPathStyleHost = `s3.${this.region}.amazonaws.com`;
    if (parsedUrl.hostname === regionalPathStyleHost) {
      const path = decodeURIComponent(parsedUrl.pathname.replace(/^\/+/, ''));
      const bucketPrefix = `${this.bucket}/`;
      return path.startsWith(bucketPrefix)
        ? path.slice(bucketPrefix.length)
        : null;
    }

    return null;
  }

  private requireConfig(key: string) {
    const value = this.configService.get<string>(key);

    if (!value) {
      throw new Error(`${key} is required when STORAGE_DRIVER=s3`);
    }

    return value;
  }
}
