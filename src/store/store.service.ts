import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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
      },
      update: {},
    });

    return settings;
  }
}
