import { Injectable } from '@nestjs/common';
import { IsNumber, IsOptional, IsString, IsArray } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';

export class UpdateStoreDto {
  @IsOptional() @IsNumber() lat?: number;
  @IsOptional() @IsNumber() lng?: number;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsNumber() opensAtHour?: number;
  @IsOptional() @IsNumber() closesAtHour?: number;
  @IsOptional() @IsNumber() avgDeliveryMinutes?: number;
  @IsOptional() @IsNumber() servingRadiusKm?: number;
  @IsOptional() @IsArray() @IsString({ each: true }) featuredProductIds?: string[];
}

@Injectable()
export class StoreService {
  constructor(private prisma: PrismaService) {}

  async getInfo() {
    // Get or create default store settings
    const settings = await this.prisma.storeSettings.upsert({
      where: { id: 'default' },
      create: {
        id: 'default',
        lat: 12.9343,
        lng: 77.6101,
        address: 'WM8X+QRF, Bhoganhalli, Bengaluru, Karnataka 560066',
        opensAtHour: 8,
        closesAtHour: 22,
        avgDeliveryMinutes: 30,
        servingRadiusKm: 50,
        featuredProductIds: [],
      },
      update: {},
    });

    return settings;
  }

  async update(dto: UpdateStoreDto) {
    return this.prisma.storeSettings.upsert({
      where: { id: 'default' },
      create: {
        id: 'default',
        lat: dto.lat ?? 12.9343,
        lng: dto.lng ?? 77.6101,
        address: dto.address ?? 'WM8X+QRF, Bhoganhalli, Bengaluru, Karnataka 560066',
        opensAtHour: dto.opensAtHour ?? 8,
        closesAtHour: dto.closesAtHour ?? 22,
        avgDeliveryMinutes: dto.avgDeliveryMinutes ?? 30,
        servingRadiusKm: dto.servingRadiusKm ?? 50,
        featuredProductIds: dto.featuredProductIds ?? [],
      },
      update: dto,
    });
  }
}
