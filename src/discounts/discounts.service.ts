import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDiscountDto } from './dto/create-discount.dto';

@Injectable()
export class DiscountsService {
  constructor(private prisma: PrismaService) {}

  findAll(activeOnly = true) {
    return this.prisma.discount.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: [{ minQty: 'asc' }, { discountPercent: 'desc' }],
    });
  }

  async findOne(id: string) {
    const discount = await this.prisma.discount.findUnique({ where: { id } });
    if (!discount) throw new NotFoundException(`Discount ${id} not found`);
    return discount;
  }

  create(dto: CreateDiscountDto) {
    return this.prisma.discount.create({
      data: {
        name: dto.name,
        description: dto.description ?? '',
        accountTypes: dto.accountTypes ?? [],
        brandSlugs: dto.brandSlugs ?? [],
        discountPercent: dto.discountPercent,
        minQty: dto.minQty ?? 1,
        maxQty: dto.maxQty ?? null,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async update(id: string, dto: Partial<CreateDiscountDto>) {
    await this.findOne(id);
    return this.prisma.discount.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.discount.delete({ where: { id } });
  }
}
