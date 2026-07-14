import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findOne(slug: string) {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: {
        _count: { select: { products: true } },
      },
    });

    if (!category) {
      throw new NotFoundException(`Category ${slug} not found`);
    }

    return category;
  }

  async create(dto: CreateCategoryDto) {
    const existing = await this.prisma.category.findUnique({
      where: { slug: dto.slug },
    });

    if (existing) {
      throw new ConflictException(`Category ${dto.slug} already exists`);
    }

    return this.prisma.category.create({ data: dto });
  }

  async update(slug: string, dto: UpdateCategoryDto) {
    const existing = await this.findOne(slug);

    // If slug is being changed, cascade to products
    if (dto.slug && dto.slug !== slug) {
      const newSlug = dto.slug;
      return this.prisma.$transaction(async (tx) => {
        await tx.product.updateMany({
          where: { categorySlug: slug },
          data: { categorySlug: newSlug },
        });

        await tx.category.delete({ where: { slug } });

        return tx.category.create({
          data: {
            slug: newSlug,
            name: dto.name ?? existing.name,
            blurb: dto.blurb ?? existing.blurb,
            subcategories: dto.subcategories ?? existing.subcategories,
            sortOrder: dto.sortOrder ?? existing.sortOrder,
          },
        });
      });
    }

    return this.prisma.category.update({
      where: { slug },
      data: dto,
    });
  }

  async remove(slug: string) {
    await this.findOne(slug);
    return this.prisma.category.delete({ where: { slug } });
  }
}
