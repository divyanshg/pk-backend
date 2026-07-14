import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const [products, brands, categories, orders, revenueResult] = await Promise.all([
      this.prisma.product.count(),
      this.prisma.brand.count(),
      this.prisma.category.count(),
      this.prisma.order.count(),
      this.prisma.order.aggregate({
        _sum: { total: true },
        where: { status: { not: 'cancelled' } },
      }),
    ]);

    return {
      products,
      brands,
      categories,
      orders,
      revenue: revenueResult._sum.total?.toNumber() || 0,
    };
  }
}
