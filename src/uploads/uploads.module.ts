import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';
import { IMAGE_STORAGE_DRIVER } from './storage/image-storage.driver';
import { LocalImageStorageDriver } from './storage/local-image-storage.driver';

@Module({
  controllers: [UploadsController],
  providers: [
    UploadsService,
    {
      provide: IMAGE_STORAGE_DRIVER,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const driver = configService.get<string>('STORAGE_DRIVER') ?? 'local';

        if (driver === 'local') {
          return new LocalImageStorageDriver(configService);
        }

        if (driver === 's3') {
          throw new Error('STORAGE_DRIVER=s3 is not configured yet');
        }

        throw new Error(`Unsupported STORAGE_DRIVER: ${driver}`);
      },
    },
  ],
})
export class UploadsModule {}
