import { Module } from '@nestjs/common';
import { ShadesController } from './shades.controller';
import { ShadesService } from './shades.service';

@Module({
  controllers: [ShadesController],
  providers: [ShadesService],
  exports: [ShadesService],
})
export class ShadesModule {}
